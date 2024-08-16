import { type User } from "@prisma/client";
import { api } from "~/trpc/server";

export default async function runBulkEncryption({
  user,
  mdkJwk,
}: {
  user: User;
  mdkJwk: JsonWebKey;
}) {
  if (user?.passwordSalt && user?.sukMdk && mdkJwk) {
    try {
      console.log("Encrypting bulk data...");
      await api.post.encryptAllPosts({ mdkJwk });
      await api.persona.encryptAllPersonas({ mdkJwk });
    } catch (error) {
      console.error("Error encrypting bulk data", error);
    }
  }
  console.log("Encryption jobs complete.");
}
