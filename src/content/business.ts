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

/** 緯度・経度。数値で、範囲内であること */
const degree = (v: unknown, path: string, max: number) =>
	typeof v === "number" && Math.abs(v) <= max ? v : fail(path, `-${max}〜${max}の数値`);

/** 段落は文字列か「strong: 文」(強調する段落) */
const paragraph = (v: unknown, path: string) => {
	if (typeof v === "string") return { text: text(v, path), strong: false };
	const keys = typeof v === "object" && v !== null ? Object.keys(v) : [];
	if (keys.length === 1 && keys[0] === "strong") {
		return { text: text((v as { strong: unknown }).strong, path), strong: true };
	}
	return fail(path, "文字列か「strong: 文」");
};

/** 「項目名: 値」の並びを表の行にする。lines の1要素が1段落で、「strong: 文」と書いた段落は強調する */
const rows = (v: unknown, path: string) =>
	Object.entries(section(v, path)).map(([label, value]) => {
		const rowPath = `${path}.${label}`;
		const items: unknown[] =
			typeof value === "string"
				? [value]
				: Array.isArray(value) && value.length > 0
					? value
					: fail(rowPath, "空でない文字列か、空でないリスト");
		return { label, lines: items.map((item, i) => paragraph(item, `${rowPath} の${i + 1}行目`)) };
	});

export function parseBusiness(data: unknown) {
	const root = section(data, "全体");
	const shop = section(root.shop, "shop");
	const instagram = section(shop.instagram, "shop.instagram");
	const line = section(shop.line, "shop.line");
	return {
		shop: {
			name: text(shop.name, "shop.name"),
			postalCode: text(shop.postalCode, "shop.postalCode"),
			region: text(shop.region, "shop.region"),
			locality: text(shop.locality, "shop.locality"),
			street: text(shop.street, "shop.street"),
			latitude: degree(shop.latitude, "shop.latitude", 90),
			longitude: degree(shop.longitude, "shop.longitude", 180),
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
		legalNotice: rows(root.legalNotice, "legalNotice"),
		privacyPolicy: rows(root.privacyPolicy, "privacyPolicy"),
	};
}
