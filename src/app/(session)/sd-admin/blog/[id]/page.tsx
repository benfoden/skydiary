"use server";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DropDownMenu from "~/app/_components/DropDown";
import FormButton from "~/app/_components/FormButton";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import Input from "~/app/_components/Input";
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

  if (!blogPost) {
    return <LoadingPageBody />;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col items-start px-2 pb-4 sm:px-8">
        write a post
        <BlogEntryBody post={blogPost} />
        <div className="flex w-full max-w-5xl flex-row items-start justify-center gap-4">
          <details className="mb-4 flex w-fit flex-row items-center">
            <summary className="flex cursor-pointer items-center">
              <span>md</span>
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </summary>
            <div className="mt-2 pl-4">
              <h3 className="text-xl">markdown</h3>
              <ul>
                <li>
                  <code># Heading</code> |{" "}
                  <span className="font-bold">Heading</span>
                </li>
                <li>
                  <code>**bold**</code> |{" "}
                  <span className="font-bold">bold</span>
                </li>
                <li>
                  <code>*italic*</code> | <span className="italic">italic</span>
                </li>
                <li>
                  <code>[link](http://example.com)</code> |{" "}
                  <a
                    href="http://example.com"
                    className="text-blue-500 underline"
                  >
                    link
                  </a>
                </li>
                <li>
                  <code>`code`</code> | <code>code</code>
                </li>
                <li>
                  <code>- List item</code> |{" "}
                  <ul className="list-disc pl-5">
                    <li>List item</li>
                  </ul>
                </li>
                <li>
                  <code>![alt text](image_url)</code> | Image
                </li>
                <li>
                  <code>
                    &lt;iframe src=&quot;video_url&quot;
                    <br /> width=&quot;560&quot; height=&quot;315&quot;&gt;
                    <br />
                    &lt;/iframe&gt;
                  </code>{" "}
                  | Embed
                </li>
              </ul>
            </div>
          </details>
          <details className="flex w-full flex-row items-center">
            <summary className="flex cursor-pointer items-center">
              <span>details</span>
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </summary>
            <form
              action={async (formData) => {
                "use server";
                try {
                  const tag = (formData.get("tag") as string) ?? "";
                  const title = (formData.get("title") as string) ?? "";
                  const description =
                    (formData.get("description") as string) ?? "";
                  const isDraft = formData.get("publish") !== "on";
                  await api.blogPost.update({
                    postId: params.id,
                    title,
                    tag,
                    description,
                    isDraft,
                  });
                } catch (error) {
                  throw new Error("Error updating post");
                }
                revalidatePath("/sd-admin/blog");
                redirect("/sd-admin/blog");
              }}
              className="flex w-full flex-col gap-4 px-4 pt-4"
            >
              <Input
                label="title"
                placeholder="a title"
                name="title"
                defaultValue={blogPost?.title}
              />
              <Input
                label="description"
                placeholder="for index and serp results"
                name="description"
                defaultValue={blogPost?.description ?? ""}
              />
              <Input
                label="tag"
                placeholder="a single tag, with no spaces"
                name="tag"
                defaultValue={blogPost?.tag}
              />
              <Input
                label="published"
                name="publish"
                type="checkbox"
                defaultChecked={!blogPost?.isDraft}
              />
              <FormButton variant="submit" isSpecial>
                Save
              </FormButton>
            </form>
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
          </details>
        </div>
      </div>
    </>
  );
}
