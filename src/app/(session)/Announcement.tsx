import Modal from "~/app/_components/Modal";
import { api } from "~/trpc/server";

export default async function Announcement() {
  const blogPosts = await api.blogPost.getAll();

  const latest = blogPosts.filter((post) => !post.isDraft).slice(0, 1);
  console.log(latest);

  return <Modal>{latest[0]?.content}</Modal>;
}
