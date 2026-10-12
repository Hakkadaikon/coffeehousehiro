import assert from "node:assert/strict";
import { test } from "node:test";
import { SAVE_DAYS } from "../order/draft.ts";
import { PAYMENTS } from "./shop.ts";
import { NAV_LINKS, ORDER_NOTICE, ORDER_STEPS, PRIVACY_NOTICE, SITE_DATA_POLICY } from "./site.ts";

test("ページ内リンクは各セクションのidを指す", () => {
	assert.deepEqual(
		NAV_LINKS.map((l) => l.href),
		["#about", "#menu", "#order", "#access"],
	);
});

test("ご注文方法の手順は3つで、支払い方法をすべて案内する", () => {
	assert.deepEqual(
		ORDER_STEPS.map((s) => s.num),
		["I", "II", "III"],
	);
	for (const p of PAYMENTS) assert.ok(ORDER_STEPS[1].desc.includes(p), p);
});

test("注文の近くに、お客様都合の返品を受けないことと、不良のときの連絡期限の目安を出す", () => {
	assert.match(ORDER_NOTICE, /お客様のご都合による.*返品はお受けしていません/);
	assert.ok(ORDER_NOTICE.includes("到着後7日以内を目安に"));
});

test("このサイトでの情報の取り扱いは、注文フォーム・来店予約フォーム・アクセス解析の3つを説明する", () => {
	assert.deepEqual(
		SITE_DATA_POLICY.map((p) => p.label),
		["かんたん注文フォーム", "かんたん来店予約フォーム", "アクセス解析"],
	);
	assert.ok(SITE_DATA_POLICY[0].text.includes(`${SAVE_DAYS}日`));
});

test("注文の近くに、お預かりする情報の利用目的を出す", () => {
	assert.ok(PRIVACY_NOTICE.includes("商品の発送"));
});
