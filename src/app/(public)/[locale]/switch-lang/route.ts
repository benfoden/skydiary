import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export async function GET({ params }: { params: { locale: string } }) {
  const session = await getServerAuthSession();
  if (!session) {
    return redirect(`/${params.locale}`);
  }
  return redirect(`/home`);
}
