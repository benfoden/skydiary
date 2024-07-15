import { type Persona } from "@prisma/client";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";
import { getResponseJSON } from "~/utils/ai";
import { getBaseUrl } from "~/utils/clientConstants";
import { NEWPERSONAUSER, productPlan } from "~/utils/constants";
import { prompts } from "~/utils/prompts";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = authHeader?.split(" ")[1];
  if (cronSecret !== env.CRON_SECRET) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const body = (await request.json()) as {
      userPersonaQueueOutput: Persona[];
    };

    const userPersonaQueue = body.userPersonaQueueOutput.filter(
      (persona) =>
        persona.updatedAt < new Date(Date.now() - 24 * 60 * 60 * 1000),
    );

    if (!userPersonaQueue.length) {
      return Response.json({
        message: "All user personas updated.",
        status: 200,
      });
    }

    for (const userPersona of userPersonaQueue) {
      const user = await api.user.getByIdAsCron({
        userId: userPersona.createdById,
        cronSecret,
      });

      const latestPost = await api.post.getLatestByInputUserIdAsCron({
        userId: userPersona.createdById,
        cronSecret,
      });

      if (!latestPost?.content || !user) {
        continue;
      }
      const generatedPersona = await getResponseJSON({
        messageContent: prompts.userPersona({
          persona: userPersona ?? NEWPERSONAUSER,
          content: latestPost?.content,
          wordLimit: user?.isSpecial
            ? 180
            : productPlan(user?.stripeProductId).memories,
        }),
        model: "gpt-3.5-turbo",
      });

      if (!generatedPersona) {
        continue;
      }

      const personaObject = JSON.parse(generatedPersona) as Persona;
      await api.persona.updateUserPersonaAsCron({
        createdById: userPersona?.createdById,
        personaId: userPersona?.id ?? "",
        name: userPersona?.name ?? "",
        description: personaObject?.description ?? "",
        image: userPersona?.image ?? "",
        age: personaObject?.age ?? 0,
        gender: personaObject?.gender ?? "",
        relationship: personaObject?.relationship ?? "",
        occupation: personaObject?.occupation ?? "",
        traits: personaObject?.traits ?? "",
        communicationStyle: personaObject?.communicationStyle ?? "",
        communicationSample: personaObject?.communicationSample ?? "",
        cronSecret,
      });

      await fetch(`${getBaseUrl()}/api/cron/user-persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({
          userPersonaQueueOutput: userPersonaQueue.filter(
            (persona) => persona.id !== userPersona.id,
          ),
        }),
      });

      Response.json({
        message: "Updated user persona in the queue.",
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error adding user personas in cron job:", error);
    const { message, stack } = error as Error;
    console.error(message, stack);
    return Response.json({
      error: "Error adding user personas in cron job:",
      message: message ?? "Unknown error",
      stack: stack ?? "Unknown stack",
    });
  }
}
