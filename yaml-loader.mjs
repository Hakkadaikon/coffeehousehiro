// node --test で .yaml を import できるようにする。ビルドでは vite.config.ts の yaml プラグインが同じ変換をする
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

registerHooks({
	load(url, context, nextLoad) {
		if (!url.endsWith(".yaml")) return nextLoad(url, context);
		const data = parse(readFileSync(fileURLToPath(url), "utf8"));
		return {
			format: "module",
			source: `export default ${JSON.stringify(data)};`,
			shortCircuit: true,
		};
	},
});
