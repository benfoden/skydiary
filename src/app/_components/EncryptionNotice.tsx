"use client";
import { type User } from "@prisma/client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "./Button";
import FormButton from "./FormButton";

export default function EncryptionNotice({
  user,
  mdkJwk,
}: {
  user?: User;
  mdkJwk?: JsonWebKey;
}) {
  const t = useTranslations();
  return (
    <>
      {user?.passwordSalt && !mdkJwk && (
        <div className="m-4 flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-yellow-100/30 p-4">
          <h2 className="text-3xl font-light">{t("encryptionNotice.title")}</h2>
          <div className="flex flex-row items-center gap-4">
            <Link href="/settings#data-security">
              <Button>{t("encryptionNotice.enterPassphrase")}</Button>
            </Link>
            <div>{t("encryptionNotice.or")}</div>
            <div>
              <form action="">
                <FormButton>{t("encryptionNotice.reload")}</FormButton>
              </form>
            </div>
          </div>
          <div className="text-sm">
            <p>{t("encryptionNotice.description")}</p>
          </div>
        </div>
      )}
    </>
  );
}
