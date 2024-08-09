"use client";

import { api } from "~/trpc/react";

import {
  type Comment,
  type Persona,
  type Post,
  type Tag,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  decryptPersona,
  encryptPersona,
  getJWKFromIndexedDB,
  importKeyFromJWK,
  MASTERDATAKEY,
} from "~/utils/cryptoA1";

export type PostsWithCommentsAndTags = Post & {
  comments: Comment[];
  tags: Tag[];
};

export interface Queue {
  posts: PostsWithCommentsAndTags[];
  personas: Persona[];
}

export default function JobQueueBuilder() {
  const session = useSession();
  const user = session?.data?.user;
  const [queue, setQueue] = useState<Queue>({
    posts: [],
    personas: [],
  });
  const [tagAndMemorizeQueue, setTagAndMemorizeQueue] = useState<
    PostsWithCommentsAndTags[]
  >([]);
  const [encryptQueue, setEncryptQueue] = useState<Queue>({
    posts: [],
    personas: [],
  });

  const { data: postsWithCommentsAndTags, isSuccess: isSuccessPosts } =
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
          posts: postsWithCommentsAndTags,
          personas: personas,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isSuccessPosts, isSuccessPersonas, postsWithCommentsAndTags, personas]);

  //todo: process the job queue for each jobToDo

  useEffect(() => {
    if (queue?.posts?.length > 0) {
      queue.posts.forEach((post) => {
        if (
          post.content.length > 15 &&
          !post.tags.length &&
          new Date(post.createdAt) < new Date(Date.now() - 8 * 60 * 60 * 1000)
        ) {
          setTagAndMemorizeQueue((prev) => [...prev, post]);
        }
        if (user?.sukMdk && !post.contentIV) {
          setEncryptQueue((prev) => ({
            posts: [...prev.posts, post],
            personas: prev.personas,
          }));
        }
      });
    }

    if (queue?.personas?.length > 0 && user?.sukMdk) {
      setEncryptQueue((prev) => ({
        posts: prev.posts,
        personas: queue.personas.filter((persona) => {
          if (persona.name.length && !persona.nameIV) {
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
    const encryptedPosts: Post[] = [];
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
            encryptQueue.personas.map(async (persona) => {
              if (persona.name.length && !persona.nameIV) {
                const encryptedPersona = await encryptPersona(persona, mdk);

                encryptedPersonas.push(encryptedPersona);
              }
            }),
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

  // console.log("tagAndMemorizeQueue", tagAndMemorizeQueue);
  // console.log("encryptQueue", encryptQueue);
  return null;
}
