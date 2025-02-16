export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { useMdkJwk } from "~/utils/useMdkJwk";
import ManageMDK from "../_components/ManageMDK";
import Announcement from "./Announcement";

type Props = {
  children: ReactNode;
};

const handleJobs = async ({ mdkJwk }: { mdkJwk?: JsonWebKey }) => {
  try {
    await api.post.tag({ mdkJwk });
    await api.post.memorize({ mdkJwk });
  } catch (error) {
    console.error("Error on tag and memorize posts", error);
  }
};

export default async function SessionLayout({ children }: Props) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/auth/signin");
  }
  await api.user.resetDailyUsage();

  const mdkJwk = await useMdkJwk();

  await handleJobs({ mdkJwk });

  const newAnnouncement = await api.blogPost.getLatest();

  return (
    <div className="container mx-auto min-h-screen">
      {newAnnouncement &&
        newAnnouncement.id === session.user.newAnnouncementId &&
        session.user.isAdmin && <Announcement blogPost={newAnnouncement} />}
      {children}
      <ManageMDK user={session?.user} />
    </div>
  );
}
