import assert from "node:assert/strict";
import { test } from "node:test";
import { PAYMENTS } from "./shop.ts";
import { NAV_LINKS, ORDER_STEPS } from "./site.ts";

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
