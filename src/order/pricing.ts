// 金額の計算と表示。送料は「2アイテム分ごとに一律」で数える。

export const SHIPPING_YEN = 270;

/** 豆1袋は1アイテム分、ドリップバッグ1セットは0.5アイテム分 */
const UNITS = { bean: 1, drip: 0.5 } as const;
export type Kind = keyof typeof UNITS;

/** 価格。null は時価、{ min, max } は価格に幅がある。どちらも金額はお店が案内する */
export type Price = number | null | { min: number; max: number };

/** 注文の1行。yen が数値でない商品は、合計に含めず価格をお店と相談する */
export type Line = { kind: Kind; yen: Price; qty: number; label?: string };

export const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

/** 「2アイテム分ごと」だけでは1アイテムの送料が分かりにくいので、例を添えて表示する */
export const SHIPPING_EXAMPLE = `1〜2アイテム分で${yen(SHIPPING_YEN)}、3〜4アイテム分で${yen(SHIPPING_YEN * 2)}`;

export const formatPrice = (p: Price) =>
	p === null ? "時価・要相談" : typeof p === "number" ? yen(p) : `${yen(p.min)}〜${yen(p.max)}`;

export const formatPrices = (prices: Price[]) => prices.map(formatPrice).join(" / ");

export const subtotal = (l: Line) => (typeof l.yen === "number" ? l.yen * l.qty : null);

const units = (lines: Line[]) => lines.reduce((sum, l) => sum + UNITS[l.kind] * l.qty, 0);

export const shippingFee = (lines: Line[]) => Math.ceil(units(lines) / 2) * SHIPPING_YEN;

/** 価格が決まっていない商品(時価・価格に幅がある)を除いた商品代金の合計 */
export const itemsTotal = (lines: Line[]) => lines.reduce((sum, l) => sum + (subtotal(l) ?? 0), 0);

export const total = (lines: Line[]) => itemsTotal(lines) + shippingFee(lines);
