"use client";

import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/react";

import { type User } from "@prisma/client";
import { useTranslations } from "next-intl";
import clearCacheServerAction from "~/utils/clearCacheServerAction";
import {
  createUserKeys,
  deleteJWKFromIndexedDB,
  getLocalMdkForUser,
  MASTERDATAKEY,
  unwrapMDKAndSave,
} from "~/utils/cryptoA1";
import { runBulkEncryption } from "~/utils/runBulkEncryption";
import Spinner from "./Spinner";

export default function DataSecurityCard({ user }: { user: User }) {
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [isLocalMdk, setIsLocalMdk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateUser = api.user.update.useMutation();

  const handleNewEncryptedUser = async (
    password: string,
    password2: string,
  ) => {
    if (password !== password2) {
      setMessage(t("dataSecurity.passwordMismatch"));
      return;
    }
    if (password.length < 16) {
      setMessage("dataSecurity.passwordTooShort");
      return;
    }
    setIsLoading(true);
    try {
      const { sukMdk, passwordSalt, mdkJwk } = await createUserKeys(password);
      const passwordSaltString = Buffer.from(passwordSalt).toString("base64");
      const sukMdkString = Buffer.from(sukMdk).toString("base64");

      await updateUser.mutateAsync({
        passwordSalt: passwordSaltString,
        sukMdk: sukMdkString,
      });
      if (passwordSaltString && sukMdkString && mdkJwk) {
        setMessage(t("dataSecurity.encryptingData"));
        try {
          await runBulkEncryption({ mdkJwk });
          setMessage(t("dataSecurity.bulkEncryptionComplete"));
        } catch (error) {
          console.error("Error encrypting your data:", error);
          setMessage(t("dataSecurity.failedToRunBulkEncryption"));
          setIsLoading(false);

          throw new Error("Failed to run bulk encryption");
        }
      }

      await clearCacheServerAction("/settings");
      window.location.reload();
    } catch (error) {
      console.error("Error enabling encryption:", error);
      setMessage(t("dataSecurity.failedToEnableEncryptionDecryption"));
      setIsLoading(false);

      throw new Error("Failed to enable decryption");
    }
    setIsLoading(false);
  };

  const handleSetupEncryptionOnNewDevice = async (
    password: string,
    passwordSalt?: string | null,
    sukMdk?: string | null,
  ) => {
    if (password.length < 16) {
      setMessage(t("dataSecurity.passwordTooShort"));
      return;
    }
    if (!passwordSalt || !sukMdk) {
      throw new Error("Missing data decryption details");
    }
    try {
      await unwrapMDKAndSave({
        password,
        passwordSalt,
        sukMdk,
      });
      await clearCacheServerAction("/settings");
      window.location.reload();
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
      await deleteJWKFromIndexedDB(MASTERDATAKEY);
      document.cookie = "mdkJwk=; path=/; secure; samesite=strict; max-age=0";
      await clearCacheServerAction("/settings");
      window.location.reload();
    } catch (error) {
      console.error("Error revoking access:", error);
      setMessage(t("dataSecurity.failedToRevokeAccess"));
      throw new Error("Failed to revoke access");
    }
  };

  useEffect(() => {
    if (!password && !password2) {
      setMessage("");
    } else if (password && password2) {
      if (password !== password2) {
        setMessage(t("dataSecurity.passwordMismatch"));
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
      <div className="flex w-full flex-col items-center gap-8">
        <h2>{t("dataSecurity.dataAccess")}</h2>

        <p className="text-sm opacity-60">
          {t("dataSecurity.dataAccessDescription")}
        </p>
        <p className="text-sm opacity-60">
          <strong>Note:</strong> This is a BETA Feature. There is a risk of your
          data becoming unrecoverable. <br />
          <br />
          Export your data first to be careful.
        </p>
        {message && <p className="text-red-600">{message}</p>}
        {!user?.sukMdk ? (
          !isLoading ? (
            <div>
              <details
                className="flex w-full flex-col gap-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-sm text-yellow-700"
                role="alert"
              >
                <summary className="cursor-pointer font-bold">Caution</summary>
                <div className="mt-2 flex flex-col gap-2">
                  <p>{t("dataSecurity.passwordCaution")}</p>
                  <p>{t("dataSecurity.passwordRecommendation")}</p>
                </div>
              </details>
              <Input
                label="data password"
                type="password"
                value={password}
                minLength={16}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="confirm password"
                type="password"
                value={password2}
                minLength={16}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
              <div className="mt-4 flex w-full flex-col gap-4">
                <Button
                  disabled={password.length < 16}
                  onClick={() => handleNewEncryptedUser(password, password2)}
                >
                  {t("dataSecurity.setPassword")}
                </Button>
              </div>
            </div>
          ) : (
            <Spinner />
          )
        ) : !isLocalMdk && user.passwordSalt ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="font-light">
              {t("dataSecurity.unlockDataOnThisDevice")}
            </p>
            <Input
              label="password"
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
                  user.passwordSalt,
                  user.sukMdk,
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
              <a
                href="/home"
                className="mb-6 mt-4 flex w-full items-center justify-center"
              >
                <Button variant="submit" isSpecial>
                  <span className="flex w-full items-center justify-center">
                    {t("dataSecurity.continueHome")}
                  </span>
                </Button>
              </a>

              <Button onClick={() => handleRevokeAccess()}>
                {t("dataSecurity.revokeAccess")}
              </Button>
              <p className="text-sm opacity-60">
                {t("dataSecurity.dataAccessCaution")}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}
