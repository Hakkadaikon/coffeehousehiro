// 端末に保存した注文フォームの下書き。保存の形と、読み込んだ値の検証。
import { GRINDS } from "../content/menu.ts";
import { type CartItem, type CatalogItem, MAX_QTY } from "./cart.ts";
import type { Form } from "./form.ts";

/** 最後の保存からこの日数を過ぎた下書きは使わずに消す */
export const SAVE_DAYS = 30;

/** 保存する下書き。電話番号は保存しない */
export type Draft = {
	savedAt: number;
	cart: CartItem[];
	form: Omit<Form, "phone">;
};

/** 最後の保存から SAVE_DAYS 日を過ぎたら期限切れ。NaN などの不正値も期限切れにする */
export const isExpired = (savedAt: number, now: number) => !(now - savedAt <= SAVE_DAYS * 864e5);

/** 保存したカートを今のメニューで検証し直す。期限切れ・消えた商品・不正な値は捨てる */
export const restoreCart = (
	saved: Pick<Draft, "savedAt" | "cart"> | null,
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

/** 保存したフォームを戻す。文字列でない値は空にし、電話番号は保存しないので戻さない */
export const restoreForm = (saved: Partial<Record<keyof Form, unknown>> | undefined): Form => {
	const str = (v: unknown) => (typeof v === "string" ? v : "");
	return {
		name: str(saved?.name),
		postal: str(saved?.postal),
		address: str(saved?.address),
		phone: "",
		payment: str(saved?.payment),
	};
};
