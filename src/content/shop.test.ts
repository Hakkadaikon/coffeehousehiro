import assert from "node:assert/strict";
import { test } from "node:test";
import { SHIPPING_YEN, yen } from "../order/pricing.ts";
import { parseBusiness } from "./business.ts";
import data from "./business.yaml";
import {
	ADDRESS,
	EMAIL,
	LEGAL_NOTICE,
	LINE_CHAT_URL,
	PAYMENTS,
	POSTAL,
	SHOP_NAME,
} from "./shop.ts";

test("LINEのトーク画面URLには本文や個人情報を入れない", () => {
	assert.equal(LINE_CHAT_URL, "https://line.me/R/oaMessage/%40992mqixg/");
});

test("住所は都道府県・市区町村・それ以降を続けて表示する", () => {
	assert.equal(ADDRESS, "岡山県倉敷市福田町福田2370-6");
});

test("business.yaml の項目が欠けたり、文字列でなかったりしたら読み込みで止める", () => {
	const ok = structuredClone(data) as { shop: Record<string, unknown>; legalNotice: unknown };
	assert.doesNotThrow(() => parseBusiness(ok));
	const broken = [
		(d: typeof ok) => delete d.shop.email,
		(d: typeof ok) => (d.shop.postalCode = 7128046),
		(d: typeof ok) => (d.shop.payments = []),
		(d: typeof ok) => delete d.shop.line,
		(d: typeof ok) => (d.legalNotice = { 電話番号: "" }),
		(d: typeof ok) => (d.legalNotice = { 電話番号: [] }),
		(d: typeof ok) => (d.legalNotice = ["x"]),
	];
	for (const breakIt of broken) {
		const d = structuredClone(ok);
		breakIt(d);
		assert.throws(() => parseBusiness(d), String(breakIt));
	}
});

const row = (label: string) => {
	const r = LEGAL_NOTICE.find((r) => r.label === label);
	assert.ok(r, label);
	return r.lines.join("\n");
};

test("特定商取引法に基づく表記は、法律で表示が必要な項目をこの順にすべて載せる", () => {
	assert.deepEqual(
		LEGAL_NOTICE.map((r) => r.label),
		[
			"販売事業者",
			"運営責任者",
			"所在地",
			"電話番号",
			"メールアドレス",
			"販売価格",
			"商品代金以外の必要料金",
			"支払方法",
			"支払時期",
			"引渡時期",
			"返品・交換",
		],
	);
});

test("特定商取引法に基づく表記の店名・所在地・連絡先・送料・支払方法は、ページ本文と同じ", () => {
	assert.equal(row("販売事業者"), SHOP_NAME);
	assert.equal(row("所在地"), `〒${POSTAL}\n${ADDRESS}`);
	assert.equal(row("メールアドレス"), EMAIL);
	assert.ok(row("商品代金以外の必要料金").includes(yen(SHIPPING_YEN)));
	assert.equal(row("支払方法"), PAYMENTS.join("・"));
});
