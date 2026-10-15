// Usage: node scripts/extract-en.mjs <upstream pstack dir>
// Refreshes `en` and `source_sha256` in i18n/zh/descriptions.json, keeps existing `zh`, flags stale entries.
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { readDescription, sha256 } from "./zh-lib.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
const file = path.join(root, "i18n/zh/descriptions.json");
const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : {};
const out = {};
for (const name of fs.readdirSync(path.join(src, "skills")).sort()) {
	const p = path.join(src, "skills", name, "SKILL.md");
	if (!fs.existsSync(p)) continue;
	const en = readDescription(fs.readFileSync(p, "utf-8")).value;
	const prev = db[name] ?? {};
	const h = sha256(en);
	out[name] = { source_sha256: prev.zh && prev.source_sha256 !== h ? prev.source_sha256 : h, en, zh: prev.zh ?? "" };
	if (prev.zh && prev.source_sha256 !== h) console.log(`stale: ${name}`);
}
fs.writeFileSync(file, JSON.stringify(out, null, "\t") + "\n");
