import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { cleanStringForInput } from "~/utils/text";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().max(140),
        traits: z.string().max(140),
        description: z.string().max(700).optional(),
        image: z.string().optional(),
        age: z.number().max(10000).optional(),
        gender: z.string().max(140).optional(),
        relationship: z.string().max(140).optional(),
        occupation: z.string().max(140).optional(),
        communicationStyle: z.string().max(140).optional(),
        communicationSample: z.string().max(1000).optional(),
        isUser: z.boolean().optional(),
        isFavorite: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { personasUsed: { increment: 1 } },
      });
      return ctx.db.persona.create({
        data: {
          name: cleanStringForInput(input.name),
          description: cleanStringForInput(input.description ?? ""),
          image: input.image,
          age: input.age,
          gender: cleanStringForInput(input.gender ?? ""),
          relationship: cleanStringForInput(input.relationship ?? ""),
          occupation: cleanStringForInput(input.occupation ?? ""),
          traits: cleanStringForInput(input.traits ?? ""),
          communicationStyle: cleanStringForInput(
            input.communicationStyle ?? "",
          ),
          communicationSample: cleanStringForInput(
            input.communicationSample ?? "",
          ),
          isUser: input.isUser,
          createdBy: { connect: { id: ctx.session.user.id } },
          isFavorite: input.isFavorite,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        personaId: z.string(),
        name: z.string().max(140),
        traits: z.string().max(140),
        description: z.string().max(700).optional(),
        image: z.string().optional(),
        age: z.number().max(10000).optional(),
        gender: z.string().max(140).optional(),
        relationship: z.string().max(140).optional(),
        occupation: z.string().max(140).optional(),
        communicationStyle: z.string().max(140).optional(),
        communicationSample: z.string().max(1000).optional(),
        isUser: z.boolean().optional(),
        isFavorite: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.persona.update({
        where: { id: input.personaId, createdBy: { id: ctx.session.user.id } },
        data: {
          name: cleanStringForInput(input.name),
          description: cleanStringForInput(input.description ?? ""),
          image: input.image,
          age: input.age,
          gender: cleanStringForInput(input.gender ?? ""),
          relationship: cleanStringForInput(input.relationship ?? ""),
          occupation: cleanStringForInput(input.occupation ?? ""),
          traits: cleanStringForInput(input.traits ?? ""),
          communicationStyle: cleanStringForInput(
            input.communicationStyle ?? "",
          ),
          communicationSample: cleanStringForInput(
            input.communicationSample ?? "",
          ),
          isUser: input.isUser,
          isFavorite: input.isFavorite,
        },
      });
    }),

  updateUserPersonaAsCron: publicProcedure
    .input(
      z.object({
        createdById: z.string(),
        personaId: z.string(),
        name: z.string().max(140),
        traits: z.string().max(140),
        description: z.string().max(700).optional(),
        image: z.string().optional(),
        age: z.number().max(10000).optional(),
        gender: z.string().max(140).optional(),
        relationship: z.string().max(140).optional(),
        occupation: z.string().max(140).optional(),
        communicationStyle: z.string().max(140).optional(),
        communicationSample: z.string().max(1000).optional(),
        isFavorite: z.boolean().optional(),
        cronSecret: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return ctx.db.persona.update({
        where: {
          id: input.personaId,
          createdBy: { id: input.createdById },
          isUser: true,
        },
        data: {
          name: cleanStringForInput(input.name),
          description: cleanStringForInput(input.description ?? ""),
          image: input.image,
          age: input.age,
          gender: cleanStringForInput(input.gender ?? ""),
          relationship: cleanStringForInput(input.relationship ?? ""),
          occupation: cleanStringForInput(input.occupation ?? ""),
          traits: cleanStringForInput(input.traits ?? ""),
          communicationStyle: cleanStringForInput(
            input.communicationStyle ?? "",
          ),
          communicationSample: cleanStringForInput(
            input.communicationSample ?? "",
          ),
          isFavorite: input.isFavorite,
        },
      });
    }),
  getAllByUserId: protectedProcedure.query(({ ctx }) => {
    return ctx.db.persona.findMany({
      where: { createdBy: { id: ctx.session.user.id }, isUser: false },
      orderBy: { createdAt: "asc" },
    });
  }),
  getAllUserPersonasAsCron: publicProcedure
    .input(z.object({ cronSecret: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return await ctx.db.persona.findMany({
        where: { isUser: true },
        orderBy: { createdAt: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ personaId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.persona.findUnique({
        where: { id: input.personaId },
      });
    }),
  getUserPersona: protectedProcedure.query(({ ctx }) => {
    return ctx.db.persona.findFirst({
      where: { createdBy: { id: ctx.session.user.id }, isUser: true },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ personaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { personasUsed: { decrement: 1 } },
      });
      return ctx.db.persona.delete({
        where: { id: input.personaId, isUser: false },
      });
    }),
});
