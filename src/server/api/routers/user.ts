import { error } from "console";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { cleanStringForInput } from "~/utils/text";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional(),
        isWorkFocused: z.boolean().optional(),
        stripeProductId: z.string().optional(),
        passwordSalt: z.string().optional(),
        sukMdk: z.string().optional(),
        newAnnouncementId: z.string().optional(),
        referredToEmails: z.array(z.string().optional()).optional(),
        isPromptShown: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, string | boolean | undefined> = {};
      if (input.name !== undefined)
        updateData.name = cleanStringForInput(input.name);
      if (input.email !== undefined) updateData.email = input.email;
      if (input.image !== undefined) updateData.image = input.image;
      if (input.isWorkFocused !== undefined)
        updateData.isWorkFocused = input.isWorkFocused;
      if (input.stripeProductId !== undefined)
        updateData.stripeProductId = input.stripeProductId;
      if (input.passwordSalt !== undefined)
        updateData.passwordSalt = input.passwordSalt;
      if (input.sukMdk !== undefined) updateData.sukMdk = input.sukMdk;
      if (input.newAnnouncementId !== undefined)
        updateData.newAnnouncementId = input.newAnnouncementId;
      if (input.referredToEmails !== undefined)
        updateData.referredToEmails = JSON.stringify(input.referredToEmails);
      if (input.isPromptShown !== undefined)
        updateData.isPromptShown = input.isPromptShown;

      return ctx.db.user.update({
        where: { id: ctx?.session?.user?.id },
        data: updateData,
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
        newAnnouncementId: z.string().optional(),
        referredToEmails: z.array(z.string().optional()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        return error("Not authorized");
      }

      const updateData: Record<string, string | boolean> = {};
      if (input.email) updateData.email = input.email;
      if (input.isAdmin !== undefined) updateData.isAdmin = input.isAdmin;
      if (input.isSpecial !== undefined) updateData.isSpecial = input.isSpecial;
      if (input.stripeProductId)
        updateData.stripeProductId = input.stripeProductId;
      if (input.newAnnouncementId)
        updateData.newAnnouncementId = input.newAnnouncementId;
      if (input.referredToEmails !== undefined)
        updateData.referredToEmails = JSON.stringify(input.referredToEmails);

      return ctx.db.user.update({
        where: { id: input.targetUserId },
        data: updateData,
      });
    }),

  getAllUsersAsAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.isAdmin) {
      return error("Not authorized");
    }
    return ctx.db.user.findMany();
  }),
  // getUser is via getServerAuthSession

  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx?.session?.user?.isAdmin) {
      return;
    }
    const userId = ctx?.session?.user?.id;
    if (!userId) {
      return;
    }

    try {
      await ctx.db.post.deleteMany({
        where: { createdById: userId },
      });
    } catch (error) {
      // Handle error if no posts exist
      console.error("Error deleting posts:", error);
    }

    try {
      await ctx.db.persona.deleteMany({
        where: { createdById: userId },
      });
    } catch (error) {
      // Handle error if no personas exist
      console.error("Error deleting personas:", error);
    }

    try {
      await ctx.db.subscription.deleteMany({
        where: { userId: userId },
      });
    } catch (error) {
      // Handle error if no subscriptions exist
      console.error("Error deleting subscriptions:", error);
    }

    await ctx.db.user.delete({
      where: { id: userId },
    });
    // Handle error if user deletion fails

    return { message: "success" };
  }),

  resetDailyUsage: protectedProcedure.mutation(async ({ ctx }) => {
    console.log("reset daily usage");
    const now = new Date();
    const lastResetAt = new Date(
      ctx.session.user.resetAt as string | number | Date,
    );
    const shouldReset = ctx?.session?.user?.resetAt
      ? now.getTime() >= lastResetAt.getTime() + 24 * 60 * 60 * 1000
      : true;

    return shouldReset
      ? await ctx.db.user.update({
          where: { id: ctx?.session?.user?.id },
          data: { commentsUsed: 0, resetAt: now },
        })
      : null;
  }),

  getById: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: { id: input.userId },
      });
    }),

  getByIdAsCron: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        cronSecret: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return await ctx.db.user.findFirst({
        where: { id: input.userId },
      });
    }),

  getAllAsCron: publicProcedure
    .input(z.object({ cronSecret: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return await ctx.db.user.findMany();
    }),
  getUserForExport: protectedProcedure.query(async ({ ctx }) => {
    const userPersona = await ctx.db.persona.findFirst({
      where: {
        createdBy: {
          id: ctx.session.user.id,
        },
        AND: {
          isUser: true,
        },
      },
    });
    if (!userPersona) {
      throw new Error("User persona not found in user export call");
    }

    return {
      id: ctx.session.user.id,
      name: ctx.session.user.name,
      email: ctx.session.user.email,
      image: ctx.session.user.image,
      age: userPersona.age,
      identity: userPersona.gender,
    };
  }),
});
