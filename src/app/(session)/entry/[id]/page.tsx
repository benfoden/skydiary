"use server";
import { type Persona, type Tag } from "@prisma/client";
import { CircleIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "~/app/_components/Avatar";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DropDownMenu from "~/app/_components/DropDown";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import LoadingPageBody from "~/app/_components/LoadingPageBody";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import { SessionNav } from "~/app/_components/SessionNav";
import UpgradeBanner from "~/app/_components/UpgradeBanner";
import { type Locale } from "~/config";
import { getUserLocale } from "~/i18n";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { isCommentAvailable } from "~/utils/planDetails";
import { formattedTimeStampToDate } from "~/utils/text";
import EntryBody from "./EntryBody";
import { makeComment } from "./helpers";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("entry.title"),
  };
}

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

  const hasComment = isCommentAvailable(user, comments);

  if (!post) {
    return <LoadingPageBody />;
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
                    try {
                      await api.post.delete({ postId: post?.id });
                      revalidatePath("/home");
                      redirect("/home");
                    } catch (error) {
                      throw new Error("Error deleting post");
                    }
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
                    try {
                      await makeComment({
                        comments,
                        postId: params.id,
                        userProductId: user?.stripeProductId ?? "",
                      });
                    } catch (error) {
                      throw new Error("Error making sky comment");
                    }
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
                        try {
                          await makeComment({
                            comments,
                            postId: params.id,
                            userProductId: user?.stripeProductId ?? "",
                            commentPersona: persona,
                          });
                        } catch (error) {
                          throw new Error("Error making persona comment");
                        }
                      }}
                    >
                      <FormButton
                        isDisabled={searchParams.s === "1" || !hasComment}
                      >
                        <div className="flex flex-row items-center gap-2 font-medium">
                          {persona.image ? (
                            <>
                              <Avatar src={persona.image} alt={persona.name} />
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
                    <div className="flex flex-row items-center gap-1">
                      <PlusIcon className="h-4 w-4" />
                      <span className="text-xs font-bold">
                        {t("entry.personaButton")}
                      </span>
                    </div>
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
                      <Card variant="comment" isButton={false}>
                        <div className="flex w-full flex-col gap-4 py-4">
                          <div className="flex w-full flex-row items-start justify-start gap-2">
                            <div className="pt-1">
                              <PersonaIcon
                                personaId={comment.createdByPersonaId!}
                                personas={personas}
                                coachVariant={comment.coachVariant ?? ""}
                              />
                            </div>
                            <div className="flex flex-col">
                              <p className="whitespace-pre-line text-sm leading-6">
                                <span className="pr-1 font-bold">
                                  {
                                    personas?.find(
                                      (persona) =>
                                        persona.id ===
                                        comment.createdByPersonaId!,
                                    )?.name
                                  }
                                </span>
                                {comment.content}
                              </p>
                              <div className="flex w-full flex-row items-center justify-between text-xs">
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
                                      throw new Error("Error deleting comment");
                                    }
                                  }}
                                >
                                  <FormDeleteButton hasText={false} />
                                </form>
                              </div>
                            </div>
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
