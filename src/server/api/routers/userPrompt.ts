import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userPromptRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        tagId: z.string().optional(),
        createdById: z.string().optional(),
        isGlobal: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin && input.isGlobal) {
        throw new Error("You are not an admin");
      }

      return ctx.db.prompt.create({
        data: {
          content: input.content,
          tagId: input.tagId,
          createdById: input.createdById,
          isGlobal: input.isGlobal,
        },
      });
    }),

  getAllGlobal: protectedProcedure.query(({ ctx }) => {
    return ctx.db.prompt.findMany({
      where: { isGlobal: true },
      orderBy: { createdAt: "desc" },
    });
  }),
  getByUserId: protectedProcedure.query(({ ctx }) => {
    return ctx.db.prompt.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByTagId: protectedProcedure
    .input(z.object({ tagId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.prompt.findMany({
        where: { tagId: input.tagId },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
        tagId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.db.prompt.findFirst({ where: { id: input.id } });

      if (ctx.session.user.id !== prompt?.createdById) {
        throw new Error("You are not the owner of this prompt");
      }

      return ctx.db.prompt.update({
        where: { id: input.id },
        data: {
          content: input.content,
          tagId: input.tagId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.db.prompt.findFirst({ where: { id: input.id } });

      if (
        !ctx.session.user.isAdmin &&
        ctx.session.user.id !== prompt?.createdById
      ) {
        throw new Error("You are not the owner of this prompt");
      }
      return ctx.db.prompt.delete({
        where: { id: input.id },
      });
    }),
});
