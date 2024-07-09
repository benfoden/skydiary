"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";

export default function UpgradeBanner() {
  const t = useTranslations();
  return (
    <Card isButton={false}>
      <div className="flex w-fit flex-col items-center justify-center gap-4 ">
        <h2 className="text-2xl font-bold">{t("personas.limitTitle")}</h2>
        <p className=" text-sm font-bold">{t("personas.limitDescription1")}</p>
        <p className="text-sm font-light">{t("personas.limitDescription2")}</p>
        <Link href="/pricing">
          <Button variant="cta" isSpecial>
            {t("nav.upgrade")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
