import { type Persona } from "@prisma/client";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getResponse, getResponseJSON } from "~/utils/ai";
import { NEWPERSONAUSER } from "~/utils/constants";
import {
  decryptPersona,
  decryptPost,
  decryptTextWithIVAndKey,
  encryptPersona,
  encryptPost,
  encryptTextWithKey,
  importKeyFromJWK,
} from "~/utils/cryptoA1";
import { prompts } from "~/utils/prompts";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string().max(25000) }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      if (post) {
        await ctx.db.event.create({
          data: {
            type: "post",
            userId: ctx.session.user.id,
          },
        });
      }
      return null;
    }),

  update: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().max(50000).optional(),
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.content) return;

      const data = {
        content: input.content ?? "",
        contentIV: "",
      };

      try {
        if (input.mdkJwk) {
          const key = await importKeyFromJWK(input.mdkJwk);
          const { cipherText, iv } = await encryptTextWithKey(
            data.content,
            key,
          );
          data.content = cipherText;
          data.contentIV = Buffer.from(iv).toString("base64");

          if (!iv) {
            throw new Error("Post encryption failed");
          }
        }

        return await ctx.db.post.update({
          where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
          data,
        });
      } catch (error) {
        console.error("Error updating post:", error);
        throw new Error("Failed to update post");
      }
    }),

  getLatest: protectedProcedure
    .input(z.object({ mdkJwk: z.custom<JsonWebKey>().optional() }))
    .query(async ({ ctx, input }) => {
      let post = await ctx.db.post.findFirst({
        orderBy: { createdAt: "desc" },
        where: { createdBy: { id: ctx.session.user.id } },
      });

      if (post && input?.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        const decryptedPostData = await decryptPost(post, key);
        post = decryptedPostData;
      }
      return post;
    }),

  getAllByUserAndTagId: protectedProcedure
    .input(
      z.object({
        tagId: z.string(),
        mdkJwk: z.custom<JsonWebKey>().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          AND: [
            { createdBy: { id: ctx.session.user.id } },
            { tags: { some: { id: input.tagId } } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        return await Promise.all(
          posts.map(async (post) => await decryptPost(post, key)),
        );
      }

      return posts;
    }),

  getByUser: protectedProcedure
    .input(z.object({ mdkJwk: z.custom<JsonWebKey>().optional() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: { createdBy: { id: ctx.session.user.id } },
        orderBy: { createdAt: "desc" },
        include: {
          tags: true,
        },
      });

      if (input?.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        const decryptedPosts = await Promise.all(
          posts.map(async (post) => {
            const decryptedPost = await decryptPost(post, key);
            return {
              ...decryptedPost,
              tags: post.tags,
            };
          }),
        );
        return decryptedPosts;
      }

      return posts;
    }),

  getTagsAndCounts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
      select: {
        tags: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    const tagCountMap: Record<
      string,
      { content: string; id: string; count: number }
    > = {};

    posts.forEach((post: { tags: { id: string; content: string }[] }) => {
      post.tags.forEach((tag: { id: string; content: string }) => {
        if (tagCountMap[tag.id]) {
          tagCountMap[tag.id]!.count += 1;
        } else {
          tagCountMap[tag.id] = { content: tag.content, id: tag.id, count: 1 };
        }
      });
    });

    const tagsList = Object.values(tagCountMap).sort((a, b) =>
      a.content.localeCompare(b.content),
    );

    return tagsList;
  }),

  getByUserForJobQueue: protectedProcedure
    .input(z.object({ mdkJwk: z.custom<JsonWebKey>().optional() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: { createdBy: { id: ctx.session.user.id } },
        orderBy: { createdAt: "desc" },
        include: {
          tags: true,
        },
      });

      if (input?.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        return await Promise.all(
          posts.map(async (post) => await decryptPost(post, key)),
        );
      }

      return posts;
    }),

  getAllByUserForExport: protectedProcedure
    .input(z.object({ mdkJwk: z.custom<JsonWebKey>().optional() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: { createdBy: { id: ctx.session.user.id } },
        orderBy: { createdAt: "desc" },
        include: {
          tags: {
            select: {
              content: true,
            },
          },
        },
      });

      if (input?.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        const decryptedPosts = await Promise.all(
          posts.map(async (post) => await decryptPost(post, key)),
        );
        return decryptedPosts;
      }

      return posts;
    }),

  getByPostId: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        mdkJwk: z.custom<JsonWebKey>().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let post = await ctx.db.post.findFirst({
        where: { id: input.postId },
      });

      if (post && input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        post = await decryptPost(post, key);
      }

      return post;
    }),

  encryptAllPosts: protectedProcedure
    .input(z.object({ mdkJwk: z.custom<JsonWebKey>().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!input?.mdkJwk) return;
      const posts = await ctx.db.post.findMany({
        where: { createdBy: { id: ctx.session.user.id } },
        orderBy: { createdAt: "desc" },
        include: {
          tags: true,
        },
      });

      const key = await importKeyFromJWK(input.mdkJwk);

      const updatePostPromises = posts
        .filter((post) => post.content?.length > 5 && !post.contentIV)
        .map(async (post) => {
          const data = post;
          const encryptedPost = await encryptPost(data, key);
          if (!encryptedPost.contentIV) return;

          return await ctx.db.post.update({
            where: { id: encryptedPost.id },
            data: {
              content: encryptedPost.content,
              summary: encryptedPost.summary,
              contentIV: encryptedPost.contentIV,
              summaryIV: encryptedPost.summaryIV,
            },
          });
        });

      return await Promise.all(updatePostPromises);
    }),

  tagAndMemorize: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let userPersona = await ctx.db.persona.findFirst({
        where: { createdById: ctx.session.user.id, isUser: true },
      });

      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

      let mdk: CryptoKey | undefined;
      let encryptedPersona: Persona;

      if (!userPersona) return;

      // todo: uncomment this when we want to update personas more frequently
      if (userPersona.updatedAt < twelveHoursAgo) {
        return;
      }

      if (input.mdkJwk) {
        mdk = await importKeyFromJWK(input.mdkJwk);
      }

      if (userPersona.descriptionIV && mdk) {
        encryptedPersona = userPersona;
        userPersona = await decryptPersona(encryptedPersona, mdk);
      }

      const posts = await ctx.db.post.findMany({
        where: {
          createdBy: { id: ctx.session.user.id },
          content: { not: "" },
          updatedAt: { lte: twelveHoursAgo },
        },
        orderBy: { createdAt: "asc" },
        take: 2,
      });

      for (const post of posts.filter((post) => post.content?.length >= 20)) {
        if (post.contentIV && mdk) {
          post.content = await decryptTextWithIVAndKey({
            cipherText: post.content,
            iv: Uint8Array.from(Buffer.from(post.contentIV, "base64")),
            key: mdk,
          });
        }

        const generatedPersonaDetails = await getResponseJSON({
          messageContent: prompts.userPersona({
            persona: userPersona ?? NEWPERSONAUSER,
            content: post?.content,
          }),
          model: "gpt-4o-mini",
        });

        if (!generatedPersonaDetails) return;

        const updatedPersonaDetails = JSON.parse(
          generatedPersonaDetails,
        ) as Partial<Persona>;
        let updateUserPersona = { ...userPersona, ...updatedPersonaDetails };

        if (mdk) {
          encryptedPersona = await encryptPersona(updateUserPersona, mdk);
          updateUserPersona = {
            ...userPersona,
            ...encryptedPersona,
          };
        }

        await ctx.db.persona.update({
          where: { id: userPersona?.id },
          data: {
            description: updateUserPersona?.description ?? null,
            descriptionIV: updateUserPersona?.descriptionIV ?? null,
            relationship: updateUserPersona?.relationship ?? null,
            relationshipIV: updateUserPersona?.relationshipIV ?? null,
            traits: updateUserPersona?.traits ?? null,
            traitsIV: updateUserPersona?.traitsIV ?? null,
          },
        });
        console.count("persona update done.");
      }
    }),

  addTagsAsCron: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        tagIds: z.array(z.string()),
        cronSecret: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }

      await ctx.db.post.update({
        where: { id: input.postId },
        data: {
          tags: {
            connect: input.tagIds.slice(0, 3).map((tagId: string) => ({
              id: tagId,
            })),
          },
        },
      });
    }),

  deleteExtraTagsAsCron: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        tagIds: z.array(z.string()),
        cronSecret: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }

      await ctx.db.post.update({
        where: { id: input.postId },
        data: {
          tags: {
            disconnect: input.tagIds.slice(3).map((tagId: string) => ({
              id: tagId,
            })),
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({
        where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
      });
    }),

  summarizeAllPostsOlderThanToday: publicProcedure.mutation(async ({ ctx }) => {
    const today = new Date().setHours(0, 0, 0, 0);

    const postsNotFromToday = await ctx.db.post.findMany({
      where: {
        createdAt: {
          lt: new Date(today),
        },
        summary: null,
        content: {
          not: "",
        },
      },
    });

    for (const post of postsNotFromToday) {
      const summary = await getResponse({
        messageContent: prompts.summary({ content: post.content }),
      });
      if (summary) {
        continue;
      }
      await ctx.db.post.update({
        where: { id: post.id },
        data: { summary },
      });
    }
  }),

  checkAndSummarizeLastPost: protectedProcedure
    .input(z.object({ userTimezone: z.string(), today: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: { createdBy: { id: ctx.session.user.id } },
      });

      const lastPost = posts.find((post) => {
        const postDate = new Date(post.createdAt).toLocaleDateString("en-US", {
          timeZone: input.userTimezone,
        });
        return postDate !== input.today && !post.summary && post.content.length;
      });

      if (lastPost) {
        const summary = await getResponse({
          messageContent: prompts.summary({ content: lastPost.content }),
        });
        if (summary) {
          await ctx.db.post.update({
            where: { id: lastPost.id },
            data: { summary },
          });
        }
      }
    }),

  getLatestTwoByInputUserIdAsCron: publicProcedure
    .input(z.object({ userId: z.string(), cronSecret: z.string() }))
    .query(({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.findMany({
        orderBy: { createdAt: "desc" },
        where: { createdBy: { id: input.userId }, content: { not: "" } },
        take: 2,
      });
    }),

  getLatestTaggedByInputUserIdAsCron: publicProcedure
    .input(z.object({ userId: z.string(), cronSecret: z.string() }))
    .query(({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.findFirst({
        orderBy: { createdAt: "desc" },
        where: {
          createdBy: { id: input.userId },
          content: { not: "" },
          tags: { none: {} },
        },
        include: {
          tags: true,
        },
      });
    }),

  getAllUntaggedByInputUserIdAsCron: publicProcedure
    .input(z.object({ userId: z.string(), cronSecret: z.string() }))
    .query(({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          createdBy: { id: input.userId },
          tags: { none: {} },
        },
        include: {
          tags: true,
        },
      });
    }),

  getAllTaggedByInputUserIdAsCron: publicProcedure
    .input(z.object({ userId: z.string(), cronSecret: z.string() }))
    .query(({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          createdBy: { id: input.userId },
          tags: { some: {} },
        },
        include: {
          tags: true,
        },
      });
    }),

  getAllByUserIdAsCron: publicProcedure
    .input(z.object({ userId: z.string(), cronSecret: z.string() }))
    .query(({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.findMany({
        where: { createdBy: { id: input.userId } },
        orderBy: { createdAt: "desc" },
        include: {
          tags: true,
        },
      });
    }),
});
