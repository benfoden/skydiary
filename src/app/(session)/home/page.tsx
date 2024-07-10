import { type Post } from "@prisma/client";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import Spinner from "~/app/_components/Spinner";
import { type Locale } from "~/config";
import { getUserLocale } from "~/i18n";
import { api } from "~/trpc/server";
import { formattedTimeStampToDate } from "~/utils/text";
export const dynamic = "force-dynamic";

const filterPostsByDateRange = (
  daysMin: number,
  daysMax: number,
  userPosts: Post[],
) => {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));

  return userPosts.filter((post) => {
    const postDate = new Date(post.createdAt);
    const startOfPostDate = new Date(postDate.setHours(0, 0, 0, 0));
    const timeDiff = today.getTime() - postDate.getTime();

    return (
      timeDiff > daysMin * oneDay &&
      timeDiff <= daysMax * oneDay &&
      startOfPostDate < startOfToday
    );
  });
};

function PostCard({
  post,
  locale,
}: {
  post: Post;
  locale: Locale;
}): JSX.Element {
  return (
    <Card>
      <div className="flex flex-col items-start justify-between gap-2 py-2">
        <div className="text-xs">
          {formattedTimeStampToDate(post.createdAt, locale)}
        </div>
        {post.content.slice(0, 140) + "..."}
      </div>
    </Card>
  );
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t(`home.title`),
  };
}

export default async function Home() {
  const t = await getTranslations();
  const locale = (await getUserLocale()) as Locale;
  const userPosts = await api.post.getByUser();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toLocaleDateString("en-US", {
    timeZone: userTimezone,
  });

  const lastPostDate = new Date(
    userPosts[0]?.createdAt ?? 0,
  ).toLocaleDateString("en-US", {
    timeZone: userTimezone,
  });

  return (
    <>
      <SessionNav>
        <NavChevronLeft targetPathname={"/topics"} label={t("nav.topics")} />
        <h1>{t("nav.home")}</h1>
        <DropDownUser />
      </SessionNav>
      <main className="flex min-h-screen flex-col items-start">
        <div className="container flex flex-col items-center justify-start px-2 pb-12">
          <Suspense fallback={<Spinner />}>
            <div className="flex flex-col items-start justify-center gap-4 sm:max-w-5xl">
              {t("home.today")}
              {lastPostDate !== today || userPosts?.length === 0 ? (
                <Link href="/today" prefetch={true}>
                  <Button>{t("home.whats happening")}</Button>
                </Link>
              ) : (
                <Link
                  key={userPosts[0]?.id}
                  href={`/entry/${userPosts[0]?.id}`}
                >
                  <PostCard
                    key={userPosts[0]?.id}
                    post={userPosts[0]!}
                    locale={locale}
                  />
                </Link>
              )}
              {filterPostsByDateRange(0, 6, userPosts).length > 0 && (
                <>
                  {t("home.last7Days")}
                  {filterPostsByDateRange(0, 6, userPosts).map((post) => (
                    <Link
                      key={post.id}
                      href={`/entry/${post.id}`}
                      prefetch={true}
                    >
                      <PostCard key={post.id} post={post} locale={locale} />
                    </Link>
                  ))}
                </>
              )}
              {filterPostsByDateRange(8, 30, userPosts).length > 0 && (
                <>
                  {t("home.last30Days")}
                  {filterPostsByDateRange(8, 30, userPosts).map((post) => (
                    <Link key={post.id} href={`/entry/${post.id}`}>
                      <PostCard key={post.id} post={post} locale={locale} />
                    </Link>
                  ))}
                </>
              )}
            </div>
          </Suspense>
        </div>
      </main>
    </>
  );
}
