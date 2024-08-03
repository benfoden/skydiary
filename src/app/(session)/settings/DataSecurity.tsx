"use client";

import { useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import {
  generateEncryptionKeyFromPasswordWithSalt,
  generateKeyPair,
} from "~/utils/encryption";

export default function DataSecurityCard() {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [password, setPassword] = useState("");

  // •   When the user first registers an account, they enter a data password and this is used with a random salt to generate a strong encryption key locally on their device.
  // •   A random UUID is generated and stored on the server as a device ID, together with a label for the device and various metadata.
  // •   The user key is only stored locally in JWK format, using the IndexedDB API.
  // •   The deviceID is also stored locally.
  // •   Before storing the salt on the server it is encrypted with a key loaded from an environment variable. It is decrypted on demand and made available to the client via the user session object.
  // •   When the user logs out, the user key and deviceID are deleted from the device.
  // •   The user is responsible for securely storing their data password. It can be backed up or stored in a secure location accessible only to the user.
  // •   A data encryption key is generated.
  // •   The user key is used to create an encrypted data encryption key, which is then stored on the server and made available in the user session object.

  const handleCreateKeyFromPassword = async (password: string) => {
    // derive user key from password
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await generateEncryptionKeyFromPasswordWithSalt({
      password,
      salt,
    });

    // generate key pair
    const { publicKey, privateKey } = await generateKeyPair();

    // send public key to the server
    // encrypt private key with user key derived from password
    // store encrypted private key in local storage, with the salt

    // const exportedJWK = await crypto.subtle.exportKey("jwk", key);
    // localStorage.setItem("exportedJWK", JSON.stringify(exportedJWK));
    // const exportedKey = await crypto.subtle.exportKey("raw", key);

    // const keyString = Buffer.from(exportedKey).toString("base64");
    // setEncryptionKey(keyString);
  };

  return (
    <Card variant="form" isButton={false}>
      <div className="flex w-full flex-col gap-4">
        <div>
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
