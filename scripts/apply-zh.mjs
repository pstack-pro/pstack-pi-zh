// Applies i18n/zh translations to the generated skills/. Called at the end of scripts/sync.mjs;
// also runnable on its own: node scripts/apply-zh.mjs <upstream pstack dir> <command prefix>
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { bilingual, loadDescriptions, readDescription, sha256, writeDescription } from "./zh-lib.mjs";

export function applyZh({ root, src, prefix, transform = (t) => t }) {
	const db = loadDescriptions(root);
	const names = Object.keys(db).sort((a, b) => b.length - a.length);
	const cmd = new RegExp(`(?<=^|[\\s\`(\\[\"'（、])/(${names.join("|")})(?![\\w/-])`, "gm");
	const stale = [], missing = [];
	for (const name of fs.readdirSync(path.join(src, "skills"))) {
		const upstream = path.join(src, "skills", name, "SKILL.md");
		const out = path.join(root, "skills", name, "SKILL.md");
		if (!fs.existsSync(upstream) || !fs.existsSync(out)) continue;
		// Port overrides (overrides/skills/<name>/SKILL.md) replace upstream text; hash against the override.
		const override = path.join(root, "overrides", "skills", name, "SKILL.md");
		const en = readDescription(fs.readFileSync(fs.existsSync(override) ? override : upstream, "utf-8")).value;
		const entry = db[name];
		if (!entry?.zh) { missing.push(name); continue; }
		if (entry.source_sha256 !== sha256(en)) stale.push(name);
		// Shipped description: Chinese + the generated (platform-adapted) English, both with this side's prefix.
		const enOut = readDescription(fs.readFileSync(out, "utf-8")).value;
		const zh = transform(entry.zh).replace(cmd, `${prefix}$1`);
		fs.writeFileSync(out, writeDescription(fs.readFileSync(out, "utf-8"), bilingual(zh, enOut)));
	}
	if (missing.length) console.log(`zh: untranslated descriptions (English kept): ${missing.join(", ")}`);
	if (stale.length) console.log(`zh: STALE translations (upstream text changed): ${stale.join(", ")}`);
	return { stale, missing };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	applyZh({ root, src: process.argv[2], prefix: process.argv[3] });
}
