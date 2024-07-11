"use client";

import { useTranslations } from "next-intl";
import Button from "./Button";
import { Card } from "./Card";

export default function DefaultErrorBody({ reset }: { reset: () => void }) {
  const t = useTranslations();

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className="z-20 flex h-dvh flex-col items-center justify-center gap-4">
        <h1 className="mb-8 flex w-full items-center justify-center text-xl font-light">
          {t("error.default.heading")}
        </h1>
        <Card>
          <div className="flex flex-col items-center gap-3 text-sm">
            <p>{t("error.default.message")}</p>
            <Button onClick={() => reset()}>
              {t("error.default.tryAgain")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
