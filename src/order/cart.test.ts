import assert from "node:assert/strict";
import { test } from "node:test";
import { cartReducer, newCartItem, roastFor, toLines } from "./cart.ts";

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
		{ kind: "bean", yen: 850, qty: 2, label: "A　200g・豆・中煎り", id: "a" },
		{ kind: "drip", yen: 570, qty: 1, label: "D", id: "d" },
	]);
});

test("粉の価格がある豆は、粉を選ぶとその価格で計算する", () => {
	const gesha = { ...panama, groundPrices: [550, 2400] };
	const cart = [
		{ id: "p", size: 1, qty: 1, grind: "豆", roast: "浅煎り" },
		{ id: "p", size: 1, qty: 1, grind: "粉", roast: "浅煎り" },
		{ id: "a", size: 0, qty: 1, grind: "粉", roast: "中煎り" },
	];
	assert.deepEqual(
		toLines(cart, [gesha, menu[0]]).map((l) => l.yen),
		[850, 2400, 450],
	);
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
