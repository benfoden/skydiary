import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Button from "~/app/_components/Button";
import { getServerAuthSession } from "~/server/auth";
import LocaleSwitcher from "../../../_components/LocaleSwitcher";

import dynamic from "next/dynamic";
import DropDownMenu from "~/app/_components/DropDown";
import { ThemeToggle } from "~/app/_components/ToggleTheme";

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
    <nav className="z-100 flex w-full flex-wrap items-center justify-between bg-transparent pl-4 pt-4 sm:pr-4 sm:pt-0">
      <div className="flex items-center">
        <h1>
          <Link
            href="/"
            className=" rounded-full px-4 py-2 text-xl font-light no-underline"
            aria-label="skydiary logo"
          >
            skydiary
          </Link>
        </h1>
        <div className="hidden md:block">
          <Link
            href="/about"
            className="rounded-full px-4 py-2 no-underline transition hover:bg-white/30"
          >
            {t("nav.about")}
          </Link>
          <Link
            href="/blog"
            className="rounded-full px-4 py-2 no-underline transition hover:bg-white/30"
          >
            {t("nav.blog")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-4 py-2 no-underline transition hover:bg-white/30"
          >
            {t("nav.pricing")}
          </Link>
        </div>
      </div>
      <div className="hidden items-center gap-4 md:flex md:pr-4">
        {!session ? (
          <>
            <Link href={"/auth/signin"}>
              <Button variant="chip">{t("nav.login")}</Button>
            </Link>
          </>
        ) : (
          <Link href={"/home"}>
            <Button variant="chip">
              <span className="text-nowrap">{t("nav.home")}</span>
            </Button>
          </Link>
        )}
        <span> · </span>
        <LocaleSwitcher />
        <SetThemeButton />
      </div>
      <div className="block pr-6 md:hidden">
        <DropDownMenu isTopMenu>
          <LocaleSwitcher isSettings />
          <ThemeToggle isMenuButton />
          {session && (
            <Link href={"/home"}>
              <Button variant="menuElement">{t("nav.userHome")}</Button>
            </Link>
          )}
          <Link href={"/about"}>
            <Button variant="menuElement">{t("nav.about")}</Button>
          </Link>
          <Link href={"/blog"}>
            <Button variant="menuElement"> {t("nav.blog")}</Button>
          </Link>
          <Link href={"/pricing"}>
            <Button variant="menuElement">{t("nav.pricing")}</Button>
          </Link>
          <Link href={"/contact"}>
            <Button variant="menuElement">{t("nav.contactUs")}</Button>
          </Link>
          <Link href={"/auth/signin"}>
            <Button variant="menuElement">{t("nav.login")}</Button>
          </Link>
          <Link href={"/auth/signin"}>
            <Button variant="menuElement" isSpecial>
              {t("nav.signup")}
            </Button>
          </Link>
        </DropDownMenu>
      </div>
    </nav>
  );
}
