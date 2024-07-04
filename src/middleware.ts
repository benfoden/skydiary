import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "~/config";

export default function middleware(request: NextRequest) {
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

  const unTranslatedAPIRoutes = ["/api/cron", "/api/stripe/checkout-session"];

  const isUntranslatedAPIRoute = unTranslatedAPIRoutes.some((route) =>
    pathname.startsWith(route),
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
