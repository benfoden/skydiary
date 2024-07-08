"use client";
import {
  type Comment,
  type Persona,
  type Post,
  type Tag,
  type User,
} from "@prisma/client";
import {
  CheckCircledIcon,
  CircleIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SetStateAction } from "react";
import Button from "~/app/_components/Button";
import ButtonSpinner from "~/app/_components/ButtonSpinner";
import { Card, cardColors } from "~/app/_components/Card";
import CopyTextButton from "~/app/_components/CopyTextButton";
import DeleteButton from "~/app/_components/DeleteButton";
import DropDownMenu from "~/app/_components/DropDown";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import { api } from "~/trpc/react";
import { productPlan } from "~/utils/constants";
import { formattedTimeStampToDate } from "~/utils/text";
import { deleteComment, deletePost, makeComment } from "./serverFunctions";

export default function EntryPageClient({
  user,
  post,
  initialComments,
  initialTags,
  initialPersonas,
  searchParams,
}: {
  user: User;
  post: Post;
  initialComments: Comment[];
  initialTags: Tag[];
  initialPersonas: Persona[];
  searchParams: { s: string };
}) {
  const postId = post.id;
  const { isSuccess, data: refetchedPost } = api.post.getByPostId.useQuery({
    postId,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [postContent, setPostContent] = useState<string>(post?.content);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const updatePost = api.post.update.useMutation({
    onMutate: () => {
      setIsSaving(true);
      router.replace(`${window.location.pathname}?s=1`, { scroll: false });
    },
    onSettled: () => {
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
    const content = e.target.value;
    setPostContent(content);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      updatePost.mutate({ content, postId });
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
    if (isSuccess && refetchedPost) {
      setPostContent(refetchedPost.content ?? "");
    }
  }, [refetchedPost, isSuccess]);

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return (
    <div className="flex h-full flex-col items-center px-2 pb-4 sm:px-8">
      <div className="flex h-full w-full flex-col items-center gap-12 pb-4">
        <textarea
          ref={textareaRef}
          value={postContent ?? ""}
          onChange={handleContentChange}
          placeholder={!postContent ? t("status.loading") : t("entry.today")}
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
                    postId,
                    isLoading: searchParams.s === "1",
                  })
                }
              />
            </DropDownMenu>
          </div>
        </div>
        <div className="flex h-full w-full flex-col items-center pb-4">
          <div className="flex w-full flex-row items-start justify-center gap-2">
            <ul className="flex w-full flex-row flex-wrap justify-start gap-2">
              <Button
                disabled={searchParams.s === "1"}
                onClick={async () => {
                  const newComment = await makeComment({
                    comments,
                    postId,
                    userProductId: user?.stripeProductId ?? "",
                    commentPersona: personas?.[0],
                  });
                  setComments((prevComments) => [...prevComments, newComment]);
                }}
              >
                <div className="flex flex-row items-center gap-2 text-xs">
                  <CircleIcon className="h-4 w-4" />
                  sky
                </div>
              </Button>

              {!personas?.length && (
                <Link href="/persona/all">
                  <Button>
                    <PlusIcon className="h-4 w-4" />
                    <span className="text-xs">{t("nav.addPersonas")}</span>
                  </Button>
                </Link>
              )}
              {personas
                ?.slice(
                  0,
                  user?.isSpecial
                    ? personas.length - 1
                    : productPlan(user?.stripeProductId)?.personas,
                )
                .map((persona: Persona) => (
                  <Button disabled={searchParams.s === "1"} key={persona.id}>
                    <div className="flex flex-row items-center gap-2 font-medium">
                      {persona.image ? (
                        <>
                          <Image
                            alt={persona.name}
                            src={persona.image}
                            width="16"
                            height="16"
                            className="rounded-full"
                          />
                          <span className="text-xs">{persona.name}</span>
                        </>
                      ) : (
                        <>
                          <PersonIcon className="h-4 w-4" />
                          <span className="text-xs">{persona.name}</span>
                        </>
                      )}
                    </div>
                  </Button>
                ))}
            </ul>
          </div>

          {comments && (
            <ul className="flex flex-col gap-4 pt-6">
              {comments
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((comment) => (
                  <li key={comment.id} className="flex flex-col rounded-lg">
                    <Card isButton={false}>
                      <div className="flex w-full flex-col gap-4 py-4">
                        <div className="flex w-full justify-between gap-4 text-xs">
                          <div className="font-medium">
                            <PersonaIcon
                              personaId={comment.createdByPersonaId ?? ""}
                              personas={personas}
                              coachVariant={comment.coachVariant ?? ""}
                            />
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            {formattedTimeStampToDate(
                              comment.createdAt,
                              locale,
                            )}

                            <DeleteButton
                              hasText={false}
                              onClick={async () =>
                                await deleteComment({
                                  commentId: comment.id,
                                  postId,
                                  isLoading: searchParams.s === "1",
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="text-sm">{comment.content}</div>
                      </div>
                    </Card>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
