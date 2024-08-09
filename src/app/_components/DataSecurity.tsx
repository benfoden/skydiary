"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/react";
import {
  createUserKeys,
  getLocalMdkForUser,
  unwrapMDKAndSave,
} from "~/utils/cryptoA1";

export default function DataPasswordCard() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [isLocalMdk, setIsLocalMdk] = useState(false);
  const updateUser = api.user.updateUser.useMutation();
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

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
    if (password && password2 && password !== password2) {
      return;
    }
    if (password.length < 16) {
      setMessage("Password must be at least 16 characters");
      return;
    }
    const { sukMdk, passwordSalt } = await createUserKeys(password);

    try {
      await updateUser.mutateAsync({
        passwordSalt: Buffer.from(passwordSalt).toString("base64"),
        sukMdk: Buffer.from(sukMdk).toString("base64"),
      });
    } catch (error) {
      console.error("Error saving user keys:", error);
      throw new Error("Failed to save user keys");
    }
  };

  useEffect(() => {
    if (!password && !password2) {
      setMessage("");
    } else if (password && password2) {
      if (password !== password2) {
        setMessage("Passwords do not match");
      } else {
        setMessage("");
      }
    }
  }, [password, password2]);

  useEffect(() => {
    const fetchLocalMdk = async () => {
      if (user?.sukMdk) {
        try {
          const key = await getLocalMdkForUser(user.sukMdk);

          setIsLocalMdk(!!key);
        } catch (error) {
          console.error("Error fetching local key:", error);
        }
      }
    };

    fetchLocalMdk().catch((error) => {
      console.error("Error fetching local key:", error);
    });
  }, [user, isLocalMdk]);

  const handleSetupEncryptionOnNewDevice = async (
    password: string,
    passwordSalt: string,
    sukMdk: string,
  ) => {
    if (password.length < 16) {
      setMessage("Password is at least 16 characters");
      return;
    }

    const unwrapped = await unwrapMDKAndSave({
      password,
      passwordSalt,
      sukMdk,
    });
    if (unwrapped) {
      setIsLocalMdk(true);
      setMessage("Your data is now accessible.");
    }
  };

  //todo: handle user logged in on second device
  //todo: handle password reset
  //todo: handle decrypt data and unset key
  if (!user) {
    return <div>loading data password details...</div>;
  }

  return (
    <Card variant="form" isButton={false}>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>data password</h2>
        <p className="text-sm opacity-60">
          setting a data password adds an extra layer of encryption for the data
          you create. <br />
          <br />
          skydiary does not store your password.
        </p>
        {!user?.sukMdk ? (
          <div>
            <details
              className="flex w-full flex-col gap-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-sm text-yellow-700"
              role="alert"
            >
              <summary className="cursor-pointer font-bold">Caution</summary>
              <div className="mt-2 flex flex-col gap-2">
                <p>
                  because we never see your password, we can not recover it if
                  you forget it.
                </p>
                <p>
                  we recommend setting a unique, long password. save it securely
                  in a password manager, write it down, or download a .PDF with
                  the password
                </p>
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
              {message && <p className="text-red-600">{message}</p>}

              <Button
                onClick={() =>
                  handleCreateKeysFromPassword(password, password2)
                }
              >
                Set Password and Encrypt Data
              </Button>
            </div>
          </div>
        ) : !isLocalMdk ? (
          <div>
            enter your password to use skydiary on this device
            <Input
              label="data password"
              type="password"
              value={password}
              minLength={16}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              Unlock your data
            </Button>
          </div>
        ) : (
          <div>
            Data password is set
            <p>removing and resetting passwords is coming soon</p>
          </div>
        )}
      </div>
    </Card>
  );
}
