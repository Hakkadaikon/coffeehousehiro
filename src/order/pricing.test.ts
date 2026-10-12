import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrices, itemsTotal, type Line, shippingFee, subtotal, total } from "./pricing.ts";

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

test("商品代金の合計は、合計から送料を引いた額", () => {
	const lines = [bean(850, 2), drip(570), drip(null)];
	assert.equal(itemsTotal(lines), 850 * 2 + 570);
	assert.equal(itemsTotal(lines), total(lines) - shippingFee(lines));
});
