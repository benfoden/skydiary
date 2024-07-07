import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
        },
      });
    }),
  updateUserAsAdmin: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
        email: z.string().email().optional(),
        isAdmin: z.boolean().optional(),
        isSpecial: z.boolean().optional(),
        stripeProductId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        return;
      }
      console.log("input", input);
      return ctx.db.user.update({
        where: { id: input.targetUserId },
        data: {
          email: input.email,
          isAdmin: input.isAdmin,
          isSpecial: input.isSpecial,
          stripeProductId: input.stripeProductId,
        },
      });
    }),

  getAllUsersAsAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.isAdmin) {
      return;
    }
    return ctx.db.user.findMany();
  }),
  // getUser is via getServerAuthSession

  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.user.delete({
      where: { id: userId },
    });
  }),

  resetDailyUsage: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const now = new Date();
    const lastResetAt = new Date(
      ctx.session.user.resetAt as string | number | Date,
    );
    const shouldReset = ctx.session.user.resetAt
      ? now.getTime() >= lastResetAt.getTime() + 24 * 60 * 60 * 1000
      : true;

    return (
      shouldReset &&
      ctx.db.user.update({
        where: { id: userId },
        data: { commentsUsed: 0, resetAt: now },
      })
    );
  }),
});
