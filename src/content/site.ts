// ページの構成に関わる文言。ヘッダーとフッターのリンク、ご注文方法の手順。
import { PAYMENTS } from "./shop.ts";

export const NAV_LINKS = [
	{ href: "#about", label: "Concept" },
	{ href: "#menu", label: "Menu" },
	{ href: "#order", label: "Order" },
	{ href: "#access", label: "Access" },
] as const;

export const ORDER_STEPS = [
	{
		num: "I",
		title: "LINEにて承ります",
		desc: "ご希望の商品名と数量をお知らせください。コーヒー豆は、豆か粉か、焙煎度もあわせてお知らせください。LINEをご利用でない方はメールでも承ります。",
	},
	{
		num: "II",
		title: "お支払いのご案内",
		desc: `折り返し、商品代金と送料の合計、およびお支払い先情報（${PAYMENTS.join("・")}）をご連絡します。`,
	},
	{
		num: "III",
		title: "焙煎と発送",
		desc: "ご入金を確認した後の週末に丁寧に焙煎し、新鮮なうちにお届け先へ発送いたします。",
	},
] as const;

/** ご注文方法と注文フォームのボタンの近くに出す、返品・キャンセルの要点。詳しくは /legal */
export const ORDER_NOTICE =
	"商品はご注文後に焙煎するため、焙煎後のキャンセルと、お客様のご都合による返品はお受けしていません。商品の不良・誤りは、到着後7日以内を目安にご連絡ください。";
