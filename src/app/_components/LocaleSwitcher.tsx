"use client";

import { useLocale } from "next-intl";
import Button from "~/app/_components/Button";
import { type Locale } from "~/config";
import { usePathname } from "~/intlnavigation.public";

export default function LocaleSwitcher({
  isFooter = false,
  isSettings = false,
}: {
  isFooter?: boolean;
  isSettings?: boolean;
}) {
  const currentLocale = useLocale() as Locale;
  return (
    <div className={`flex w-fit flex-row ${isFooter ? "py-2" : "gap-3 py-5"}`}>
      <LocaleButton
        locale="en"
        currentLocale={currentLocale}
        isFooter={isFooter}
        isSettings={isSettings}
      />
      <LocaleButton
        locale="ja"
        currentLocale={currentLocale}
        isFooter={isFooter}
        isSettings={isSettings}
      />
    </div>
  );
}

function LocaleButton({
  locale,
  currentLocale,
  isFooter,
  isSettings,
}: {
  locale: Locale;
  currentLocale: Locale;
  isFooter: boolean;
  isSettings: boolean;
}) {
  const isActive = locale === currentLocale;

  const pathname = usePathname();

  return (
    <>
      {isFooter && (
        <button
          disabled={isActive}
          className={`rounded-full px-2 py-2 no-underline transition hover:bg-white/50 dark:bg-black/60 ${isActive && "cursor-not-allowed opacity-50"}`}
          onClick={() => {
            if (isActive) return;
            document.cookie = `NEXT_LOCALE=${locale};`;
            window.location.href = pathname;
          }}
        >
          <span className={`text-xs ${isActive && "underline"}`}>{locale}</span>
        </button>
      )}
      {isSettings && (
        <Button
          variant="menuElement"
          disabled={isActive}
          onClick={() => {
            if (isActive) return;
            document.cookie = `NEXT_LOCALE=${locale};`;
            window.location.href = pathname;
          }}
        >
          <span
            className={`w-fit text-nowrap text-xs ${isActive && "underline"}`}
          >
            {locale === "ja" ? "日本語" : "en"}
          </span>
        </Button>
      )}
      {!isFooter && !isSettings && (
        <Button
          variant="chip"
          disabled={isActive}
          onClick={() => {
            if (isActive) return;
            document.cookie = `NEXT_LOCALE=${locale};`;
            window.location.href = pathname;
          }}
        >
          <span className={`text-xs ${isActive && "underline"}`}>{locale}</span>
        </Button>
      )}
    </>
  );
}
