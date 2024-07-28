import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// model Event {
//   id        String   @id @default(cuid())
//   type      String
//   value     String?
//   userId    String
//   ipAddress String?
//   userAgent String?
//   createdAt DateTime @default(now())
// }

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        value: z.string(),
        type: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          value: input.value,
          type: input.type,
          userId: ctx.session.user.id,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.event.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllByType: protectedProcedure
    .input(z.object({ type: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findMany({
        where: {
          type: input.type,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.delete({
        where: {
          id: input.eventId,
        },
      });
    }),
});
