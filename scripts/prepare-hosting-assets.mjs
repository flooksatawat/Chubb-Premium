import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "public");

const rootFiles = [
  "index.html",
  "favicon.ico",
  "icon.png",
  "New Icon.png",
  "site.webmanifest"
];
const assetDirectories = ["css", "js", "data", "icons"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all([
  ...rootFiles.map((file) => cp(resolve(root, file), resolve(output, file))),
  ...assetDirectories.map((directory) =>
    cp(resolve(root, directory), resolve(output, directory), { recursive: true })
  )
]);
