"use client";

import { useSession } from "next-auth/react";
import {
  getJWKFromIndexedDB,
  importKeyFromJWK,
  MASTERDATAKEY,
} from "./cryptoA1";

import { useEffect, useState } from "react";

export function useMdk(): CryptoKey | undefined {
  const { data: session } = useSession();
  const user = session?.user;
  const [mdk, setMdk] = useState<CryptoKey | undefined>(undefined);

  useEffect(() => {
    const fetchJWK = async () => {
      try {
        const result = await getJWKFromIndexedDB(MASTERDATAKEY);
        if (!result) {
          return;
        }
        const mdk = await importKeyFromJWK(result);
        setMdk(mdk ?? undefined);
      } catch (error) {
        throw new Error();
      }
    };

    if (user?.sukMdk && user?.passwordSalt) {
      fetchJWK().catch(() => {
        console.error("Error getting key for user");
      });
    }
  }, [user, user?.sukMdk, user?.passwordSalt]);

  return mdk;
}
