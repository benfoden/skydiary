"use client";

import { getJWKFromIndexedDB, MASTERDATAKEY } from "./cryptoA1";

import { useCallback, useEffect, useState } from "react";

export function useMdkJwkLocal(): JsonWebKey | undefined {
  const [mdkJwk, setMdkJwk] = useState<JsonWebKey | undefined>(undefined);

  const fetchJWK = useCallback(async () => {
    try {
      const result = await getJWKFromIndexedDB(MASTERDATAKEY);
      setMdkJwk(result ?? undefined);
    } catch (error) {
      console.error("Failed to retrieve key from IndexedDB:", error);
    }
  }, []);

  useEffect(() => {
    fetchJWK().catch((error) => {
      console.error("Error:", error);
    });
  }, [fetchJWK]);

  return mdkJwk;
}
