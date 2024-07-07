"use server";

import { type Comment, type Persona } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getResponse } from "~/server/api/ai";
import { api } from "~/trpc/server";
import { productPlan } from "~/utils/constants";
import { commentPromptString, randomizedCoachVariant } from "~/utils/prompts";

export async function makeComment({
  comments,
  postId,
  isDisabled,
  userProductId,
  commentPersona,
}: {
  comments: Comment[];
  postId: string;
  isDisabled: boolean;
  userProductId: string;
  commentPersona?: Persona;
}) {
  "use server";
  if (isDisabled) {
    return;
  }

  try {
    if (
      productPlan(userProductId)?.comments >
      comments.filter(
        (comment: Comment) =>
          comment.createdAt.toDateString() === new Date().toDateString(),
      ).length
    ) {
      return;
    }
    const latestPost = await api.post.getByPostId({
      postId,
    });
    const currentUserPersona = await api.persona.getUserPersona();
    if (!latestPost?.content || !currentUserPersona) {
      return;
    }

    const messageContent = commentPromptString({
      commentType: commentPersona ? "custom" : randomizedCoachVariant,
      authorDetails: currentUserPersona,
      diaryEntry: latestPost?.content ?? "",
      characters: productPlan(userProductId)?.characters,
      personaDetails: commentPersona ?? undefined,
    });
    const content = await getResponse({
      messageContent,
    });
    if (content) {
      const comment = await api.comment.create({
        content,
        postId,
        coachVariant: commentPersona ? "custom" : randomizedCoachVariant,
      });
      return comment;
    } else {
      console.error("Failed to get a response for the comment.");
    }
  } catch (error) {
    console.error("Error creating comment:", error);
  }
}

export async function deleteComment({
  commentId,
  postId,
  isLoading,
}: {
  commentId: string;
  postId: string;
  isLoading: boolean;
}) {
  "use server";
  if (isLoading) {
    return;
  }
  try {
    await api.comment.delete({
      commentId,
    });
    revalidatePath(`/entry/${postId}`);
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

export async function deletePost({
  postId,
  isLoading,
}: {
  postId: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return;
  }
  ("use server");
  await api.post.delete({ postId });
  revalidatePath("/home");
  redirect("/home");
}
