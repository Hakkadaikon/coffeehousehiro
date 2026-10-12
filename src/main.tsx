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
