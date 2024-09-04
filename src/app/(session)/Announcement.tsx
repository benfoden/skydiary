"use client";
import { useEffect, useState } from "react";

import { type BlogPost } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";
import Modal from "~/app/_components/Modal";
import { api } from "~/trpc/react";
import { formatContent } from "~/utils/blog";
import { formattedTimeStampToDate } from "~/utils/text";

export default function Announcement({ blogPost }: { blogPost?: BlogPost }) {
  const updateUser = api.user.update.useMutation();
  const [isOpen, setIsOpen] = useState(true);
  const [content, setContent] = useState("");

  const closeModal = async () => {
    setIsOpen(false);
    await updateUser.mutateAsync({
      newAnnouncementId: "",
    });
  };

  useEffect(() => {
    if (!blogPost?.content) return;
    console.log("blogPost", blogPost);

    formatContent(blogPost?.content ?? "")
      .then((content) => {
        console.log("content", content);
        setContent(content);
      })
      .catch((error) => {
        console.error("Error displaying content", error);
        setContent("error. please reload or try again later");
      });
  }, [blogPost]);

  if (!blogPost) return null;
  if (!isOpen) return null;

  return (
    <Modal>
      <div className="flex w-full flex-col items-start gap-8">
        {blogPost?.updatedAt && (
          <span className="text-xs opacity-70">
            {formattedTimeStampToDate(new Date(blogPost.updatedAt))}
          </span>
        )}
        <div className="flex w-full flex-row items-center justify-between">
          {blogPost.title && (
            <h1 className="text-3xl font-light">{blogPost.title}</h1>
          )}
          <button
            onClick={closeModal}
            className="absolute right-2 top-2 m-2 rounded-full p-2 transition-all hover:bg-white/20"
          >
            <Cross1Icon className="h-6 w-6" />
          </button>
        </div>
        <div id="blog">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </Modal>
  );
}
