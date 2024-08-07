"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Button from "~/app/_components/Button";
import Input from "~/app/_components/Input";
import {
  decryptTextWithKey,
  encryptTextWithKey,
  getLocalMdkForUser,
} from "~/utils/cryptoA1";

export default function CryptoPage() {
  const [plainText, setPlainText] = useState("");
  const [cipherText, setCipherText] = useState<string>();
  const [iv, setIv] = useState<Uint8Array>();
  const [decryptedText, setDecryptedText] = useState<string>();

  const { data: sessionData } = useSession();
  const user = sessionData?.user;
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
      {user?.sukMdk ? (
        <div>user has a key</div>
      ) : (
        <div>user does not have a key</div>
      )}

      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div>
        <div className="mb-8 flex w-full flex-col gap-4">
          <Input
            label="input plain text"
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
          />
        </div>

        <Button
          onClick={async () => {
            const encryptedText = await encryptTextWithKey({
              plainText,
              key: await getLocalMdkForUser(user!),
            });
            setCipherText(encryptedText.cipherText);
            setIv(encryptedText.iv);
          }}
        >
          Encrypt Data
        </Button>
        {cipherText && <p>cipherText: {cipherText}</p>}
        <Button
          onClick={async () => {
            const decryptedData = await decryptTextWithKey({
              cipherText: cipherText!,
              iv: iv!,
              key: await getLocalMdkForUser(user!),
            });
            if (decryptedData) {
              setDecryptedText(decryptedData);
            } else {
              setDecryptedText("failed to decrypt");
            }
          }}
        >
          Decrypt Data
        </Button>
        {decryptedText && <p>decryptedText: {decryptedText}</p>}
      </div>
    </div>
  );
}
