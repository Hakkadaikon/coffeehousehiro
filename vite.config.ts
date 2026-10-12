import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		// フォントは data: URI に埋め込まずファイルで配信する。CSP の font-src 'self' で読めるようにするため
		assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
	},
});
