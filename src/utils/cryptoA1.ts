import { type Persona } from "@prisma/client";

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
    const jwkMdk = await exportKeyToJWK(masterDataKey);
    console.log("JWK MDK", jwkMdk);

    await saveJWKToIndexedDB(jwkMdk, MASTERDATAKEY);
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
  return {
    cipherText: Buffer.from(encryptedData).toString("base64"),
    iv,
  };
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
    const jwkMdk = await getJWKFromIndexedDB(MASTERDATAKEY);
    if (!jwkMdk) {
      throw new Error("Failed to retrieve key from IndexedDB");
    }
    return await importKeyFromJWK(jwkMdk);
  } catch (error) {
    throw new Error(`Error getting local key for user`);
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
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cryptoDB", 2); // Incremented version to 2

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "name" });
        console.log("Object store 'keys' created");
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      let transaction;
      try {
        transaction = db.transaction("keys", "readwrite");
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") {
          console.error("Object store 'keys' not found in IndexedDB");
          reject(new Error("Object store 'keys' not found in IndexedDB"));
          return;
        } else {
          reject(new Error("Failed to create transaction"));
          return;
        }
      }
      const store = transaction.objectStore("keys");
      const putRequest = store.put({ name: keyName, jwk });

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = () => {
        reject(new Error("Failed to save to IndexedDB"));
      };
    };

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };
  });
}

export async function getJWKFromIndexedDB(
  keyName: string,
): Promise<JsonWebKey | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cryptoDB", 2);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      let transaction;
      try {
        transaction = db.transaction("keys", "readonly");
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") {
          console.error("Object store keys not found in IndexedDB");
          resolve(null);
          return;
        } else {
          reject(new Error("Failed to create transaction"));
          return;
        }
      }

      const store = transaction.objectStore("keys");
      const getRequest = store.get(keyName);

      getRequest.onsuccess = () => {
        const result = getRequest.result as { jwk: JsonWebKey } | null;
        if (result) {
          resolve(result.jwk);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to retrieve from IndexedDB"));
      };
    };

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };
  });
}

export async function deleteJWKFromIndexedDB(keyName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cryptoDB", 2);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("keys", "readwrite");
      const store = transaction.objectStore("keys");
      const deleteRequest = store.delete(keyName);

      deleteRequest.onsuccess = () => {
        resolve();
      };

      deleteRequest.onerror = () => {
        reject(new Error("Failed to delete from IndexedDB"));
      };
    };

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };
  });
}

export async function encryptPersona(
  persona: Persona,
  mdk: CryptoKey,
): Promise<Persona> {
  const result: Partial<Persona> = { ...persona };
  const encryptionPromises = [];

  if (persona.name) {
    encryptionPromises.push(
      encryptTextWithKey(persona.name, mdk).then(({ cipherText, iv }) => {
        result.name = cipherText;
        result.nameIV = Buffer.from(iv).toString("base64");
      }),
    );
  }

  if (persona.gender) {
    encryptionPromises.push(
      encryptTextWithKey(persona.gender, mdk).then(({ cipherText, iv }) => {
        result.gender = cipherText;
        result.genderIV = Buffer.from(iv).toString("base64");
      }),
    );
  }

  if (persona.occupation) {
    encryptionPromises.push(
      encryptTextWithKey(persona.occupation, mdk).then(({ cipherText, iv }) => {
        result.occupation = cipherText;
        result.occupationIV = Buffer.from(iv).toString("base64");
      }),
    );
  }

  if (persona.traits) {
    encryptionPromises.push(
      encryptTextWithKey(persona.traits, mdk).then(({ cipherText, iv }) => {
        result.traits = cipherText;
        result.traitsIV = Buffer.from(iv).toString("base64");
      }),
    );
  }

  if (persona.description) {
    encryptionPromises.push(
      encryptTextWithKey(persona.description, mdk).then(
        ({ cipherText, iv }) => {
          result.description = cipherText;
          result.descriptionIV = Buffer.from(iv).toString("base64");
        },
      ),
    );
  }

  if (persona.relationship) {
    encryptionPromises.push(
      encryptTextWithKey(persona.relationship, mdk).then(
        ({ cipherText, iv }) => {
          result.relationship = cipherText;
          result.relationshipIV = Buffer.from(iv).toString("base64");
        },
      ),
    );
  }

  if (persona.communicationStyle) {
    encryptionPromises.push(
      encryptTextWithKey(persona.communicationStyle, mdk).then(
        ({ cipherText, iv }) => {
          result.communicationStyle = cipherText;
          result.communicationStyleIV = Buffer.from(iv).toString("base64");
        },
      ),
    );
  }

  if (persona.communicationSample) {
    encryptionPromises.push(
      encryptTextWithKey(persona.communicationSample, mdk).then(
        ({ cipherText, iv }) => {
          result.communicationSample = cipherText;
          result.communicationSampleIV = Buffer.from(iv).toString("base64");
        },
      ),
    );
  }

  await Promise.all(encryptionPromises);

  return result as Persona;
}

export async function decryptPersona(
  persona: Persona,
  mdk: CryptoKey,
): Promise<Persona> {
  const result: Partial<Persona> = { ...persona };

  const decryptionPromises: Promise<void>[] = [];

  if (persona.name && persona.nameIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.name,
        iv: Uint8Array.from(Buffer.from(persona.nameIV, "base64")),
        key: mdk,
      }).then((decryptedText) => {
        result.name = decryptedText;
      }),
    );
  }

  if (persona.gender && persona.genderIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.gender,
        iv: Uint8Array.from(Buffer.from(persona.genderIV, "base64")),
        key: mdk,
      }).then((decryptedText) => {
        result.gender = decryptedText;
      }),
    );
  }

  if (persona.occupation && persona.occupationIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.occupation,
        iv: Uint8Array.from(Buffer.from(persona.occupationIV, "base64")),
        key: mdk,
      }).then((decryptedText) => {
        result.occupation = decryptedText;
      }),
    );
  }

  if (persona.traits && persona.traitsIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.traits,
        iv: Uint8Array.from(Buffer.from(persona.traitsIV, "base64")),
        key: mdk,
      }).then((decryptedText) => {
        result.traits = decryptedText;
      }),
    );
  }

  if (persona.description && persona.descriptionIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.description,
        iv: Uint8Array.from(Buffer.from(persona.descriptionIV, "base64")),
        key: mdk,
      }).then((decryptedText) => {
        result.description = decryptedText;
      }),
    );
  }

  if (persona.relationship && persona.relationshipIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.relationship,
        iv: Uint8Array.from(Buffer.from(persona.relationshipIV, "base64")),
        key: mdk,
      }).then((decryptedText) => {
        result.relationship = decryptedText;
      }),
    );
  }

  if (persona.communicationStyle && persona.communicationStyleIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.communicationStyle,
        iv: Uint8Array.from(
          Buffer.from(persona.communicationStyleIV, "base64"),
        ),
        key: mdk,
      }).then((decryptedText) => {
        result.communicationStyle = decryptedText;
      }),
    );
  }

  if (persona.communicationSample && persona.communicationSampleIV) {
    decryptionPromises.push(
      decryptTextWithIVAndKey({
        cipherText: persona.communicationSample,
        iv: Uint8Array.from(
          Buffer.from(persona.communicationSampleIV, "base64"),
        ),
        key: mdk,
      }).then((decryptedText) => {
        result.communicationSample = decryptedText;
      }),
    );
  }

  await Promise.all(decryptionPromises);

  return result as Persona;
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
