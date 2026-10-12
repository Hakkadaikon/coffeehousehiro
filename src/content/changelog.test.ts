import assert from "node:assert/strict";
import { test } from "node:test";
import { CHANGELOG, parseChangelog } from "./changelog.ts";

test("更新履歴は日付が新しい順で、同じ日は1つにまとめる", () => {
	const dates = CHANGELOG.map((e) => e.date);
	assert.deepEqual(dates, [...new Set(dates)].sort().reverse());
});

test("更新履歴の日付は実在する yyyy/MM/dd で、未来の日付にしない", () => {
	const todayJst = new Date(Date.now() + 9 * 3600e3)
		.toISOString()
		.slice(0, 10)
		.replaceAll("-", "/");
	for (const { date } of CHANGELOG) {
		assert.match(date, /^\d{4}\/\d{2}\/\d{2}$/, date);
		const iso = date.replaceAll("/", "-");
		assert.equal(new Date(`${iso}T00:00:00Z`).toISOString().slice(0, 10), iso, date);
		assert.ok(date <= todayJst, date);
	}
});

test("更新履歴の最初の公開日は「サイトを公開」", () => {
	assert.deepEqual(CHANGELOG.at(-1)?.items, ["サイトを公開"]);
});

test("changelog.yaml の形が違えば読み込みで止める", () => {
	assert.deepEqual(parseChangelog([{ date: "2026/01/02", items: ["a"] }]), [
		{ date: "2026/01/02", items: ["a"] },
	]);
	for (const bad of [
		{},
		[],
		[{ date: "2026/01/02" }],
		[{ date: "2026/01/02", items: [] }],
		[{ date: "2026/01/02", items: [""] }],
		[{ date: "2026-01-02", items: ["a"] }],
		[{ date: 20260102, items: ["a"] }],
	]) {
		assert.throws(() => parseChangelog(bad), JSON.stringify(bad));
	}
});

test("更新履歴の項目は「〇〇を追加・更新・削除・公開」のどれかで終え、表記をそろえる", () => {
	for (const { items } of CHANGELOG) {
		for (const item of items) assert.match(item, /.を(追加|更新|削除|公開)$/, item);
	}
});
