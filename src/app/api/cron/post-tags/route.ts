import { type NextRequest } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getResponse } from "~/utils/ai";
import { TAGS } from "~/utils/constants";
import { prompts } from "~/utils/prompts";

export async function POST(request: NextRequest) {
  // setTimeout(() => {
  //   console.error("Cron job for post tagstimed out after 9900 milliseconds");
  //   return Response.json(
  //     { error: "Cron job for post tags timed out after 9900 milliseconds" },
  //     { status: 504 },
  //   );
  // }, 9900);

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    // const userPersonas = await api.persona.getAllUserPersonas();
    const session = await getServerAuthSession();

    const { user } = session;
    const userId = user.id;

    // for (const userPersona of userPersonas) {
    const latestPost = await api.post.getLatestUnprocessedByInputUserId({
      userId,
    });

    if (!latestPost) {
      console.log("No unprocessed post found for userId:", userId);
      // continue;
      return;
    }
    const newTags = await getResponse({
      messageContent: prompts.tag({ content: latestPost?.content }),
      model: "gpt-3.5-turbo",
    });
    if (!newTags) {
      console.log("No new tags found for post:", latestPost?.id);
      return;
    }

    const tagContents = newTags?.split(",").map((tag) => tag.trim());

    const tagIds = tagContents
      ?.map((content) => {
        const tag = TAGS.find((tag) => tag.content === content);
        return tag?.id ?? undefined;
      })
      .filter((tag): tag is string => tag !== undefined);
    if (!tagIds?.length) {
      console.log("No tagIds found for post:", latestPost?.id);
      return; // Changed from return to continue to ensure all userPersonas are processed
    }
    await api.post.addTags({
      postId: latestPost?.id,
      tagIds: tagIds,
    });

    return Response.json({ message: "Tags added successfully." });
    // }
  } catch (error) {
    console.error("Error adding tags in cron job:", error);
    const { message, stack } = error as Error;
    console.error(message, stack);
    return Response.json({
      error: "Error adding tags in cron job:",
      message: message ?? "Unknown error",
      stack: stack ?? "Unknown stack",
    });
  }
}
