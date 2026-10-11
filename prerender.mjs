// Inline the server-rendered App into dist/index.html so crawlers see the content without JS.
import fs from "node:fs";
import { render } from "./dist-ssr/entry-server.js";

const file = "dist/index.html";
const html = fs.readFileSync(file, "utf8");
const placeholder = '<div id="root"></div>';
if (!html.includes(placeholder)) throw new Error(`${placeholder} not found in ${file}`);
fs.writeFileSync(file, html.replace(placeholder, `<div id="root">${render()}</div>`));
fs.rmSync("dist-ssr", { recursive: true });
