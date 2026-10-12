import assert from "node:assert/strict";
import { test } from "node:test";
import { isExpired, restoreCart, restoreForm } from "./draft.ts";
import { EMPTY_FORM } from "./form.ts";

const DAY = 864e5;
const menu = [
	{
		id: "a",
		kind: "bean" as const,
		label: "A",
		prices: [450, 850],
		sizes: ["100g", "200g"],
		roasts: ["浅煎り", "中煎り"],
	},
	{ id: "d", kind: "drip" as const, label: "D", prices: [570], sizes: ["1セット"], roasts: [] },
];

test("保存したカートは今のメニューから計算し直し、消えた商品・不正な値は捨てる", () => {
	const saved = {
		savedAt: 0,
		cart: [
			{ id: "a", size: 1, qty: 2, grind: "豆", roast: "中煎り" },
			{ id: "gone", size: 0, qty: 1, grind: "豆", roast: "中煎り" },
			{ id: "a", size: 5, qty: 1, grind: "豆", roast: "中煎り" },
			{ id: "d", size: 0, qty: 99, grind: "", roast: "" },
		],
	};
	const cart = restoreCart(saved, menu, 0);
	assert.deepEqual(
		cart.map((c) => [c.id, c.size, c.qty]),
		[["a", 1, 2]],
	);
});

test("30日を過ぎた保存データは使わない", () => {
	const saved = { savedAt: 0, cart: [{ id: "a", size: 0, qty: 1, grind: "豆", roast: "中煎り" }] };
	assert.equal(restoreCart(saved, menu, 30 * DAY).length, 1);
	assert.equal(restoreCart(saved, menu, 30 * DAY + 1).length, 0);
	assert.equal(restoreCart(null, menu, 0).length, 0);
});

test("豆の保存データは挽き方・焙煎度が選択肢にあるものだけ残す", () => {
	const saved = {
		savedAt: 0,
		cart: [
			{ id: "a", size: 0, qty: 1, grind: "豆", roast: "深煎り" },
			{ id: "a", size: 0, qty: 1, grind: "砂", roast: "中煎り" },
			{ id: "a", size: 0, qty: 1, grind: "粉", roast: "浅煎り" },
		],
	};
	assert.deepEqual(
		restoreCart(saved, menu, 0).map((c) => c.grind),
		["粉"],
	);
});

test("期限切れの判定は30日ちょうどまで有効、NaNは期限切れ扱い", () => {
	assert.equal(isExpired(0, 30 * DAY), false);
	assert.equal(isExpired(0, 30 * DAY + 1), true);
	assert.equal(isExpired(Number.NaN, 0), true);
});

test("数量は1〜20だけ、整数でない値や負のサイズは捨てる", () => {
	const item = (qty: number, size = 0) => ({ id: "a", size, qty, grind: "豆", roast: "浅煎り" });
	const saved = {
		savedAt: 0,
		cart: [item(0), item(1), item(20), item(21), item(1.5), item(1, -1)],
	};
	assert.deepEqual(
		restoreCart(saved, menu, 0).map((c) => c.qty),
		[1, 20],
	);
});

test("壊れた保存データ（cart が配列でない）は空のカートにする", () => {
	assert.deepEqual(restoreCart({ savedAt: 0, cart: undefined } as never, menu, 0), []);
});

test("保存したフォームは文字列の欄だけ戻し、電話番号は戻さない", () => {
	assert.deepEqual(restoreForm(undefined), EMPTY_FORM);
	assert.deepEqual(
		restoreForm({
			name: "山田",
			postal: 7128046,
			address: "倉敷市",
			phone: "090",
			payment: "PayPay",
		}),
		{ name: "山田", postal: "", address: "倉敷市", phone: "", payment: "PayPay" },
	);
});
