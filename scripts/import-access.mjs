import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AccessStore } from "../lib/access-store.mjs";

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...values] = rows;
  return values.map((columns) => Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ""), columns[index] ?? ""])));
}

const [usersPath, adminsPath] = process.argv.slice(2);
if (!usersPath || !adminsPath) throw new Error("usage: npm run import:access -- users.csv admins.csv");
const databasePath = process.env.CHUBB_ACCESS_DB || resolve("tmp/chubb-access.sqlite");
const store = new AccessStore(databasePath);
const result = store.importSnapshot({ users: parseCsv(readFileSync(usersPath, "utf8")), admins: parseCsv(readFileSync(adminsPath, "utf8")) });
console.log(JSON.stringify(result, null, 2));
store.close();
