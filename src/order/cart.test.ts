import assert from "node:assert/strict";
import { test } from "node:test";
import { cartReducer, isExpired, newCartItem, restoreCart, roastFor, toLines } from "./cart.ts";

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

const panama = { ...menu[0], id: "p", roasts: ["浅煎り"] };

test("選べない焙煎度を指定したら、その商品の最初の焙煎度にする", () => {
	assert.equal(roastFor(menu[0], "中煎り"), "中煎り");
	assert.equal(roastFor(panama, "おまかせ"), "浅煎り");
});

test("カートに入れる行は、豆なら挽き方・焙煎度を持ち、ドリップバッグなら空にする", () => {
	const pick = { size: 1, qty: 3, grind: "粉", roast: "おまかせ" };
	assert.deepEqual(newCartItem(panama, pick), {
		id: "p",
		size: 1,
		qty: 3,
		grind: "粉",
		roast: "浅煎り",
	});
	assert.deepEqual(newCartItem(menu[1], { ...pick, size: 0 }), {
		id: "d",
		size: 0,
		qty: 3,
		grind: "",
		roast: "",
	});
});

test("カートから注文の行を作る。豆はサイズ・挽き方・焙煎度をラベルに足し、消えた商品は捨てる", () => {
	const cart = [
		{ id: "a", size: 1, qty: 2, grind: "豆", roast: "中煎り" },
		{ id: "gone", size: 0, qty: 1, grind: "", roast: "" },
		{ id: "d", size: 0, qty: 1, grind: "", roast: "" },
	];
	assert.deepEqual(toLines(cart, menu), [
		{ kind: "bean", yen: 850, qty: 2, label: "A　200g・豆・中煎り", item: cart[0] },
		{ kind: "drip", yen: 570, qty: 1, label: "D", item: cart[2] },
	]);
});

test("カートの操作は、追加は末尾、数量変更と削除は指定した行だけで、元の配列は変えない", () => {
	const a = { id: "a", size: 0, qty: 1, grind: "豆", roast: "中煎り" };
	const d = { id: "d", size: 0, qty: 1, grind: "", roast: "" };
	const cart = Object.freeze([a]);
	assert.deepEqual(cartReducer(cart, { type: "add", item: d }), [a, d]);
	assert.deepEqual(cartReducer([a, d], { type: "setQty", index: 1, qty: 5 }), [
		a,
		{ ...d, qty: 5 },
	]);
	assert.deepEqual(cartReducer([a, d], { type: "remove", index: 0 }), [d]);
	assert.deepEqual(cartReducer([a], { type: "replace", cart: [d] }), [d]);
	assert.deepEqual(cart, [a]);
});
