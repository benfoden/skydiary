"use client";
import {
  type Comment,
  type Persona,
  type Post,
  type Tag,
  type User,
} from "@prisma/client";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SetStateAction } from "react";
import Button from "~/app/_components/Button";
import ButtonSpinner from "~/app/_components/ButtonSpinner";
import { cardColors } from "~/app/_components/Card";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DeleteButton from "~/app/_components/DeleteButton";
import DropDownMenu from "~/app/_components/DropDown";
import { api } from "~/trpc/react";
import Comments from "./Comments";
import { deletePost } from "./serverFunctions";

export default function EntryPageClient({
  user,
  initialPost,
  initialComments,
  initialTags,
  initialPersonas,
  searchParams,
  params,
}: {
  user: User;
  initialPost: Post;
  initialComments: Comment[];
  initialTags: Tag[];
  initialPersonas: Persona[];
  searchParams: { s: string };
  params: { id: string };
}) {
  const utils = api.useUtils();
  const [post, setPost] = useState<Post>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const firstLoad = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();
  const router = useRouter();

  const postId = params.id;

  const updatePost = api.post.update.useMutation({
    onMutate: async (newContent) => {
      setIsSaving(true);
      router.replace(`${window.location.pathname}?s=1`, { scroll: false });
      await utils.post.getByPostId.cancel({ postId });

      // Get the data from the queryCache
      const prevData = utils.post.getByPostId.getData({ postId });

      // Optimistically update the data with our new post
      utils.post.getByPostId.setData({ postId }, (prevPost) => ({
        ...prevPost,
        content: newContent,
      }));

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onSuccess: () => {
      setIsSaving(false);
      router.replace(`${window.location.pathname}`, { scroll: false });
    },
    onSettled: async () => {
      await utils.post.getByPostId.invalidate({ postId });
      revalidatePath(`/entry/${postId}`);
      await utils.post.getByUser.invalidate();
      revalidatePath("/home");
    },
  });

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;

    setPost({ ...post, content: newContent });
    // setPost({ ...post, content: updatePost.data?.content ?? "" });

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      updatePost.mutate({ content: newContent, postId: post?.id });
    }, 1000);

    setDebounceTimeout(newTimeout as unknown as SetStateAction<null>);
    if (!debounceTimeout) {
      router.push(`${window.location.pathname}?s=1`);
      const routerTimeout = setTimeout(() => {
        setDebounceTimeout(null);
      }, 300);
      setDebounceTimeout(routerTimeout as unknown as SetStateAction<null>);
    }
  };

  useEffect(() => {
    if (!firstLoad.current) {
      return;
    }
    console.count("useEffect");
    setPost(initialPost);
    firstLoad.current = false;
    return;
  }, [initialPost]);

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return (
    <div className="flex h-full flex-col items-center px-2 pb-4 sm:px-8">
      <div className="flex h-full w-full flex-col items-center gap-12 pb-4">
        <textarea
          ref={textareaRef}
          value={post?.content ?? ""}
          onChange={handleContentChange}
          placeholder={!post?.content ? t("status.loading") : t("entry.today")}
          className={`min-h-full w-full resize-none rounded-xl border-none px-8 py-6 focus:outline-none sm:max-w-5xl sm:rounded-3xl sm:px-16 sm:py-12 dark:text-[#DCDCDC] ${cardColors("default")}`}
          autoFocus
          style={{ height: "auto", overflow: "hidden", paddingBottom: "16px" }}
          onInput={adjustTextareaHeight}
        />
        <div className="fixed bottom-1 right-1">
          <div className="flex items-center justify-center">
            {isSaving ? (
              <ButtonSpinner />
            ) : (
              <CheckCircledIcon className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center gap-4">
        <div className="flex w-full flex-row items-center justify-center gap-4">
          {tags && (
            <ul className="flex w-full flex-row flex-wrap items-center justify-start gap-2">
              {tags?.map((tag: Tag) => (
                <li key={tag.id}>
                  <Link href={`/topics/${tag.content}/${tag.id}`}>
                    <Button variant="text">
                      <span className="text-xs font-medium">{tag.content}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex w-fit flex-row items-center justify-end gap-2">
            <DropDownMenu isEntryMenu>
              <CopyTextButton text={post?.content} />

              <DeleteButton
                onClick={async () =>
                  await deletePost({
                    postId: post?.id,
                    isLoading: searchParams.s === "1",
                  })
                }
              />
            </DropDownMenu>
          </div>
        </div>
        <Comments
          user={user}
          postId={params?.id}
          isLoading={searchParams.s === "1"}
          comments={comments}
          personas={personas}
        />
      </div>
    </div>
  );
}
