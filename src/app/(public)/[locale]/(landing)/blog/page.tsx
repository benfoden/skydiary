"use server";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card } from "~/app/_components/Card";
import { type Locale } from "~/config";
import { api } from "~/trpc/server";
import { formattedTimeStampToDate } from "~/utils/text";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("blog.index.title"),
    description: t("blog.index.description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
}

export default async function BlogIndex() {
  const blogPosts = (await api.blogPost.getAll()).filter(
    (post) => !post.isDraft,
  );

  return (
    <>
      <h1 className="text-lg font-light">blog</h1>

      <section className="mt-10 flex w-full max-w-[600px] flex-col gap-4">
        <ul>
          {blogPosts.map(
            ({ id, updatedAt, title, content, tag, description }) => (
              <li key={id}>
                <Link href={`/blog/${id}`}>
                  <Card>
                    <div className="flex w-full flex-col items-start">
                      <h2 className="text-4xl font-light">{title}</h2>
                      <span className="text-xs opacity-70">
                        {formattedTimeStampToDate(new Date(updatedAt))}
                      </span>
                    </div>
                    {description
                      ? description
                      : content.length > 140
                        ? content.slice(0, 140) + "..."
                        : content}
                    {tag && <div className="text-xs opacity-70">{tag}</div>}
                  </Card>
                </Link>
              </li>
            ),
          )}
        </ul>
      </section>
    </>
  );
}
