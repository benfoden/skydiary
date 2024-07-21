import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";

type Props = {
  children: ReactNode;
};

export default async function SessionLayout({ children }: Props) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/auth/signin");
  }
  if (!session.user.name) {
    redirect("/auth/new-user");
  }
  console.log("session", session);
  return <div className="container mx-auto min-h-screen">{children}</div>;
}
