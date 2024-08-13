export const fetchCache = "force-no-store";
export const revalidate = 0; // seconds
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import ManageEncryption from "../_components/ManageEncryption";
import { NextAuthProvider } from "../_components/NextAuthProvider";

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
        {children}
        <ManageEncryption user={session.user} />
      </NextAuthProvider>
    </div>
  );
}
