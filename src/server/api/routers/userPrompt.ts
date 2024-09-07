import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userPromptRouter = createTRPCRouter({
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
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByTag: protectedProcedure
    .input(z.object({ tagId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.prompt.findMany({
        where: { tagId: { some: { id: input.postId } } },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.db.prompt.findFirst({ where: { id: input.id } });

      if (ctx.session.user.id !== prompt?.createdById) {
        throw new Error("You are not the owner of this prompt");
      }
      return ctx.db.prompt.delete({
        where: { id: input.id },
      });
    }),
});
