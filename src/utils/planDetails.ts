import { type Comment, type Persona, type User } from "@prisma/client";
import { env } from "~/env";

export const ACTIVESTATUSES: string[] = ["trialing", "active", "past_due"];

export type UserPlanLimit = {
  personas: number;
  comments: number;
  memories: number;
  characters: number;
  model: "gpt-3.5-turbo" | "gpt-4o";
};

const userplanDetails: Record<string, UserPlanLimit> = {
  [env.PRODUCT_ID_LITE]: {
    personas: 1,
    comments: 1,
    memories: 10,
    characters: 140,
    model: "gpt-3.5-turbo",
  },
  [env.PRODUCT_ID_PLUS_TEST ?? env.PRODUCT_ID_PLUS]: {
    personas: 10,
    comments: 10,
    memories: 60,
    characters: 1400,
    model: "gpt-4o",
  },
  [env.PRODUCT_ID_PREMIUM_TEST ?? env.PRODUCT_ID_PREMIUM]: {
    personas: 100,
    comments: 100,
    memories: 180,
    characters: 2800,
    model: "gpt-4o",
  },
};

export const productPlan = (stripeProductId?: string | null): UserPlanLimit => {
  "server only";
  return userplanDetails[stripeProductId ?? env.PRODUCT_ID_LITE]!;
};

export type OpenAIModels = ["gpt-4o", "gpt-3.5-turbo"];

export type PlanNames = "lite" | "plus" | "premium";

export const planFromId = (
  stripeProductId?: string | null | undefined,
): string => {
  if (!stripeProductId) {
    return "lite";
  }
  switch (stripeProductId) {
    case "lite":
      return stripeProductId === env.PRODUCT_ID_LITE ? "lite" : "lite";
    case "plus":
      return stripeProductId === env.PRODUCT_ID_PLUS_TEST ||
        stripeProductId === env.PRODUCT_ID_PLUS
        ? "plus"
        : "lite";
    case "premium":
      return stripeProductId === env.PRODUCT_ID_PREMIUM_TEST ||
        stripeProductId === env.PRODUCT_ID_PREMIUM
        ? "premium"
        : "lite";
    default:
      return "lite";
  }
};

export function isCommentAvailable(user: User, comments: Comment[]) {
  return (
    user.isSpecial ||
    productPlan(user.stripeProductId)?.comments >
      comments.filter(
        (comment: Comment) =>
          comment.createdAt.toDateString() === new Date().toDateString(),
      ).length
  );
}

export function isFavoritePersonaAvailable(user: User, personas: Persona[]) {
  return (
    user.isSpecial ||
    productPlan(user.stripeProductId)?.personas >
      personas.filter((persona) => persona?.isFavorite).length
  );
}
