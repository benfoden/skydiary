export interface EncryptedData {
  cipherText: string;
  iv: Uint8Array;
}

export async function genUserKey() {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const passwordLength = 36; // 6 sets of 6 characters
  const randomValues = new Uint8Array(passwordLength);
  crypto.getRandomValues(randomValues);

  let userKeyBase = "";
  for (let i = 0; i < passwordLength; i++) {
    const randomValue = randomValues[i];
    if (randomValue === undefined) {
      throw new Error("Failed to gen random values");
    }
    userKeyBase += charset[randomValue % charset.length];
    if ((i + 1) % 6 === 0 && i < passwordLength - 1) {
      userKeyBase += "-";
    }
  }
  return "A1-" + userKeyBase;
}

export async function genRandomSalt(): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return Buffer.from(salt).toString("base64");
}

export async function deriveSecretUserKey({
  userKey,
  salt,
}: {
  userKey: string;
  salt: string;
}): Promise<JsonWebKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const saltArray = Uint8Array.from(Buffer.from(salt, "base64"));

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltArray,
      iterations: 310000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  return await crypto.subtle.exportKey("jwk", derivedKey);
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

export async function generateAsymmetricKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function encryptDataWithKey(
  data: string,
  key: CryptoKey,
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
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

export async function decryptDataWithKey(
  encryptedData: { cipherText: string; iv: Uint8Array },
  key: CryptoKey,
): Promise<string> {
  const decoder = new TextDecoder();
  const encryptedBuffer = Buffer.from(encryptedData.cipherText, "base64");
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: encryptedData.iv,
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
    const request = indexedDB.open("cryptoDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "name" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("keys", "readwrite");
      const store = transaction.objectStore("keys");
      const putRequest = store.put({ name: keyName, jwk });

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = () => {
        reject(new Error("Failed to save JWK to IndexedDB"));
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
    const request = indexedDB.open("cryptoDB", 1);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("keys", "readonly");
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
        reject(new Error("Failed to retrieve JWK from IndexedDB"));
      };
    };

    request.onerror = (event) => {
      reject(new Error("Failed to open IndexedDB"));
    };
  });
}
