import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Button from "~/app/_components/Button";
import { getServerAuthSession } from "~/server/auth";
import LocaleSwitcher from "../../../_components/LocaleSwitcher";

import dynamic from "next/dynamic";
import DropDownMenu from "~/app/_components/DropDown";

const SetThemeButton = dynamic(
  () => import("~/app/_components/ToggleTheme").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => <div className="h-4 w-4" />,
  },
);

export async function PublicNav() {
  const session = await getServerAuthSession();
  const t = await getTranslations();

  return (
    <nav className="z-100 w-full flex-wrap items-center justify-between bg-transparent pl-4 pt-4 sm:pr-4 sm:pt-0">
      <div className="flex items-center">
        <h1>
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-xl font-light no-underline"
            aria-label="skydiary logo"
          >
            skydiary
          </Link>
        </h1>
        <Link
          href="/about"
          className="rounded-full px-4 py-2 no-underline transition hover:bg-white/30"
        >
          {t("nav.about")}
        </Link>
        <Link
          href="/pricing"
          className="rounded-full px-4 py-2 no-underline transition hover:bg-white/30"
        >
          {t("nav.pricing")}
        </Link>
      </div>
      <div className="hidden sm:block">
        <div className="flex items-center gap-4 sm:pr-4">
          {!session && (
            <Link
              href={session ? "/home" : "/auth/signin"}
              className="text-nowrap rounded-full px-4 py-2 no-underline transition hover:bg-white/50 dark:bg-black/60"
            >
              {t("nav.login")}
            </Link>
          )}
          <Link href={session ? "/home" : "/auth/signin"}>
            <Button>
              <span className="text-nowrap">
                {session ? t("nav.home") : t("nav.signup")}
              </span>
            </Button>
          </Link>
          <span> · </span>
          <LocaleSwitcher />
          <SetThemeButton />
        </div>
      </div>
      <div className="block sm:hidden">
        <DropDownMenu>hi</DropDownMenu>
      </div>
    </nav>
  );
}
