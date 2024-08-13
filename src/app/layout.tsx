import "~/styles/globals.css";

import { ThemeScript } from "next-app-theme/theme-script";
import { Inter } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { type Locale } from "~/config";
import { TRPCReactProvider } from "~/trpc/react";

export const siteTitle = "skydiary";
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL("https://skydiary.app"),
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    title: { template: "%s · skydiary", default: "skydiary" },
    description: t("top.description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    openGraph: {
      title: { template: "%s · skydiary", default: t("top.title") },
      description: t("top.description"),
      url: "https://skydiary.app",
      siteName: "skydiary",
      locale,
      type: "website",
    },
  };
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  const theme = "dark";
  return (
    <html lang={locale} data-theme={theme} suppressHydrationWarning={true}>
      <head>
        <ThemeScript />
      </head>

      <body className={`font-sans ${inter.variable} bg-transparent`}>
        <div className="relative min-h-screen w-full">
          <div className="absolute inset-0 z-[-20] min-h-full w-full bg-gradient-to-b from-[#cce3f1] to-[#f3f6f6] dark:from-[#07090a] dark:to-[#171727]" />
          <NextIntlClientProvider messages={messages}>
            <TRPCReactProvider>
              <div className="relative z-0 mx-auto min-h-screen">
                {children}
              </div>
              <SpeedInsights />
              <Analytics />
            </TRPCReactProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
