// index.html の目印(__X__)に入れる値。ビルド時に prerender.mjs が埋める。
// 店舗情報は business.yaml、価格は menu.ts、画像は photos.ts の値を使う。
import { MENU, priceRange } from "./content/menu.ts";
import { CONCEPT, HERO } from "./content/photos.ts";
import {
	ADDRESS_PARTS,
	EMAIL,
	GEO,
	INSTAGRAM_URL,
	LINE_URL,
	PAYMENTS,
	POSTAL,
	SHOP_NAME,
	SITE_URL,
} from "./content/shop.ts";
import { yen } from "./order/pricing.ts";

/** JSON-LD のメニュー(Menu → MenuSection → MenuItem → Offer)。時価の品目は価格を載せず、幅のある価格は最小〜最大で載せる */
const menuJsonLd = () => ({
	"@type": "Menu",
	name: "コーヒー豆・ドリップバッグ",
	hasMenuSection: MENU.map((c) => ({
		"@type": "MenuSection",
		name: c.title,
		hasMenuItem: c.items.map((item) => {
			const sizes = item.sizes ?? c.sizes;
			const offers = item.prices.flatMap<object>((price, i) =>
				price === null
					? []
					: typeof price === "number"
						? [{ "@type": "Offer", name: sizes[i], price, priceCurrency: "JPY" }]
						: [
								{
									"@type": "Offer",
									name: sizes[i],
									priceSpecification: {
										"@type": "PriceSpecification",
										minPrice: price.min,
										maxPrice: price.max,
										priceCurrency: "JPY",
									},
								},
							],
			);
			return {
				"@type": "MenuItem",
				name: item.sub ? `${item.name}（${item.sub}）` : item.name,
				...(offers.length > 0 && { offers }),
			};
		}),
	})),
});

/** script タグの中に置く JSON。「<」を \u003c にして、</script> で閉じられないようにする */
const json = (value: unknown) => JSON.stringify(value).replaceAll("<", "\\u003c");

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
		__MENU_JSON__: json(menuJsonLd()),
		__GEO_JSON__: json({ "@type": "GeoCoordinates", ...GEO }),
		__HERO_IMAGE_URL__: url(HERO.src),
		__CONCEPT_IMAGE_URL__: url(CONCEPT.src),
	};
};
