import { env } from "~/env";

export function pathHelper(pathname: string): string {
  switch (pathname) {
    case "/":
      return "/home";
    case "/home":
      return "/topics";
    case "/today":
      return "/home";
    default:
      return pathname;
  }
}

export const TAGS = [
  { content: "career", id: "clwg3mpgd0001vsr5m46ocag5" },
  { content: "diet", id: "clwg3mpgd0000vsr5h6j0z5e7" },
  { content: "exercise", id: "clwg3mpgd0002vsr5urz19xlm" },
  { content: "family", id: "clwg3mpgd0003vsr51azv3nkw" },
  { content: "dating", id: "clwg3mpgd0004vsr56r5doti5" },
  { content: "friends", id: "clwg3mpgd0005vsr5510t1rz9" },
  { content: "mental health", id: "clwg3mpgd0006vsr52bugzcf3" },
  { content: "learning", id: "clwg3mpgd000bvsr5l1joi4c4" },
  { content: "skills", id: "clwg3mpgd0007vsr5ofgll54l" },
  { content: "finances", id: "clwg3mpgd000cvsr5z6mprx5h" },
  { content: "hobbies", id: "clwg3mpgd0008vsr5oru3dpey" },
  { content: "travel", id: "clwg3mpgd000dvsr5robvtn9y" },
  { content: "emotions", id: "clwg3mpgd000avsr5zukohqjx" },
  { content: "goals", id: "clwg3mpgd0009vsr5at0fkh96" },
  { content: "relationships", id: "clwg3mpgd000gvsr5ek7jx2w2" },
  { content: "self", id: "clwg3mpgd000hvsr57ftkjbtj" },
  { content: "work", id: "clwg3mpgd000evsr5nzdy9ece" },
  { content: "education", id: "clwg3mpgd000fvsr5dgk1w7nh" },
  { content: "physical health", id: "clwg3mpgd000ivsr53125sjfk" },
  { content: "spirituality", id: "clwg3mpgd000jvsr5mhgknvq3" },
];

export interface NewPersonaUser {
  description: string;
  relationship: string;
  occupation: string;
  traits: string;
}

export const NEWPERSONAUSER = {
  description: "",
  occupation: "",
  relationship: "",
  traits: "",
};

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
    characters: 280,
    model: "gpt-3.5-turbo",
  },
  [env.PRODUCT_ID_PLUS_TEST ?? env.PRODUCT_ID_PLUS]: {
    personas: 10,
    comments: 10,
    memories: 60,
    characters: 500,
    model: "gpt-4o",
  },
  [env.PRODUCT_ID_PREMIUM_TEST ?? env.PRODUCT_ID_PREMIUM]: {
    personas: 100,
    comments: 100,
    memories: 180,
    characters: 1000,
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
): PlanNames => {
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
