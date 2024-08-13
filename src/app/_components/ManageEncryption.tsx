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
  const [tagAndMemorizeQueue, setTagAndMemorizeQueue] = useState<
    PostWithCommentsAndTags[]
  >([]);
  const [encryptQueue, setEncryptQueue] = useState<{
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
  const bulkUpdatePosts = api.post.bulkUpdate.useMutation();

  useEffect(() => {
    try {
      if (isSuccessPosts && isSuccessPersonas) {
        setQueue({
          posts: postsData,
          personas: personasData,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isSuccessPosts, isSuccessPersonas, postsData, personasData]);

  useEffect(() => {
    const processPosts = () => {
      const newTagAndMemorizeQueue: PostWithCommentsAndTags[] = [];
      const newEncryptQueuePosts: PostWithCommentsAndTags[] = [];

      queue.posts?.forEach((post) => {
        const isOldPost =
          new Date(post.createdAt) < new Date(Date.now() - 8 * 60 * 60 * 1000);
        const hasContent = post.content && post.content.length > 5;
        const hasNoTags = !post.tags?.length;
        const hasComments = post.comments;

        if (hasContent && hasNoTags && isOldPost) {
          newTagAndMemorizeQueue.push(post);
        }

        if (user?.sukMdk && user?.passwordSalt && (hasContent ?? hasComments)) {
          newEncryptQueuePosts.push(post);
        }
      });

      setTagAndMemorizeQueue(newTagAndMemorizeQueue);
      setEncryptQueue((prev) => ({
        posts: newEncryptQueuePosts,
        personas: prev.personas,
      }));
    };

    const processPersonas = () => {
      if (queue?.personas?.length && user?.sukMdk) {
        const newEncryptQueuePersonas = queue.personas.filter(
          (persona) => !persona.nameIV,
        );
        setEncryptQueue((prev) => ({
          posts: prev.posts,
          personas: newEncryptQueuePersonas,
        }));
      }
    };

    processPosts();
    processPersonas();
  }, [queue, user?.sukMdk, user?.passwordSalt]);

  useEffect(() => {
    const handleTagAndMemorize = async () => {
      if (tagAndMemorizeQueue.length) {
        await tagAndMemorize.mutateAsync(
          tagAndMemorizeQueue.map((post) => ({
            id: post.id,
            content: post.content,
            tags: post.tags ? post.tags.map((tag) => tag.content) : [],
          })),
        );
      }
    };
    handleTagAndMemorize().catch((error) => {
      console.error("Error processing tagAndMemorizeQueue:", error);
    });
  }, [tagAndMemorizeQueue, tagAndMemorize]);

  useEffect(() => {
    if (user?.sukMdk && user?.passwordSalt && encryptQueue.personas.length) {
      const handleEncryptPersonas = async () => {
        try {
          await bulkUpdatePersonas.mutateAsync({
            personas: encryptQueue.personas,
            mdkJwk,
          });
        } catch (error) {
          console.error("Error processing encryptQueue:", error);
        }
      };
      handleEncryptPersonas().catch(() => {
        console.error("Error processing encryptQueue:");
      });
    }
  }, [
    encryptQueue.personas,
    user?.sukMdk,
    user?.passwordSalt,
    bulkUpdatePersonas,
    mdkJwk,
  ]);

  useEffect(() => {
    if (
      user?.sukMdk &&
      user?.passwordSalt &&
      encryptQueue.posts.length &&
      mdkJwk
    ) {
      const handleEncryptPosts = async () => {
        try {
          await bulkUpdatePosts.mutateAsync({
            posts: encryptQueue.posts.map((post) => ({
              id: post.id,
              content: post.content ?? "",
              summary: post.summary ?? undefined,
              comments: post.comments?.map((comment) => ({
                id: comment.id,
                content: comment.content,
                coachName: comment.coachName ?? undefined,
              })),
            })),
            mdkJwk,
          });
        } catch (error) {
          console.error("Error processing encryptQueue:", error);
        }
      };
      // handleEncryptPosts().catch(() => {
      //   console.error("Error processing encryptQueue:");
      // });
    }
  }, [
    encryptQueue.posts,
    user?.sukMdk,
    user?.passwordSalt,
    mdkJwk,
    bulkUpdatePosts,
  ]);
  return null;
}
