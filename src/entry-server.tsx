import { renderToString } from "react-dom/server";
import App from "./App.tsx";
import LegalNotice from "./LegalNotice.tsx";

export { placeholders } from "./placeholders.ts";

export const render = () => renderToString(<App />);
export const renderLegalNotice = () => renderToString(<LegalNotice />);
