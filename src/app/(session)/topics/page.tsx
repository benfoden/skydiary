import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import EncryptionNotice from "~/app/_components/EncryptionNotice";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { useMdkJwk } from "~/utils/useMdkJwk";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("topics.title"),
  };
}

export default async function Topics() {
  const { user } = await getServerAuthSession();
  const mdkJwk = await useMdkJwk();
  const t = await getTranslations();
  const userPosts = await api.post.getByUser({ mdkJwk });

  const tagsAndCounts = await api.post.getTagsAndCounts();

  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/home"} label={t("nav.home")} />
        </div>
        <h1>{t("nav.topics")}</h1>

        <DropDownUser />
      </SessionNav>

      {user?.passwordSalt && !mdkJwk ? (
        <EncryptionNotice user={user} mdkJwk={mdkJwk} />
      ) : (
        <main className="flex min-h-screen w-full flex-col items-center justify-start">
          <div className="container flex flex-col items-center justify-start gap-12 px-4 md:py-16 ">
            <div className="flex w-full flex-col items-start justify-center gap-4 md:w-fit">
              <Link href="/home" className="flex w-full flex-row pb-4">
                <Card>
                  <div className="flex w-full flex-row items-center justify-between gap-2">
                    <p>{t("topics.all")}</p>
                    <p>{userPosts.length}</p>
                  </div>
                </Card>
              </Link>
              {tagsAndCounts
                ?.sort((a, b) => b.count - a.count)
                .map(
                  (tag) =>
                    tag && (
                      <Link
                        key={tag.id}
                        href={`/topics/${tag.content}/${tag.id}`}
                        className="flex w-full flex-row"
                      >
                        <Card>
                          <div className="flex w-full flex-row items-center justify-between gap-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <p>{t(`topics.${tag.content}` as any)}</p>
                            <p>{tag.count}</p>
                          </div>
                        </Card>
                      </Link>
                    ),
                )}
            </div>
          </div>
        </main>
      )}
    </>
  );
}
