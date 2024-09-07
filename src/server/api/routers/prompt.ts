import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const promptRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        tag: z.string().optional(),
        createdById: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.prompt.create({
        data: {
          content: input.content,
          tag: input.tag,
          createdById: input.createdById,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.prompt.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getByUserId: protectedProcedure.query(({ ctx }) => {
    return ctx.db.prompt.findMany({
      where: { user: { some: { id: ctx.session.user.id } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByTag: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.prompt.findMany({
        where: { post: { some: { id: input.postId } } },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ tagId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.prompt.delete({
        where: { id: input.tagId },
      });
    }),
});
