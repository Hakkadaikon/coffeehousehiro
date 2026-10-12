import assert from "node:assert/strict";
import { test } from "node:test";
import {
	catalog,
	categoryNote,
	categoryUnit,
	groupCatalog,
	itemSub,
	MENU,
	priceRange,
	ROASTS,
} from "./menu.ts";

test("どの品目もサイズと価格の数がそろい、価格は正の整数か時価", () => {
	for (const c of MENU) {
		for (const item of c.items) {
			const where = `${c.title} ${item.name}`;
			assert.equal(item.prices.length, (item.sizes ?? c.sizes).length, where);
			if (item.groundPrices) assert.equal(item.groundPrices.length, item.prices.length, where);
			const ok = (n: number) => Number.isInteger(n) && n > 0;
			for (const p of item.prices) {
				assert.ok(
					p === null || (typeof p === "number" ? ok(p) : ok(p.min) && ok(p.max) && p.min < p.max),
					where,
				);
			}
		}
	}
});

test("焙煎度の指定は選択肢の中から選び、空にしない", () => {
	for (const item of MENU.flatMap((c) => c.items)) {
		if (!item.roasts) continue;
		assert.ok(item.roasts.length > 0, item.name);
		for (const r of item.roasts) assert.ok((ROASTS as readonly string[]).includes(r), item.name);
	}
});

test("商品IDの区切りに使う / を名前に入れない", () => {
	for (const c of MENU) {
		assert.ok(!c.title.includes("/"), c.title);
		for (const item of c.items) assert.ok(!`${item.name}${item.sub}`.includes("/"), item.name);
	}
});

test("価格帯は時価を除いた全価格の最安値と最高値（幅のある価格は両端、粉の価格も含める）", () => {
	const all = MENU.flatMap((c) =>
		c.items.flatMap((i) => [...i.prices, ...(i.groundPrices ?? [])]),
	).flatMap((p) => (p === null ? [] : typeof p === "number" ? [p] : [p.min, p.max]));
	const [min, max] = priceRange();
	assert.equal(min, Math.min(...all));
	assert.equal(max, Math.max(...all));
	assert.ok(Number.isFinite(min) && min <= max);
});

const bean = MENU.find((c) => c.kind === "bean" && !c.limited);
const limited = MENU.find((c) => c.limited);
const drip = MENU.find((c) => c.kind === "drip");

test("カテゴリの注記と単位", () => {
	assert.ok(bean && limited && drip);
	assert.equal(categoryNote(bean), "豆・粉　／　浅煎り・中煎り・中深煎り・おまかせ");
	assert.equal(categoryNote(limited), "なくなり次第終了");
	assert.equal(categoryNote(drip), "");
	assert.equal(categoryUnit(bean), "100g / 200g");
	assert.equal(categoryUnit(drip), "0.5アイテム分");
});

test("品目の補足行に、違うサイズと焙煎度の制限を足す", () => {
	assert.equal(
		itemSub({
			name: "パナマ",
			sub: "ゲイシャ",
			prices: [1, 2],
			sizes: ["20g", "100g"],
			roasts: ["浅煎り"],
		}),
		"ゲイシャ　20g / 100g　浅煎りのみ",
	);
	assert.equal(itemSub({ name: "ブラジル", sub: "", prices: [1, 2] }), "");
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

test("注文フォームの商品はメニューのカテゴリ順にまとめ、どの商品も1回だけ出す", () => {
	const groups = groupCatalog(catalog());
	assert.deepEqual(
		groups.map(([title]) => title),
		MENU.map((c) => c.title),
	);
	assert.deepEqual(
		groups.flatMap(([, items]) => items),
		catalog(),
	);
});

test("ドリップバッグのスペシャル 5枚セットは ¥1,000〜¥1,500", () => {
	const drip = MENU.find((c) => c.title === "ドリップバッグ");
	const special = drip?.items.find((i) => i.name === "スペシャル 5枚セット");
	assert.deepEqual(special?.prices, [{ min: 1000, max: 1500 }]);
});
