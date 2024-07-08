"use server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { getUserLocale } from "~/i18n";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { formattedTimeStampToDate } from "~/utils/text";
import EntryPageClient from "./EntryPage";

export default async function EntryPageServer({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { s: string };
}) {
  const session = await getServerAuthSession();
  const { user } = session ?? {};
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
      <EntryPageClient
        user={user}
        post={post}
        initialComments={comments}
        initialTags={tags}
        initialPersonas={personas}
        searchParams={searchParams}
      />
    </>
  );
}
