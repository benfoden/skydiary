import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        traits: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        age: z.number().optional(),
        gender: z.string().optional(),
        relationship: z.string().optional(),
        occupation: z.string().optional(),
        communicationStyle: z.string().optional(),
        communicationSample: z.string().optional(),
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
        description: z.string().optional(),
        image: z.string().optional(),
        age: z.number().optional(),
        gender: z.string().optional(),
        relationship: z.string().optional(),
        occupation: z.string().optional(),
        traits: z.string().optional(),
        communicationStyle: z.string().optional(),
        communicationSample: z.string().optional(),
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
  getById: protectedProcedure
    .input(z.object({ personaId: z.string(), isUser: z.boolean() }))
    .query(({ ctx, input }) => {
      return ctx.db.persona.findUnique({
        where: { id: input.personaId, isUser: input.isUser },
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
