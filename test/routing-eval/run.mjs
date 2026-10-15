#!/usr/bin/env node
// Routing eval: simulates skill selection with an LLM router (Grok Build headless).
// The router sees ONLY "name: description" for every skill, the way an agent's skill list looks,
// plus a batch of user prompts, and picks one skill (or "none") per prompt.
// This is a simulation, not real Claude Code / pi routing.
// Usage: node test/routing-eval/run.mjs [--desc en|zh|both] [--batch 30] [--jobs 3] [--only <id,...>]
import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDescriptions, readDescription } from "../../scripts/zh-lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const versions = arg("desc", "both") === "both" ? ["en", "zh"] : [arg("desc")];
const BATCH = Number(arg("batch", 30)), JOBS = Number(arg("jobs", 3));
const only = arg("only")?.split(",");
// prompts.json = basic set (3 per skill); prompts-hard.json = confusable near-neighbors + "none" cases.
const prompts = fs.readdirSync(here).filter((f) => /^prompts.*\.json$/.test(f)).sort()
	.flatMap((f) => JSON.parse(fs.readFileSync(path.join(here, f), "utf-8")).map((p) => ({ set: "basic", ...p })))
	.filter((p) => !only || only.includes(p.id));
const prefix = fs.readFileSync(path.join(root, "scripts/sync.mjs"), "utf-8").match(/COMMAND_PREFIX = "([^"]+)"/)[1];

function skillList(version) {
	const db = loadDescriptions(root);
	return Object.keys(db).sort().map((name) => {
		const desc = version === "zh"
			? readDescription(fs.readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf-8")).value
			: db[name].en.replace(/(?<=^|[\s`("'])\/([a-z][\w-]*)(?![\w/-])/g, (m, n) => (db[n] ? `${prefix}${n}` : m));
		return `- ${name}: ${desc}`;
	}).join("\n");
}

const schema = JSON.stringify({ type: "object", properties: { answers: { type: "array", items: { type: "object", properties: { id: { type: "string" }, skill: { type: "string" } }, required: ["id", "skill"] } } }, required: ["answers"] });

function route(version, batch) {
	const prompt = `You are the skill router of a coding agent. Available skills (name: description):\n\n${skillList(version)}\n\nFor each user message below, choose the ONE skill the agent should load, or "none" if no skill fits. Judge only from the descriptions. Do not use any tools. Answer with JSON {"answers":[{"id","skill"}]} covering every id.\n\n${batch.map((p) => `[${p.id}] ${p.prompt}`).join("\n")}`;
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "route-"));
	fs.writeFileSync(path.join(dir, "prompt.md"), prompt);
	return new Promise((resolve) => {
		execFile("grok", ["--prompt-file", "prompt.md", "--output-format", "json", "--max-turns", "3", "--json-schema", schema, "--disable-web-search"], { cwd: dir, maxBuffer: 1 << 26 }, (err, stdout) => {
			let out = { answers: [] }, cost = 0;
			try { const j = JSON.parse(stdout); cost = j.total_cost_usd ?? 0; out = JSON.parse(j.text.slice(j.text.indexOf("{"), j.text.lastIndexOf("}") + 1)); } catch { console.error(`batch failed (${version}): ${err?.message ?? stdout.slice(0, 200)}`); }
			fs.rmSync(dir, { recursive: true, force: true });
			resolve({ answers: out.answers, cost });
		});
	});
}

async function pool(tasks, n) {
	const res = []; let i = 0;
	await Promise.all(Array.from({ length: n }, async () => { while (i < tasks.length) { const k = i++; res[k] = await tasks[k](); } }));
	return res;
}

const results = { prefix, cost: 0, runs: {} };
for (const v of versions) {
	const batches = [];
	for (let i = 0; i < prompts.length; i += BATCH) batches.push(prompts.slice(i, i + BATCH));
	const outs = await pool(batches.map((b) => () => route(v, b)), JOBS);
	const picked = Object.fromEntries(outs.flatMap((o) => o.answers.map((a) => [a.id, a.skill.replace(/^\/?(?:pstack:|skill:)?/, "")])));
	results.cost += outs.reduce((s, o) => s + o.cost, 0);
	results.runs[v] = prompts.map((p) => ({ id: p.id, set: p.set, lang: p.lang, hinted: p.hinted, expected: p.skill, got: picked[p.id] ?? "(no answer)" }));
}

console.log(`router: Grok Build headless, command prefix ${prefix}, ${prompts.length} prompts`);
console.log("| descriptions | set | zh prompts | zh unhinted | en prompts |\n|---|---|---|---|---|");
for (const [v, rows] of Object.entries(results.runs)) for (const set of [...new Set(rows.map((r) => r.set))]) {
	const acc = (f) => { const r = rows.filter((x) => x.set === set && f(x)); return `${r.filter((x) => x.got === x.expected).length}/${r.length}`; };
	console.log(`| ${v} | ${set} | ${acc((r) => r.lang === "zh")} | ${acc((r) => r.lang === "zh" && !r.hinted)} | ${acc((r) => r.lang === "en")} |`);
}
for (const [v, rows] of Object.entries(results.runs)) for (const r of rows) if (r.got !== r.expected) console.log(`miss [${v}] ${r.id}: expected ${r.expected}, got ${r.got}`);
console.log(`cost: $${results.cost.toFixed(4)}`);
fs.writeFileSync(path.join(here, `results-${new Date().toISOString().slice(0, 19).replace(/:/g, "")}.json`), JSON.stringify(results, null, 1));
