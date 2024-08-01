import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LocaleSwitcher from "~/app/_components/LocaleSwitcher";

export async function PublicFooter() {
  const t = await getTranslations();
  return (
    <footer className="flex w-full flex-row flex-wrap items-center justify-start gap-1 px-4 pb-4 text-xs opacity-60 sm:px-8">
      <Link href="/about" className="p-2">
        {t("nav.about")}
      </Link>
      <Link href="/contact" className="p-2">
        {t("nav.contact")}
      </Link>
      <Link href="/privacy" className="p-2">
        {t("nav.privacy")}
      </Link>
      <Link href="/terms" className="p-2">
        {t("nav.terms")}
      </Link>
      <LocaleSwitcher isFooter />·
      <p className="p-2">&copy; {new Date().getFullYear()} skydiary</p>
    </footer>
  );
}
