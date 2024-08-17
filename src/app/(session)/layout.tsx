export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
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

  return (
    <div className="container mx-auto min-h-screen">
      {children}
      <ManageMDK user={session?.user} />
    </div>
  );
}
