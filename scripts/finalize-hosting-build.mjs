import { cp, mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverEntry = resolve(root, "dist/server/index.js");
const metadataDirectory = resolve(root, "dist/.openai");

await stat(serverEntry);
await mkdir(metadataDirectory, { recursive: true });
await cp(
  resolve(root, ".openai/hosting.json"),
  resolve(metadataDirectory, "hosting.json")
);
