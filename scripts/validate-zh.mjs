#!/usr/bin/env node
// Asserts the Chinese layer did not change anything a machine reads.
// Checks: i18n/zh/descriptions.json (EN vs ZH), generated skills/*/SKILL.md, and any full-file
// translations in i18n/zh/bodies/<path> against the upstream checkout (PSTACK_SRC or the sync temp clone).
// Usage: node scripts/validate-zh.mjs [--allow-stale]
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { checkBodies, defaultSrc } from "./check-body.mjs";
import { diffTokens, listUpstreamMarkdown, loadDescriptions, protectedTokens, readDescription, sha256 } from "./zh-lib.mjs";

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
	if (d.includes("| EN:") || !CJK.test(d)) errors.push(`skills/${name}: description must be Chinese only`);
	const e = db[name];
	if (!e) { errors.push(`skills/${name}: no translation entry`); continue; }
	// Shipped text = the translation with only the command prefix / platform tool names rewritten.
	if (norm(d) !== norm(e.zh)) errors.push(`skills/${name}: shipped description differs from i18n entry`);
	for (const x of diffTokens(protectedTokens(norm(e.en), names), protectedTokens(norm(d), names))) errors.push(`skills/${name}: shipped token mismatch vs English ${x}`);
	for (const q of quoted(e.en)) if (!d.includes(q)) errors.push(`skills/${name}: trigger phrase missing: ${q}`);
	const prefixes = new Set([...d.matchAll(/\/(pstack|skill):/g)].map((m) => m[1]));
	if (prefixes.size > 1) errors.push(`skills/${name}: mixed command prefixes`);
	if ([...d.matchAll(/(?<![\w./:-])\/([a-z][\w-]*)(?![\w/-])/g)].some((m) => names.includes(m[1]))) errors.push(`skills/${name}: unprefixed slash command`);
}

// 3. Body translations (i18n/zh/bodies/<upstream path>), checked against the upstream English.
const bodiesDir = path.join(root, "i18n/zh/bodies");
const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const bodyFiles = walk(bodiesDir).map((f) => path.relative(bodiesDir, f)).sort();
const src = defaultSrc();
let upstreamMd = [];
if (!fs.existsSync(path.join(src, "skills"))) {
	if (bodyFiles.length) errors.push(`body translations need the upstream checkout at ${src} (run scripts/sync.mjs or set PSTACK_SRC)`);
} else {
	const r = checkBodies({ root, src, files: bodyFiles, allowStale });
	errors.push(...r.errors); warnings.push(...r.warnings);
	upstreamMd = listUpstreamMarkdown(src);
	const missing = upstreamMd.filter((f) => !bodyFiles.includes(f));
	if (missing.length) warnings.push(`${missing.length} upstream markdown files still English: ${missing.join(", ")}`);
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);
console.log(`${errors.length ? "FAIL" : "PASS"}: ${names.length} descriptions, ${fs.readdirSync(skillsDir).length} skills, ${bodyFiles.length}/${upstreamMd.length} body files translated, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
