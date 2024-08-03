"use client";

import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import {
  decryptString,
  encryptString,
  generateEncryptionKeyFromPassword,
} from "~/utils/encryption";

export default function CryptoPage() {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [password, setPassword] = useState("");

  /*
todo: 
generate user key from password with random salt
generate raw data key





*/

  const handleCreateKeyFromPassword = async (password: string) => {
    const key = await generateEncryptionKeyFromPassword({
      password,
    });

    const exportedJWK = await crypto.subtle.exportKey("jwk", key);
    localStorage.setItem("exportedJWK", JSON.stringify(exportedJWK));
    const exportedKey = await crypto.subtle.exportKey("raw", key);

    const keyString = Buffer.from(exportedKey).toString("base64");
    setEncryptionKey(keyString);
  };

  const handleEncrypt = async (input: string, encryptionKey: string) => {
    const encrypted = await encryptString({
      plainText: input,
      encryptionKey,
    });
    setEncryptedText(encrypted);
  };
  const handleDecrypt = async (
    encryptedText: string,
    encryptionKey: string,
  ) => {
    const decrypted = await decryptString({
      encryptedText,
      encryptionKey,
    });
    setOutput(decrypted);
  };

  const handleReset = async () => {
    setInput("");
    setOutput("");
    setEncryptedText("");
    setEncryptionKey("");
  };

  useEffect(() => {}, [encryptionKey]);

  return (
    <div className="container mx-auto flex w-full flex-col gap-4 p-4">
      <div>Crypto</div>
      <div className="flex flex-col items-start gap-4">
        <p>encryptionKey: {encryptionKey}</p>
        <p>input: {input}</p>
        <p>encryptedText: {encryptedText}</p>
        <p>output: {output}</p>
      </div>
      <div>
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={() => handleCreateKeyFromPassword(password)}>
          Create Key from Password
        </Button>
        pass
        <input
          className="rounded border bg-white/20 p-4"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        text
        <input
          className="rounded border bg-white/20 p-4"
          type="text"
          value={input}
          defaultValue="hello world"
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={() => handleEncrypt(input, encryptionKey)}>
          Encrypt
        </Button>
        <Button onClick={() => handleDecrypt(encryptedText, encryptionKey)}>
          Decrypt
        </Button>
      </div>
      <div></div>
    </div>
  );
}
