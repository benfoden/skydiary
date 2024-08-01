// Function to generate a strong encryption key
export async function generateEncryptionKeyFromPassword({
  password,
  returnType = "base64",
}: {
  password: string;
  returnType?: string;
}): Promise<string | ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 310000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return returnType === "base64"
    ? Buffer.from(exportedKey).toString("base64")
    : exportedKey;
}

// Function to generate a data encryption key that is itself encrypted with the user encryption key
export async function generateDataEncryptionKey({
  encryptionKey,
  returnType = "base64",
}: {
  encryptionKey: CryptoKey;
  returnType?: string;
}): Promise<string | ArrayBuffer> {
  const dataEncryptionKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedDataEncryptionKey = await crypto.subtle.exportKey(
    "raw",
    dataEncryptionKey,
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedDataEncryptionKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    encryptionKey,
    exportedDataEncryptionKey,
  );

  const combinedArray = new Uint8Array(
    iv.length + encryptedDataEncryptionKey.byteLength,
  );
  combinedArray.set(iv, 0);
  combinedArray.set(new Uint8Array(encryptedDataEncryptionKey), iv.length);

  return returnType === "base64"
    ? Buffer.from(combinedArray).toString("base64")
    : combinedArray.buffer;
}

// Function to decrypt the data encryption key using the user encryption key
export async function decryptDataEncryptionKey(
  encryptedDataEncryptionKey: ArrayBuffer,
  userEncryptionKey: CryptoKey,
): Promise<CryptoKey> {
  const encryptedDataEncryptionKeyArray = new Uint8Array(
    encryptedDataEncryptionKey,
  );
  const iv = encryptedDataEncryptionKeyArray.slice(0, 12);
  const encryptedKey = encryptedDataEncryptionKeyArray.slice(12);

  const decryptedDataEncryptionKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    userEncryptionKey,
    encryptedKey,
  );

  return crypto.subtle.importKey(
    "raw",
    decryptedDataEncryptionKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"],
  );
}

// Function to encrypt a string with the user encryption key
export async function encryptString(
  plainText: string,
  encryptionKey: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plainText);

  const encryptedText = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    encryptionKey,
    encodedText,
  );

  const combinedArray = new Uint8Array(iv.length + encryptedText.byteLength);
  combinedArray.set(iv, 0);
  combinedArray.set(new Uint8Array(encryptedText), iv.length);

  return Buffer.from(combinedArray).toString("base64");
}

// Function to decrypt a string with the user encryption key
export async function decryptString(
  encryptedText: string,
  encryptionKey: CryptoKey,
): Promise<string> {
  const encryptedTextArray = Uint8Array.from(
    Buffer.from(encryptedText, "base64"),
  );
  const iv = encryptedTextArray.slice(0, 12);
  const encryptedData = encryptedTextArray.slice(12);

  const decryptedText = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    encryptionKey,
    encryptedData,
  );

  return new TextDecoder().decode(decryptedText);
}
