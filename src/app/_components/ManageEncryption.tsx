"use client";

import { api } from "~/trpc/react";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  encryptPost,
  getJWKFromIndexedDB,
  importKeyFromJWK,
  MASTERDATAKEY,
} from "~/utils/cryptoA1";
import {
  type PostsWithCommentsAndTagsAndPersonas,
  type PostWithCommentsAndTags,
} from "~/utils/types";

export default function ManageEncryption() {
  const session = useSession();
  const user = session?.data?.user;
  const [queue, setQueue] = useState<PostsWithCommentsAndTagsAndPersonas>({
    posts: [],
    personas: [],
  });
  const [tagAndMemorizeQueue, setTagAndMemorizeQueue] = useState<
    PostWithCommentsAndTags[]
  >([]);
  const [encryptQueue, setEncryptQueue] =
    useState<PostsWithCommentsAndTagsAndPersonas>({
      posts: [],
      personas: [],
    });

  const { data: PostWithCommentsAndTags, isSuccess: isSuccessPosts } =
    api.post.getByUserForJobQueue.useQuery();
  const { data: personas, isSuccess: isSuccessPersonas } =
    api.persona.getByUserForJobQueue.useQuery();
  const tagAndMemorize = api.post.tagAndMemorize.useMutation();

  const bulkUpdatePersonas = api.persona.bulkUpdate.useMutation();

  useEffect(() => {
    const handleMakeMdkCookie = async () => {
      const mdkJwk = await getJWKFromIndexedDB(MASTERDATAKEY);
      if (!mdkJwk) {
        throw new Error("Failed to retrieve key from IndexedDB");
      }

      document.cookie = `mdkJwk=${JSON.stringify(mdkJwk)}; path=/; secure; samesite=strict`;
    };
    handleMakeMdkCookie().catch((error) => {
      console.error("Error handling makeMdkCookie:", error);
    });
  }, []);

  useEffect(() => {
    try {
      if (isSuccessPosts && isSuccessPersonas) {
        setQueue({
          posts: PostWithCommentsAndTags,
          personas: personas,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isSuccessPosts, isSuccessPersonas, PostWithCommentsAndTags, personas]);

  useEffect(() => {
    const processPosts = () => {
      const newTagAndMemorizeQueue: PostWithCommentsAndTags[] = [];
      const newEncryptQueuePosts: PostWithCommentsAndTags[] = [];

      queue.posts?.forEach((post) => {
        const isOldPost =
          new Date(post.createdAt) < new Date(Date.now() - 8 * 60 * 60 * 1000);
        const hasContent = post.content.length > 5;
        const hasNoTags = !post.tags.length;
        const hasComments = post.comments.length > 0;

        if (hasContent && hasNoTags && isOldPost) {
          newTagAndMemorizeQueue.push(post);
        }

        if (user?.sukMdk && user?.passwordSalt && (hasContent || hasComments)) {
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
          tagAndMemorizeQueue.map(({ id, content, tags }) => ({
            id,
            content,
            tags: tags.map((tag) => tag.content),
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
        const mdkJwk = await getJWKFromIndexedDB(MASTERDATAKEY);
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
  ]);

  useEffect(() => {
    const encryptedPosts: PostWithCommentsAndTags[] = [];
    if (user?.sukMdk && user?.passwordSalt && encryptQueue.posts.length) {
      const handleEncryptPosts = async () => {
        try {
          const mdkJwk = await getJWKFromIndexedDB(MASTERDATAKEY);
          if (!mdkJwk) {
            throw new Error("Failed to retrieve key from IndexedDB");
          }
          const mdk = await importKeyFromJWK(mdkJwk);
          await Promise.all(
            encryptQueue.posts.map(async (post) =>
              encryptedPosts.push(await encryptPost(post, mdk)),
            ),
          );
        } catch (error) {
          console.error("Error processing encryptQueue:", error);
        }
      };
      handleEncryptPosts()
        // .then(() => {
        //   // console.log("encrypted posts", encryptedPosts);
        //   handleDecryptPosts(encryptedPosts)
        //     // .then(() => console.log("decrypted posts", decryptedPosts))
        //     .catch((e) => console.error("Error decrypting posts:", e));
        // })
        .catch(() => {
          console.error("Error processing encryptQueue:");
        });
    }
  }, [encryptQueue.posts, user?.sukMdk, user?.passwordSalt]);
  return null;
}
