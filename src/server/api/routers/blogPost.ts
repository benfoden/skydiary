import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getResponse } from "~/utils/ai";
import { prompts } from "~/utils/prompts";

export const blogPostRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.create({
        data: {
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.update({
        where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
        data: {
          content: input.content,
          description: input.description,
        },
      });
    }),

  getAllByTag: protectedProcedure
    .input(z.object({ tag: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findMany({
        where: {
          AND: [
            { createdBy: { id: ctx.session.user.id } },
            { tags: { some: { id: input.tagId } } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getByUser: protectedProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
      },
    });
  }),

  getAllByUserForExport: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.blogPost.findMany({
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

    return posts.map(
      (post: {
        content: string;
        updatedAt: Date;
        createdAt: Date;
        id: string;
        tags: { content: string }[];
      }) => ({
        id: post.id,
        content: post.content,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        tags: post.tags.map((tag) => ({
          content: tag.content,
        })),
      }),
    );
  }),

  getByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findFirst({
        where: { id: input.postId },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.delete({
        where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
      });
    }),

  summarizeAllPostsOlderThanToday: publicProcedure.mutation(async ({ ctx }) => {
    const today = new Date().setHours(0, 0, 0, 0);

    const postsNotFromToday = await ctx.db.blogPost.findMany({
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
      await ctx.db.blogPost.update({
        where: { id: post.id },
        data: { summary },
      });
    }
  }),

  checkAndSummarizeLastPost: protectedProcedure
    .input(z.object({ userTimezone: z.string(), today: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const posts = await ctx.db.blogPost.findMany({
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
          await ctx.db.blogPost.update({
            where: { id: lastPost.id },
            data: { summary },
          });
        }
      }
    }),
});
