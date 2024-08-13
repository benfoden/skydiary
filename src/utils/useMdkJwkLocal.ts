"use client";

import { useSession } from "next-auth/react";
import { getJWKFromIndexedDB, MASTERDATAKEY } from "./cryptoA1";

import { useEffect, useState } from "react";

export function useMdkJwkLocal(): JsonWebKey | undefined {
  const { data: session } = useSession();
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
        //don't leak error details to client
        return undefined;
      }
    };

    if (user?.sukMdk && user?.passwordSalt) {
      fetchJWK().catch(() => {
        //don't leak error details to client
        return undefined;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [user, user?.sukMdk, user?.passwordSalt]);

  return mdkJwk;
}
