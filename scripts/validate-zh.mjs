#!/usr/bin/env node
// Asserts the Chinese layer did not change anything a machine reads.
// Checks: i18n/zh/descriptions.json (EN vs ZH), generated skills/*/SKILL.md, and any full-file
// translations in i18n/zh/files/<path> against upstream <path> (reserved; none shipped yet).
// Usage: node scripts/validate-zh.mjs [--allow-stale]
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { SEPARATOR, diffTokens, loadDescriptions, protectedTokens, readDescription, sha256 } from "./zh-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowStale = process.argv.includes("--allow-stale");
const db = loadDescriptions(root);
const names = Object.keys(db);
const errors = [], warnings = [];
const norm = (s) => s.replace(/\/(?:pstack|skill):/g, "/").replace(/\bAskUserQuestion\b/g, "AskQuestion");
const quoted = (s) => [...s.matchAll(/(?<![A-Za-z])(["'])([^"'\n]*[A-Za-z][^"'\n]*)\1(?![A-Za-z])/g)].map((m) => m[2]);
const CJK = /[\u4e00-\u9fff]/;

// 1. Translation source.
for (const [name, e] of Object.entries(db)) {
	if (!e.zh) { (allowStale ? warnings : errors).push(`${name}: missing zh (stale: new upstream skill, untranslated)`); continue; }
	if (!CJK.test(e.zh)) errors.push(`${name}: zh has no Chinese`);
	if (e.source_sha256 !== sha256(e.en)) (allowStale ? warnings : errors).push(`${name}: stale (en changed since translation)`);
	for (const d of diffTokens(protectedTokens(e.en, names), protectedTokens(e.zh, names))) errors.push(`${name}: token mismatch ${d}`);
	for (const q of quoted(e.en)) if (!e.zh.includes(q)) errors.push(`${name}: English trigger phrase dropped: ${q}`);
	if (/[\u4e00-\u9fff][A-Za-z0-9/`]|[A-Za-z0-9`][\u4e00-\u9fff]/.test(e.zh.replace(/'[^']*'|"[^"]*"/g, " "))) warnings.push(`${name}: missing space between Chinese and Latin`);
}

// 2. Generated skills.
const skillsDir = path.join(root, "skills");
for (const name of fs.readdirSync(skillsDir)) {
	const file = path.join(skillsDir, name, "SKILL.md");
	if (!fs.existsSync(file)) continue;
	const text = fs.readFileSync(file, "utf-8");
	const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!fm) { errors.push(`${name}: no frontmatter`); continue; }
	if (!fm[1].split("\n").includes(`name: ${name}`)) errors.push(`${name}: name must equal directory`);
	const d = readDescription(text)?.value ?? "";
	if (d.length > 1024) errors.push(`${name}: description ${d.length} chars > 1024`);
	const i = d.indexOf(SEPARATOR);
	if (i < 0) { errors.push(`${name}: description is not bilingual`); continue; }
	const zh = d.slice(0, i), en = d.slice(i + SEPARATOR.length);
	for (const x of diffTokens(protectedTokens(norm(en), names), protectedTokens(norm(zh), names))) errors.push(`skills/${name}: shipped token mismatch ${x}`);
	const prefixes = new Set([...d.matchAll(/\/(pstack|skill):/g)].map((m) => m[1]));
	if (prefixes.size > 1) errors.push(`skills/${name}: mixed command prefixes`);
	if (/(?<![\w./:-])\/[a-z][\w-]*(?![\w/-])/.test(zh.replace(/\/(?:pstack|skill):/g, "")) && [...zh.matchAll(/(?<![\w./:-])\/([a-z][\w-]*)/g)].some((m) => names.includes(m[1])))
		errors.push(`skills/${name}: unprefixed slash command in zh`);
}

// 3. Full-file translations (none yet in this preview).
const filesDir = path.join(root, "i18n/zh/files");
const hashesFile = path.join(root, "i18n/zh/source-hashes.json");
const hashes = fs.existsSync(hashesFile) ? JSON.parse(fs.readFileSync(hashesFile, "utf-8")) : {};
const fmKeys = (t) => (t.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "").split("\n").map((l) => l.match(/^([\w-]+):/)?.[1]).filter(Boolean);
const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
for (const zhFile of walk(filesDir)) {
	const rel = path.relative(filesDir, zhFile);
	// rel mirrors the upstream pstack layout (e.g. skills/how/SKILL.md); pass the checkout as PSTACK_SRC.
	if (!process.env.PSTACK_SRC) { warnings.push(`${rel}: set PSTACK_SRC to check this translation`); continue; }
	const enFile = path.join(process.env.PSTACK_SRC, rel);
	if (!fs.existsSync(enFile)) { errors.push(`i18n/zh/files/${rel}: no upstream file`); continue; }
	const en = fs.readFileSync(enFile, "utf-8"), zh = fs.readFileSync(zhFile, "utf-8");
	if (hashes[rel] !== sha256(en)) (allowStale ? warnings : errors).push(`${rel}: stale or unhashed translation`);
	if (fmKeys(en).join() !== fmKeys(zh).join()) errors.push(`${rel}: frontmatter keys differ`);
	for (const x of diffTokens(protectedTokens(en, names), protectedTokens(zh, names))) errors.push(`${rel}: token mismatch ${x}`);
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);
console.log(`${errors.length ? "FAIL" : "PASS"}: ${names.length} descriptions, ${fs.readdirSync(skillsDir).length} skills, ${walk(filesDir).length} full translations, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
