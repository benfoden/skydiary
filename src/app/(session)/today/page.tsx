import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { useMdkJwk } from "~/utils/useMdkJwk";

export default async function Today() {
  const mdkJwk = await useMdkJwk();
  const post = await api.post.getLatest({ mdkJwk });

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toLocaleDateString("en-US", {
    timeZone: userTimezone,
  });

  if (
    post?.createdAt.toLocaleDateString("en-US", {
      timeZone: userTimezone,
    }) !== today
  ) {
    await api.post.create({ content: "" });
    const newPost = await api.post.getLatest({ mdkJwk });
    redirect("/entry/" + newPost?.id);
  }

  redirect("/entry/" + post?.id);
}
