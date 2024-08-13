"use client";

import { api } from "~/trpc/react";

import { type Persona, type User } from "@prisma/client";
import { useEffect, useState } from "react";
import { type PostWithCommentsAndTags } from "~/utils/types";
import { useMdkJwkLocal } from "~/utils/useMdkJwkLocal";

export default function ManageEncryption({ user }: { user: User }) {
  const mdkJwk = useMdkJwkLocal();

  const [queue, setQueue] = useState<{
    posts: PostWithCommentsAndTags[];
    personas: Persona[];
  }>({
    posts: [],
    personas: [],
  });

  const { data: postsData, isSuccess: isSuccessPosts } =
    api.post.getByUserForJobQueue.useQuery({ mdkJwk });
  const { data: personasData, isSuccess: isSuccessPersonas } =
    api.persona.getByUserForJobQueue.useQuery();
  const tagAndMemorize = api.post.tagAndMemorize.useMutation();
  const bulkUpdatePersonas = api.persona.bulkUpdate.useMutation();
  const updatePost = api.post.update.useMutation();

  useEffect(() => {
    if (isSuccessPosts && isSuccessPersonas) {
      setQueue({
        posts: postsData,
        personas: personasData,
      });
    }
  }, [isSuccessPosts, isSuccessPersonas, postsData, personasData]);

  useEffect(() => {
    const newTagAndMemorizeQueue: PostWithCommentsAndTags[] = [];
    const newEncryptQueuePosts: PostWithCommentsAndTags[] = [];
    const newEncryptQueuePersonas: Persona[] = [];

    queue.posts.forEach((post) => {
      const isOldPost =
        new Date(post.createdAt) < new Date(Date.now() - 8 * 60 * 60 * 1000);
      const hasContent = post.content && post.content.length > 5;
      const hasNoTags = !post.tags?.length;
      const hasComments = post.comments;
      const hasNoContentIV = !post.contentIV;

      if (hasContent && hasNoTags && isOldPost) {
        newTagAndMemorizeQueue.push(post);
      }

      if (
        user?.sukMdk &&
        user?.passwordSalt &&
        (hasContent || hasComments) &&
        hasNoContentIV
      ) {
        newEncryptQueuePosts.push(post);
      }
    });

    if (queue.personas.length && user?.sukMdk) {
      queue.personas.forEach((persona) => {
        if (!persona.nameIV) {
          newEncryptQueuePersonas.push(persona);
        }
      });
    }

    if (newTagAndMemorizeQueue.length) {
      tagAndMemorize
        .mutateAsync(
          newTagAndMemorizeQueue.map((post) => ({
            id: post.id,
            content: post.content,
            tags: post.tags ? post.tags.map((tag) => tag.content) : [],
          })),
        )
        .catch((error) => {
          console.error("Error processing tagAndMemorizeQueue:", error);
        });
    }

    if (newEncryptQueuePersonas.length) {
      bulkUpdatePersonas
        .mutateAsync({
          personas: newEncryptQueuePersonas,
          mdkJwk,
        })
        .catch((error) => {
          console.error("Error processing encryptQueue:", error);
        });
    }

    if (newEncryptQueuePosts.length && mdkJwk) {
      Promise.all(
        newEncryptQueuePosts.map(async (post) => {
          if (!post.content || post.contentIV) {
            return;
          }
          await updatePost.mutateAsync({
            postId: post.id,
            content: post.content ?? "",
            summary: post.summary ?? undefined,
            comments: post.comments?.map((comment) => ({
              id: comment.id,
              content: comment.content,
              coachName: comment.coachName ?? undefined,
            })),
            mdkJwk,
          });
        }),
      ).catch((error) => {
        console.error("Error processing encryptQueue:", error);
      });
    }
  }, [
    queue,
    user?.sukMdk,
    user?.passwordSalt,
    mdkJwk,
    tagAndMemorize,
    bulkUpdatePersonas,
    updatePost,
  ]);

  return null;
}
