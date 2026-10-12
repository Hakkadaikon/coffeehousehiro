import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReport, lastWeek, recentWeek } from "./report.ts";

test("集計期間は、実行日の前日までの7日間（日本時間）", () => {
	// 月曜 9:00 JST に動いたとき、前の週の月曜〜日曜
	assert.deepEqual(lastWeek(new Date("2026-10-12T00:00:00Z")), {
		since: "2026-10-05",
		until: "2026-10-11",
	});
	// 日本時間ではもう翌日になっている時刻
	assert.deepEqual(lastWeek(new Date("2026-10-11T16:00:00Z")), {
		since: "2026-10-05",
		until: "2026-10-11",
	});
});

const data = {
	range: { since: "2026-10-05", until: "2026-10-11" },
	days: [
		{ timestamp: "2026-10-05T00:00:00.000Z", pageviews: 3, visitors: 2 },
		{ timestamp: "2026-10-06T00:00:00.000Z", pageviews: 7, visitors: 5 },
	],
	pages: [
		{ requestPath: "/", pageviews: 9, visitors: 6 },
		{ requestPath: "/legal", pageviews: 1, visitors: 1 },
	],
	referrers: [
		{ referrerHostname: "l.instagram.com", pageviews: 4, visitors: 3 },
		{ referrerHostname: "", pageviews: 6, visitors: 4 },
	],
	devices: [{ deviceType: "mobile", pageviews: 8, visitors: 6 }],
	countries: [{ country: "JP", pageviews: 10, visitors: 7 }],
};

test("週の合計と、日別・ページ・参照元・端末・国の内訳を書く", () => {
	const text = buildReport(data);
	assert.match(text, /10\/05〜10\/11/);
	assert.match(text, /訪問者 7人・ページビュー 10回/);
	assert.match(text, /10\/06（火） 5人・7回/);
	assert.match(text, /\/legal 1回/);
	assert.match(text, /リファラー（参照元）\*\* l\.instagram\.com 3人/);
	assert.match(text, /直接・不明 4人/);
	assert.match(text, /mobile 6人/);
	assert.match(text, /JP 7人/);
});

test("アクセスがない週も、0として送る", () => {
	const text = buildReport({
		...data,
		days: [],
		pages: [],
		referrers: [],
		devices: [],
		countries: [],
	});
	assert.match(text, /訪問者 0人・ページビュー 0回/);
	assert.match(text, /なし/);
});

test("Discord の1メッセージの上限（2000文字）を超えない", () => {
	const many = Array.from({ length: 500 }, (_, i) => ({
		requestPath: `/page-${i}`,
		pageviews: 1,
		visitors: 1,
	}));
	assert.ok(buildReport({ ...data, pages: many }).length <= 2000);
});

test("手動で動かすときは、今日を含む直近7日間（日本時間）", () => {
	assert.deepEqual(recentWeek(new Date("2026-10-12T07:58:00Z")), {
		since: "2026-10-06",
		until: "2026-10-12",
	});
});

test("期間中のアクセスが1件もないときは、そのことを書き添える", () => {
	const empty = { ...data, days: [], pages: [], referrers: [], devices: [], countries: [] };
	assert.match(buildReport(empty), /この期間のアクセスはありません/);
	assert.doesNotMatch(buildReport(data), /この期間のアクセスはありません/);
});
