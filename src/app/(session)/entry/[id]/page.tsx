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
import DropDownMenu from "~/app/_components/DropDown";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import { SessionNav } from "~/app/_components/SessionNav";
import UpgradeBanner from "~/app/_components/UpgradeBanner";
import { getUserLocale } from "~/i18n";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { isCommentAvailable } from "~/utils/planLimits";
import { formattedTimeStampToDate } from "~/utils/text";
import EntryBody from "./EntryBody";
import { makeComment } from "./helpers";

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

  if (!post || !user) {
    console.error("Failed to get post or user.");
    return notFound();
  }
  const hasComment = isCommentAvailable(user, comments);

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
                  <FormDeleteButton />
                </form>
              </DropDownMenu>
            </div>
          </div>
          <div className="flex h-full w-full flex-col items-center gap-4 pb-4">
            <div className="flex w-full flex-row items-start justify-center">
              <ul className="flex w-full flex-row flex-wrap justify-start gap-2">
                <form
                  action={async () => {
                    "use server";
                    await makeComment({
                      comments,
                      postId: params.id,
                      userProductId: user?.stripeProductId ?? "",
                    });
                  }}
                >
                  <FormButton
                    isDisabled={searchParams.s === "1" || !hasComment}
                  >
                    <div className="flex flex-row items-center gap-2 text-xs">
                      <CircleIcon className="h-4 w-4" />
                      sky
                    </div>
                  </FormButton>
                </form>

                {personas
                  .filter(
                    (persona) =>
                      persona.isFavorite || !personas.some((p) => p.isFavorite),
                  )
                  .map((persona: Persona) => (
                    <form
                      key={persona.id}
                      action={async () => {
                        "use server";
                        await makeComment({
                          comments,
                          postId: params.id,
                          userProductId: user?.stripeProductId ?? "",
                          commentPersona: persona,
                        });
                      }}
                    >
                      <FormButton
                        isDisabled={searchParams.s === "1" || !hasComment}
                      >
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
                <Link href="/persona/all">
                  <Button>
                    <PersonIcon className="h-4 w-4" />
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </ul>
            </div>
            {!hasComment && <UpgradeBanner variant="comment" />}

            {comments && (
              <ul className="flex flex-col gap-4 pt-4">
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
                                <FormDeleteButton hasText={false} />
                              </form>
                            </div>
                          </div>
                          <div className="whitespace-pre-line text-sm">
                            {comment.content}
                          </div>
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
