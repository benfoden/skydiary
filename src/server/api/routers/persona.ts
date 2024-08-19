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
  encryptPersonaCreate,
  encryptPersonaUpdate,
  importKeyFromJWK,
} from "~/utils/cryptoA1";
import { cleanStringForInput } from "~/utils/text";
import {
  type PersonaCreateValues,
  type PersonaUpdateValues,
} from "~/utils/types";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        name: z.string().max(140),
        traits: z.string().max(280),
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

      let data: PersonaCreateValues = {
        name: cleanStringForInput(input.name),
        traits: cleanStringForInput(input.traits ?? ""),
        description: cleanStringForInput(input.description ?? "") ?? undefined,
        image: input.image ?? undefined,
        age: input.age ?? undefined,
        gender: cleanStringForInput(input.gender ?? "") ?? undefined,
        relationship:
          cleanStringForInput(input.relationship ?? "") ?? undefined,
        occupation: cleanStringForInput(input.occupation ?? "") ?? undefined,
        communicationStyle:
          cleanStringForInput(input.communicationStyle ?? "") ?? undefined,
        communicationSample:
          cleanStringForInput(input.communicationSample ?? "") ?? undefined,
        isUser: input.isUser ?? false,
        isFavorite: input.isFavorite ?? false,
      };
      if (input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        data = await encryptPersonaCreate(data, key);
      }
      const persona = await ctx.db.persona.create({
        data: { ...data, createdBy: { connect: { id: ctx.session.user.id } } },
      });
      if (persona) {
        await ctx.db.event.create({
          data: {
            type: "persona",
            userId: ctx.session.user.id,
          },
        });
      }
      return persona;
    }),
  update: protectedProcedure
    .input(
      z.object({
        mdkJwk: z.custom<JsonWebKey>().nullable().optional(),
        personaId: z.string(),
        name: z.string().max(140).optional(),
        traits: z.string().max(280).optional(),
        description: z.string().max(1700).optional(),
        relationship: z.string().max(140).optional(),
        image: z.string().optional(),
        age: z.number().max(10000).optional(),
        gender: z.string().max(140).optional(),
        occupation: z.string().max(140).optional(),
        communicationStyle: z.string().max(140).optional(),
        communicationSample: z.string().max(1000).optional(),
        isUser: z.boolean().optional(),
        isFavorite: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let data: PersonaUpdateValues = {
        name: input.name ? cleanStringForInput(input.name) : undefined,
        traits: cleanStringForInput(input.traits ?? ""),
        description: cleanStringForInput(input.description ?? "") ?? undefined,
        image: input.image ?? undefined,
        age: input.age ?? undefined,
        gender: cleanStringForInput(input.gender ?? "") ?? undefined,
        relationship:
          cleanStringForInput(input.relationship ?? "") ?? undefined,
        occupation: cleanStringForInput(input.occupation ?? "") ?? undefined,
        communicationStyle:
          cleanStringForInput(input.communicationStyle ?? "") ?? undefined,
        communicationSample:
          cleanStringForInput(input.communicationSample ?? "") ?? undefined,
        isUser: input.isUser ?? false,
        isFavorite: input.isFavorite ?? false,
      };

      // Remove falsy optional values (except booleans)
      Object.keys(data).forEach((key) => {
        if (
          data[key as keyof PersonaUpdateValues] === undefined ||
          data[key as keyof PersonaUpdateValues] === null ||
          data[key as keyof PersonaUpdateValues] === ""
        ) {
          delete data[key as keyof PersonaUpdateValues];
        }
      });

      if (input.mdkJwk) {
        const key = await importKeyFromJWK(input.mdkJwk);
        data = await encryptPersonaUpdate(data, key);
        if (!data.nameIV || !data.nameIVBytes) {
          throw new Error("Persona encryption failed");
        }
      }
      return await ctx.db.persona.update({
        where: { id: input.personaId, createdBy: { id: ctx.session.user.id } },
        data,
      });
    }),

  updateUserPersonaAsCron: publicProcedure
    .input(
      z.object({
        personaId: z.string(),
        createdById: z.string(),
        traits: z.string().max(280).optional(),
        description: z.string().max(1700).optional(),
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

      if (!input?.mdkJwk) {
        return personas;
      }

      const key = await importKeyFromJWK(input.mdkJwk);
      const decryptedPersonas = [];
      for (const persona of personas) {
        if (persona.nameIVBytes ?? persona.nameIV) {
          decryptedPersonas.push(await decryptPersona(persona, key));
        } else {
          decryptedPersonas.push(persona);
        }
      }

      return decryptedPersonas;
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
      if (input?.mdkJwk && (persona?.nameIVBytes ?? persona?.nameIV)) {
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

  encryptAllPersonas: protectedProcedure
    .input(z.object({ mdkJwk: z.custom<JsonWebKey>().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!input?.mdkJwk) return;
      const personas = await ctx.db.persona.findMany({
        where: { createdBy: { id: ctx.session.user.id }, isUser: false },
        orderBy: { createdAt: "asc" },
      });

      const key = await importKeyFromJWK(input.mdkJwk);
      const updatePromises = personas
        .filter((persona) => !persona.nameIV)
        .map(async (persona) => {
          const encryptedPersona = await encryptPersona(persona, key);
          if (!encryptedPersona.nameIV) return;
          return ctx.db.persona.update({
            where: { id: encryptedPersona.id },
            data: {
              ...encryptedPersona,
              nameIV: encryptedPersona.nameIV,
              descriptionIV: encryptedPersona.descriptionIV,
              genderIV: encryptedPersona.genderIV,
              relationshipIV: encryptedPersona.relationshipIV,
              occupationIV: encryptedPersona.occupationIV,
              traitsIV: encryptedPersona.traitsIV,
              communicationStyleIV: encryptedPersona.communicationStyleIV,
              communicationSampleIV: encryptedPersona.communicationSampleIV,
            },
          });
        });

      return await Promise.all(updatePromises);
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
