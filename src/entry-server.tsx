import { renderToString } from "react-dom/server";
import App from "./App.tsx";
import { priceRange } from "./content/menu.ts";
import { CONCEPT, HERO } from "./content/photos.ts";
import { SITE_URL } from "./content/shop.ts";
import { yen } from "./order/pricing.ts";

export const render = () => renderToString(<App />);

/** index.html の目印を menu.ts・photos.ts の値で埋める */
export const placeholders = () => {
	const [min, max] = priceRange();
	const url = (src: string) => new URL(src, SITE_URL).href;
	return {
		__PRICE_MIN__: yen(min),
		__PRICE_RANGE__: `${yen(min)}〜${yen(max)}`,
		__HERO_IMAGE_URL__: url(HERO.src),
		__CONCEPT_IMAGE_URL__: url(CONCEPT.src),
	};
};
