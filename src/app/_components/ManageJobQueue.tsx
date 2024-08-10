"use client";

import { api } from "~/trpc/react";

import { type Persona } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  decryptPersona,
  decryptPost,
  encryptPersona,
  encryptPost,
  getJWKFromIndexedDB,
  importKeyFromJWK,
  MASTERDATAKEY,
} from "~/utils/cryptoA1";
import {
  type PostsWithCommentsAndTagsAndPersonas,
  type PostWithCommentsAndTags,
} from "~/utils/types";

export default function ManageJobQueue() {
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

        if (user?.sukMdk && (hasContent || hasComments)) {
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
  }, [queue, user?.sukMdk]);

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
    const encryptedPersonas: Persona[] = [];
    const decryptedPersonas: Persona[] = [];

    if (encryptQueue.personas.length && user?.sukMdk) {
      console.log("encryptQueue.personas", encryptQueue.personas);
      const handleEncryptPersonas = async () => {
        try {
          const jwkMdk = await getJWKFromIndexedDB(MASTERDATAKEY);
          if (!jwkMdk) {
            throw new Error("Failed to retrieve key from IndexedDB");
          }
          const mdk = await importKeyFromJWK(jwkMdk);
          await Promise.all(
            encryptQueue.personas.map(async (persona) =>
              encryptedPersonas.push(await encryptPersona(persona, mdk)),
            ),
          );
        } catch (error) {
          console.error("Error processing encryptQueue:", error);
        }
      };
      handleEncryptPersonas()
        .then(() => {
          console.log("encrypted personas", encryptedPersonas);
          handleDecryptPersonas(encryptedPersonas).catch((e) =>
            console.error("Error decrypting personas:", e),
          );
        })
        .catch(() => {
          console.error("Error processing encryptQueue:");
        });
    }

    const handleDecryptPersonas = async (personas: Persona[]) => {
      const jwkMdk = await getJWKFromIndexedDB(MASTERDATAKEY);
      if (!jwkMdk) {
        throw new Error("Failed to retrieve key from IndexedDB");
      }
      const mdk = await importKeyFromJWK(jwkMdk);
      return Promise.all(
        personas.map(async (persona) => {
          decryptedPersonas.push(await decryptPersona(persona, mdk));
        }),
      );
    };

    console.log("decrypted personas", decryptedPersonas);
  }, [encryptQueue.personas, user?.sukMdk]);

  useEffect(() => {
    const encryptedPosts: PostWithCommentsAndTags[] = [];
    const decryptedPosts: PostWithCommentsAndTags[] = [];
    if (encryptQueue.posts.length && user?.sukMdk) {
      const handleEncryptPosts = async () => {
        try {
          const jwkMdk = await getJWKFromIndexedDB(MASTERDATAKEY);
          if (!jwkMdk) {
            throw new Error("Failed to retrieve key from IndexedDB");
          }
          const mdk = await importKeyFromJWK(jwkMdk);
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
        .then(() => {
          console.log("encrypted posts", encryptedPosts);
          handleDecryptPosts(encryptedPosts)
            .then(() => console.log("decrypted posts", decryptedPosts))
            .catch((e) => console.error("Error decrypting posts:", e));
        })
        .catch(() => {
          console.error("Error processing encryptQueue:");
        });
    }

    const handleDecryptPosts = async (posts: PostWithCommentsAndTags[]) => {
      const jwkMdk = await getJWKFromIndexedDB(MASTERDATAKEY);
      if (!jwkMdk) {
        throw new Error("Failed to retrieve key from IndexedDB");
      }
      const mdk = await importKeyFromJWK(jwkMdk);
      return Promise.all(
        posts.map(async (post) => {
          return await decryptPost(post, mdk);
        }),
      );
    };
  }, [encryptQueue.posts, user?.sukMdk]);
  // console.log("tagAndMemorizeQueue", tagAndMemorizeQueue);
  // console.log("encryptQueue", encryptQueue);
  return null;
}
