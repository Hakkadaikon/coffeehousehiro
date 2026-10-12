import assert from "node:assert/strict";
import { test } from "node:test";
import type { Form } from "./form.ts";
import { buildMessage } from "./message.ts";

const form: Form = {
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

test("すべて価格をご相談する商品なら、合計は送料だけで注記が付く", () => {
	const text = buildMessage([{ kind: "drip", yen: null, qty: 1, label: "D" }], form);
	assert.ok(text.includes("小計：¥0\n送料：¥270\n合計：¥270（価格をご相談する商品を除く）"));
});
