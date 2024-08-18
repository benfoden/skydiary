import { type Persona } from "@prisma/client";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";
import { getResponseJSON } from "~/utils/ai";
import { getBaseUrl } from "~/utils/clientConstants";
import { NEWPERSONAUSER } from "~/utils/constants";
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
        new Date(persona.updatedAt).getTime() < Date.now() - 60 * 60 * 1000,
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

      const latestPosts = await api.post.getLatestTwoByInputUserIdAsCron({
        userId: userPersona.createdById,
        cronSecret,
      });

      const latestPostWithContent = latestPosts.find(
        (post) => post.content?.length > 5,
      );
      if (!latestPostWithContent || !user) {
        continue;
      }
      const generatedPersona = await getResponseJSON({
        messageContent: prompts.userPersona({
          persona: userPersona ?? NEWPERSONAUSER,
          content: latestPostWithContent.content,
        }),
        model: "gpt-4o-mini",
      });

      if (!generatedPersona) {
        continue;
      }

      const personaObject = JSON.parse(generatedPersona) as Persona;
      await api.persona.updateUserPersonaAsCron({
        personaId: userPersona?.id ?? "",
        createdById: userPersona?.createdById,
        description: personaObject?.description ?? "",
        relationship: personaObject?.relationship ?? "",
        traits: personaObject?.traits ?? "",
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
    return Response.json(
      "No out of date personas remain to update. Jobs done.",
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error adding user personas in cron job:", error);
    const { message, stack } = error as Error;
    console.error(message, stack);
    return Response.json({
      error: "Error adding user personas in cron job:",
      message: message ?? "Unknown error",
      stack: stack ?? "Unknown stack",
      status: 500,
    });
  }
}
