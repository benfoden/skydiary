"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "./Button";
import { Card } from "./Card";

export default function EncryptionNotice() {
  const t = useTranslations();
  return (
    <Card isButton={false}>
      <div className="m-4 flex h-full w-full flex-col items-center justify-center gap-8">
        <h2 className="text-3xl font-light">{t("encryptionNotice.title")}</h2>
        <p>{t("encryptionNotice.description")}</p>
        <div className="flex flex-row items-center gap-4">
          <form action="">
            <Button variant="cta" isSpecial>
              {t("encryptionNotice.reload")}
            </Button>
          </form>

          <div>{t("encryptionNotice.or")}</div>
          <Link href="/settings#data-security">
            <Button>{t("encryptionNotice.enterPassword")}</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
