"use client";

import { getJWKFromIndexedDB, MASTERDATAKEY } from "./cryptoA1";

export function useMdkJwkLocal(): JsonWebKey | undefined {
  let mdkJwk: JsonWebKey | undefined;
  const getMdkJwkFromCookies = () => {
    getJWKFromIndexedDB(MASTERDATAKEY)
      .then((result) => {
        mdkJwk = result;
      })
      .catch((error) => {
        console.error("Failed to retrieve key from IndexedDB:", error);
      });
  };

  getMdkJwkFromCookies();
  return mdkJwk;
}
