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
