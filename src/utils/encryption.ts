// Function to generate a strong encryption key
export async function generateEncryptionKeyFromPassword({
  password,
}: {
  password: string;
}): Promise<CryptoKey> {
  if (password.length < 16) {
    throw new Error("Password must be at least 16 characters long");
  }
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  return await crypto.subtle.deriveKey(
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
}

// Function to return create a data encryption key and return it encrypted with the user encryption key
export async function generateDataEncryptionKey({
  encryptionKey,
}: {
  encryptionKey: CryptoKey;
}): Promise<ArrayBuffer> {
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

  return await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    encryptionKey,
    exportedDataEncryptionKey,
  );
}

// Function to decrypt the data encryption key using the user encryption key
export async function decryptDataEncryptionKey(
  encryptedDataEncryptionKey: ArrayBuffer,
  encryptionKey: CryptoKey,
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
    encryptionKey,
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
export async function encryptString({
  plainText,
  encryptionKey,
}: {
  plainText: string;
  encryptionKey: string;
}): Promise<string> {
  const currentCryptokey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(encryptionKey, "base64"),
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plainText);

  const encryptedText = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    currentCryptokey,
    encodedText,
  );

  const combinedArray = new Uint8Array(iv.length + encryptedText.byteLength);
  combinedArray.set(iv, 0);
  combinedArray.set(new Uint8Array(encryptedText), iv.length);

  return Buffer.from(combinedArray).toString("base64");
}

// Function to decrypt a string with the user encryption key
export async function decryptString({
  encryptedText,
  encryptionKey,
}: {
  encryptedText: string;
  encryptionKey: string;
}): Promise<string> {
  try {
    const currentCryptokey = await crypto.subtle.importKey(
      "raw",
      Buffer.from(encryptionKey, "base64"),
      {
        name: "AES-GCM",
      },
      true,
      ["encrypt", "decrypt"],
    );
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
      currentCryptokey,
      encryptedData,
    );

    return new TextDecoder().decode(decryptedText);
  } catch (error) {
    console.error("Error decrypting string:", error);
    throw new Error(
      "Failed to decrypt string. Please check the encryption key and try again.",
    );
  }
}

// how to store th ekey locally
// window.crypto.subtle.exportKey("jwk", key)
// .then(e=>localStorage.setItem("webkey",JSON.stringify(e)));
