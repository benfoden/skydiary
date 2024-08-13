import { type Persona } from "@prisma/client";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  decryptPersona,
  encryptPersona,
  importKeyFromJWK,
} from "~/utils/cryptoA1";
import { cleanStringForInput } from "~/utils/text";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        name: z.string().max(140),
        traits: z.string().max(140),
        description: z.string().max(1700).optional(),
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

      let data = {
        name: cleanStringForInput(input.name),
        description: cleanStringForInput(input.description ?? ""),
        image: input.image,
        age: input.age,
        gender: cleanStringForInput(input.gender ?? ""),
        relationship: cleanStringForInput(input.relationship ?? ""),
        occupation: cleanStringForInput(input.occupation ?? ""),
        traits: cleanStringForInput(input.traits ?? ""),
        communicationStyle: cleanStringForInput(input.communicationStyle ?? ""),
        communicationSample: cleanStringForInput(
          input.communicationSample ?? "",
        ),
        isUser: input.isUser,
        createdBy: { connect: { id: ctx.session.user.id } },
        isFavorite: input.isFavorite,
      };
      if (input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        data = (await encryptPersona(
          data as Partial<Persona>,
          key,
        )) as typeof data;
      }
      const persona = await ctx.db.persona.create({
        data,
      });
      if (persona) {
        await ctx.db.event.create({
          data: {
            type: "persona",
            userId: ctx.session.user.id,
          },
        });
      }
      return null;
    }),
  update: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        personaId: z.string(),
        name: z.string().max(140),
        traits: z.string().max(140),
        description: z.string().max(1700).optional(),
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
      let data: Partial<Persona> = {
        name: cleanStringForInput(input.name),
        description: cleanStringForInput(input.description ?? ""),
        image: input.image,
        age: input.age,
        gender: cleanStringForInput(input.gender ?? ""),
        relationship: cleanStringForInput(input.relationship ?? ""),
        occupation: cleanStringForInput(input.occupation ?? ""),
        traits: cleanStringForInput(input.traits ?? ""),
        communicationStyle: cleanStringForInput(input.communicationStyle ?? ""),
        communicationSample: cleanStringForInput(
          input.communicationSample ?? "",
        ),
        isUser: input.isUser,
        isFavorite: input.isFavorite,
      };
      if (input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        data = await encryptPersona(data, key);
        if (!data.nameIV) {
          throw new Error("Persona encryption failed");
        }
      }
      return await ctx.db.persona.update({
        where: { id: input.personaId, createdBy: { id: ctx.session.user.id } },
        data,
      });
    }),
  bulkUpdate: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        personas: z.array(
          z.object({
            id: z.string(),
            name: z.string().max(140),
            traits: z.string().max(140),
            description: z.string().max(1700).nullable().optional(),
            image: z.string().nullable().optional(),
            age: z.number().max(10000).nullable().optional(),
            gender: z.string().max(140).nullable().optional(),
            relationship: z.string().max(140).nullable().optional(),
            occupation: z.string().max(140).nullable().optional(),
            communicationStyle: z.string().max(140).nullable().optional(),
            communicationSample: z.string().max(1000).nullable().optional(),
            isUser: z.boolean().optional(),
            isFavorite: z.boolean().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatePromises = input.personas.map(async (persona) => {
        let data: Partial<Persona> = {
          name: cleanStringForInput(persona.name),
          description: cleanStringForInput(persona.description ?? ""),
          image: persona.image,
          age: persona.age,
          gender: cleanStringForInput(persona.gender ?? ""),
          relationship: cleanStringForInput(persona.relationship ?? ""),
          occupation: cleanStringForInput(persona.occupation ?? ""),
          traits: cleanStringForInput(persona.traits ?? ""),
          communicationStyle: cleanStringForInput(
            persona.communicationStyle ?? "",
          ),
          communicationSample: cleanStringForInput(
            persona.communicationSample ?? "",
          ),
          isUser: persona.isUser,
          isFavorite: persona.isFavorite,
        };
        if (input.mdkJwk) {
          const key = await importKeyFromJWK(input.mdkJwk);
          data = await encryptPersona(data, key);
          if (!data.nameIV) {
            throw new Error("Persona encryption failed");
          }
        }
        return ctx.db.persona.update({
          where: {
            id: persona.id,
            createdBy: { id: ctx.session.user.id },
          },
          data,
        });
      });
      await Promise.all(updatePromises);
    }),

  updateUserPersonaAsCron: publicProcedure
    .input(
      z.object({
        personaId: z.string(),
        createdById: z.string(),
        traits: z.string().max(140).optional(),
        description: z.string().max(700).optional(),
        relationship: z.string().max(140).optional(),
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
          description: cleanStringForInput(input.description ?? ""),
          relationship: cleanStringForInput(input.relationship ?? ""),
          traits: cleanStringForInput(input.traits ?? ""),
        },
      });
    }),

  getAllByUserId: protectedProcedure
    .input(
      z
        .object({ mdkJwk: z.custom<JsonWebKey>().nullable().optional() })
        .nullable()
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const personas = await ctx.db.persona.findMany({
        where: { createdBy: { id: ctx.session.user.id }, isUser: false },
        orderBy: { createdAt: "asc" },
      });
      if (input?.mdkJwk) {
        const key = await importKeyFromJWK(input?.mdkJwk);
        await Promise.all(
          personas.map(async (persona: Persona) => {
            if (persona.nameIV) {
              return await decryptPersona(persona, key);
            }
            return persona;
          }),
        );
      }
      return personas;
    }),

  getByUserForJobQueue: protectedProcedure.query(({ ctx }) => {
    return ctx.db.persona.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
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

  getAllAiPersonasByUserIdAsCron: publicProcedure
    .input(z.object({ userId: z.string(), cronSecret: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new Error("Unauthorized");
      }
      return await ctx.db.persona.findMany({
        where: { isUser: false, createdBy: { id: input.userId } },
        orderBy: { createdAt: "asc" },
      });
    }),

  getAllByUserForExport: protectedProcedure.query(async ({ ctx }) => {
    const personas = await ctx.db.persona.findMany({
      where: { createdBy: { id: ctx.session.user.id }, isUser: false },
      orderBy: { createdAt: "asc" },
    });

    return personas.map((persona) => ({
      id: persona.id,
      name: persona.name,
      description: persona.description,
      gender: persona.gender,
      occupation: persona.occupation,
      relationship: persona.relationship,
      traits: persona.traits,
      communicationSample: persona.communicationSample,
      communicationStyle: persona.communicationStyle,
    }));
  }),

  getById: protectedProcedure
    .input(
      z.object({
        personaId: z.string(),
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const persona = await ctx.db.persona.findUnique({
        where: { id: input.personaId },
      });
      if (input?.mdkJwk && persona?.nameIV) {
        const key = await importKeyFromJWK(input.mdkJwk);
        return await decryptPersona(persona, key);
      }
      return persona;
    }),
  getUserPersona: protectedProcedure
    .input(
      z
        .object({
          mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const persona = await ctx.db.persona.findFirst({
        where: { createdBy: { id: ctx.session.user.id }, isUser: true },
      });
      if (input?.mdkJwk && persona?.nameIV) {
        const key = await importKeyFromJWK(input.mdkJwk);
        return await decryptPersona(persona, key);
      }
      return persona;
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
