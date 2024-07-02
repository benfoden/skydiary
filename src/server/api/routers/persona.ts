import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().max(1000).optional(),
        image: z.string().optional(),
        age: z.number().max(120).optional(),
        gender: z.string().max(140).optional(),
        relationship: z.string().max(140).optional(),
        occupation: z.string().max(140).optional(),
        traits: z.string().max(140),
        communicationStyle: z.string().max(140).optional(),
        communicationSample: z.string().max(1000).optional(),
        isUser: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.persona.create({
        data: {
          name: input.name,
          description: input.description,
          image: input.image,
          age: input.age,
          gender: input.gender,
          relationship: input.relationship,
          occupation: input.occupation,
          traits: input.traits,
          communicationStyle: input.communicationStyle,
          communicationSample: input.communicationSample,
          isUser: input.isUser,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        personaId: z.string(),
        name: z.string().optional(),
        description: z.string().max(1000).optional(),
        image: z.string().optional(),
        age: z.number().max(120).optional(),
        gender: z.string().max(140).optional(),
        relationship: z.string().max(140).optional(),
        occupation: z.string().max(140).optional(),
        traits: z.string().max(140).optional(),
        communicationStyle: z.string().max(140).optional(),
        communicationSample: z.string().max(1000).optional(),
        isUser: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.persona.update({
        where: { id: input.personaId, createdBy: { id: ctx.session.user.id } },
        data: {
          name: input.name,
          description: input.description,
          image: input.image,
          age: input.age,
          gender: input.gender,
          relationship: input.relationship,
          occupation: input.occupation,
          traits: input.traits,
          communicationStyle: input.communicationStyle,
          communicationSample: input.communicationSample,
          isUser: input.isUser,
        },
      });
    }),
  getAllByUserId: protectedProcedure.query(({ ctx }) => {
    return ctx.db.persona.findMany({
      where: { createdBy: { id: ctx.session.user.id }, isUser: false },
      orderBy: { createdAt: "desc" },
    });
  }),
  getAllUserPersonas: publicProcedure.query(({ ctx }) => {
    return ctx.db.persona.findMany({
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
      return ctx.db.persona.delete({
        where: { id: input.personaId, isUser: false },
      });
    }),
});
