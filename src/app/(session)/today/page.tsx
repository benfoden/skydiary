import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Today() {
  const post = await api.post.getLatest();

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toLocaleDateString("en-US", {
    timeZone: userTimezone,
  });

  if (
    post?.createdAt.toLocaleDateString("en-US", {
      timeZone: userTimezone,
    }) !== today
  ) {
    const newPost = await api.post.create({ content: "" });
    if (!newPost) {
      redirect("/home");
    }
    redirect("/entry/" + newPost?.id);
  }
}
