"use client";

import { useState } from "react";
import Input from "~/app/_components/Input";

export default function CryptoPage() {
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

      <div>
        <div className="mb-8 flex w-full flex-col gap-4">
          <Input
            label="input plain text"
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
