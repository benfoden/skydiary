import { type NextRequest } from "next/server";
import { api } from "~/trpc/server";
import { getResponse } from "~/utils/ai";
import { TAGS, productPlan } from "~/utils/constants";
import { prompts } from "~/utils/prompts";

export async function GET(request: NextRequest) {
  setTimeout(() => {
    console.error("Cron job for post tagstimed out after 9900 milliseconds");
    return Response.json(
      { error: "Cron job for post tags timed out after 9900 milliseconds" },
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
      const newTags = await getResponse({
        messageContent: prompts.tag({ content: latestPost?.content }),
        model: user?.isSpecial
          ? "gpt-4o"
          : productPlan(user?.stripeProductId)?.model,
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
        continue; // Changed from return to continue to ensure all userPersonas are processed
      }
      await api.post.addTags({
        postId: latestPost?.id,
        tagIds: tagIds,
      });

      return Response.json({ message: "Tags added successfully." });
    }
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
