import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function NewBlogPost() {
  await api.blogPost.create({ content: "", title: "DRAFT", tag: "DRAFT" });
  const newPost = await api.post.getLatest();
  redirect("/sd-admin/blog/" + newPost?.id);
}
