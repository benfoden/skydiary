import "~/styles/globals.css";

import { ThemeScript } from "next-app-theme/theme-script";
import { Inter } from "next/font/google";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "skydiary",
  description:
    "Write a daily entry and you're done. You get recaps and advice in total privacy with an AI friend, coach, and mentor.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`font-sans ${inter.variable} bg-gradient-to-b from-[#cce3f1] to-[#f3f6f6] dark:from-[#101015] dark:to-[#0b0f10]`}
      >
        <NextIntlClientProvider messages={messages}>
          <TRPCReactProvider>
            <div className="container mx-auto min-h-screen">{children}</div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
