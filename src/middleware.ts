import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "~/config";

export function middleware(request: NextRequest) {
  const BLOCKED_COUNTRIES = ["CN", "RU", "IR", "KP"];
  const country = request.geo?.country ?? "US";

  if (BLOCKED_COUNTRIES.includes(country)) {
    return new Response("Sorry, your country is blocked for legal reasons.", {
      status: 451,
    });
  }
  const pathname = request.nextUrl.pathname;
  const appRoutes = [
    "/home",
    "/topics",
    "/today",
    "/persona",
    "/entry",
    "/settings",
    "/auth",
    "/api/auth",
    "/sd-admin",
  ];

  const unTranslatedAPIRoutes = [
    "/api/cron",
    "/api/trpc",
    "/api/stripe-webhook",
    "/api/upload",
    "/api/chat",
  ];

  const isUntranslatedAPIRoute = unTranslatedAPIRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route,
  );

  if (isUntranslatedAPIRoute) {
    return NextResponse.next();
  }

  const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));

  const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
  });

  if (isAppRoute) {
    // Add a hint that we can read in `i18n.ts`
    request.headers.set("x-app-route", "true");
    return NextResponse.next({ headers: request.headers });
  } else {
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: ["/", "/(en|ja)/:path*", "/((?!_next|.*\\..*).*)"],
};
