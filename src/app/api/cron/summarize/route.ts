import { type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";

export async function GET(request: NextRequest) {
  setTimeout(() => {
    console.error("Cron job timed out after 9999 milliseconds");
    return Response.json(
      { error: "Cron job timed out after 9999 milliseconds" },
      { status: 504 },
    );
  }, 9999);
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    await api.post.summarizeAllPostsOlderThanToday();
    return Response.json({ message: "Posts summarized successfully." });
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
