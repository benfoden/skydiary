"use client";
export const fetchCache = "force-no-store";
export const revalidate = 0; // seconds
export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { decryptPost } from "~/utils/cryptoA1";
import { formattedTimeStampToDate } from "~/utils/text";
import { type PostWithTags } from "~/utils/types";
import { useMdk } from "~/utils/useMdk";
import { Card } from "./Card";
import Spinner from "./Spinner";

export default function PostCard({
  postId,
  locale,
}: {
  postId: string;
  locale: string;
}) {
  const user = useSession().data?.user;
  const mdk = useMdk();

  const [isDecrypting, setIsDecrypting] = useState(true);
  const [currentPost, setCurrentPost] = useState<PostWithTags>();

  const { data: localPost, isSuccess } = api.post.getByPostId.useQuery({
    postId: postId,
    withTags: true,
  }) as { data: PostWithTags | null; isSuccess: boolean };

  useEffect(() => {
    setIsDecrypting(true);

    if (isSuccess && !localPost?.content) {
      setIsDecrypting(false);
      return;
    }
    if (isSuccess && user?.sukMdk && localPost && mdk) {
      const handleDecrypt = async () => {
        try {
          const decryptedPost = await decryptPost(localPost, mdk);
          setCurrentPost(decryptedPost);
        } catch (error) {
          console.error(
            "Error decrypting post.",
            localPost.id,
            localPost.content,
            localPost.contentIV,
            mdk,
            error,
          );
        } finally {
          setIsDecrypting(false);
        }
      };

      handleDecrypt().catch((error) => {
        console.error("Error decrypting post.", error);
      });
    }
  }, [user?.sukMdk, mdk, localPost, isSuccess]);

  if (!localPost) return <Spinner />;

  return (
    <Link key={postId} href={`/entry/${postId}`} className="w-full">
      <Card>
        <div className="flex w-full flex-col items-start justify-between gap-2 py-2">
          {isDecrypting ? (
            <Spinner />
          ) : currentPost?.content && currentPost.content.length > 140 ? (
            currentPost?.content.slice(0, 140) + "..."
          ) : (
            currentPost?.content
          )}

          <div className="flex w-full flex-row items-center justify-between gap-2 text-xs opacity-70">
            <div className="flex flex-col items-start justify-start gap-1">
              {localPost?.tags && (
                <div className="flex w-full flex-row items-center justify-start gap-2">
                  {localPost.tags?.map((tag) => (
                    <div key={tag.id}>{tag.content}</div>
                  ))}
                </div>
              )}
              <div className="flex min-w-fit">
                {formattedTimeStampToDate(localPost.createdAt, locale)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
