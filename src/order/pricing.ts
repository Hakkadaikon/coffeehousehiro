// 金額の計算と表示。送料は「2アイテム分ごとに一律」で数える。

export const SHIPPING_YEN = 270;

/** 豆1袋は1アイテム分、ドリップバッグ1セットは0.5アイテム分 */
const UNITS = { bean: 1, drip: 0.5 } as const;
export type Kind = keyof typeof UNITS;

/** 注文の1行。yen が null の商品は時価(価格はお店と相談) */
export type Line = { kind: Kind; yen: number | null; qty: number; label?: string };

export const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export const formatPrices = (prices: (number | null)[]) =>
	prices.map((p) => (p === null ? "時価・要相談" : yen(p))).join(" / ");

export const subtotal = (l: Line) => (l.yen === null ? null : l.yen * l.qty);

const units = (lines: Line[]) => lines.reduce((sum, l) => sum + UNITS[l.kind] * l.qty, 0);

export const shippingFee = (lines: Line[]) => Math.ceil(units(lines) / 2) * SHIPPING_YEN;

/** 時価の商品を除いた商品代金の合計 */
export const itemsTotal = (lines: Line[]) => lines.reduce((sum, l) => sum + (subtotal(l) ?? 0), 0);

export const total = (lines: Line[]) => itemsTotal(lines) + shippingFee(lines);
