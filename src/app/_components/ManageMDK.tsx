"use client";

import { type User } from "@prisma/client";
import { useEffect } from "react";
import { useMdkJwkLocal } from "~/utils/useMdkJwkLocal";

export default function ManageMDK({ user }: { user?: User }) {
  const mdkJwk = useMdkJwkLocal();

  useEffect(() => {
    const handleMakeMdkCookie = async () => {
      if (!mdkJwk) {
        throw new Error("Failed to retrieve local key");
      }
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `mdkJwk=${JSON.stringify(mdkJwk)}; path=/; secure; samesite=strict; expires=${expires.toUTCString()}`;
    };

    if (user?.sukMdk && user?.passwordSalt) {
      handleMakeMdkCookie().catch(() => void 0);
    }
  }, [mdkJwk, user?.sukMdk, user?.passwordSalt]);

  return null;
}
