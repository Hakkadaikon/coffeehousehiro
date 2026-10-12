import assert from "node:assert/strict";
import { test } from "node:test";
import { PAYMENTS } from "./shop.ts";
import { NAV_LINKS, ORDER_NOTICE, ORDER_STEPS } from "./site.ts";

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
