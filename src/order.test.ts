import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog, priceRange } from "./menu.ts";
import {
	buildMessage,
	cleanLine,
	formatPrices,
	isExpired,
	LINE_CHAT_URL,
	type Line,
	restoreCart,
	shippingFee,
	subtotal,
	total,
	validate,
} from "./order.ts";

const bean = (yen: number | null, qty = 1): Line => ({ kind: "bean", yen, qty });
const drip = (yen: number | null, qty = 1): Line => ({ kind: "drip", yen, qty });

test("価格表示はメニューの表記と同じ", () => {
	assert.equal(formatPrices([450, 850]), "¥450 / ¥850");
	assert.equal(formatPrices([500, 1000]), "¥500 / ¥1,000");
	assert.equal(formatPrices([570]), "¥570");
	assert.equal(formatPrices([null]), "時価・要相談");
});

test("小計は単価×数量、時価の品は小計なし", () => {
	assert.equal(subtotal(bean(850, 3)), 2550);
	assert.equal(subtotal(drip(null, 2)), null);
});

test("送料は2アイテム分ごとに¥270、豆1袋=1・ドリップバッグ1セット=0.5", () => {
	assert.equal(shippingFee([]), 0);
	assert.equal(shippingFee([bean(450)]), 270);
	assert.equal(shippingFee([bean(450, 2)]), 270);
	assert.equal(shippingFee([bean(450, 3)]), 540);
	assert.equal(shippingFee([drip(570, 4)]), 270);
	assert.equal(shippingFee([drip(570, 5)]), 540);
	assert.equal(shippingFee([bean(450), drip(570, 2)]), 270);
	assert.equal(shippingFee([drip(null, 1)]), 270);
});

test("合計は時価を除いた小計と送料の和", () => {
	assert.equal(total([]), 0);
	assert.equal(total([bean(850, 2), drip(570)]), 850 * 2 + 570 + 540);
	assert.equal(total([bean(450), drip(null)]), 450 + 270);
});

const form = {
	name: "山田 太郎",
	postal: "712-8046",
	address: "岡山県倉敷市福田町福田2370-6",
	phone: "",
	payment: "PayPay",
};

test("注文文は商品・小計・送料・合計・お届け先・支払い方法を含む", () => {
	const text = buildMessage(
		[
			{
				kind: "bean",
				yen: 850,
				qty: 1,
				label: "シングル タンザニア(キリマンジャロ AA)/豆/中煎り/200g",
			},
			{ kind: "drip", yen: null, qty: 1, label: "ドリップバッグ スペシャル 5枚セット" },
		],
		form,
	);
	assert.equal(
		text,
		[
			"【ご注文】",
			"■商品",
			"・シングル タンザニア(キリマンジャロ AA)/豆/中煎り/200g ×1 … ¥850",
			"・ドリップバッグ スペシャル 5枚セット ×1 … 時価・要相談",
			"■小計 ¥850",
			"■送料 ¥270(1.5アイテム分)",
			"■合計 ¥1,120 ※時価の商品は別途ご相談",
			"■お名前 山田 太郎",
			"■お届け先 〒712-8046 岡山県倉敷市福田町福田2370-6",
			"■お支払い PayPay",
			"※表示金額は概算です。在庫・送料を確認のうえ、お店から確定金額をご連絡します。",
			"(メニュー改定日: 2026年10月1日)",
			"よろしくお願いします。",
		].join("\n"),
	);
});

test("電話番号は入力があるときだけ載せる", () => {
	const line = {
		kind: "bean" as const,
		yen: 450,
		qty: 2,
		label: "ブレンド おまかせ/粉/おまかせ/100g",
	};
	assert.ok(!buildMessage([line], form).includes("■お電話"));
	assert.ok(
		buildMessage([line], { ...form, phone: "090-0000-0000" }).includes("■お電話 090-0000-0000"),
	);
	assert.ok(!buildMessage([line], form).includes("時価"));
});

test("1行の入力は全角を半角に寄せ、制御文字・改行・方向制御文字を消し、上限で切る", () => {
	assert.equal(cleanLine("７１２－８０４６", 10), "712-8046");
	assert.equal(cleanLine("倉敷市\n■合計 ¥0", 200), "倉敷市■合計 ¥0");
	assert.equal(cleanLine("a\u202Eb\u200Bc\u0007", 10), "abc");
	assert.equal(cleanLine("  山田  ", 50), "山田");
	assert.equal(cleanLine("あ".repeat(60), 50).length, 50);
});

test("必須項目・郵便番号・電話番号・支払い方法を検査する", () => {
	const ok = { name: "山田", postal: "712-8046", address: "倉敷市", phone: "", payment: "PayPay" };
	assert.deepEqual(validate(ok), []);
	assert.deepEqual(validate({ ...ok, postal: "7128046" }), []);
	assert.deepEqual(validate({ ...ok, phone: "090-1234-5678" }), []);
	assert.deepEqual(validate({ ...ok, name: "" }), ["name"]);
	assert.deepEqual(validate({ ...ok, postal: "712-804" }), ["postal"]);
	assert.deepEqual(validate({ ...ok, address: "" }), ["address"]);
	assert.deepEqual(validate({ ...ok, phone: "abc" }), ["phone"]);
	assert.deepEqual(validate({ ...ok, payment: "現金" }), ["payment"]);
});

test("LINEのトーク画面URLには本文や個人情報を入れない", () => {
	assert.equal(LINE_CHAT_URL, "https://line.me/R/oaMessage/%40992mqixg/");
});

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

test("メニューから注文用の商品リストと価格帯を作る", () => {
	const items = catalog();
	assert.equal(new Set(items.map((i) => i.id)).size, items.length);
	const panama = items.find((i) => i.label.includes("パナマ"));
	assert.deepEqual(panama?.sizes, ["20g", "100g"]);
	assert.deepEqual(panama?.roasts, ["浅煎り"]);
	assert.equal(
		items.find((i) => i.label.includes("タンザニア"))?.label,
		"シングル タンザニア(キリマンジャロ AA)",
	);
	assert.deepEqual(priceRange(), [450, 2200]);
});

test("期限切れの判定は30日ちょうどまで有効、NaNは期限切れ扱い", () => {
	assert.equal(isExpired(0, 30 * DAY), false);
	assert.equal(isExpired(0, 30 * DAY + 1), true);
	assert.equal(isExpired(Number.NaN, 0), true);
});
