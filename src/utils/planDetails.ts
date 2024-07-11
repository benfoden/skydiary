import { type Comment, type Persona, type User } from "@prisma/client";
import { productPlan } from "./constants";

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
