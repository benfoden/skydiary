"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { decryptTextWithIVAndKey, getLocalMdkForUser } from "~/utils/cryptoA1";

export default function DecryptedTextSpan({
  cipherText,
  iv,
}: {
  cipherText: string;
  iv: string;
}) {
  const [text, setText] = useState("");
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  useEffect(() => {
    const decryptText = async () => {
      if (iv && user?.sukMdk) {
        try {
          const key = await getLocalMdkForUser(user.sukMdk);
          const decryptedText = await decryptTextWithIVAndKey({
            cipherText,
            iv: Uint8Array.from(Buffer.from(iv, "base64")),
            key,
          });
          setText(decryptedText);
        } catch (error) {
          console.error("Error decrypting text:", error);
        }
      }
    };
    decryptText().catch(() => {
      throw new Error("Error decrypting text");
    });
  }, [cipherText, iv, user?.sukMdk]);

  console.log("text", text);

  return <span>{text}</span>;
}
