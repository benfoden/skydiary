export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { runBulkEncryption } from "~/utils/runBulkEncryption";
import { useMdkJwk } from "~/utils/useMdkJwk";
import ManageMDK from "../_components/ManageMDK";
import Announcement from "./Announcement";

type Props = {
  children: ReactNode;
  announcement?: ReactNode;
};

export default async function SessionLayout({ announcement, children }: Props) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/auth/signin");
  }
  await api.user.resetDailyUsage();

  const mdkJwk = await useMdkJwk();
  if (
    session.user.passwordSalt &&
    session.user.sukMdk &&
    mdkJwk &&
    session.user.isAdmin
  ) {
    await runBulkEncryption({ mdkJwk });
  }

  api.post.tagAndMemorize({ mdkJwk }).catch((error) => {
    console.error("Error on tag and memorize posts", error);
  });
  const blogPost = await api.blogPost.getLatestAnnouncement();

  return (
    <div className="container mx-auto min-h-screen">
      {blogPost && <Announcement blogPost={blogPost} />}
      {children}
      <ManageMDK user={session?.user} />
    </div>
  );
}
