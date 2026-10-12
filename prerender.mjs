// Inline the server-rendered App into dist/index.html so crawlers see the content without JS,
// and fill the price and image placeholders from src/content.
import fs from "node:fs";
import { placeholders, render } from "./dist-ssr/entry-server.js";

const file = "dist/index.html";
let html = fs.readFileSync(file, "utf8");
const root = '<div id="root"></div>';
if (!html.includes(root)) throw new Error(`${root} not found in ${file}`);
html = html.replace(root, `<div id="root">${render()}</div>`);
for (const [key, value] of Object.entries(placeholders())) {
	if (!html.includes(key)) throw new Error(`${key} not found in ${file}`);
	html = html.replaceAll(key, value);
}
const leftover = html.match(/__[A-Z_]+__/);
if (leftover) throw new Error(`${leftover[0]} is not filled in ${file}`);
fs.writeFileSync(file, html);
fs.rmSync("dist-ssr", { recursive: true });
