import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        age: z.number().optional(),
        gender: z.string().optional(),
        relationship: z.string().optional(),
        occupation: z.string().optional(),
        traits: z.string(),
        communicationStyle: z.string().optional(),
        communicationSample: z.string().optional(),
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
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.persona.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getByUserId: protectedProcedure.query(({ ctx }) => {
    return ctx.db.persona.findMany({
      where: { user: { some: { id: ctx.session.user.id } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.persona.findMany({
        where: { post: { some: { id: input.postId } } },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ tagId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.persona.delete({
        where: { id: input.tagId },
      });
    }),
});
