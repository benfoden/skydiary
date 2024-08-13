"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { decryptPost } from "~/utils/cryptoA1";
import { formattedTimeStampToDate } from "~/utils/text";
import { type PostWithTags } from "~/utils/types";
import { useMdk } from "~/utils/useMdk";
import { Card } from "./Card";
import Spinner from "./Spinner";

export default function PostCard({
  post,
  locale,
}: {
  post: PostWithTags;
  locale: string;
}) {
  const user = useSession().data?.user;
  const mdk = useMdk();

  const [isDecrypting, setIsDecrypting] = useState(true);
  const [currentPost, setCurrentPost] = useState<PostWithTags>();

  useEffect(() => {
    setIsDecrypting(true);
    if (user?.sukMdk && post && mdk) {
      console.log("Decrypting post...", mdk);
      const handleDecrypt = async () => {
        setCurrentPost(await decryptPost(post, mdk));
      };
      handleDecrypt()
        .then(() => setIsDecrypting(false))
        .catch(() => {
          console.error("Error decrypting post.");
        });
    }
  }, [user?.sukMdk, mdk, post]);

  return (
    <Link key={post.id} href={`/entry/${post.id}`} className="w-full">
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
              {post.tags && (
                <div className="flex w-full flex-row items-center justify-start gap-2">
                  {post.tags?.map((tag) => (
                    <div key={tag.id}>{tag.content}</div>
                  ))}
                </div>
              )}
              <div className="flex min-w-fit">
                {formattedTimeStampToDate(post.createdAt, locale)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
