/* eslint-disable react/jsx-key */
"use client";

import { type Post } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import PostCard from "~/app/_components/PostCard";
import { SessionNav } from "~/app/_components/SessionNav";
import Spinner from "~/app/_components/Spinner";
import { api } from "~/trpc/react";
import { type PostWithTags } from "~/utils/types";

const filterPostsByDateRange = (
  daysMin: number,
  daysMax: number,
  posts: Post[],
) => {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));

  return posts.filter((post) => {
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

export default function Home() {
  const locale = useLocale();
  const t = useTranslations();
  const { data: fetchedPosts, isSuccess } = api.post.getByUser.useQuery();
  const [posts, setPosts] = useState<PostWithTags[]>([]);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const today = new Date().toLocaleDateString("en-US", {
    timeZone: userTimezone,
  });

  useEffect(() => {
    if (isSuccess && fetchedPosts?.length > 0) {
      setPosts(fetchedPosts);
    }
  }, [isSuccess, fetchedPosts]);

  const lastPostDate = new Date(posts[0]?.createdAt ?? 0).toLocaleDateString(
    "en-US",
    {
      timeZone: userTimezone,
    },
  );

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
            <div className="flex w-full flex-col items-start justify-center gap-4 md:max-w-3xl">
              <div className="ml-4">{t("home.today")}</div>
              {lastPostDate !== today || posts?.length === 0 ? (
                <Link href="/today" prefetch={true} className="w-full">
                  <Button>{t("home.whats happening")}</Button>
                </Link>
              ) : (
                <PostCard postId={posts[0]?.id ?? ""} locale={locale} />
              )}
              {filterPostsByDateRange(1, 6, posts).length > 0 && (
                <>
                  <div className="pl-4 pt-4">{t("home.last7Days")}</div>
                  {filterPostsByDateRange(1, 6, posts).map((post) => (
                    <PostCard postId={post.id ?? ""} locale={locale} />
                  ))}
                </>
              )}
              {filterPostsByDateRange(8, 30, posts).length > 0 && (
                <>
                  <div className="pl-4 pt-4">{t("home.last30Days")}</div>
                  {filterPostsByDateRange(8, 30, posts).map((post) => (
                    <PostCard postId={post?.id ?? ""} locale={locale} />
                  ))}
                </>
              )}
              {posts && posts.length > 0 && (
                <>
                  {Array.from(
                    new Set(
                      posts.map((post) => {
                        const date = new Date(post.createdAt);
                        return `${date.getFullYear()} ${date.toLocaleString("default", { month: "long" })}`;
                      }),
                    ),
                  ).map((monthYear) => (
                    <div key={monthYear} className="flex flex-col gap-4 pt-4">
                      <div className="ml-4">{monthYear}</div>
                      {posts
                        .filter((post) => {
                          const date = new Date(post.createdAt);
                          const postMonthYear = `${date.getFullYear()} ${date.toLocaleString("default", { month: "long" })}`;
                          return postMonthYear === monthYear;
                        })
                        .map((post) => (
                          <PostCard postId={post?.id ?? ""} locale={locale} />
                        ))}
                    </div>
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
