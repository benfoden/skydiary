"use server";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card } from "~/app/_components/Card";
import { type Locale } from "~/config";
import { api } from "~/trpc/server";
import { formatContent } from "~/utils/blog";
import { formattedTimeStampToDate, stringToUrlStub } from "~/utils/text";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("blog.index.title"),
    description: t("blog.index.description"),
    openGraph: {
      title: t("blog.index.title"),
      description: t("blog.index.description"),
      url: "https://skydiary.app/blog",
      siteName: "skydiary",
      locale,
      type: "website",
    },
  };
}

export default async function BlogIndex() {
  const allPosts = await api.blogPost.getAll();
  const blogPosts = await Promise.all(
    allPosts
      .filter((post) => !post.isDraft)
      .map(async (post) => ({
        ...post,
        content: await formatContent(post.content),
      })),
  );

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <h1 className="text-3xl font-light">blog</h1>

      <ul className="mt-4 flex w-full flex-col gap-4">
        {blogPosts.map(
          ({ id, updatedAt, title, content, tag, description }) => (
            <li key={id}>
              <Link href={`/blog/${stringToUrlStub(title)}`}>
                <Card>
                  <div className="flex w-full flex-col items-start">
                    <h2 className="text-4xl font-light">{title}</h2>
                    <span className="text-xs opacity-70">
                      {formattedTimeStampToDate(new Date(updatedAt))}
                    </span>
                  </div>
                  {description ? (
                    description
                  ) : content.length > 140 ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: content.slice(0, 140) + "...",
                      }}
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  )}
                  {tag && <div className="text-xs opacity-70">{tag}</div>}
                </Card>
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
