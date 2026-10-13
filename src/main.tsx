import { inject } from "@vercel/analytics";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

hydrateRoot(
	// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
	document.getElementById("root")!,
	<StrictMode>
		<App />
	</StrictMode>,
);

// Vercel Web Analytics。訪問数とページの表示回数を数える。cookie は使わず、フォームの入力内容も送らない
inject({ mode: import.meta.env.DEV ? "development" : "production" });

// PostHog。どのリンク・ボタンが押されたか、どこまで読まれたかを見る。送り先は自分のドメインの /ingest(vercel.json で PostHog へ中継)。
// cookie もブラウザへの保存も使わず、画面の録画はしない。IP はプロジェクト設定「Discard client IP data」で捨てる。
// 大きいので、ページの表示を待たせないよう別に読み込む
if (!import.meta.env.DEV)
	import("posthog-js/dist/module.no-external").then(({ default: posthog }) =>
		posthog.init("phc_AdL6iDeUccJYMWTYEtr367bHGKC3innK8wnHSw9J26Sk", {
			api_host: "/ingest",
			ui_host: "https://us.posthog.com",
			cookieless_mode: "always",
			disable_session_recording: true,
			// クリックを記録するのはリンク・ボタンと、フォームを開く見出し(summary)だけ。入力欄やメッセージのプレビューは対象にしない
			autocapture: { css_selector_allowlist: ["a", "button", "summary"] },
		}),
	);
