"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { default as clearCacheAndFetch } from "~/utils/clearCache";
import {
  createUserKeys,
  deleteJWKFromIndexedDB,
  getLocalMdkForUser,
  MASTERDATAKEY,
  unwrapMDKAndSave,
} from "~/utils/cryptoA1";
import Spinner from "./Spinner";

export default function DataSecurityCard() {
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [isLocalMdk, setIsLocalMdk] = useState(false);
  const updateUser = api.user.updateUser.useMutation();
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const router = useRouter();

  // CD: on /settings page the user enters a data password and is prompted to save it securely in a password manager or otherwise save a copy
  // CD: a random uint8Array(16) salts is generated: SUKs
  // CD: Argon2 is used to derive secret user key (SUK) from data password and SUKs
  // CD: master data key is generated (MDK), saved in jwk format in local IndexedDB
  // CD: SUK is used to encrypt MDK, resulting in SUK-MDK
  // S: SUK-MDK, SUKs are added to user record, updated in DB
  // S: new device A record with UUID, device A metadata, userID is created in DB
  // CD: user is ready to securely use the service for duration of their session
  const handleCreateKeysFromPassword = async (
    password: string,
    password2: string,
  ) => {
    if (password !== password2) {
      setMessage(t("dataSecurity.passphraseMismatch")); // passphrases do not match
      return;
    }
    if (password.length < 16) {
      setMessage("dataSecurity.passphraseTooShort"); // passphrases must be at least 16 characters
      return;
    }
    try {
      const { sukMdk, passwordSalt } = await createUserKeys(password);

      await updateUser.mutateAsync({
        passwordSalt: Buffer.from(passwordSalt).toString("base64"),
        sukMdk: Buffer.from(sukMdk).toString("base64"),
      });
      await clearCacheAndFetch("/settings");
    } catch (error) {
      console.error("Error saving user keys:", error);
      setMessage(t("dataSecurity.failedToSaveUserKeys")); // Failed to save user keys
      throw new Error("Failed to save user keys.");
    }
  };

  const handleSetupEncryptionOnNewDevice = async (
    password: string,
    passwordSalt: string,
    sukMdk: string,
  ) => {
    if (password.length < 16) {
      setMessage(t("dataSecurity.passphraseTooShort"));
      return;
    }
    try {
      await unwrapMDKAndSave({
        password,
        passwordSalt,
        sukMdk,
      });
      await clearCacheAndFetch("/settings");
      setIsLocalMdk(true);
    } catch (error) {
      console.error("Failed to enable encryption/decryption:", error);
      setMessage(t("dataSecurity.failedToEnableEncryptionDecryption"));
      throw new Error("Failed to enable encryption/decryption");
    }
  };

  const handleRevokeAccess = async () => {
    try {
      setIsLocalMdk(false);
      document.cookie = "mdkJwk=; path=/; secure; samesite=strict";
      await deleteJWKFromIndexedDB(MASTERDATAKEY);
      await clearCacheAndFetch("/settings");
    } catch (error) {
      console.error("Error revoking access:", error);
      setMessage(t("dataSecurity.failedToRevokeAccess")); // Failed to revoke data access
      throw new Error("Failed to revoke access");
    }
  };

  useEffect(() => {
    if (!password && !password2) {
      setMessage("");
    } else if (password && password2) {
      if (password !== password2) {
        setMessage(t("dataSecurity.passphraseMismatch")); // passphrases do not match
      } else {
        setMessage("");
      }
    }
  }, [password, password2, t]);

  useEffect(() => {
    const fetchLocalMdk = async () => {
      if (user?.sukMdk) {
        try {
          const key = await getLocalMdkForUser(user.sukMdk);

          setIsLocalMdk(!!key);
        } catch (error) {
          console.error("Error retrieving local key");
        }
      }
    };

    fetchLocalMdk().catch(() => {
      console.error("Error retrieving local key");
    });
  }, [user?.sukMdk, isLocalMdk]);

  //todo: handle user logged in on second device
  //todo: handle password reset
  //todo: handle decrypt data and unset key
  if (!user) {
    return (
      <Card isButton={false}>
        <Spinner />
      </Card>
    );
  }

  return (
    <Card variant="form" isButton={false}>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>{t("dataSecurity.dataPassphrase")}</h2>
        <p className="text-sm opacity-60">
          {t("dataSecurity.dataPassphraseDescription")}
        </p>
        {message && <p className="text-red-600">{message}</p>}

        {!user?.sukMdk ? (
          <div>
            <details
              className="flex w-full flex-col gap-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-sm text-yellow-700"
              role="alert"
            >
              <summary className="cursor-pointer font-bold">Caution</summary>
              <div className="mt-2 flex flex-col gap-2">
                <p>{t("dataSecurity.passphraseCaution")}</p>
                <p>{t("dataSecurity.passphraseRecommendation")}</p>
              </div>
            </details>
            <Input
              label="data passphrase"
              type="password"
              value={password}
              minLength={16}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="confirm passphrase"
              type="password"
              value={password2}
              minLength={16}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <div className="mt-4 flex w-full flex-col gap-4">
              <Button
                disabled={password.length < 16}
                onClick={() =>
                  handleCreateKeysFromPassword(password, password2)
                }
              >
                {t("dataSecurity.setPassphrase")}
              </Button>
            </div>
          </div>
        ) : !isLocalMdk ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="font-light">
              {t("dataSecurity.unlockDataOnThisDevice")}
            </p>
            <Input
              label="passphrase"
              type="password"
              value={password}
              minLength={16}
              onChange={(e) => setPassword(e.target.value)}
              required
              showHidePassword
            />
            <Button
              onClick={() =>
                handleSetupEncryptionOnNewDevice(
                  password,
                  user.passwordSalt!,
                  user.sukMdk!,
                )
              }
            >
              enable decryption / encryption
            </Button>
          </div>
        ) : (
          <Card isButton={false}>
            <div className="flex w-full flex-col items-center gap-4">
              <p className="font-light">
                {t("dataSecurity.dataAccessIsEnabledOnThisDevice")}
              </p>
              <p className="text-sm opacity-60">
                {t("dataSecurity.dataAccessCaution")}
              </p>
              <Button onClick={() => handleRevokeAccess()}>
                {t("dataSecurity.revokeAccess")}{" "}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}
