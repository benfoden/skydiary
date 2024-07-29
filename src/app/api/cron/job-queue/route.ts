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
      const latestPosts = await api.post.getAllUntaggedByInputUserIdAsCron({
        userId: userPersona?.createdById,
        cronSecret,
      });
      // run for personas that haven't been updated in the last hour
      if (
        new Date(userPersona.updatedAt).getTime() <
        Date.now() - 60 * 60 * 1000
      ) {
        userPersonaQueueOutput.push(userPersona);
      }
      if (
        !latestPosts ||
        latestPosts.length === 0 ||
        latestPosts.every((post) => post.tags.length > 0)
      ) {
        continue;
      }
      postQueueOutput.push(...latestPosts.filter((post) => post.content));
    }

    if (postQueueOutput.length) {
      console.log("postQueueOutput length", postQueueOutput.length);
      await fetch(`${getBaseUrl()}/api/cron/post-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ postQueueOutput }),
      });
      Response.json({
        message: "Post tags updated.",
        status: 200,
      });
    }

    if (userPersonaQueueOutput.length) {
      await fetch(`${getBaseUrl()}/api/cron/user-persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ userPersonaQueueOutput }),
      });
      Response.json({
        message: "User personas updated.",
        status: 200,
      });
    }

    if (!postQueueOutput.length && !userPersonaQueueOutput.length) {
      return Response.json({
        message: "No unprocessed posts or user personas found.",
        status: 200,
      });
    } else {
      return Response.json({
        message: "Cron job ran successfully.",
        status: 200,
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
      status: 500,
    });
  }
}
