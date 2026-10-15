// Builds a temporary copy of the upstream pstack checkout with the Chinese body translations
// (i18n/zh/bodies/<path>) laid over the English files, so scripts/sync.mjs transforms them
// exactly like upstream text (command prefix, paths, tool names).
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { sha256 } from "./zh-lib.mjs";

export function overlayZh(src, root) {
	const bodies = path.join(root, "i18n/zh/bodies");
	if (!fs.existsSync(bodies)) return src;
	const hashes = JSON.parse(fs.readFileSync(path.join(root, "i18n/zh/bodies.json"), "utf-8"));
	const out = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-zh-src-"));
	fs.cpSync(src, out, { recursive: true, filter: (p) => !p.includes(`${path.sep}node_modules`) && !p.includes(`${path.sep}.git${path.sep}`) && !p.endsWith(`${path.sep}.git`) });
	const stale = [];
	for (const rel of Object.keys(hashes)) {
		const en = path.join(src, rel), zh = path.join(bodies, rel);
		if (!fs.existsSync(en) || !fs.existsSync(zh)) continue;
		if (hashes[rel] !== sha256(fs.readFileSync(en, "utf-8"))) stale.push(rel);
		fs.copyFileSync(zh, path.join(out, rel));
	}
	if (stale.length) console.log(`zh: STALE body translations (upstream changed, Chinese still applied): ${stale.join(", ")}`);
	return out;
}
