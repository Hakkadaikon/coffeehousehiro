// business.yaml の形の検査。形が違えば読み込んだ時点で例外にして、テストとビルドを止める。

const fail = (path: string, want: string): never => {
	throw new Error(`business.yaml の ${path} は、${want}で書いてください`);
};
const section = (v: unknown, path: string) =>
	typeof v === "object" && v !== null && !Array.isArray(v)
		? (v as Record<string, unknown>)
		: fail(path, "「項目名: 値」の並び");
const text = (v: unknown, path: string) =>
	typeof v === "string" && v !== "" ? v : fail(path, "空でない文字列");
const texts = (v: unknown, path: string) =>
	Array.isArray(v) && v.length > 0
		? v.map((x, i) => text(x, `${path} の${i + 1}行目`))
		: fail(path, "空でない文字列か、空でないリスト");

export function parseBusiness(data: unknown) {
	const root = section(data, "全体");
	const shop = section(root.shop, "shop");
	const instagram = section(shop.instagram, "shop.instagram");
	const line = section(shop.line, "shop.line");
	const legal = section(root.legalNotice, "legalNotice");
	return {
		shop: {
			name: text(shop.name, "shop.name"),
			postalCode: text(shop.postalCode, "shop.postalCode"),
			region: text(shop.region, "shop.region"),
			locality: text(shop.locality, "shop.locality"),
			street: text(shop.street, "shop.street"),
			email: text(shop.email, "shop.email"),
			instagram: {
				handle: text(instagram.handle, "shop.instagram.handle"),
				url: text(instagram.url, "shop.instagram.url"),
			},
			line: {
				url: text(line.url, "shop.line.url"),
				accountId: text(line.accountId, "shop.line.accountId"),
			},
			payments: texts(shop.payments, "shop.payments"),
		},
		/** 表の1行。lines の1要素が1段落 */
		legalNotice: Object.entries(legal).map(([label, v]) => ({
			label,
			lines:
				typeof v === "string"
					? [text(v, `legalNotice.${label}`)]
					: texts(v, `legalNotice.${label}`),
		})),
	};
}
