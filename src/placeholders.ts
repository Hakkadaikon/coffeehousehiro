// index.html の目印(__X__)に入れる値。ビルド時に prerender.mjs が埋める。
// 店舗情報は business.yaml、価格は menu.ts、画像は photos.ts の値を使う。
import { priceRange } from "./content/menu.ts";
import { CONCEPT, HERO } from "./content/photos.ts";
import {
	ADDRESS_PARTS,
	EMAIL,
	INSTAGRAM_URL,
	LINE_URL,
	PAYMENTS,
	POSTAL,
	SHOP_NAME,
	SITE_URL,
} from "./content/shop.ts";
import { yen } from "./order/pricing.ts";

export const placeholders = () => {
	const [min, max] = priceRange();
	const url = (src: string) => new URL(src, SITE_URL).href;
	return {
		__SHOP_NAME__: SHOP_NAME,
		__POSTAL__: POSTAL,
		__REGION__: ADDRESS_PARTS.region,
		__LOCALITY__: ADDRESS_PARTS.locality,
		__STREET__: ADDRESS_PARTS.street,
		__EMAIL__: EMAIL,
		__INSTAGRAM_URL__: INSTAGRAM_URL,
		__LINE_URL__: LINE_URL,
		__PAYMENTS__: PAYMENTS.join(", "),
		__PRICE_MIN__: yen(min),
		__PRICE_RANGE__: `${yen(min)}〜${yen(max)}`,
		__HERO_IMAGE_URL__: url(HERO.src),
		__CONCEPT_IMAGE_URL__: url(CONCEPT.src),
	};
};
