import { type Persona } from "@prisma/client";
import { type NextRequest } from "next/server";
import { api } from "~/trpc/server";
import { getResponseJSON } from "~/utils/ai";
import { NEWPERSONAUSER } from "~/utils/constants";
import { productPlan } from "~/utils/planDetails";
import { prompts } from "~/utils/prompts";

export async function GET(request: NextRequest) {
  setTimeout(() => {
    console.error("Cron job for user personatimed out after 9900 milliseconds");
    return Response.json(
      { error: "Cron job for user persona timed out after 9900 milliseconds" },
      { status: 504 },
    );
  }, 9900);
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const userPersonas = await api.persona.getAllUserPersonas();

    for (const userPersona of userPersonas) {
      const latestPost = await api.post.getLatestByInputUserId({
        userId: userPersona.createdById,
      });
      const user = await api.user.getByUserId({
        userId: userPersona.createdById,
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
        model: user?.isSpecial
          ? "gpt-4o"
          : productPlan(user?.stripeProductId)?.model,
      });

      if (!generatedPersona) {
        continue;
      }
      const personaObject = JSON.parse(generatedPersona) as Persona;
      await api.persona.update({
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
      });
    }
    return Response.json({ message: "Tags added successfully." });
  } catch (error) {
    console.error("Error summarizing posts in cron job:", error);
    const { message, stack } = error as Error;
    console.error(message, stack);
    return Response.json({
      error: "Error summarizing posts in cron job:",
      message: message ?? "Unknown error",
      stack: stack ?? "Unknown stack",
    });
  }
}
