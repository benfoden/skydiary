import { type Persona, type User } from "@prisma/client";
import { productPlan } from "~/utils/constants";

export function isFavoritePersonaAvailable(user: User, personas: Persona[]) {
  return user.isSpecial ||
    user.isAdmin ||
    productPlan(user.stripeProductId)?.personas >
      personas.filter((persona) => persona?.isFavorite).length
    ? true
    : false;
}
