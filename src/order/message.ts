// LINE でお店に送る注文メッセージを組み立てる。
import { MENU_START_DATE } from "../content/menu.ts";
import type { Form } from "./form.ts";
import { itemsTotal, type Line, shippingFee, subtotal, total, yen } from "./pricing.ts";

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
