export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import runBulkEncryption from "~/utils/runBulkEncryption";
import { useMdkJwk } from "~/utils/useMdkJwk";
import { NextAuthProvider } from "../_components/NextAuthProvider";
import PrepareMDK from "../_components/PrepareMDK";

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
  if (session.user?.passwordSalt && mdkJwk) {
    await runBulkEncryption({ user: session.user, mdkJwk });
  }

  return (
    <div className="container mx-auto min-h-screen">
      <NextAuthProvider>
        {children}
        <PrepareMDK />
      </NextAuthProvider>
    </div>
  );
}
