"use server";

import { revalidatePath } from "next/cache";
import FormButton from "~/app/_components/FormButton";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getBaseUrl } from "~/utils/clientConstants";
export default async function TheCronic() {
  const session = await getServerAuthSession();
  const posts = await api.post.getAllByUserIdAsCron({
    userId: session?.user.id,
    cronSecret: env.CRON_SECRET,
  });

  const processedPosts = posts.filter(
    (post) => post.content && post.tags.length > 0,
  );
  const unProcessedPosts = posts.filter(
    (post) => post.content && post.tags.length === 0,
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Run Cron Jobs</h1>

      <div>
        <h2>Unprocessed Posts: {unProcessedPosts.length}</h2>
        {unProcessedPosts.map((post, index) => (
          <div key={post.id}>
            <p>
              {index}. {post.id} {post.content.slice(0, 10)}{" "}
              {JSON.stringify(post.tags.map((tag) => tag.content))}
            </p>
          </div>
        ))}
      </div>
      <div>
        <h2>Processed Posts: {processedPosts.length}</h2>
        {processedPosts.map((post, index) => (
          <div key={post.id}>
            <p>
              {index}. {JSON.stringify(post.tags.map((tag) => tag.content))}
            </p>
          </div>
        ))}
      </div>
      <form
        action={async () => {
          "use server";
          try {
            await fetch(`${getBaseUrl()}/api/cron/job-queue`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.CRON_SECRET}`,
              },
            });
            revalidatePath("/sd-admin/cron");
          } catch (error) {
            console.error("Error running post tags cron job:", error);
          }
        }}
        className="space-y-4"
      >
        <div className="w-fit">
          <FormButton variant="submit">Run cron job queue</FormButton>
        </div>
      </form>
    </div>
  );
}
