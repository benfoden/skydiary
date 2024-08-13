export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import ManageEncryption from "../_components/ManageEncryption";
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

  return (
    <div className="container mx-auto min-h-screen">
      <NextAuthProvider>
        <PrepareMDK user={session.user} />
        <ManageEncryption user={session.user} />
        {children}
      </NextAuthProvider>
    </div>
  );
}
