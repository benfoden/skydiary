"use client";

import { useSession } from "next-auth/react";
import { getJWKFromIndexedDB, MASTERDATAKEY } from "./cryptoA1";

import { useEffect, useState } from "react";

export function useMdkJwkLocal(): JsonWebKey | undefined {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [mdkJwk, setMdkJwk] = useState<JsonWebKey | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchJWK = async () => {
      try {
        const result = await getJWKFromIndexedDB(MASTERDATAKEY);
        if (isMounted) {
          setMdkJwk(result ?? undefined);
        }
      } catch (error) {
        console.error(
          "Failed to retrieve key from IndexedDB in useMdkJwkLocal:",
          error,
        );
        // Additional logging for debugging
        console.error("IndexedDB Error Details:", {
          status,
          user,
          MASTERDATAKEY,
        });
      }
    };

    if (status === "authenticated" && user?.sukMdk && user?.passwordSalt) {
      fetchJWK().catch((error) => {
        console.error("Error in fetchJWK call in useMdkJwkLocal:", error);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [status, user, user?.sukMdk, user?.passwordSalt]);

  return mdkJwk;
}
