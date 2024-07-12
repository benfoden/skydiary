import { type LocalePrefix, type Pathnames } from "next-intl/routing";

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
