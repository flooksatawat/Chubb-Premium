#!/usr/bin/env node
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");

const mode = (process.env.HOSTINGER_DEPLOY_MODE || "app").toLowerCase();
const host = process.env.HOSTINGER_HOST || "";
const user = process.env.HOSTINGER_USER || "";
const remotePath = process.env.HOSTINGER_PATH || "";
const port = process.env.HOSTINGER_PORT || "22";
const restartCmd = process.env.HOSTINGER_RESTART_CMD || "";
const sourceDir = process.env.HOSTINGER_SOURCE_DIR || (mode === "static" ? "dist/client" : ".");

const required = [
  ["HOSTINGER_HOST", host],
  ["HOSTINGER_USER", user],
  ["HOSTINGER_PATH", remotePath],
];

const missing = required.filter(([, value]) => !String(value).trim()).map(([name]) => name);
if (missing.length) {
  console.error(`Missing Hostinger env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const rsyncBase = [
  "-az",
  "--delete",
  "--exclude", ".git",
  "--exclude", "node_modules",
  "--exclude", ".env",
  "--exclude", ".env.*",
  "--exclude", ".DS_Store",
];

function run(label, cmd, args, opts = {}) {
  process.stdout.write(`> ${label}
`);
  execFileSync(cmd, args, { stdio: "inherit", cwd: root, ...opts });
}

function remoteSpec() {
  return `${user}@${host}`;
}

if (checkOnly) {
  console.log(JSON.stringify({
    success: true,
    mode,
    root,
    sourceDir,
    remote: remoteSpec(),
    remotePath,
    restartCmd: Boolean(restartCmd),
    env: {
      HOSTINGER_HOST: Boolean(host),
      HOSTINGER_USER: Boolean(user),
      HOSTINGER_PATH: Boolean(remotePath),
      HOSTINGER_PORT: port,
    }
  }, null, 2));
  process.exit(0);
}

if (!existsSync(resolve(root, sourceDir))) {
  console.error(`Source path not found: ${sourceDir}`);
  process.exit(1);
}

if (mode === "static") {
  const source = sourceDir.endsWith("/") ? sourceDir : `${sourceDir}/`;
  run(
    "sync static files to Hostinger",
    "rsync",
    [
      ...rsyncBase,
      "-e", `ssh -p ${port}`,
      source,
      `${remoteSpec()}:${remotePath}/`,
    ]
  );
} else {
  run(
    "sync app repo to Hostinger",
    "rsync",
    [
      ...rsyncBase,
      "-e", `ssh -p ${port}`,
      "./",
      `${remoteSpec()}:${remotePath}/`,
    ]
  );

  if (restartCmd.trim()) {
    run(
      "restart Hostinger service",
      "ssh",
      ["-p", port, remoteSpec(), `cd ${JSON.stringify(remotePath)} && ${restartCmd}`]
    );
  } else {
    console.log("No HOSTINGER_RESTART_CMD set; remote service restart skipped.");
  }
}

console.log("Deploy scaffold finished.");
