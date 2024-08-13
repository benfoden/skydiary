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
      return post;
    }),

  update: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().max(50000).optional(),
        summary: z.string().max(5000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
        data: { content: input.content ?? "", summary: input.summary ?? "" },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  getAllByUserAndTagId: protectedProcedure
    .input(
      z.object({
        tagId: z.string(),
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

      return posts;
    }),

  getByUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.post.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
      },
    });
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

  getByUserForJobQueue: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.post.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
        comments: true,
      },
    });
  }),

  getAllByUserForExport: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.post.findMany({
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
  }),

  getByPostId: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.post.findFirst({
        where: { id: input.postId },
      });
    }),

  tagAndMemorize: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          summary: z.string().nullable().optional(),
          tags: z.array(z.string()),
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
                connect: tagIds.slice(0, 2).map((tagId: string) => ({
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
