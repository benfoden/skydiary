import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import { type Locale } from "~/config";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("about.title"),
    description: t("about.description"),
  };
}

export default async function About() {
  const t = await getTranslations();
  return (
    <>
      <main className="mt-[-72px] flex min-h-screen flex-col items-center justify-center">
        <div className="mb-8 flex w-full max-w-xl flex-col items-center justify-center gap-2">
          <h1 className="mb-8 text-xl font-light">{t("about.title")}</h1>
          <Card variant="wide" isButton={false}>
            <div className="flex flex-col items-start justify-start gap-2 px-4 py-8">
              <p>{t("about.description 0")}</p>
              <p>{t("about.description 1")}</p>
              <p>{t("about.description 2")}</p>
              <p>{t("about.description 3")}</p>
              <p>{t("about.description 4")}</p>
              <p>{t("about.description 5")}</p>
              <div className="flex w-full flex-col items-center pt-8">
                <Link href="/auth/signin">
                  <Button variant="cta">{t("about.try it")}</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
