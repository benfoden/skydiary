"use client";

import { useState } from "react";
import Button from "~/app/_components/Button";
import Input from "~/app/_components/Input";
import {
  decryptDataWithKey,
  deriveSecretUserKey,
  encryptDataWithKey,
  type EncryptedData,
  exportKeyToJWK,
  generateAsymmetricKeyPair,
  genRandomSalt,
  genSymmetricKey,
  genUserKey,
  importKeyFromJWK,
} from "~/utils/cryptoA1";

export default function CryptoPage() {
  const [userKey, setUserKey] = useState("");
  const [salt, setSalt] = useState("");
  const [secretUserKey, setSecretUserKey] = useState<JsonWebKey>();
  const [dataEncryptionKey, setDataEncryptionKey] = useState<JsonWebKey>();
  const [publicKey, setPublicKey] = useState<JsonWebKey>();
  const [privateKey, setPrivateKey] = useState<JsonWebKey>();
  const [encryptedData, setEncryptedData] = useState<EncryptedData>();
  const [decryptedData, setDecryptedData] = useState<string>();
  const [plainText, setPlainText] = useState("");

  /*
todo: 
generate user-held user key
generate random salt
generate secret user key from user key with random salt
generate data encryption key as jwk
save data encryption key as jwk in indexeddb 
encrypt data encryption key with secret user key

*/

  return (
    <div className="container mx-auto flex w-full flex-col gap-4 p-4">
      <div>Crypto</div>
      <div className="flex flex-col items-start gap-4">
        <p>userKey: {userKey}</p>
        <p>salt: {salt}</p>
        <p>secretUserKey: {JSON.stringify(secretUserKey)}</p>
        <p>dataEncryptionKey: {JSON.stringify(dataEncryptionKey)}</p>
        <p>publicKey: {JSON.stringify(publicKey)}</p>
        <p>privateKey: {JSON.stringify(privateKey)}</p>
        <p>encryptedData: {JSON.stringify(encryptedData)}</p>
        <p>decryptedData: {decryptedData}</p>
      </div>
      <div>
        <Button onClick={async () => setUserKey(await genUserKey())}>
          Generate User Key
        </Button>
        <Button onClick={async () => setSalt(await genRandomSalt())}>
          Generate Random Salt
        </Button>
        <Button
          onClick={async () => {
            const derivedKey = await deriveSecretUserKey({ userKey, salt });
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
        <Button
          onClick={async () => {
            const { publicKey, privateKey } = await generateAsymmetricKeyPair();
            setPublicKey(await exportKeyToJWK(publicKey));
            setPrivateKey(await exportKeyToJWK(privateKey));
          }}
        >
          Generate Asymmetric Key Pair
        </Button>
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
      <div className="mb-8 flex w-full flex-col gap-4">
        <Input
          label="input plain text"
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
        />
      </div>
    </div>
  );
}
