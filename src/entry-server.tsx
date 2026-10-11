import { renderToString } from "react-dom/server";
import App from "./App.tsx";
import { priceRange } from "./menu.ts";
import { yen } from "./order.ts";

export const render = () => renderToString(<App />);

/** index.html の目印を menu.ts の値で埋める */
export const placeholders = () => {
	const [min, max] = priceRange();
	return { __PRICE_MIN__: yen(min), __PRICE_RANGE__: `${yen(min)}〜${yen(max)}` };
};
