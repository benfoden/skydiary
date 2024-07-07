import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional(),
        stripeCustomerId: z.string().optional(),
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
          stripeCustomerId: input.stripeCustomerId,
        },
      });
    }),
  // getUser is via getServerAuthSession

  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.user.delete({
      where: { id: userId },
    });
  }),
});
