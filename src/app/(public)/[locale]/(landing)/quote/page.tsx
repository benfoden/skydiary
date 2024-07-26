"use server";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import QuoteClient from "./QuoteClient";
export default async function QuotePage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/");
  return (
    <>
      <h1 className="mb-16 text-2xl">Quote maker</h1>
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <QuoteClient />
      </div>
    </>
  );
}
