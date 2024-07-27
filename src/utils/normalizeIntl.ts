import * as fs from "fs";
import * as path from "path";

function readJSONFile(filePath: string): Record<string, unknown> {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as Record<string, unknown>;
}

// Read all JSON files in the ~/i18n folder
const messagesDir = path.join(__dirname, "..", "i18n");
const files = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json"));
const filesData = files.map((file) =>
  readJSONFile(path.join(messagesDir, file)),
);

// Find missing keys that are not consistent between all json files
const allKeys = filesData.reduce(
  (acc: Set<string>, fileData: Record<string, unknown>) => {
    return new Set([...acc, ...Object.keys(fileData)]);
  },
  new Set(),
);
const missingKeys = filesData.map((fileData: Record<string, unknown>) => {
  return Array.from(allKeys).filter((key: string) => !(key in fileData));
});

if (missingKeys.some((keys: string[]) => keys.length > 0)) {
  console.log("Missing keys in files:");
  missingKeys.forEach((keys: string[], index: number) => {
    console.log(`File ${files[index]}: ${keys.join(", ")}`);
  });
} else {
  console.log("No missing keys found.");
}
