import { type LocalePrefix, type Pathnames } from "next-intl/routing";
import { ServerClient } from "postmark";
import { env } from "./env";

export const defaultLocale = "en";
export type Locales = "en" | "ja";
export const locales: Locales[] = ["en", "ja"];
export type Locale = (typeof locales)[number];

export const pathnames: Pathnames<typeof locales> = {
  "/": "/",
  "/pathnames": {
    en: "/pathnames",
    ja: "/pathnames",
  },
};

export const localePrefix: LocalePrefix<typeof locales> = "always";

export const postmarkClient = new ServerClient(env.POSTMARK_API_KEY);
