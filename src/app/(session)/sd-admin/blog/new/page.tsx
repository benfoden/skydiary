import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function NewBlogPost() {
  await api.blogPost.create({
    content: "",
    title: "DRAFT",
    tag: "",
  });

  const newPost = await api.blogPost.getLatest();
  redirect("/sd-admin/blog/" + newPost?.id);
}
