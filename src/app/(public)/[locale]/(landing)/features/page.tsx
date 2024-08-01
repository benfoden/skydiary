import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card } from "~/app/_components/Card";
import { type Locale } from "~/config";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("features.title"),
    description: t("features.description"),
    openGraph: {
      title: t("features.title"),
      description: t("features.description"),
      url: "https://skydiary.app/features",
      siteName: "skydiary",
      locale,
      type: "website",
    },
  };
}

export default async function Features() {
  const t = await getTranslations();
  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <h1 className="mb-4 text-3xl font-light">{t("features.title")}</h1>
      <Card variant="textBlock" isButton={false}>
        yo
      </Card>
    </div>
  );
}
