import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReport, last24Hours, recentWeek } from "./report.ts";

test("集計するのは、直近の 20:00（日本時間）までの24時間", () => {
	// 20:00 JST に動いたとき、前日 20:00 から今まで
	assert.deepEqual(last24Hours(new Date("2026-10-13T11:00:00Z")), {
		since: "2026-10-12T11:00:00.000Z",
		until: "2026-10-13T11:00:00.000Z",
	});
	// 定期実行が遅れても、区切りは 20:00 のまま（前後の回と重ならない）
	assert.deepEqual(last24Hours(new Date("2026-10-13T12:30:00Z")), {
		since: "2026-10-12T11:00:00.000Z",
		until: "2026-10-13T11:00:00.000Z",
	});
	// 20:00 より前に動いたときは、前日の 20:00 まで
	assert.deepEqual(last24Hours(new Date("2026-10-13T10:59:00Z")), {
		since: "2026-10-11T11:00:00.000Z",
		until: "2026-10-12T11:00:00.000Z",
	});
});

const data = {
	range: { since: "2026-10-05T00:00:00.000Z", until: "2026-10-11T23:59:59.999Z" },
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

test("期間の合計と、日別・ページ・参照元・端末・国の内訳を書く", () => {
	const text = buildReport(data);
	assert.match(text, /10\/05（月）9:00〜10\/12（月）8:59/);
	assert.match(text, /訪問者 7人・ページビュー 10回/);
	assert.match(text, /10\/06（火） 5人・7回/);
	assert.match(text, /\/legal 1回/);
	assert.match(text, /リファラー（参照元）\*\* l\.instagram\.com 3人/);
	assert.match(text, /直接・不明 4人/);
	assert.match(text, /mobile 6人/);
	assert.match(text, /JP 7人/);
});

test("アクセスがない期間も、0として送る", () => {
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

test("手動で動かすときは、今日を含む直近7日間（日本時間）を、最終日の終わりまで", () => {
	assert.deepEqual(recentWeek(new Date("2026-10-12T07:58:00Z")), {
		since: "2026-10-06T00:00:00.000Z",
		until: "2026-10-12T23:59:59.999Z",
	});
});

test("24時間分のときは、日別の内訳を省く", () => {
	const text = buildReport({
		...data,
		range: { since: "2026-10-12T11:00:00.000Z", until: "2026-10-13T11:00:00.000Z" },
		days: [{ timestamp: "2026-10-12T00:00:00.000Z", pageviews: 3, visitors: 2 }],
	});
	assert.match(text, /アクセス（10\/12（月）20:00〜10\/13（火）20:00）/);
	assert.match(text, /訪問者 2人・ページビュー 3回/);
	assert.doesNotMatch(text, /日別/);
});

test("期間中のアクセスが1件もないときは、そのことを書き添える", () => {
	const empty = { ...data, days: [], pages: [], referrers: [], devices: [], countries: [] };
	assert.match(buildReport(empty), /この期間のアクセスはありません/);
	assert.doesNotMatch(buildReport(data), /この期間のアクセスはありません/);
});
