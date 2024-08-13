import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
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

  const features = [
    {
      title: t("features.feature1.title"),
      description: t("features.feature1.description"),
      imageSrc: "/images/feature1.png",
    },
    {
      title: t("features.feature2.title"),
      description: t.rich("features.feature2.description", {
        privacy: (chunks) => (
          <Link className="text-link" href="/features/privacy">
            {chunks}
          </Link>
        ),
      }),
      imageSrc: "/images/feature2.png",
    },
    {
      title: t("features.feature3.title"),
      description: t("features.feature3.description"),
      imageSrc: "/images/feature3.png",
    },
  ];
  const miniFeatures = [
    {
      title: t("features.miniFeature1.title"),
    },
    {
      title: t("features.miniFeature2.title"),
    },
    {
      title: t("features.miniFeature3.title"),
    },
  ];
  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <h1 className="mb-4 text-3xl font-light">{t("features.title")}</h1>
      <section className="flex w-full flex-col items-start justify-start gap-16">
        <h2 className="mb-4 text-6xl font-extralight">
          {t("features.heroTitle")}
        </h2>
      </section>
      <section className="mt-16 flex w-full flex-col items-start justify-start gap-16">
        {features.map((feature, index) => (
          <Card isButton={false} key={index}>
            <div className="flex w-full flex-col items-start justify-start gap-4">
              <h3 className="text-4xl font-extralight">{feature.title}</h3>
              <p className="text-sm">{feature.description}</p>
            </div>
          </Card>
        ))}
      </section>
      <section className="mt-16 flex w-full flex-col items-start justify-start">
        <h2 className="mb-4 text-2xl font-extralight">
          {t("features.miniFeaturesTitle")}
        </h2>
        <Card isButton={false}>
          <ul className="ml-4 flex w-full list-disc flex-col items-start justify-start gap-2">
            {miniFeatures.map((feature, index) => (
              <li key={index}>{feature.title}</li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
