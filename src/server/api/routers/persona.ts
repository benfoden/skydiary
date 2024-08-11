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
  encryptTextWithKey,
  importKeyFromJWK,
} from "~/utils/cryptoA1";
import { cleanStringForInput } from "~/utils/text";

export const personaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
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
      const persona = await ctx.db.persona.create({
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
        mdk: z.instanceof(CryptoKey).optional(),
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
      if (input.mdk) {
        data = await encryptPersona(data, input.mdk);
      }
      return await ctx.db.persona.update({
        where: { id: input.personaId, createdBy: { id: ctx.session.user.id } },
        data,
      });
    }),

  updateEncrypted: protectedProcedure
    .input(
      z.object({
        mdk: z.instanceof(CryptoKey),
        personaId: z.string(),
        image: z.string().optional(),
        age: z.number().optional(),
        name: z.string(),
        traits: z.string(),
        gender: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        occupation: z.string().nullable().optional(),
        relationship: z.string().nullable().optional(),
        communicationStyle: z.string().nullable().optional(),
        communicationSample: z.string().nullable().optional(),
        isFavorite: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data: Partial<Persona> = {};

      const encryptIfNotNullish = async (
        value: string | null | undefined,
        key: CryptoKey,
      ) => {
        if (value != null) {
          const { cipherText, iv } = await encryptTextWithKey(value, key);
          return { cipherText, iv: Buffer.from(iv).toString("base64") };
        }
        return null;
      };

      const encryptedName = await encryptIfNotNullish(input.name, input.mdk);
      if (encryptedName) {
        data.name = encryptedName.cipherText;
        data.nameIV = encryptedName.iv;
      }

      const encryptedTraits = await encryptIfNotNullish(
        input.traits,
        input.mdk,
      );
      if (encryptedTraits) {
        data.traits = encryptedTraits.cipherText;
        data.traitsIV = encryptedTraits.iv;
      }

      const encryptedGender = await encryptIfNotNullish(
        input.gender,
        input.mdk,
      );
      if (encryptedGender) {
        data.gender = encryptedGender.cipherText;
        data.genderIV = encryptedGender.iv;
      }

      const encryptedDescription = await encryptIfNotNullish(
        input.description,
        input.mdk,
      );
      if (encryptedDescription) {
        data.description = encryptedDescription.cipherText;
        data.descriptionIV = encryptedDescription.iv;
      }

      const encryptedOccupation = await encryptIfNotNullish(
        input.occupation,
        input.mdk,
      );
      if (encryptedOccupation) {
        data.occupation = encryptedOccupation.cipherText;
        data.occupationIV = encryptedOccupation.iv;
      }

      const encryptedRelationship = await encryptIfNotNullish(
        input.relationship,
        input.mdk,
      );
      if (encryptedRelationship) {
        data.relationship = encryptedRelationship.cipherText;
        data.relationshipIV = encryptedRelationship.iv;
      }

      const encryptedCommunicationStyle = await encryptIfNotNullish(
        input.communicationStyle,
        input.mdk,
      );
      if (encryptedCommunicationStyle) {
        data.communicationStyle = encryptedCommunicationStyle.cipherText;
        data.communicationStyleIV = encryptedCommunicationStyle.iv;
      }

      const encryptedCommunicationSample = await encryptIfNotNullish(
        input.communicationSample,
        input.mdk,
      );
      if (encryptedCommunicationSample) {
        data.communicationSample = encryptedCommunicationSample.cipherText;
        data.communicationSampleIV = encryptedCommunicationSample.iv;
      }

      if (input.image != null) {
        data.image = input.image;
      }

      if (input.age != null) {
        data.age = input.age;
      }

      if (input.isFavorite != null) {
        data.isFavorite = input.isFavorite;
      }

      return ctx.db.persona.update({
        where: { id: input.personaId },
        data: data,
      });
    }),
  bulkUpdateEncrypted: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          nameIV: z.string().nullable().optional(),
          traits: z.string(),
          traitsIV: z.string().nullable().optional(),
          gender: z.string().nullable().optional(),
          genderIV: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          descriptionIV: z.string().nullable().optional(),
          occupation: z.string().nullable().optional(),
          occupationIV: z.string().nullable().optional(),
          relationship: z.string().nullable().optional(),
          relationshipIV: z.string().nullable().optional(),
          communicationStyle: z.string().nullable().optional(),
          communicationStyleIV: z.string().nullable().optional(),
          communicationSample: z.string().nullable().optional(),
          communicationSampleIV: z.string().nullable().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const updatePromises = input.map((persona) => {
        const data: Partial<Persona> = {};
        if (persona.nameIV) {
          data.name = persona.name;
          data.nameIV = persona.nameIV;
        }
        if (persona.traitsIV) {
          data.traits = persona.traits;
          data.traitsIV = persona.traitsIV;
        }
        if (persona.gender && persona.genderIV) {
          data.gender = persona.gender;
          data.genderIV = persona.genderIV;
        }
        if (persona.description && persona.descriptionIV) {
          data.description = persona.description;
          data.descriptionIV = persona.descriptionIV;
        }
        if (persona.occupation && persona.occupationIV) {
          data.occupation = persona.occupation;
          data.occupationIV = persona.occupationIV;
        }
        if (persona.relationship && persona.relationshipIV) {
          data.relationship = persona.relationship;
          data.relationshipIV = persona.relationshipIV;
        }
        if (persona.communicationStyle && persona.communicationStyleIV) {
          data.communicationStyle = persona.communicationStyle;
          data.communicationStyleIV = persona.communicationStyleIV;
        }
        if (persona.communicationSample && persona.communicationSampleIV) {
          data.communicationSample = persona.communicationSample;
          data.communicationSampleIV = persona.communicationSampleIV;
        }

        return ctx.db.persona.update({
          where: { id: persona.id },
          data: data,
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
    .input(z.string().nullable().optional())
    .query(async ({ ctx, input }) => {
      const personas = await ctx.db.persona.findMany({
        where: { createdBy: { id: ctx.session.user.id }, isUser: false },
        orderBy: { createdAt: "asc" },
      });
      if (input) {
        const jwkMdk = JSON.parse(input) as JsonWebKey;
        const key = await importKeyFromJWK(jwkMdk);
        console.log("decrypting personas with mdk:", key);

        //todo: remove slice
        await Promise.all(
          personas.map(async (persona: Persona) => {
            if (input) {
              await decryptPersona(persona, key);
            }
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
