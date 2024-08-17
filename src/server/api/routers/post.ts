import { type Persona } from "@prisma/client";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getResponse, getResponseJSON } from "~/utils/ai";
import { NEWPERSONAUSER, productPlan, TAGS } from "~/utils/constants";
import { decryptPost, encryptPost, importKeyFromJWK } from "~/utils/cryptoA1";
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
        summary: z.string().max(5000).optional(),
        comments: z
          .array(
            z.object({
              id: z.string(),
              content: z.string().max(10000),
              coachName: z.string().optional(),
            }),
          )
          .optional(),
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = {
        id: input.postId,
        content: input.content ?? "",
        summary: input.summary,
        contentIV: "",
        summaryIV: "",
        comments: input.comments?.map((comment) => ({
          id: comment.id,
          content: comment.content,
          coachName: comment.coachName ?? "",
          contentIV: "",
          coachNameIV: "",
        })),
      };

      if (input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        const encryptedData = await encryptPost(data, key);
        data.content = encryptedData.content ?? data.content;
        data.summary = encryptedData.summary ?? data.summary;
        data.summaryIV = encryptedData.summaryIV ?? "";
        data.contentIV = encryptedData.contentIV ?? "";
        data.comments = encryptedData.comments?.map((comment) => ({
          id: comment.id ?? "",
          content: comment.content,
          coachName: comment.coachName ?? "",
          contentIV: comment.contentIV ?? "",
          coachNameIV: comment.coachNameIV ?? "",
        }));
        if (
          (!data.contentIV || (data.summary && !data.summaryIV)) ??
          data.comments?.some((comment) => !comment.contentIV)
        ) {
          throw new Error("Post / comment encryption failed");
        }
      }

      if (data.comments) {
        const commentUpdatePromises = data.comments.map(async (comment) => {
          return ctx.db.comment.update({
            where: { id: comment.id },
            data: {
              content: comment.content,
              coachName: comment.coachName,
              contentIV: comment.contentIV,
              coachNameIV: comment.coachNameIV,
            },
          });
        });
        await Promise.all(commentUpdatePromises);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { comments: _unused, ...dataWithoutComments } = data;
      return ctx.db.post.update({
        where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
        data: dataWithoutComments,
      });
    }),
  bulkUpdate: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        posts: z.array(
          z.object({
            id: z.string(),
            content: z.string().max(50000).optional(),
            summary: z.string().max(5000).optional(),
            comments: z
              .array(
                z.object({
                  id: z.string(),
                  content: z.string().max(10000),
                  coachName: z.string().optional(),
                }),
              )
              .optional(),
            mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatePromises = input.posts.map(async (post) => {
        const data = {
          id: post.id,
          content: post.content ?? "",
          summary: post.summary,
          comments: post.comments?.map((comment) => ({
            id: comment.id,
            content: comment.content,
            coachName: comment.coachName ?? "",
            contentIV: "",
            coachNameIV: "",
          })),
          contentIV: "",
          summaryIV: "",
        };

        if (input.mdkJwk) {
          const key = await importKeyFromJWK(input.mdkJwk);
          const encryptedData = await encryptPost(data, key);
          data.content = encryptedData.content ?? data.content;
          data.contentIV = encryptedData.contentIV ?? "";
          data.summary = encryptedData.summary ?? data.summary;
          data.summaryIV = encryptedData.summaryIV ?? "";
          data.comments = encryptedData.comments?.map((comment) => ({
            id: comment.id ?? "",
            content: comment.content,
            coachName: comment.coachName ?? "",
            contentIV: comment.contentIV ?? "",
            coachNameIV: comment.coachNameIV ?? "",
          }));
          if (
            (!data.contentIV || (data.summary && !data.summaryIV)) ??
            data.comments?.some((comment) => !comment.contentIV)
          ) {
            throw new Error("Post / comment encryption failed");
          }
        }

        if (data.comments) {
          const commentUpdatePromises = data.comments.map(async (comment) => {
            return ctx.db.comment.update({
              where: { id: comment.id },
              data: {
                content: comment.content,
                coachName: comment.coachName,
                contentIV: comment.contentIV,
                coachNameIV: comment.coachNameIV,
              },
            });
          });
          await Promise.all(commentUpdatePromises);
        }

        return ctx.db.post.update({
          where: { id: post.id, createdBy: { id: ctx.session.user.id } },
          data: { ...data, comments: undefined },
        });
      });
      await Promise.all(updatePromises);
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
          comments: true,
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
          comments: true,
        },
      });

      const key = await importKeyFromJWK(input.mdkJwk);

      const updatePostPromises = posts
        .filter((post) => post.content?.length > 5 && !post.contentIV)
        .map(async (post) => {
          const data = {
            id: post.id,
            content: post.content ?? "",
            summary: post.summary ?? "",
            contentIV: "",
            summaryIV: "",
            comments: post.comments?.map((comment) => ({
              id: comment.id,
              content: comment.content,
              coachName: comment.coachName ?? "",
              contentIV: "",
              coachNameIV: "",
            })),
          };
          const encryptedPost = await encryptPost(data, key);
          if (!encryptedPost.contentIV) return;

          const updatePost = ctx.db.post.update({
            where: { id: encryptedPost.id },
            data: {
              content: encryptedPost.content,
              summary: encryptedPost.summary,
              contentIV: encryptedPost.contentIV,
              summaryIV: encryptedPost.summaryIV,
            },
          });

          const updateComments = encryptedPost.comments?.map((comment) =>
            ctx.db.comment.update({
              where: { id: comment.id },
              data: {
                content: comment.content,
                coachName: comment.coachName,
                contentIV: comment.contentIV,
                coachNameIV: comment.coachNameIV,
              },
            }),
          );

          return Promise.all([updatePost, ...(updateComments ?? [])]);
        });

      return await Promise.all(updatePostPromises);
    }),

  tagAndMemorize: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          summary: z.string().nullable().optional(),
          tags: z.array(z.string()),
          mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const userPersona = await ctx.db.persona.findFirst({
        where: { createdById: ctx.session.user.id, isUser: true },
      });

      for (const post of input) {
        if (!post?.id && post.content?.length < 20 && post.tags.length > 0) {
          continue;
        }

        const [newTags, generatedPersona] = await Promise.all([
          getResponse({
            messageContent: prompts.tag({ content: post?.content }),
            model: "gpt-4o-mini",
          }),
          getResponseJSON({
            messageContent: prompts.userPersona({
              persona: userPersona ?? NEWPERSONAUSER,
              content: post?.content,
              wordLimit: ctx.session.user?.isSpecial
                ? 150
                : productPlan(ctx.session.user?.stripeProductId).memories,
            }),
            model: "gpt-4o-mini",
          }),
        ]);

        if (!newTags) {
          continue;
        }
        if (!generatedPersona) {
          continue;
        }
        const personaObject = JSON.parse(generatedPersona) as Persona;

        const tagContents = newTags?.split(",").map((tag) => tag.trim());

        const tagIds = tagContents
          ?.map((content) => {
            const tag = TAGS.find((tag) => tag.content === content);
            return tag?.id ?? undefined;
          })
          .filter((tag): tag is string => tag !== undefined);
        if (!tagIds?.length) {
          continue;
        }

        if (post.mdkJwk) {
          if (post.summary === null || post.summary === undefined) {
            post.summary = "";
          }
          const mdk = await importKeyFromJWK(post.mdkJwk);
          const encryptedPost = await encryptPost(
            { id: post.id, content: post.content, summary: post.summary },
            mdk,
          );
          post.content = encryptedPost.content ?? "";
          post.summary = encryptedPost.summary;
        }

        await Promise.all([
          ctx.db.persona.update({
            where: { id: userPersona?.id },
            data: {
              description: personaObject?.description,
              relationship: personaObject?.relationship,
              traits: personaObject?.traits,
            },
          }),
          ctx.db.post.update({
            where: { id: post.id },
            data: {
              tags: {
                connect: tagIds.slice(0, 3).map((tagId: string) => ({
                  id: tagId,
                })),
              },
            },
          }),
        ]);
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
