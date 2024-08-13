"use server";
import { cookies } from "next/headers";

export async function useMdkJwk() {
  const getMdkJwkFromCookies = () => {
    try {
      const mdkCookie = cookies().get("mdkJwk");
      return mdkCookie
        ? (JSON.parse(mdkCookie.value) as JsonWebKey)
        : undefined;
    } catch (error) {
      console.error("Error getting key cookie:", error);
      return undefined;
    }
  };

  return getMdkJwkFromCookies();
}
