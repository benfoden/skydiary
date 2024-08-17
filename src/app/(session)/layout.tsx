export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { runBulkEncryption } from "~/utils/runBulkEncryption";
import { useMdkJwk } from "~/utils/useMdkJwk";
import ManageMDK from "../_components/ManageMDK";

type Props = {
  children: ReactNode;
};

export default async function SessionLayout({ children }: Props) {
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

  await api.post.tagAndMemorize({ mdkJwk });

  return (
    <div className="container mx-auto min-h-screen">
      {children}
      <ManageMDK user={session?.user} />
    </div>
  );
}
