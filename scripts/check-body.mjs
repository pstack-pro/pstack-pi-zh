#!/usr/bin/env node
// Checks body translations against the upstream English. Used by validate-zh.mjs and by translators.
// Usage: node scripts/check-body.mjs [--src <upstream pstack dir>] [--record] [rel ...]
//   --record writes the current upstream hash of each checked, passing file into i18n/zh/bodies.json.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { bodyTokens, diffTokens, frontmatterOf, sha256 } from "./zh-lib.mjs";

export function defaultSrc() {
	return process.env.PSTACK_SRC ?? path.join(os.tmpdir(), "pstack-upstream", "pstack");
}

export function checkBodies({ root, src, files, allowStale = false }) {
	const errors = [], warnings = [];
	const hashFile = path.join(root, "i18n/zh/bodies.json");
	const hashes = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, "utf-8")) : {};
	const names = fs.readdirSync(path.join(src, "skills")).filter((n) => fs.existsSync(path.join(src, "skills", n, "SKILL.md")));
	const bodies = path.join(root, "i18n/zh/bodies");
	for (const rel of files) {
		const enFile = path.join(src, rel), zhFile = path.join(bodies, rel);
		if (!fs.existsSync(zhFile)) { errors.push(`${rel}: no translation`); continue; }
		if (!fs.existsSync(enFile)) { errors.push(`${rel}: not in upstream`); continue; }
		const en = fs.readFileSync(enFile, "utf-8"), zh = fs.readFileSync(zhFile, "utf-8");
		if (frontmatterOf(en) !== frontmatterOf(zh)) errors.push(`${rel}: frontmatter must be identical to English`);
		if (!/[\u4e00-\u9fff]/.test(zh.slice(frontmatterOf(zh).length))) errors.push(`${rel}: body has no Chinese`);
		for (const d of diffTokens(bodyTokens(en, names), bodyTokens(zh, names))) errors.push(`${rel}: mismatch ${d}`);
		if (hashes[rel] === undefined) errors.push(`${rel}: no source hash recorded`);
		else if (hashes[rel] !== sha256(en)) (allowStale ? warnings : errors).push(`${rel}: stale (upstream changed since translation)`);
	}
	return { errors, warnings, hashes };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	const args = process.argv.slice(2);
	const i = args.indexOf("--src");
	const src = i >= 0 ? args.splice(i, 2)[1] : defaultSrc();
	const record = args.includes("--record");
	const files = args.filter((a) => !a.startsWith("--"));
	if (record) {
		const hashFile = path.join(root, "i18n/zh/bodies.json");
		const hashes = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, "utf-8")) : {};
		for (const rel of files) hashes[rel] = sha256(fs.readFileSync(path.join(src, rel), "utf-8"));
		fs.writeFileSync(hashFile, JSON.stringify(Object.fromEntries(Object.entries(hashes).sort()), null, "\t") + "\n");
	}
	const { errors } = checkBodies({ root, src, files });
	for (const e of errors) console.log(`FAIL  ${e}`);
	console.log(`${errors.length ? "FAIL" : "PASS"}: ${files.length} files, ${errors.length} errors`);
	process.exit(errors.length ? 1 : 0);
}
