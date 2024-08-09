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

  // const handleEncryptQueue = async () => {
  //   if (encryptQueue.personas.length) {
  //     await api.persona.encryptAsCron.mutateAsync({
  //       personaQueueOutput: encryptQueue.personas,
  //       cronSecret: env.CRON_SECRET,
  //     });
  //   }
  // };

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

  //todo: process the job queue for each jobToDo

  useEffect(() => {
    if (queue?.posts?.length > 0) {
      queue.posts.forEach((post) => {
        if (
          post.content.length > 5 &&
          !post.tags.length &&
          new Date(post.createdAt) < new Date(Date.now() - 8 * 60 * 60 * 1000)
        ) {
          setTagAndMemorizeQueue((prev) => [...prev, post]);
        }
        if (
          user?.sukMdk &&
          (post.content.length > 5 || post.comments.length > 0)
        ) {
          setEncryptQueue((prev) => ({
            posts: [...prev.posts, post],
            personas: prev.personas,
          }));
        }
      });
    }

    if (queue?.personas?.length && user?.sukMdk) {
      setEncryptQueue((prev) => ({
        posts: prev.posts,
        personas: queue.personas.filter((persona) => {
          if (!persona.nameIV) {
            return true;
          }
        }),
      }));
    }
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
    if (encryptQueue.personas.length && user?.sukMdk) {
      console.log("encryptQueue.personas", encryptQueue.personas.length);
      const handleEncryptQueue = async () => {
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
      handleEncryptQueue().catch(() => {
        console.error("Error processing encryptQueue:");
      });
    }
    console.log("encryptedPersonas", encryptedPersonas);

    const handleDecryptPersonas = async (personas: Persona[]) => {
      const jwkMdk = await getJWKFromIndexedDB(MASTERDATAKEY);
      if (!jwkMdk) {
        throw new Error("Failed to retrieve key from IndexedDB");
      }
      const mdk = await importKeyFromJWK(jwkMdk);
      return Promise.all(
        personas.map(async (persona) => {
          return await decryptPersona(persona, mdk);
        }),
      );
    };

    handleDecryptPersonas(encryptedPersonas)
      .then((decryptedPersonas) => {
        console.log("decrypted personas", decryptedPersonas);
      })
      .catch((e) => console.error("Error decrypting personas:", e));
  }, [encryptQueue.personas, user?.sukMdk]);

  useEffect(() => {
    const encryptedPosts: PostWithCommentsAndTags[] = [];
    if (encryptQueue.posts.length && user?.sukMdk) {
      console.log("encryptQueue.posts", encryptQueue.posts.length);
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
      handleEncryptPosts().catch(() => {
        console.error("Error processing encryptQueue:");
      });
    }
    console.log("encryptedPosts", encryptedPosts);

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

    handleDecryptPosts(encryptedPosts)
      .catch((e) => console.error("Error decrypting posts:", e))
      .then((decryptedPosts) => {
        console.log("decrypted posts", decryptedPosts);
      })
      .catch((e) => console.error("Error decrypting posts:", e));
  }, [encryptQueue.posts, user?.sukMdk]);
  // console.log("tagAndMemorizeQueue", tagAndMemorizeQueue);
  // console.log("encryptQueue", encryptQueue);
  return null;
}
