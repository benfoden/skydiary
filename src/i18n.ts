/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { defaultLocale, locales, type Locales } from "./config";

async function getConfig(locale: string) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locales)) notFound();

  return {
    messages: (await import(`../i18n/${locale}.json`)).default,
  };
}

export default getRequestConfig(async (params) => {
  // Read a hint that was set in the middleware
  const isAppRoute = headers().get("x-app-route") === "true";

  if (isAppRoute) {
    const locale = await getUserLocale();

    return {
      // Return a locale to `next-intl` in case we've read
      // it from user settings instead of the pathname
      locale,
      ...(await getConfig(locale)),
    };
  } else {
    // Be careful to only read from params if the route is public
    const locale = params.locale;
    return getConfig(locale);
  }
});

export async function getUserLocale() {
  return cookies().get("NEXT_LOCALE")?.value ?? defaultLocale;
}

export async function setUserLocale(locale: string) {
  cookies().set("NEXT_LOCALE", locale);
}
