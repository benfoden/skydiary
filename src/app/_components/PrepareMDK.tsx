"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useMdkJwkLocal } from "~/utils/useMdkJwkLocal";

export default function PrepareMDK() {
  const { data: session } = useSession();
  const user = session?.user;
  const mdkJwk = useMdkJwkLocal();

  useEffect(() => {
    const handleMakeMdkCookie = async () => {
      if (!mdkJwk) {
        throw new Error("Failed to retrieve key from IndexedDB");
      }
      document.cookie = `mdkJwk=${JSON.stringify(mdkJwk)}; path=/; secure; samesite=strict`;
    };
    if (user?.sukMdk && user?.passwordSalt) {
      //todo: find a way to get this prepared that doesn't cause an error
      //todo: hypothesis: when the server first loads the page the client isn't ready yet
      handleMakeMdkCookie().catch(() => void 0);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        document.cookie = `mdkJwk=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mdkJwk, user?.sukMdk, user?.passwordSalt]);

  return null;
}
