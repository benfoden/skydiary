import { type BlogPost } from "@prisma/client";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Spinner from "~/app/_components/Spinner";
import { type Locale } from "~/config";
import { getUserLocale } from "~/i18n";
import { api } from "~/trpc/server";
import { formattedTimeStampToDate } from "~/utils/text";
export const dynamic = "force-dynamic";

const filterPostsByDateRange = (
  daysMin: number,
  daysMax: number,
  blogPosts: BlogPost[],
) => {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));

  return blogPosts.filter((post) => {
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
  post: BlogPost;
  locale: Locale;
}): JSX.Element {
  return (
    <Link key={post.id} href={`/sd-admin/blog/${post.id}`} className="w-full">
      <Card>
        <div className="flex w-full flex-col items-start justify-between gap-2 py-2">
          <div>{post.title}</div>
          {post.content.length > 280
            ? post.content.slice(0, 280) + "..."
            : post.content}

          <div className="flex w-full flex-row items-center justify-between gap-2 text-xs opacity-70">
            <div className="flex w-full flex-row items-start justify-between gap-1">
              <div className="flex min-w-fit">
                {formattedTimeStampToDate(post.createdAt, locale)}
              </div>
              <div>{post.tag}</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
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

export default async function BlogAdmin() {
  const t = await getTranslations();
  const locale = (await getUserLocale()) as Locale;
  const blogPosts = await api.blogPost.getAll();

  return (
    <>
      <main className="flex min-h-screen flex-col items-start">
        <div className="container flex flex-col items-center justify-start px-2 pb-12">
          <Suspense fallback={<Spinner />}>
            <div className="flex w-full flex-col items-start justify-center gap-4 md:max-w-3xl">
              <div className="ml-4">{t("home.today")}</div>

              <Link href="/sd-admin/blog/new" className="w-full">
                <Button>Write now</Button>
              </Link>
              {blogPosts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </Suspense>
        </div>
      </main>
    </>
  );
}
