// カートの中身と、その操作。
import type { Kind, Line } from "./pricing.ts";

export const MAX_QTY = 20;

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

/** 商品で選べない焙煎度なら、その商品の最初の焙煎度にする */
export const roastFor = (item: CatalogItem, roast: string) =>
	item.roasts.includes(roast) ? roast : item.roasts[0];

/** 選んだ内容からカートの1行を作る。ドリップバッグは挽き方・焙煎度を持たない */
export const newCartItem = (
	item: CatalogItem,
	pick: { size: number; qty: number; grind: string; roast: string },
): CartItem =>
	item.kind === "bean"
		? {
				id: item.id,
				size: pick.size,
				qty: pick.qty,
				grind: pick.grind,
				roast: roastFor(item, pick.roast),
			}
		: { id: item.id, size: pick.size, qty: pick.qty, grind: "", roast: "" };

/** 金額計算と注文メッセージに使う行。id はカートの行がどの商品かを表す */
export type CartLine = Line & { id: string };

/** カートを金額計算と注文メッセージに使う行にする。メニューから消えた商品は捨てる */
export const toLines = (cart: CartItem[], catalog: CatalogItem[]): CartLine[] =>
	cart.flatMap((c) => {
		const item = catalog.find((i) => i.id === c.id);
		if (!item) return [];
		const size = item.sizes[c.size];
		const label =
			item.kind === "bean" ? `${item.label}　${size}・${c.grind}・${c.roast}` : item.label;
		return [{ kind: item.kind, yen: item.prices[c.size], qty: c.qty, label, id: c.id }];
	});

export type CartAction =
	| { type: "add"; item: CartItem }
	| { type: "setQty"; index: number; qty: number }
	| { type: "remove"; index: number }
	| { type: "replace"; cart: CartItem[] };

/** カートの状態遷移。同じ商品を別の焙煎度で複数行入れられるので、行は位置で指す */
export const cartReducer = (cart: readonly CartItem[], action: CartAction): CartItem[] => {
	switch (action.type) {
		case "add":
			return [...cart, action.item];
		case "setQty":
			return cart.map((c, i) => (i === action.index ? { ...c, qty: action.qty } : c));
		case "remove":
			return cart.filter((_, i) => i !== action.index);
		case "replace":
			return action.cart;
	}
};
