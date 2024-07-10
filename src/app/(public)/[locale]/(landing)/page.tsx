import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("top.title"),
    description: t("top.description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
}

export default async function Top() {
  const session = await getServerAuthSession();
  const t = await getTranslations();

  return (
    <>
      <main className="mt-[-72px] flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Link href={session ? "/home" : "/auth/signin"}>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-full bg-white/40 px-16 py-12 hover:bg-white/60"
            >
              {session ? t("top.welcomeBack") : t("top.welcome")}
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
