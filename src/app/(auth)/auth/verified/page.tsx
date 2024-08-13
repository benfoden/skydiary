import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Verified() {
  const session = await getServerAuthSession();

  if (!session) return redirect("/auth/signin");
  if (session) {
    return redirect("/auth/new-user");
  }
  return null;
}
