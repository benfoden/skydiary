import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { productPlan } from "~/utils/constants";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        postId: z.string(),
        coachVariant: z.string().optional(),
        createdByPersonaId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.content.trim()) {
        throw new Error("Content cannot be empty.");
      }
      if (
        !ctx.session.user.isSpecial &&
        productPlan(ctx.session.user.stripeProductId)?.comments <=
          (ctx.session.user.commentsUsed ?? 0)
      ) {
        throw new Error(
          "You have reached the maximum number of comments for this plan.",
        );
      }
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { commentsUsed: { increment: 1 } },
      });

      const comment = await ctx.db.comment.create({
        data: {
          content: input.content,
          postId: input.postId,
          coachVariant: input.coachVariant,
          createdByPersonaId: input.createdByPersonaId ?? undefined,
        },
      });

      if (comment) {
        await ctx.db.event.create({
          data: {
            value: input.coachVariant,
            type: "comment",
            userId: ctx.session.user.id,
          },
        });
      }
      return null;
    }),

  delete: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.delete({
        where: { id: input.commentId },
      });
    }),

  // update: protectedProcedure
  //   .input(z.object({ postId: z.string(), content: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.update({
  //       where: { id: input.postId },
  //       data: { content: input.content },
  //     });
  //   }),

  // getLatest: protectedProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });
  // }),

  // getByUserAndTag: protectedProcedure
  //   .input(z.object({ tagContent: z.string() }))
  //   .query(({ ctx, input }) => {
  //     return ctx.db.post.findMany({
  //       where: {
  //         AND: [
  //           { createdBy: { id: ctx.session.user.id } },
  //           { tag: { some: { content: input.tagContent } } },
  //         ],
  //       },
  //       orderBy: { createdAt: "desc" },
  //     });
  //   }),

  // getByUser: protectedProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findMany({
  //     where: { createdBy: { id: ctx.session.user.id } },
  //     orderBy: { createdAt: "desc" },
  //   });
  // }),

  getCommentByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.comment.findFirst({
        where: { postId: input.postId },
      });
    }),

  getCommentsByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.comment.findMany({
        where: { postId: input.postId },
      });
    }),

  // delete: protectedProcedure
  //   .input(z.object({ postId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.delete({
  //       where: { id: input.postId, createdBy: { id: ctx.session.user.id } },
  //     });
  //   }),
});
