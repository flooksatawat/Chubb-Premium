import { readFileSync } from "node:fs";

const [rawPath, expectedCommit, expectedUrl] = process.argv.slice(2);

if (!rawPath || !expectedCommit || !expectedUrl) {
  throw new Error("usage: extract-codex-result.mjs RAW_FILE COMMIT URL");
}

const messages = [];
for (const line of readFileSync(rawPath, "utf8").split(/\r?\n/)) {
  if (!line.startsWith("{")) continue;

  try {
    const event = JSON.parse(line);
    const item = event?.item;
    if (
      event?.type === "item.completed" &&
      item?.type === "agent_message" &&
      typeof item.text === "string"
    ) {
      messages.push(item.text.trim());
    }
  } catch {
    // Ignore non-event output. Raw connector traces are never forwarded.
  }
}

const finalMessage = messages.at(-1);
if (!finalMessage) {
  throw new Error("Sites deployment returned no safe final result");
}

let result;
try {
  result = JSON.parse(finalMessage);
} catch {
  throw new Error("Sites deployment did not return the required JSON result");
}

if (
  result?.status !== "succeeded" ||
  result?.deployed_url !== expectedUrl ||
  result?.commit_sha !== expectedCommit ||
  !Number.isInteger(result?.version)
) {
  throw new Error("Sites deployment result did not match the requested release");
}

const forbidden = JSON.stringify(result);
if (
  /(token|credential|authorization|bearer|siwc|secret|password|private[_ -]?key)/i.test(
    forbidden
  )
) {
  throw new Error("Sites deployment result contained a forbidden field");
}

process.stdout.write(
  JSON.stringify({
    status: "succeeded",
    deployed_url: expectedUrl,
    version: result.version,
    commit_sha: expectedCommit,
  })
);
