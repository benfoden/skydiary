import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { type Locale } from "~/config";
import { api } from "~/trpc/server";

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
  const t = await getTranslations();
  const userPosts = await api.post.getByUser();

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

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16 ">
          <div className="flex flex-col items-start justify-center gap-4">
            <Link className="pb-4" href="/home">
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
    </>
  );
}
