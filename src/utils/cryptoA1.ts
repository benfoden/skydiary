import { type Persona, type Post } from "@prisma/client";
import localforage from "localforage";
import { type PostWithCommentsAndTags } from "./types";

export interface EncryptedData {
  cipherText: string;
  iv: Uint8Array;
}

export const MASTERDATAKEY = "masterDataKey";
export const SECRETUSERKEY = "secretUserKey";

export async function genRandomSalt(): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return Buffer.from(salt).toString("base64");
}

export async function deriveKeyArgon2({
  password,
  passwordSalt,
}: {
  password: string;
  passwordSalt: Uint8Array;
}): Promise<CryptoKey> {
  const { argon2id } = await import("hash-wasm");
  const hash = await argon2id({
    password: password.normalize(),
    salt: passwordSalt,
    parallelism: 1,
    iterations: 4,
    memorySize: 1024,
    hashLength: 32,
    outputType: "binary",
  });

  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-KW", length: 256 },
    true,
    ["wrapKey", "unwrapKey"],
  );
}

export async function genSymmetricKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function wrapKey({
  wrappingKey,
  key,
}: {
  wrappingKey: CryptoKey;
  key: CryptoKey;
}): Promise<ArrayBuffer> {
  return await crypto.subtle.wrapKey("raw", key, wrappingKey, {
    name: "AES-KW",
  });
}

export async function unwrapKey({
  wrappingKey,
  wrappedKey,
}: {
  wrappingKey: CryptoKey;
  wrappedKey: ArrayBuffer;
}): Promise<CryptoKey> {
  return await crypto.subtle.unwrapKey(
    "raw",
    wrappedKey,
    wrappingKey,
    {
      name: "AES-KW",
    },
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function unwrapMDKAndSave({
  password,
  passwordSalt,
  sukMdk,
}: {
  password: string;
  passwordSalt: string;
  sukMdk: string;
}) {
  const passwordSaltArray = Uint8Array.from(
    Buffer.from(passwordSalt, "base64"),
  );
  try {
    const secretUserKey = await deriveSecretUserKey(
      password,
      passwordSaltArray,
    );
    const masterDataKey = await unwrapKey({
      wrappingKey: secretUserKey,
      wrappedKey: Buffer.from(sukMdk, "base64").buffer,
    });
    const mdkJwk = await exportKeyToJWK(masterDataKey);

    await saveJWKToIndexedDB(mdkJwk, MASTERDATAKEY);
  } catch (error) {
    console.error("Error unwrapping key:", error);
    return false;
  }
  return true;
}

export async function encryptTextWithKey(
  plainText: string,
  key: CryptoKey,
): Promise<{ cipherText: string; iv: Uint8Array }> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plainText);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedData,
    );
    const cipherText = Buffer.from(encryptedData).toString("base64");

    if (cipherText) {
      return {
        cipherText,
        iv,
      };
    } else {
      throw new Error("Failed to encrypt text");
    }
  } catch (error) {
    console.error("Error encrypting text:", error);
    throw new Error("Failed to encrypt text");
  }
}
export async function decryptTextWithIVAndKey({
  cipherText,
  iv,
  key,
}: {
  cipherText: string;
  iv: Uint8Array;
  key: CryptoKey;
}): Promise<string> {
  try {
    if (!cipherText || !iv || !key) {
      throw new Error("Missing cipherText, iv or key");
    }
    const decoder = new TextDecoder();
    const encryptedBuffer = Buffer.from(cipherText, "base64");
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedBuffer,
    );
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Error decrypting text:", error);
    throw new Error("Failed to decrypt text");
  }
}

export async function createUserKeys(
  password: string,
): Promise<{ sukMdk: ArrayBuffer; suk: CryptoKey; passwordSalt: Uint8Array }> {
  "use client";
  try {
    const passwordSalt = crypto.getRandomValues(new Uint8Array(16));

    const secretUserKey = await deriveKeyArgon2({
      password,
      passwordSalt,
    });

    const masterDataKey = await genSymmetricKey();

    const sukMdk = await wrapKey({
      wrappingKey: secretUserKey,
      key: masterDataKey,
    });

    const jwkDataEncryptionKey = await exportKeyToJWK(masterDataKey);

    await saveJWKToIndexedDB(jwkDataEncryptionKey, MASTERDATAKEY);
    return { sukMdk, suk: secretUserKey, passwordSalt };
  } catch (error) {
    console.error("Error creating user keys:", error);
    throw new Error("Failed to create user keys");
  }
}

export async function deriveSecretUserKey(
  password: string,
  passwordSalt: Uint8Array,
): Promise<CryptoKey> {
  "use client";
  try {
    return await deriveKeyArgon2({
      password,
      passwordSalt,
    });
  } catch (error) {
    console.error("Error deriving secret user key");
    throw new Error("Failed to derive secret user key");
  }
}

export async function getLocalMdkForUser(sukMdk: string): Promise<CryptoKey> {
  if (!sukMdk) {
    throw new Error("No key for data encryption");
  }

  try {
    const mdkJwk = await getJWKFromIndexedDB(MASTERDATAKEY);
    if (!mdkJwk) {
      throw new Error("Failed to retrieve key from IndexedDB");
    }
    return await importKeyFromJWK(mdkJwk);
  } catch (error) {
    throw new Error(`Error getting local key for user`);
  }
}

export async function exportKeyToJWK(key: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey("jwk", key);
}

export async function importKeyFromJWK(jwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function saveJWKToIndexedDB(
  jwk: JsonWebKey,
  keyName: string,
): Promise<void> {
  try {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "skydiary",
      version: 1.0,
      storeName: "keys",
      description: "hello",
    });
    await localforage.setItem(keyName, jwk);
  } catch (error) {
    console.error("Failed to save to local db:", error);
    throw new Error("Failed to save to local db");
  }
}

export async function getJWKFromIndexedDB(
  keyName: string,
): Promise<JsonWebKey | null> {
  try {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "skydiary",
      version: 1.0,
      storeName: "keys",
      description: "hello",
    });
    const jwk = await localforage.getItem<JsonWebKey>(keyName);
    if (!jwk) {
      console.error("Key not found in local db");
      return null;
    }
    return jwk;
  } catch (error) {
    console.error("Failed to retrieve from local db:", error);
    throw new Error("Failed to retrieve from local db");
  }
}

export async function deleteJWKFromIndexedDB(keyName: string): Promise<void> {
  try {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "skydiary",
      version: 1.0,
      storeName: "keys",
      description: "hello",
    });
    await localforage.removeItem(keyName);
  } catch (error) {
    console.error("Failed to delete from local db:", error);
    throw new Error("Failed to delete from local db");
  }
}

export async function encryptPersona(
  persona: Partial<Persona>,
  mdk: CryptoKey,
): Promise<Partial<Persona>> {
  const result: Partial<Persona> = persona;

  const fieldsToEncrypt = [
    "name",
    "gender",
    "occupation",
    "traits",
    "description",
    "relationship",
    "communicationStyle",
    "communicationSample",
  ] as const;

  const encryptionPromises = fieldsToEncrypt.map(async (field) => {
    if (persona[field]) {
      const { cipherText, iv } = await encryptTextWithKey(persona[field], mdk);
      result[field] = cipherText;
      result[`${field}IV`] = Buffer.from(iv).toString("base64");
    }
  });

  await Promise.all(encryptionPromises);

  return result;
}

export async function decryptPersona(
  persona: Persona,
  mdk: CryptoKey,
): Promise<Persona> {
  const result: Persona = persona;

  const fieldsToDecrypt = [
    "name",
    "gender",
    "occupation",
    "traits",
    "description",
    "relationship",
    "communicationStyle",
    "communicationSample",
  ] as const;

  const decryptionPromises = fieldsToDecrypt.map(async (field) => {
    const ivField = `${field}IV`;
    if (persona[field as keyof Persona] && persona[ivField as keyof Persona]) {
      const decryptedText = await decryptTextWithIVAndKey({
        cipherText: persona[field as keyof Persona] as string,
        iv: Uint8Array.from(
          Buffer.from(persona[ivField as keyof Persona] as string, "base64"),
        ),
        key: mdk,
      });
      if (typeof decryptedText === "string") {
        result[field] = decryptedText;
      }
    }
  });

  await Promise.all(decryptionPromises);

  return result;
}

export async function encryptPost(
  post: Post,
  mdk: CryptoKey,
): Promise<Partial<Post>> {
  const result: Partial<Post> = post;

  const fieldsToEncrypt = ["content", "summary"] as const;

  const encryptionPromises = fieldsToEncrypt.map(async (field) => {
    if (post[field]) {
      const { cipherText, iv } = await encryptTextWithKey(post[field], mdk);
      result[field] = cipherText;
      result[`${field}IV`] = Buffer.from(iv).toString("base64");
    }
  });

  await Promise.all(encryptionPromises);

  return result as PostWithCommentsAndTags;
}

export async function decryptPost(post: Post, mdk: CryptoKey): Promise<Post> {
  const result: Post = post;

  const fieldsToDecrypt = ["content", "summary"] as const;

  const decryptionPromises = fieldsToDecrypt.map(async (field) => {
    const ivField = `${field}IV` as keyof Post;
    if (post[field as keyof Post] && post[ivField]) {
      const decryptedText = await decryptTextWithIVAndKey({
        cipherText: post[field as keyof Post] as string,
        iv: Uint8Array.from(Buffer.from(post[ivField] as string, "base64")),
        key: mdk,
      });
      if (typeof decryptedText === "string") {
        result[field] = decryptedText;
      }
    }
  });

  await Promise.all(decryptionPromises);

  return result;
}

// export async function genUserKey() {
//   const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   const passwordLength = 36; // 6 sets of 6 characters
//   const randomValues = new Uint8Array(passwordLength);
//   crypto.getRandomValues(randomValues);

//   let userKeyBase = "";
//   for (let i = 0; i < passwordLength; i++) {
//     const randomValue = randomValues[i];
//     if (randomValue === undefined) {
//       throw new Error("Failed to gen random values");
//     }
//     userKeyBase += charset[randomValue % charset.length];
//     if ((i + 1) % 6 === 0 && i < passwordLength - 1) {
//       userKeyBase += "-";
//     }
//   }
//   return "A1-" + userKeyBase;
// }
