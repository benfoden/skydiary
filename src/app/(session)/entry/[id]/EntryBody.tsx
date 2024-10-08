"use client";
import { type Post } from "@prisma/client";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SetStateAction } from "react";
import ButtonSpinner from "~/app/_components/ButtonSpinner";
import { cardColors } from "~/app/_components/Card";
import { api } from "~/trpc/react";
import { useMdkJwkLocal } from "~/utils/useMdkJwkLocal";

export default function EntryBody({ post }: { post: Post }) {
  const [content, setContent] = useState(post?.content ?? "");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();
  const router = useRouter();
  const mdkJwk = useMdkJwkLocal();

  const { data, isSuccess } = api.post.getByPostId.useQuery({
    postId: post?.id,
    mdkJwk,
  });

  const updatePost = api.post.update.useMutation({
    onMutate: () => {
      setIsSaving(true);
      router.replace(`${window.location.pathname}?s=1`, { scroll: false });
    },
    onSuccess: () => {
      setIsSaving(false);
      router.replace(`${window.location.pathname}`, { scroll: false });
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

    if (newContent === content) return;

    setContent(newContent);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      updatePost.mutate({ content: newContent, postId: post?.id, mdkJwk });
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
    if (isSuccess && data?.content) {
      setContent(data.content);
    }
  }, [data?.content, isSuccess]);

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center pb-4">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder={!isSuccess ? t("status.loading") : t("entry.today")}
        className={` min-h-full w-full resize-none rounded-xl border-none px-8 py-6 leading-6 focus:outline-none sm:max-w-5xl sm:rounded-3xl sm:px-16 sm:py-12 dark:text-[#DCDCDC] ${cardColors("default")}`}
        autoFocus
        style={{ height: "auto", overflow: "hidden", paddingBottom: "16px" }}
        onInput={adjustTextareaHeight}
        maxLength={50000}
      />
      {content?.length > 0.9 * 50000 && (
        <div className="flex min-h-full w-full flex-row items-center justify-end pr-4 pt-1 sm:max-w-5xl">
          <span
            className={`text-xs ${content?.length > 0.975 * 50000 ? (content?.length === 50000 ? "text-red-600" : "text-yellow-500") : "text-secondary"}`}
          >
            {content.length} / 50000
          </span>
        </div>
      )}
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
  );
}
