import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { parse } from "yaml";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		// .yaml は中身を JSON にしたデータとして import する。node --test では yaml-loader.mjs が同じ変換をする
		{
			name: "yaml",
			transform: (code, id) =>
				id.endsWith(".yaml") ? `export default ${JSON.stringify(parse(code))};` : undefined,
		},
	],
	build: {
		// トップページと特定商取引法に基づく表記の2ページ
		rollupOptions: { input: ["index.html", "legal.html"] },
		// フォントは data: URI に埋め込まずファイルで配信する。CSP の font-src 'self' で読めるようにするため
		assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
	},
});
