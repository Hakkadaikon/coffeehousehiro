// カートの中身と、端末に保存したカートの復元。
import { GRINDS } from "../content/menu.ts";
import type { Kind } from "./pricing.ts";

export const MAX_QTY = 20;
const SAVE_DAYS = 30;

/** 注文できる商品。メニュー表示と同じ MENU から作る */
export type CatalogItem = {
	id: string;
	kind: Kind;
	label: string;
	prices: (number | null)[];
	sizes: string[];
	roasts: string[];
};

export type CartItem = { id: string; size: number; qty: number; grind: string; roast: string };

export type Saved = { savedAt: number; cart: CartItem[] };

/** 最後の保存から SAVE_DAYS 日を過ぎたら期限切れ。NaN などの不正値も期限切れにする */
export const isExpired = (savedAt: number, now: number) => !(now - savedAt <= SAVE_DAYS * 864e5);

/** 保存データを今のメニューで検証し直す。期限切れ・消えた商品・不正な値は捨てる */
export const restoreCart = (
	saved: Saved | null,
	catalog: CatalogItem[],
	now: number,
): CartItem[] => {
	if (!saved || !Array.isArray(saved.cart) || isExpired(saved.savedAt, now)) return [];
	return saved.cart.filter((c) => {
		const item = catalog.find((i) => i.id === c.id);
		return (
			item !== undefined &&
			Number.isInteger(c.size) &&
			c.size >= 0 &&
			c.size < item.sizes.length &&
			Number.isInteger(c.qty) &&
			c.qty >= 1 &&
			c.qty <= MAX_QTY &&
			(item.kind === "drip" ||
				((GRINDS as readonly string[]).includes(c.grind) && item.roasts.includes(c.roast)))
		);
	});
};
