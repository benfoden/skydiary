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
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <Card variant="textBlock" isButton={false}>
        <h1 className="mb-4 text-lg font-medium">{t("about.title")}</h1>
        <div className="flex flex-col items-start justify-start gap-2">
          <p>{t("about.description 0")}</p>
          <p>{t("about.description 1")}</p>
          <p>{t("about.description 2")}</p>
          <p>{t("about.description 3")}</p>
          <p>{t("about.description 4")}</p>
          <p>{t("about.description 5")}</p>
          <div className="flex w-full flex-col items-start pt-8">
            <Link href="/auth/signin">
              <Button variant="cta">{t("about.try it")}</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
