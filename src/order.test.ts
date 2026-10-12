import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog } from "./menu.ts";
import {
	buildMessage,
	cleanDigits,
	cleanLine,
	formatPrices,
	isExpired,
	LIMITS,
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

test("注文メッセージはお客さんからお店への依頼文として、商品・金額・お届け先・支払い方法を含む", () => {
	const text = buildMessage(
		[
			{
				kind: "bean",
				yen: 850,
				qty: 1,
				label: "シングル タンザニア（キリマンジャロ AA）　200g・豆・中煎り",
			},
			{ kind: "drip", yen: null, qty: 1, label: "ドリップバッグ スペシャル 5枚セット" },
		],
		form,
	);
	assert.equal(
		text,
		[
			"コーヒーhouseヒロ様",
			"以下の内容で注文をお願いします。",
			"",
			"【注文内容】",
			"・シングル タンザニア（キリマンジャロ AA）　200g・豆・中煎り ×1　¥850",
			"・ドリップバッグ スペシャル 5枚セット ×1　価格はご相談",
			"小計：¥850",
			"送料：¥270",
			"合計：¥1,120（価格をご相談する商品を除く）",
			"",
			"【お届け先】",
			"お名前：山田 太郎",
			"ご住所：〒712-8046 岡山県倉敷市福田町福田2370-6",
			"",
			"【お支払い方法】",
			"PayPay",
			"",
			"※金額は、2026年10月1日改定のメニューをもとにサイトで計算した目安です。在庫と送料をご確認のうえ、確定した金額を教えてください。",
			"よろしくお願いいたします。",
		].join("\n"),
	);
});

test("電話番号は入力があるときだけ載せる", () => {
	const line = {
		kind: "bean" as const,
		yen: 450,
		qty: 2,
		label: "ブレンド おまかせ　100g・粉・おまかせ",
	};
	assert.ok(!buildMessage([line], form).includes("電話番号："));
	assert.ok(
		buildMessage([line], { ...form, phone: "090-0000-0000" }).includes(
			"ご住所：〒712-8046 岡山県倉敷市福田町福田2370-6\n電話番号：090-0000-0000",
		),
	);
	assert.ok(!buildMessage([line], form).includes("ご相談"));
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

test("メニューから注文用の商品リストを作る", () => {
	const items = catalog();
	assert.equal(new Set(items.map((i) => i.id)).size, items.length);
	const panama = items.find((i) => i.label.includes("パナマ"));
	assert.deepEqual(panama?.sizes, ["20g", "100g"]);
	assert.deepEqual(panama?.roasts, ["浅煎り"]);
	assert.equal(
		items.find((i) => i.label.includes("タンザニア"))?.label,
		"シングル タンザニア（キリマンジャロ AA）",
	);
});

test("期限切れの判定は30日ちょうどまで有効、NaNは期限切れ扱い", () => {
	assert.equal(isExpired(0, 30 * DAY), false);
	assert.equal(isExpired(0, 30 * DAY + 1), true);
	assert.equal(isExpired(Number.NaN, 0), true);
});

test("郵便番号・電話番号は日本語入力のハイフンや〒も受け付ける", () => {
	const ok = { name: "山田", postal: "", address: "倉敷市", phone: "", payment: "PayPay" };
	for (const postal of ["712ー8046", "712−8046", "712‐8046", "〒712-8046", "〒７１２－８０４６"]) {
		assert.ok(postal.length <= LIMITS.postal, "入力欄の maxLength で切れない");
		const f = { ...ok, postal: cleanDigits(postal, LIMITS.postal) };
		assert.equal(f.postal, "712-8046");
		assert.deepEqual(validate(f), []);
	}
	const phone = cleanDigits("090ー1234ー5678", LIMITS.phone);
	assert.equal(phone, "090-1234-5678");
	assert.deepEqual(validate({ ...ok, postal: "712-8046", phone }), []);
});

test("空のフォームは必須項目をすべて指摘し、電話番号は任意", () => {
	assert.deepEqual(validate({ name: "", postal: "", address: "", phone: "", payment: "" }), [
		"name",
		"postal",
		"address",
		"payment",
	]);
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

test("すべて価格をご相談する商品なら、合計は送料だけで注記が付く", () => {
	const text = buildMessage([{ kind: "drip", yen: null, qty: 1, label: "D" }], form);
	assert.ok(text.includes("小計：¥0\n送料：¥270\n合計：¥270（価格をご相談する商品を除く）"));
});
