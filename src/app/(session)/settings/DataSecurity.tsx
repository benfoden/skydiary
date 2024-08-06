"use client";

import { useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";

export default function DataSecurityCard() {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [password, setPassword] = useState("");

  // CD: on /settings page the user enters a data password and is prompted to save it securely in a password manager or otherwise save a copy
  // CD: a random uint8Array(16) salts is generated: SUKs
  // CD: Argon2 is used to derive secret user key (SUK) from data password and SUKs
  // CD: master data key is generated (MDK), saved in jwk format in local IndexedDB
  // CD: SUK is used to encrypt MDK, resulting in SUK-MDK
  // S: SUK-MDK, SUKs are added to user record, updated in DB
  // S: new device A record with UUID, device A metadata, userID is created in DB
  // CD: user is ready to securely use the service for duration of their session
  const handleCreateKeyFromPassword = async (password: string) => {
    // derive user key from password
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await generateEncryptionKeyFromPasswordWithSalt({
      password,
      salt,
    });
  };

  return (
    <Card variant="form" isButton={false}>
      <div className="flex w-full flex-col gap-4">
        <div>
          <p>
            create a unique password, and save it securely. we recommend using a
            password manager or saving a .PDF with the password
          </p>
          <Input
            label="data password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={() => handleCreateKeyFromPassword(password)}>
            Set Password and Encrypt Data
          </Button>
        </div>
        <div></div>
      </div>
    </Card>
  );
}
