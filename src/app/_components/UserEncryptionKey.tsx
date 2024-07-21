"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { generateUserEncryptionKey } from "~/utils/encryption";
import Button from "./Button";
import CopyTextField from "./CopyTextField";

export default function UserEncryptionKey() {
  const t = useTranslations();
  const [userEncryptionKey, setUserEncryptionKey] = useState<string>("");

  async function handleClick() {
    const key = await generateUserEncryptionKey();
    setUserEncryptionKey(key);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>{t("settings.encryptionKeyTitle")}</h2>
      <p className="text-sm">{t("settings.encryptionKeyDescription")}</p>
      {userEncryptionKey ? (
        <CopyTextField value={userEncryptionKey} />
      ) : (
        <Button variant="cta" onClick={handleClick}>
          Generate key
        </Button>
      )}
    </div>
  );
}
