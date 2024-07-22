import { type Post } from "@prisma/client";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";
import { getResponse } from "~/utils/ai";
import { getBaseUrl } from "~/utils/clientConstants";
import { TAGS } from "~/utils/constants";
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
      postQueueOutput: (Post & {
        tags: {
          id: string;
          content: string;
          isSentiment: boolean;
          createdAt: Date;
        }[];
      })[];
    };
    const postQueue = body.postQueueOutput.filter(
      (post) => post.tags.length === 0,
    );

    if (!postQueue.length) {
      return Response.json({
        message: "All posts tagged.",
        status: 200,
      });
    }

    for (const post of postQueue) {
      if (!post?.id || post.content?.length < 6 || post.tags.length > 0) {
        continue;
      }
      const postId = post.id;

      const newTags = await getResponse({
        messageContent: prompts.tag({ content: post?.content }),
        model: "gpt-4o-mini",
      });

      if (!newTags) {
        continue;
      }

      const tagContents = newTags?.split(",").map((tag) => tag.trim());

      const tagIds = tagContents
        ?.map((content) => {
          const tag = TAGS.find((tag) => tag.content === content);
          return tag?.id ?? undefined;
        })
        .filter((tag): tag is string => tag !== undefined);
      if (!tagIds?.length) {
        continue;
      }
      await api.post.addTagsAsCron({
        postId,
        tagIds,
        cronSecret,
      });

      await fetch(`${getBaseUrl()}/api/cron/post-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({
          postQueueOutput: postQueue.filter((post) => post.id !== postId),
        }),
      });

      Response.json({
        message: "Tags added to a post in the queue.",
        status: 200,
      });
    }
    return Response.json("No untagged posts remain to update. Jobs done.", {
      status: 200,
    });
  } catch (error) {
    console.error("Error in post-tags cron job:", error);
    const { message, stack } = error as Error;
    console.error(message, stack);
    return Response.json({
      error: "Error adding tags in cron job:",
      message: message ?? "Unknown error",
      stack: stack ?? "Unknown stack",
    });
  }
}
