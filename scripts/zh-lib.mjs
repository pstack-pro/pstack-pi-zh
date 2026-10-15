// Shared helpers for the Chinese (zh) layer. Identical in claude-pstack-zh and pi-pstack-zh.
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

// Shared translations, plus this port's own entries for skills it overrides (i18n/zh-port.json wins).
export function loadDescriptions(root) {
	const shared = JSON.parse(fs.readFileSync(path.join(root, "i18n/zh/descriptions.json"), "utf-8"));
	const local = path.join(root, "i18n/zh-port.json");
	return { ...shared, ...(fs.existsSync(local) ? JSON.parse(fs.readFileSync(local, "utf-8")) : {}) };
}

export const sha256 = (s) => createHash("sha256").update(s, "utf-8").digest("hex").slice(0, 16);

// Returns { line, value } for the frontmatter `description:` (double-quoted, single-quoted or plain).
export function readDescription(text) {
	const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!fm) return null;
	const lines = fm[1].split("\n");
	const i = lines.findIndex((l) => l.startsWith("description:"));
	if (i < 0) return null;
	const raw = lines[i].slice("description:".length).trim();
	let value, block = lines[i];
	if (/^[>|][-+]?$/.test(raw)) {
		const body = [];
		for (let j = i + 1; j < lines.length && /^(\s+|$)/.test(lines[j]) && lines[j] !== ""; j++) body.push(lines[j]);
		block = [lines[i], ...body].join("\n");
		const parts = body.map((l) => l.trim());
		value = raw.startsWith(">") ? parts.join(" ") : parts.join("\n");
	} else if (raw.startsWith('"')) value = JSON.parse(raw);
	else if (raw.startsWith("'")) value = raw.slice(1, -1).replace(/''/g, "'");
	else value = raw;
	return { line: block, value };
}

export function writeDescription(text, value) {
	const d = readDescription(text);
	if (!d) throw new Error("no description");
	return text.replace(d.line, () => `description: ${JSON.stringify(value)}`);
}

// Shipped description: Chinese with embedded English trigger words (token-lean).
// SEPARATOR kept so validate can reject leftover full-bilingual "| EN:" tails.
export const SEPARATOR = " | EN: ";
export const bilingual = (zh, en) => zh; // lean: drop full English duplicate; triggers live inside zh

// Tokens that must survive translation unchanged (as a multiset).
export function protectedTokens(text, skillNames = []) {
	const tokens = [];
	const push = (kind, re) => {
		for (const m of text.matchAll(re)) tokens.push(`${kind}:${m[1] ?? m[0]}`);
	};
	const noCode = text.replace(/```[\s\S]*?```/g, (b) => (tokens.push(`code:${b}`), " "));
	const t = noCode;
	for (const m of t.matchAll(/`([^`\n]+)`/g)) tokens.push(`tick:${m[1]}`);
	const plain = t.replace(/`[^`\n]+`/g, " ");
	for (const m of plain.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) tokens.push(`link:${m[1]}`);
	for (const m of plain.matchAll(/https?:\/\/[^\s)"'”）]+/g)) tokens.push(`url:${m[0]}`);
	for (const m of plain.matchAll(/(?<![\w./-])\/(?:pstack:|skill:)?([a-z][\w-]*)(?![\w/-])/g))
		if (skillNames.length === 0 || skillNames.includes(m[1])) tokens.push(`cmd:${m[1]}`);
	for (const m of plain.matchAll(/\b(Task|Await|AskQuestion|AskUserQuestion|PstackModels)\b/g)) tokens.push(`tool:${m[1]}`);
	for (const m of plain.matchAll(/subagent_type\W+([\w:-]+)/g)) tokens.push(`subagent:${m[1]}`);
	for (const m of plain.matchAll(/(?<![\w])(?:~|\.{1,2})?\/?(?:[\w.-]+\/)+[\w.-]*\.(?:md|mdc|mjs|ts|js|json|jsonl|sh)\b/g)) tokens.push(`path:${m[0]}`);
	return tokens.sort();
}

export function diffTokens(a, b) {
	const count = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
	const ca = count(a), cb = count(b), out = [];
	for (const k of new Set([...ca.keys(), ...cb.keys()])) if ((ca.get(k) ?? 0) !== (cb.get(k) ?? 0)) out.push(`${k} (en ${ca.get(k) ?? 0}, zh ${cb.get(k) ?? 0})`);
	return out;
}
