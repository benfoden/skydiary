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
    title: t("contact.thankYouTitle"),
    description: t("contact.thankYouDescription"),
  };
}

export default async function ContactThankYou() {
  const t = await getTranslations();
  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <Card variant="form" isButton={false}>
        <div className="flex w-fit flex-row gap-4">
          <h1 className="mb-4 text-lg font-medium">
            {t("contact.thankYouTitle")}
          </h1>
          <div className="flex flex-col items-start justify-start gap-2">
            <p>{t("contact.thankYouDescription")}</p>
          </div>
          <Link href="/">
            <Button>{t("nav.home")}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
