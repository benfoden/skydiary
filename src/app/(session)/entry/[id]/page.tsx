"use server";
import { type Tag } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "~/app/_components/Button";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DeleteButton from "~/app/_components/DeleteButton";
import DropDownMenu from "~/app/_components/DropDown";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { getUserLocale } from "~/i18n";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { formattedTimeStampToDate } from "~/utils/text";
import Comments from "./Comments";
import EntryBody from "./EntryBody";
import { deletePost } from "./serverFunctions";

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

                <DeleteButton
                  onClick={async () =>
                    await deletePost({
                      postId: post?.id,
                      isLoading: searchParams.s === "1",
                    })
                  }
                />
              </DropDownMenu>
            </div>
          </div>
          <Comments
            postId={params?.id}
            isLoading={searchParams.s === "1"}
            comments={comments}
            personas={personas}
          />
        </div>
      </div>
    </>
  );
}
