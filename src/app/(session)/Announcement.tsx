"use client";
import { useState } from "react";

import { type BlogPost } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";
import Modal from "~/app/_components/Modal";
import { api } from "~/trpc/react";
import { formatContent } from "~/utils/blog";

export default function Announcement({ blogPost }: { blogPost?: BlogPost }) {
  const updateUser = api.user.updateUser.useMutation();
  const [isOpen, setIsOpen] = useState(true);

  const content = formatContent(blogPost?.content ?? "").catch((error) => {
    console.error("Error displaying content", error);
    return "error. please reload or try again later";
  });

  const closeModal = async () => {
    await updateUser.mutateAsync({
      newAnnouncementId: "",
    });
    setIsOpen(false);
  };

  if (!blogPost) return null;
  if (!isOpen) return null;

  return (
    <Modal>
      <div className="flex w-full flex-row items-center justify-between">
        {blogPost.title && (
          <h1 className="text-3xl font-light">{blogPost.title}</h1>
        )}
        <button
          onClick={closeModal}
          className="absolute right-2 top-4 m-2 rounded-full p-2 transition-all hover:bg-white/20"
        >
          <Cross1Icon className="h-6 w-6" />
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Modal>
  );
}
