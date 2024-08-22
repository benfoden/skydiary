import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import EncryptionNotice from "~/app/_components/EncryptionNotice";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import Spinner from "~/app/_components/Spinner";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { formattedTimeStampToDate } from "~/utils/text";
import { useMdkJwk } from "~/utils/useMdkJwk";

export default async function TopicPosts({
  params,
}: {
  params: { content: string; id: string };
}) {
  const { user } = await getServerAuthSession();
  const t = await getTranslations();
  const mdkJwk = await useMdkJwk();
  const posts = await api.post.getAllByUserAndTagId({
    tagId: params.id,
    mdkJwk,
  });

  if (!posts || posts.length === 0) return <div>No entries found...</div>;

  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/topics"} label={"topics"} />
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <h1 className="font-light">{t(`topics.${params.content}` as any)}</h1>
        <DropDownUser />
      </SessionNav>
      {user?.passwordSalt && !mdkJwk ? (
        <EncryptionNotice />
      ) : (
        <main className="flex min-h-screen w-full flex-col items-center justify-start">
          <div className="flex h-full flex-col items-center gap-12 px-4 pb-4">
            {posts && (
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center font-light">
                    <Spinner />
                  </div>
                }
              >
                <ul>
                  {posts.map((post) => (
                    <li key={post.id} className="flex flex-col rounded-lg p-4">
                      <Link href={`/entry/${post.id}`}>
                        <Card isButton={true}>
                          <div className="flex w-full flex-col gap-4 pt-4">
                            <div className="flex w-full justify-between gap-4 text-xs">
                              <div className="font-medium">
                                {formattedTimeStampToDate(post.createdAt)}
                              </div>
                            </div>
                            <div className="max-w-md text-sm">
                              {post.content.slice(0, 140)}...
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Suspense>
            )}
          </div>
        </main>
      )}
    </>
  );
}
