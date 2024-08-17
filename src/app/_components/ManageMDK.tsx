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
      document.cookie = `mdkJwk=${JSON.stringify(mdkJwk)}; path=/; secure; samesite=strict`;
    };
    if (user?.sukMdk && user?.passwordSalt) {
      handleMakeMdkCookie().catch(() => void 0);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        document.cookie = `mdkJwk=; path=/; secure; samesite=strict`;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mdkJwk, user?.sukMdk, user?.passwordSalt]);

  return null;
}
