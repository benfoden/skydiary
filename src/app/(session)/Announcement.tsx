import { type BlogPost } from "@prisma/client";
import Modal from "~/app/_components/Modal";
import { formatContent } from "~/utils/blog";

export default async function Announcement({
  blogPost,
}: {
  blogPost: BlogPost;
}) {
  if (!blogPost) return null;

  const content = await formatContent(blogPost?.content ?? "");
  return (
    <Modal title={blogPost?.title}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Modal>
  );
}
