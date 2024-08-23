"use server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card } from "~/app/_components/Card";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { type Locale } from "~/config";
import { api } from "~/trpc/server";
import { formatContent } from "~/utils/blog";
import { formattedTimeStampToDate } from "~/utils/text";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; urlStub: string };
}) {
  try {
    const blogPost = await api.blogPost.getByUrlStub({
      urlStub: params.urlStub,
    });
    if (!blogPost) {
      return {
        title: "Error",
        description: "Could not fetch blog post metadata",
      };
    }

    return {
      title: blogPost.title,
      description: blogPost.description,
      openGraph: {
        title: blogPost.title,
        description: blogPost.description,
        url: `https://skydiary.app/blog/${params.urlStub}`,
        siteName: "skydiary",
        locale: params.locale,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error fetching blog post metadata:", error);
    return {
      title: "Error",
      description: "Could not fetch blog post metadata",
    };
  }
}

export default async function Post({
  params,
}: {
  params: { urlStub: string };
}) {
  const t = await getTranslations();
  const blogPost = await api.blogPost.getByUrlStub({ urlStub: params.urlStub });
  if (!blogPost) {
    notFound();
  }
  const content = await formatContent(blogPost.content);

  return (
    <>
      <NavChevronLeft targetPathname={"/blog"} label={t("nav.blog")} />

      <div className="flex w-full max-w-[600px] flex-col">
        <div className="ml-8 flex flex-col">
          <h1 className="text-3xl font-light">{blogPost.title}</h1>
          <div className="font-base opacity-50">
            {formattedTimeStampToDate(new Date(blogPost.createdAt))}
          </div>
        </div>
        <Card isButton={false}>
          <div
            id="blog"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        </Card>
      </div>
    </>
  );
}
