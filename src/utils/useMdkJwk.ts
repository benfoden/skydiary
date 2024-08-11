import { cookies } from "next/headers";

export function useMdkJwk() {
  const getMdkJwkFromCookies = () => {
    const mdkCookie = cookies().get("mdkJwk");
    return mdkCookie ? (JSON.parse(mdkCookie.value) as JsonWebKey) : undefined;
  };

  return getMdkJwkFromCookies();
}
