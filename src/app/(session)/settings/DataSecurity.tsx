"use client";

import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import {
  deriveKeyArgon2,
  getJWKFromIndexedDB,
  saveJWKToIndexedDB,
} from "~/utils/cryptoA1";

export default function DataSecurityCard() {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");

  // CD: on /settings page the user enters a data password and is prompted to save it securely in a password manager or otherwise save a copy
  // CD: a random uint8Array(16) salts is generated: SUKs
  // CD: Argon2 is used to derive secret user key (SUK) from data password and SUKs
  // CD: master data key is generated (MDK), saved in jwk format in local IndexedDB
  // CD: SUK is used to encrypt MDK, resulting in SUK-MDK
  // S: SUK-MDK, SUKs are added to user record, updated in DB
  // S: new device A record with UUID, device A metadata, userID is created in DB
  // CD: user is ready to securely use the service for duration of their session

  const handleCreateKeyFromPassword = async (
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
    // derive user key from password
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const saltString = Buffer.from(salt).toString("base64");
    //todo: save salt to db

    const dataEncryptionKey = await deriveKeyArgon2({
      password,
      salt,
    });
    //todo: save key to indexeddb

    await saveJWKToIndexedDB(dataEncryptionKey, "dataEncryptionKey");

    console.log(
      "dataEncryptionkey",
      await getJWKFromIndexedDB("dataEncryptionKey"),
    );
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

  return (
    <Card variant="form" isButton={false}>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>data password</h2>
        <p className="text-sm opacity-60">
          setting a data password will keep the data you create private from
          skydiary and anyone else.
        </p>
        <details
          className="flex w-full flex-col gap-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-sm text-yellow-700"
          role="alert"
        >
          <summary className="cursor-pointer font-bold">Caution</summary>
          <div className="mt-2 flex flex-col gap-2">
            <p>
              because we never see your password, we can not recover it if you
              forget it.
            </p>
            <p>
              we recommend setting a unique, long password. save it securely in
              a password manager, write it down, or download a .PDF with the
              password
            </p>
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
          {message && <p className="text-red-600">{message}</p>}

          <Button
            onClick={() => handleCreateKeyFromPassword(password, password2)}
          >
            Set Password and Encrypt Data
          </Button>
        </div>
      </div>
    </Card>
  );
}
