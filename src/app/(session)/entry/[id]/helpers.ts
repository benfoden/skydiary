"use server";

import { type Comment, type Persona } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getResponse } from "~/utils/ai";
import { productPlan } from "~/utils/constants";
import { isCommentAvailable } from "~/utils/planDetails";
import { prompts, randomizedSkyAdvisor } from "~/utils/prompts";
import { type CommentType } from "~/utils/types";

export async function makeComment({
  comments,
  postId,
  userProductId,
  commentPersona,
  mdkJwk,
}: {
  comments: Comment[];
  postId: string;
  userProductId: string;
  commentPersona?: Persona;
  mdkJwk?: JsonWebKey;
}) {
  "use server";

  try {
    // get latest post in case there are any changes
    const [latestPost, currentUserPersona, session] = await Promise.all([
      api.post.getByPostId({ postId }),
      api.persona.getUserPersona({ mdkJwk }),
      getServerAuthSession(),
    ]);
    const { user } = session;
    if (!user || !latestPost?.content || !currentUserPersona) return null;
    if (!isCommentAvailable(user, comments)) {
      return "outOfComments";
    }
    let commentType: CommentType = "custom";
    if (!commentPersona) {
      commentType = randomizedSkyAdvisor();
    }

    const messageContent = prompts.comment({
      commentType,
      authorDetails: currentUserPersona,
      content: latestPost?.content ?? "",
      characters: user?.isSpecial
        ? 1500
        : productPlan(userProductId)?.characters,
      personaDetails: commentPersona ?? undefined,
      contentDate: latestPost?.createdAt,
      commentDate: new Date(),
    });

    const responseContent = await getResponse({
      messageContent,
      model: user?.isSpecial ? "gpt-4o" : productPlan(userProductId)?.model,
    });
    if (responseContent) {
      await api.comment.create({
        content: responseContent,
        postId,
        coachVariant: commentType,
        createdByPersonaId: commentPersona?.id ?? undefined,
        mdkJwk,
      });
      revalidatePath(`/entry/${postId}`);
    } else {
      console.error("Failed to get a response for the comment.");
    }
  } catch (error) {
    console.error("Error creating comment:", error);
  }
}
