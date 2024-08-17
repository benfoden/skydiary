"use server";
import { api } from "~/trpc/server";

export async function runBulkEncryption({ mdkJwk }: { mdkJwk: JsonWebKey }) {
  if (mdkJwk) {
    try {
      await api.post.encryptAllPosts({ mdkJwk });
      await api.persona.encryptAllPersonas({ mdkJwk });
    } catch (error) {
      console.error("Error encrypting bulk data", error);
    }
  }
  console.log("Encryption jobs complete.");
}
