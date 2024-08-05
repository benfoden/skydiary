"use client";

import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import Input from "~/app/_components/Input";
import {
  decryptDataWithKey,
  deriveSecretUserKey,
  encryptDataWithKey,
  type EncryptedData,
  exportKeyToJWK,
  genRandomSalt,
  genSymmetricKey,
  importKeyFromJWK,
} from "~/utils/cryptoA1";

export default function CryptoPage() {
  const [salt, setSalt] = useState("");
  const [secretUserKey, setSecretUserKey] = useState<JsonWebKey>();
  const [dataEncryptionKey, setDataEncryptionKey] = useState<JsonWebKey>();
  const [encryptedData, setEncryptedData] = useState<EncryptedData>();
  const [decryptedData, setDecryptedData] = useState<string>();
  const [plainText, setPlainText] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");

  /*
todo: 
generate user-held user key
generate random salt
generate secret user key from user key with random salt
generate data encryption key as jwk
save data encryption key as jwk in indexeddb 
encrypt data encryption key with secret user key

*/

  useEffect(() => {
    if (password && password2 && password !== password2) {
      setMessage("Passwords do not match");
    }
    if (password === password2) {
      setMessage("");
    }
  }, [password, password2]);

  return (
    <div className="container mx-auto flex w-full flex-col gap-4 p-4">
      <div>Crypto</div>
      <div className="flex flex-col items-start gap-4">
        <p>salt: {salt}</p>
        <p>secretUserKey: {JSON.stringify(secretUserKey)}</p>
        <p>dataEncryptionKey: {JSON.stringify(dataEncryptionKey)}</p>
        <p>encryptedData: {JSON.stringify(encryptedData)}</p>
        <p>decryptedData: {decryptedData}</p>
      </div>
      <div>
        {message && <p className="text-red-600">{message}</p>}
        <Input
          type="password"
          label="password"
          value={password}
          minLength={16}
          onChange={(e) => setPassword(e.target.value)}
          required
          showHidePassword
        />
        <Input
          type="password"
          label="confirm password"
          value={password2}
          minLength={16}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <Button onClick={async () => setSalt(await genRandomSalt())}>
          Generate Random Salt
        </Button>
        <Button
          onClick={async () => {
            const derivedKey = await deriveSecretUserKey({ password, salt });
            setSecretUserKey(derivedKey);
          }}
        >
          Derive Secret User Key
        </Button>
        <Button
          onClick={async () =>
            setDataEncryptionKey(await exportKeyToJWK(await genSymmetricKey()))
          }
        >
          Generate Data Encryption Key
        </Button>

        <div className="mb-8 flex w-full flex-col gap-4">
          <Input
            label="input plain text"
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
          />
        </div>
        <Button
          onClick={async () => {
            const encryptedData = await encryptDataWithKey(
              plainText,
              await importKeyFromJWK(dataEncryptionKey!),
            );
            setEncryptedData(encryptedData);
          }}
        >
          Encrypt Data
        </Button>
        <Button
          onClick={async () => {
            const decryptedData = await decryptDataWithKey(
              encryptedData!,
              await importKeyFromJWK(dataEncryptionKey!),
            );
            setDecryptedData(decryptedData);
          }}
        >
          Decrypt Data
        </Button>
      </div>
    </div>
  );
}
