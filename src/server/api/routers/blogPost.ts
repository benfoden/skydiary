import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const blogPostRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ content: z.string(), title: z.string(), tag: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.create({
        data: {
          content: input.content,
          title: input.title,
          tag: input.tag,
          createdBy: {
            connect: {
              id: ctx.session.user.id,
              isAdmin: ctx.session.user.isAdmin,
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        tag: z.string().optional(),
        isDraft: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.update({
        where: {
          id: input.postId,
          createdBy: {
            id: ctx.session.user.id,
            isAdmin: ctx.session.user.isAdmin,
          },
        },
        data: {
          content: input.content,
          title: input.title,
          description: input.description,
          tag: input.tag,
          isDraft: input.isDraft,
        },
      });
    }),

  getByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findFirst({
        where: {
          id: input.postId,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllByTag: protectedProcedure
    .input(z.object({ tag: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findMany({
        where: {
          tag: input.tag,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.delete({
        where: {
          id: input.postId,
          createdBy: {
            id: ctx.session.user.id,
            isAdmin: ctx.session.user.isAdmin,
          },
        },
      });
    }),
});
