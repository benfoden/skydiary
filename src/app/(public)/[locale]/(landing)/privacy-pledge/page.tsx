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
    title: t("privacyPledge.title"),
    description: t("privacyPledge.description"),
    openGraph: {
      title: t("privacyPledge.title"),
      description: t("privacyPledge.description"),
      url: "https://skydiary.app/privacy-pledge",
      siteName: "skydiary",
      locale,
      type: "website",
    },
  };
}

export default async function PrivacyPledged() {
  const t = await getTranslations();

  const privacyDetails = [
    {
      title: t("privacyPledge.detail1.title"),
      description: t("privacyPledge.detail1.description"),
    },
    {
      title: t("privacyPledge.detail2.title"),
      description: t("privacyPledge.detail2.description"),
    },
    {
      title: t("privacyPledge.detail3.title"),
      description: t("privacyPledge.detail3.description"),
    },
    {
      title: t("privacyPledge.detail4.title"),
      description: t("privacyPledge.detail4.description"),
    },
    {
      title: t("privacyPledge.detail5.title"),
      description: t("privacyPledge.detail5.description"),
    },
  ];

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <h1 className="mb-4 text-3xl font-light">{t("privacyPledge.title")}</h1>
      <section className="flex w-full flex-col items-start justify-start gap-16">
        <p>{t("privacyPledge.description")}</p>
      </section>
      <ol className="mt-16 flex w-full flex-col items-start justify-start gap-16">
        {privacyDetails.map((detail, index) => (
          <Card isButton={false} key={index}>
            <div className="flex w-full flex-col items-start justify-start gap-4">
              <li className="ml-8 list-decimal text-3xl font-extralight">
                <h3 className="text-4xl font-extralight">{detail.title}</h3>
                <p className="text-sm">{detail.description}</p>
              </li>
            </div>
          </Card>
        ))}
      </ol>
    </div>
  );
}
