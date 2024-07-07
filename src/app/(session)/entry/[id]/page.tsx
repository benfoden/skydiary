"use server";
import { type Persona, type Tag } from "@prisma/client";
import { CircleIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DeleteButton from "~/app/_components/DeleteButton";
import DropDownMenu from "~/app/_components/DropDown";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import { SessionNav } from "~/app/_components/SessionNav";
import { getUserLocale } from "~/i18n";
import { getResponse } from "~/server/api/ai";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { productPlan } from "~/utils/constants";
import {
  commentPromptString,
  prompts,
  randomizedCoachVariant,
} from "~/utils/prompts";
import { formattedTimeStampToDate } from "~/utils/text";
import EntryBody from "./EntryBody";

export default async function Entry({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { s: string };
}) {
  const session = await getServerAuthSession();
  const { user } = session;
  const [t, locale, post, comments, tags, personas] = await Promise.all([
    getTranslations(),
    getUserLocale(),
    api.post.getByPostId({ postId: params.id }),
    api.comment.getCommentsByPostId({ postId: params.id }),
    api.tag.getByPostId({ postId: params.id }),
    api.persona.getAllByUserId(),
  ]);

  if (!post) {
    console.error("Failed to get post.");
    return notFound();
  }

  return (
    <>
      <SessionNav>
        <NavChevronLeft
          targetPathname={"/home"}
          label={t("nav.home")}
          isDisabled={searchParams.s === "1"}
        />
        <h1>{formattedTimeStampToDate(post.createdAt, locale)}</h1>
        <DropDownUser />
      </SessionNav>
      <div className="flex h-full flex-col items-center px-2 pb-4 sm:px-8">
        <EntryBody post={post} />
        <div className="flex w-full max-w-5xl flex-col items-center gap-4">
          <div className="flex w-full flex-row items-center justify-center gap-4">
            {tags && (
              <ul className="flex w-full flex-row flex-wrap items-center justify-start gap-2">
                {tags?.map((tag: Tag) => (
                  <li key={tag.id}>
                    <Link href={`/topics/${tag.content}/${tag.id}`}>
                      <Button variant="text">
                        <span className="text-xs font-medium">
                          {tag.content}
                        </span>
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex w-fit flex-row items-center justify-end gap-2">
              <DropDownMenu isEntryMenu>
                <CopyTextButton text={post.content} />
                <form
                  action={async () => {
                    "use server";
                    await api.post.delete({ postId: post?.id });
                    revalidatePath("/home");
                    redirect("/home");
                  }}
                >
                  <DeleteButton />
                </form>
              </DropDownMenu>
            </div>
          </div>
          <div className="flex h-full w-full flex-col items-center pb-4">
            <div className="flex w-full flex-row items-start justify-center gap-2">
              <ul className="flex w-full flex-row flex-wrap justify-start gap-2">
                <form
                  action={async () => {
                    "use server";
                    if (searchParams.s === "1") {
                      return;
                    }

                    try {
                      if (
                        productPlan(user?.stripeProductId)?.comments >
                        comments.filter(
                          (comment) =>
                            comment.createdAt.toDateString() ===
                            new Date().toDateString(),
                        ).length
                      ) {
                        return;
                      }
                      const latestPost = await api.post.getByPostId({
                        postId: params.id,
                      });
                      if (!latestPost?.content) {
                        return;
                      }

                      const currentUserPersona =
                        await api.persona.getUserPersona();

                      const commentType = randomizedCoachVariant;
                      const response = await getResponse({
                        messageContent: commentPromptString({
                          commentType,
                          authorDetails: currentUserPersona!,
                          diaryEntry: latestPost?.content ?? "",
                          characters: productPlan(user?.stripeProductId)
                            ?.characters,
                        }),
                      });
                      if (response) {
                        await api.comment.create({
                          content: response,
                          postId: params?.id,
                          coachVariant: commentType,
                        });
                        revalidatePath(`/entry/${params.id}`);
                      } else {
                        console.error(
                          "Failed to get a response for the comment.",
                        );
                      }
                    } catch (error) {
                      console.error("Error creating comment:", error);
                    }
                  }}
                >
                  <FormButton isDisabled={searchParams.s === "1"}>
                    <div className="flex flex-row items-center gap-2 text-xs">
                      <CircleIcon className="h-4 w-4" />
                      sky
                    </div>
                  </FormButton>
                </form>
                {!personas?.length && (
                  <Link href="/persona/all">
                    <Button>
                      <PlusIcon className="h-4 w-4" />
                      <span className="text-xs">{t("nav.addPersonas")}</span>
                    </Button>
                  </Link>
                )}
                {personas
                  ?.slice(0, productPlan(user?.stripeProductId)?.personas)
                  .map((persona: Persona) => (
                    <form
                      key={persona.id}
                      action={async () => {
                        "use server";
                        if (searchParams.s === "1") {
                          return;
                        }
                        try {
                          // if (
                          //   comments.some(
                          //     (comment) =>
                          //       comment.createdAt.toDateString() ===
                          //       new Date().toDateString(),
                          //   ) &&
                          //   !user?.isSubscriber
                          // ) {
                          //   return;
                          // }
                          const latestPost = await api.post.getByPostId({
                            postId: params.id,
                          });

                          const currentUserPersona =
                            await api.persona.getUserPersona();
                          //todo: measure tokens and limit based on plan
                          const prompt = prompts.personaCommentPrompt(
                            persona,
                            latestPost?.content ?? "",
                            currentUserPersona!,
                          );

                          const response = await getResponse({
                            messageContent: prompt,
                            model: productPlan(user?.stripeProductId)?.model,
                          });
                          if (response) {
                            await api.comment.create({
                              content: response,
                              postId: params?.id,
                              createdByPersonaId: persona.id,
                              coachVariant: persona.name,
                            });
                            revalidatePath(`/entry/${params.id}`);
                          } else {
                            console.error(
                              "Failed to get a response for the comment.",
                            );
                          }
                        } catch (error) {
                          console.error("Error creating comment:", error);
                        }
                      }}
                    >
                      <FormButton isDisabled={searchParams.s === "1"}>
                        <div className="flex flex-row items-center gap-2 font-medium">
                          {persona.image ? (
                            <>
                              <Image
                                alt={persona.name}
                                src={persona.image}
                                width="16"
                                height="16"
                                className="rounded-full"
                              />
                              <span className="text-xs">{persona.name}</span>
                            </>
                          ) : (
                            <>
                              <PersonIcon className="h-4 w-4" />
                              <span className="text-xs">{persona.name}</span>
                            </>
                          )}
                        </div>
                      </FormButton>
                    </form>
                  ))}
              </ul>
            </div>

            {comments && (
              <ul className="flex flex-col gap-4 pt-6">
                {comments
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((comment) => (
                    <li key={comment.id} className="flex flex-col rounded-lg">
                      <Card isButton={false}>
                        <div className="flex w-full flex-col gap-4 py-4">
                          <div className="flex w-full justify-between gap-4 text-xs">
                            <div className="font-medium">
                              <PersonaIcon
                                personaId={comment.createdByPersonaId!}
                                personas={personas}
                                coachVariant={comment.coachVariant ?? ""}
                              />
                            </div>
                            <div className="flex flex-row items-center gap-2">
                              {formattedTimeStampToDate(
                                comment.createdAt,
                                locale,
                              )}
                              <form
                                action={async () => {
                                  "use server";
                                  if (searchParams.s === "1") {
                                    return;
                                  }
                                  try {
                                    //not sure why this is erorring, but it works so shut it up for now
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                    await api.comment.delete({
                                      commentId: comment.id,
                                    });
                                    revalidatePath(`/entry/${params.id}`);
                                  } catch (error) {
                                    console.error(
                                      "Error deleting comment:",
                                      error,
                                    );
                                  }
                                }}
                              >
                                <DeleteButton hasText={false} />
                              </form>
                            </div>
                          </div>
                          <div className="text-sm">{comment.content}</div>
                        </div>
                      </Card>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
