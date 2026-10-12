// Inline the server-rendered pages into dist/*.html so crawlers see the content without JS,
// and fill the price and image placeholders from src/content.
import fs from "node:fs";
import { placeholders, render, renderLegalNotice } from "./dist-ssr/entry-server.js";

const root = '<div id="root"></div>';
const pages = [
	{ file: "dist/index.html", render, fill: placeholders() },
	{
		file: "dist/legal.html",
		render: renderLegalNotice,
		fill: { __SHOP_NAME__: placeholders().__SHOP_NAME__ },
	},
];
for (const { file, render, fill } of pages) {
	let html = fs.readFileSync(file, "utf8");
	if (!html.includes(root)) throw new Error(`${root} not found in ${file}`);
	html = html.replace(root, `<div id="root">${render()}</div>`);
	for (const [key, value] of Object.entries(fill)) {
		if (!html.includes(key)) throw new Error(`${key} not found in ${file}`);
		// 値は HTML の属性と JSON の文字列にそのまま入るので、エスケープが要る文字は通さない
		if (/["<>&\\]/.test(value)) throw new Error(`${key} must not contain " < > & \\: ${value}`);
		html = html.replaceAll(key, value);
	}
	const leftover = html.match(/__[A-Z_]+__/);
	if (leftover) throw new Error(`${leftover[0]} is not filled in ${file}`);
	fs.writeFileSync(file, html);
}
fs.rmSync("dist-ssr", { recursive: true });
