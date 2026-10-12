import { GRINDS, MENU_START_DATE } from "./menu.ts";

export const SHIPPING_YEN = 270;
export const LINE_OA_ID = "992mqixg";
export const PAYMENTS = ["PayPay", "楽天ペイ", "銀行振込"] as const;
export const MAX_QTY = 20;
const SAVE_DAYS = 30;

/** 豆1袋は1アイテム分、ドリップバッグ1セットは0.5アイテム分 */
const UNITS = { bean: 1, drip: 0.5 } as const;
type Kind = keyof typeof UNITS;

export type Line = { kind: Kind; yen: number | null; qty: number; label?: string };

export const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export const formatPrices = (prices: (number | null)[]) =>
	prices.map((p) => (p === null ? "時価・要相談" : yen(p))).join(" / ");

export const subtotal = (l: Line) => (l.yen === null ? null : l.yen * l.qty);

const units = (lines: Line[]) => lines.reduce((sum, l) => sum + UNITS[l.kind] * l.qty, 0);

export const shippingFee = (lines: Line[]) => Math.ceil(units(lines) / 2) * SHIPPING_YEN;

const itemsTotal = (lines: Line[]) => lines.reduce((sum, l) => sum + (subtotal(l) ?? 0), 0);

export const total = (lines: Line[]) => itemsTotal(lines) + shippingFee(lines);

/** 1行の入力欄用。全角を半角に寄せ、制御文字・改行・方向制御文字を消して上限で切る */
export const cleanLine = (s: string, max: number) =>
	s
		.normalize("NFKC")
		// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除くための正規表現
		.replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
		.trim()
		.slice(0, max);

/** 郵便番号・電話番号用。長音記号やマイナスなど日本語入力で混じるハイフンを "-" にそろえ、〒を外す */
export const cleanDigits = (s: string, max: number) =>
	cleanLine(s.replace(/[〒\s]/g, "").replace(/[ー－−‐‑–—―]/g, "-"), max);

export const LIMITS = { name: 50, postal: 10, address: 200, phone: 15 } as const;

export type Form = {
	name: string;
	postal: string;
	address: string;
	phone: string;
	payment: string;
};

export const validate = (f: Form) => {
	const errors: (keyof Form)[] = [];
	if (!f.name) errors.push("name");
	if (!/^\d{3}-?\d{4}$/.test(f.postal)) errors.push("postal");
	if (!f.address) errors.push("address");
	if (f.phone && !/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(f.phone)) errors.push("phone");
	if (!(PAYMENTS as readonly string[]).includes(f.payment)) errors.push("payment");
	return errors;
};

/** お客さんがお店に送る依頼文。金額はお店が確定させる前提の目安として書く */
export const buildMessage = (lines: Line[], f: Form) => {
	const hasQuote = lines.some((l) => l.yen === null);
	return [
		"コーヒーhouseヒロ様",
		"以下の内容で注文をお願いします。",
		"",
		"【注文内容】",
		...lines.map((l) => {
			const s = subtotal(l);
			return `・${l.label} ×${l.qty}　${s === null ? "価格はご相談" : yen(s)}`;
		}),
		`小計：${yen(itemsTotal(lines))}`,
		`送料：${yen(shippingFee(lines))}`,
		`合計：${yen(total(lines))}${hasQuote ? "（価格をご相談する商品を除く）" : ""}`,
		"",
		"【お届け先】",
		`お名前：${f.name}`,
		`ご住所：〒${f.postal} ${f.address}`,
		...(f.phone ? [`電話番号：${f.phone}`] : []),
		"",
		"【お支払い方法】",
		f.payment,
		"",
		`※金額は、${MENU_START_DATE}改定のメニューをもとにサイトで計算した目安です。在庫と送料をご確認のうえ、確定した金額を教えてください。`,
		"よろしくお願いいたします。",
	].join("\n");
};

/** 本文なしで公式アカウントのトーク画面を開く。住所や氏名を URL に載せないため、本文はコピーして貼ってもらう */
export const LINE_CHAT_URL = `https://line.me/R/oaMessage/%40${LINE_OA_ID}/`;

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
