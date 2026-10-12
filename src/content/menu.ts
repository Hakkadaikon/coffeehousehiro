// メニューの唯一の元データ。サイトのメニュー表示・注文フォーム・SEO の価格帯はすべてここから作る。
import type { CatalogItem } from "../order/cart.ts";
import type { Price } from "../order/pricing.ts";

export const MENU_START_DATE = "2026年10月1日";
export const GRINDS = ["豆", "粉"] as const;
export const ROASTS = ["浅煎り", "中煎り", "中深煎り", "おまかせ"] as const;
export type Grind = (typeof GRINDS)[number];
export type Roast = (typeof ROASTS)[number];
/** 注文フォームで最初に選ばれている焙煎度 */
export const DEFAULT_ROAST: Roast = "おまかせ";

export type MenuItem = {
	name: string;
	sub: string;
	/** サイズごとの価格。null は時価・要相談、{ min, max } は価格に幅がある */
	prices: Price[];
	/** 粉にすると価格が変わるときだけ指定する、粉のときの価格 */
	groundPrices?: number[];
	/** カテゴリと違うサイズのときだけ指定する */
	sizes?: string[];
	/** 選べる焙煎度を絞るときだけ指定する */
	roasts?: string[];
};

export type MenuCategory = {
	title: string;
	kind: "bean" | "drip";
	sizes: string[];
	/** なくなり次第終了の限定品 */
	limited?: boolean;
	items: MenuItem[];
};

export const MENU: MenuCategory[] = [
	{
		title: "シングル",
		kind: "bean",
		sizes: ["100g", "200g"],
		items: [
			{ name: "タンザニア", sub: "キリマンジャロ AA", prices: [450, 850] },
			{ name: "エチオピア", sub: "モカ、イルガチェフェ G1", prices: [500, 1000] },
			{ name: "エチオピア", sub: "モカ、ゲラ農園 G1", prices: [450, 850] },
			{ name: "グァテマラ", sub: "", prices: [450, 850] },
			{ name: "ブラジル", sub: "", prices: [450, 850] },
			{ name: "インドネシア", sub: "マンデリン", prices: [450, 850] },
			{ name: "ケニア", sub: "", prices: [500, 1000] },
			{ name: "コロンビア", sub: "", prices: [450, 850] },
			{ name: "ブルンジ", sub: "", prices: [450, 850] },
		],
	},
	{
		title: "ブレンド",
		kind: "bean",
		sizes: ["100g", "200g"],
		items: [
			{ name: "タンザニア", sub: "キリマンジャロ", prices: [450, 850] },
			{ name: "エチオピア", sub: "モカ", prices: [450, 850] },
			{ name: "ブラジル", sub: "", prices: [450, 850] },
			{ name: "インドネシア", sub: "", prices: [450, 850] },
			{ name: "おまかせ", sub: "", prices: [450, 850] },
		],
	},
	{
		title: "スペシャル",
		kind: "bean",
		sizes: ["100g", "200g"],
		limited: true,
		items: [
			{ name: "エクアドル", sub: "ガラパゴス諸島", prices: [800, 1600] },
			{
				name: "ネパール",
				sub: "ヒマラヤンスペシャル、アナエロビックナチュラル",
				prices: [850, 1700],
			},
			{
				name: "パナマ",
				sub: "ゲイシャ、エル・パロマール農園",
				prices: [500, 2200],
				groundPrices: [550, 2400],
				sizes: ["20g", "100g"],
				roasts: ["浅煎り"],
			},
		],
	},
	{
		title: "ドリップバッグ",
		kind: "drip",
		sizes: ["1セット"],
		items: [
			{ name: "シングル 5枚セット", sub: "上記シングルから", prices: [570] },
			{ name: "スペシャル 5枚セット", sub: "", prices: [{ min: 1000, max: 1500 }] },
			{ name: "おまかせ 5枚セット", sub: "", prices: [570] },
		],
	},
];

/** カテゴリ見出しの下に出す注記 */
export const categoryNote = (c: MenuCategory) =>
	c.limited
		? "なくなり次第終了"
		: c.kind === "bean"
			? `${GRINDS.join("・")}　／　${ROASTS.join("・")}`
			: "";

/** カテゴリ見出しの右に出す単位 */
export const categoryUnit = (c: MenuCategory) =>
	c.kind === "drip" ? "0.5アイテム分" : c.sizes.join(" / ");

/** 品目の補足行。カテゴリと違うサイズや焙煎度の制限もここに出す */
export const itemSub = (item: MenuItem) =>
	[item.sub, item.sizes?.join(" / "), item.roasts?.length === 1 ? `${item.roasts[0]}のみ` : ""]
		.filter(Boolean)
		.join("　");

export const catalog = (): CatalogItem[] =>
	MENU.flatMap((c) =>
		c.items.map((item) => ({
			id: `${c.title}/${item.name}/${item.sub}`,
			kind: c.kind,
			label: `${c.title} ${item.name}${item.sub ? `（${item.sub}）` : ""}`,
			prices: item.prices,
			groundPrices: item.groundPrices,
			sizes: item.sizes ?? c.sizes,
			roasts: c.kind === "bean" ? (item.roasts ?? [...ROASTS]) : [],
		})),
	);

/** SEO 用の価格帯 [最安値, 最高値]。粉の価格も含める */
export const priceRange = () => {
	const all = MENU.flatMap((c) =>
		c.items.flatMap((i) => [...i.prices, ...(i.groundPrices ?? [])]),
	).flatMap((p) => (p === null ? [] : typeof p === "number" ? [p] : [p.min, p.max]));
	return [Math.min(...all), Math.max(...all)] as const;
};

/** 注文フォームで選べる商品 */
export const CATALOG = catalog();

/** 注文フォームの商品選択用。カテゴリ名ごとに、メニューの順でまとめる */
export const groupCatalog = (items: CatalogItem[]): [string, CatalogItem[]][] =>
	[...new Set(items.map((i) => i.id.split("/")[0]))].map((g) => [
		g,
		items.filter((i) => i.id.startsWith(`${g}/`)),
	]);

export const CATALOG_GROUPS = groupCatalog(CATALOG);
