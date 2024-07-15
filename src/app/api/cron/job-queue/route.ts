import { type Persona, type Post } from "@prisma/client";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";
import { getBaseUrl } from "~/utils/clientConstants";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = authHeader?.split(" ")[1];
  if (cronSecret !== env.CRON_SECRET) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const userPersonaQueueOutput: Persona[] = [];

    const postQueueOutput: (Post & {
      tags: {
        id: string;
        content: string;
        isSentiment: boolean;
        createdAt: Date;
      }[];
    })[] = [];

    const userPersonas = await api.persona.getAllUserPersonasAsCron({
      cronSecret,
    });

    for (const userPersona of userPersonas) {
      const latestPosts = await api.post.getAllUnprocessedByInputUserIdAsCron({
        userId: userPersona?.createdById,
        cronSecret,
      });
      if (!latestPosts || latestPosts.length === 0) {
        continue;
      }
      postQueueOutput.push(...latestPosts);
      if (userPersona.updatedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        userPersonaQueueOutput.push(userPersona);
      }
    }

    if (!postQueueOutput.length) {
      return Response.json({
        message: "No unprocessed posts found.",
        status: 200,
      });
    } else {
      await fetch(`${getBaseUrl()}/api/cron/post-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ postQueueOutput }),
      });
    }

    if (!userPersonaQueueOutput.length) {
      return Response.json({
        message: "No user personas found.",
        status: 200,
      });
    } else {
      await fetch(`${getBaseUrl()}/api/cron/user-persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ userPersonaQueueOutput }),
      });
    }
  } catch (error) {
    console.error("Error getting posts in cron job:", error);
    const { message, stack } = error as Error;
    console.error(message, stack);
    return Response.json({
      error: "Error getting posts in cron job:",
      message: message ?? "Unknown error",
      stack: stack ?? "Unknown stack",
    });
  }
}
