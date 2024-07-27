"use server";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DropDownMenu from "~/app/_components/DropDown";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import LoadingPageBody from "~/app/_components/LoadingPageBody";
import { type Locale } from "~/config";
import { api } from "~/trpc/server";
import BlogEntryBody from "./BlogEntryBody";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("entry.title"),
  };
}

export default async function BlogEntry({
  params,
}: {
  params: { id: string };
}) {
  const blogPost = await api.blogPost.getByPostId({ postId: params.id });
  console.log("blog post", blogPost);

  if (!blogPost) {
    return <LoadingPageBody />;
  }

  return (
    <>
      <div className="flex h-full flex-col items-center px-2 pb-4 sm:px-8">
        <BlogEntryBody post={blogPost} />
        <div className="flex w-full max-w-5xl flex-col items-center gap-4">
          <div className="flex w-full flex-row items-center justify-center gap-4">
            add tag here
            <div className="flex w-fit flex-row items-center justify-end gap-2">
              <DropDownMenu isEntryMenu>
                <CopyTextButton text={blogPost.content} />
                <form
                  action={async () => {
                    "use server";
                    try {
                      await api.blogPost.delete({ postId: blogPost?.id });
                    } catch (error) {
                      throw new Error("Error deleting post");
                    }
                    revalidatePath("/sd-admin/blog");
                    redirect("/sd-admin/blog");
                  }}
                >
                  <FormDeleteButton />
                </form>
              </DropDownMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
