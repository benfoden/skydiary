"use server";

import { type Comment, type Persona } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getResponse } from "~/server/api/ai";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { productPlan } from "~/utils/constants";
import { commentPromptString, randomizedSkyAdvisor } from "~/utils/prompts";
import { type CommentType } from "~/utils/types";

function userHasCommentAvailable(comments: Comment[], userProductId: string) {
  return (
    comments.filter(
      (comment: Comment) =>
        comment.createdAt.toDateString() === new Date().toDateString(),
    ).length > productPlan(userProductId)?.comments
  );
}

export async function makeComment({
  comments,
  postId,
  userProductId,
  commentPersona,
}: {
  comments: Comment[];
  postId: string;
  userProductId: string;
  commentPersona?: Persona;
}) {
  "use server";

  try {
    // get latest post in case there are any changes
    const [latestPost, currentUserPersona, session] = await Promise.all([
      api.post.getByPostId({ postId }),
      api.persona.getUserPersona(),
      getServerAuthSession(),
    ]);
    const { user } = session;
    if (
      !user ||
      !latestPost?.content ||
      !currentUserPersona ||
      !(
        user.isSpecial ||
        user.isAdmin ||
        userHasCommentAvailable(comments, userProductId)
      )
    ) {
      return;
    }
    let commentType: CommentType = "custom";
    if (!commentPersona) {
      commentType = randomizedSkyAdvisor();
    }

    const messageContent = commentPromptString({
      commentType,
      authorDetails: currentUserPersona,
      diaryEntry: latestPost?.content ?? "",
      characters: productPlan(userProductId)?.characters,
      personaDetails: commentPersona ?? undefined,
    });
    const responseContent = await getResponse({
      messageContent,
    });
    if (responseContent) {
      console.log("responseContent", responseContent);

      await api.comment.create({
        content: responseContent,
        postId,
        coachVariant: commentType,
        createdByPersonaId: commentPersona?.id ?? undefined,
      });
      revalidatePath(`/entry/${postId}`);
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

// <form
//                       key={persona.id}
//                       action={async () => {
//                         "use server";
//                         if (searchParams.s === "1") {
//                           return;
//                         }
//                         try {
//                           if (
//                             productPlan(user?.stripeProductId)?.comments >
//                             comments.filter(
//                               (comment) =>
//                                 comment.createdAt.toDateString() ===
//                                 new Date().toDateString(),
//                             ).length
//                           ) {
//                             return;
//                           }
//                           const latestPost = await api.post.getByPostId({
//                             postId: params.id,
//                           });

//                           const currentUserPersona =
//                             await api.persona.getUserPersona();
//                           //todo: measure tokens and limit based on plan
//                           const prompt = commentPromptString({
//                             authorDetails: currentUserPersona!,
//                             diaryEntry: latestPost?.content ?? "",
//                             characters: productPlan(user?.stripeProductId)
//                               ?.characters,
//                           });

//                           const response = await getResponse({
//                             messageContent: prompt,
//                             model: productPlan(user?.stripeProductId)?.model,
//                           });
//                           if (response) {
//                             await api.comment.create({
//                               content: response,
//                               postId: params?.id,
//                               createdByPersonaId: persona.id,
//                               coachVariant: persona.name,
//                             });
//                             revalidatePath(`/entry/${params.id}`);
//                           } else {
//                             console.error(
//                               "Failed to get a response for the comment.",
//                             );
//                           }
//                         } catch (error) {
//                           console.error("Error creating comment:", error);
//                         }
//                       }}
//                     >
