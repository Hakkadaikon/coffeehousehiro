import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReport, hourChunks, last24Hours, recent, scheduled } from "./report.ts";

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
	total: { pageviews: 10, visitors: 6 },
	hours: [
		// UTC の 11時台・12時台は、日本時間の 20時台・21時台
		{ timestamp: "2026-10-05T11:00:00.000Z", pageviews: 2, visitors: 2 },
		{ timestamp: "2026-10-06T11:00:00.000Z", pageviews: 4, visitors: 3 },
		{ timestamp: "2026-10-06T12:00:00.000Z", pageviews: 3, visitors: 2 },
		{ timestamp: "2026-10-06T03:00:00.000Z", pageviews: 1, visitors: 1 },
		{ timestamp: "2026-10-06T04:00:00.000Z", pageviews: 0, visitors: 0 },
	],
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

test("手動で動かすときは、今から選んだ日数だけさかのぼる", () => {
	const now = new Date("2026-10-13T05:37:12.345Z");
	assert.deepEqual(recent(now, 1), {
		since: "2026-10-12T05:37:00.000Z",
		until: "2026-10-13T05:37:00.000Z",
	});
	assert.deepEqual(recent(now, 30), {
		since: "2026-09-13T05:37:00.000Z",
		until: "2026-10-13T05:37:00.000Z",
	});
});

test("1時間ごとの数は、API の上限（168時間）に収まるよう分けて取る。区切りは正時で、すき間なくつながる", () => {
	for (const days of [1, 7, 30]) {
		const range = recent(new Date("2026-10-13T05:37:00Z"), days);
		const chunks = hourChunks(range);
		assert.equal(chunks[0].since, range.since);
		assert.equal(chunks.at(-1)?.until, range.until);
		for (const [i, c] of chunks.entries()) {
			// API は始まりを正時に切り下げるので、その分を見込んでも 168時間以内
			assert.ok(Date.parse(c.until) - Date.parse(c.since) <= 167 * 3600e3);
			if (i > 0) {
				assert.equal(c.since, chunks[i - 1].until);
				assert.equal(Date.parse(c.since) % 3600e3, 0);
			}
		}
	}
});

const behavior = {
	buttons: [
		["注文フォーム", 14],
		["来店予約フォーム", 6],
	] as [string, number][],
	forms: { order: { opened: 9, sent: 2 }, reserve: { opened: 4, sent: 1 } },
	links: { instagram: { clicks: 5, people: 4 }, line: { clicks: 3, people: 3 } },
	scroll: { end: 7, half: 6, top: 7 },
};

/** 全部の埋め込みの項目を「見出し → 値」で引けるようにする */
const fields = (report: ReturnType<typeof buildReport>) =>
	Object.fromEntries(report.embeds.flatMap((e) => e.fields ?? []).map((f) => [f.name, f.value]));

test("期間の合計と、日別・時間帯・ページ・参照元・端末・国の内訳を、項目ごとに並べる", () => {
	const report = buildReport(data);
	assert.match(report.embeds[0].title, /10\/05（月）9:00〜10\/12（月）8:59/);
	const f = fields(report);
	assert.equal(f.訪問者, "6人");
	assert.equal(f.ページビュー, "10回");
	// 時間帯は日本時間の時刻ごとに足して、多い順に3つ
	assert.equal(f.アクセスの多い時間帯, "20時台 6回\n21時台 3回\n12時台 1回");
	assert.ok(f.日別.includes("10/06（火） 5人・7回"));
	assert.equal(f.いちばん多かった日, "10/06（火） 7回");
	assert.ok(f.よく見られたページ.includes("/legal 1回"));
	assert.equal(f["リファラー（参照元）"], "l.instagram.com 3人\n直接・不明 4人");
	assert.equal(f.端末, "mobile 6人");
	assert.equal(f["国・地域"], "JP 7人");
	assert.equal(report.embeds.length, 1);
});

test("24時間分のときは、日別の内訳を省く", () => {
	const report = buildReport({
		...data,
		range: { since: "2026-10-12T11:00:00.000Z", until: "2026-10-13T11:00:00.000Z" },
	});
	assert.match(report.embeds[0].title, /10\/12（月）20:00〜10\/13（火）20:00/);
	assert.equal(fields(report).日別, undefined);
	assert.equal(fields(report).いちばん多かった日, undefined);
});

test("アクセスがない期間も0として送り、アクセスがないことを書き添える", () => {
	const empty = {
		...data,
		total: { pageviews: 0, visitors: 0 },
		hours: [],
		days: [],
		pages: [],
		referrers: [],
		devices: [],
		countries: [],
	};
	const report = buildReport(empty);
	assert.equal(fields(report).訪問者, "0人");
	assert.equal(fields(report).端末, "なし");
	assert.match(report.embeds[0].description ?? "", /この期間のアクセスはありません/);
	assert.equal(buildReport(data).embeds[0].description, undefined);
});

test("Discord の埋め込みの上限（項目の値は1024文字、全体で6000文字）を超えない", () => {
	const many = Array.from({ length: 500 }, (_, i) => ({
		referrerHostname: `site-${i}.example.com`,
		pageviews: 1,
		visitors: 1,
	}));
	const report = buildReport({ ...data, referrers: many, behavior });
	for (const v of Object.values(fields(report))) assert.ok(v.length <= 1024);
	assert.ok(JSON.stringify(report.embeds).length <= 6000);
});

test("PostHog の集計があれば、2つ目の埋め込みに押されたボタン・フォームの進み具合・リンク・読まれた深さを並べる", () => {
	const report = buildReport({ ...data, behavior });
	assert.equal(report.embeds[1].title, "ページ内の動き（PostHog）");
	const f = fields(report);
	assert.equal(f.押されたボタン, "注文フォーム 14回\n来店予約フォーム 6回");
	assert.equal(f.注文フォーム, "開いた 9人\nメッセージをコピー 2人");
	assert.equal(f.来店予約フォーム, "開いた 4人\nメッセージをコピー 1人");
	assert.equal(f.Instagramを開いた, "5回（4人）");
	assert.equal(f.LINEを開いた, "3回（3人）");
	// 割合は四捨五入
	assert.equal(f.どこまで読まれたか, "最後まで 35%\n半分まで 30%\n最初だけ 35%");
});

test("PostHog の集計が空なら「なし」、取れなかったときはそう書き添える", () => {
	const empty = {
		buttons: [],
		forms: { order: { opened: 0, sent: 0 }, reserve: { opened: 0, sent: 0 } },
		links: { instagram: { clicks: 0, people: 0 }, line: { clicks: 0, people: 0 } },
		scroll: { end: 0, half: 0, top: 0 },
	};
	const f = fields(buildReport({ ...data, behavior: empty }));
	assert.equal(f.押されたボタン, "なし");
	assert.equal(f.どこまで読まれたか, "なし");
	const failed = buildReport({ ...data, behavior: null });
	assert.match(failed.embeds[1].description ?? "", /PostHog の集計は取得できませんでした/);
});

test("1か月のときは、日別ではなく7日ずつの週別にまとめる", () => {
	const days = Array.from({ length: 31 }, (_, i) => ({
		timestamp: new Date(Date.parse("2026-09-13T00:00:00.000Z") + i * 86400e3).toISOString(),
		pageviews: i === 20 ? 50 : 2,
		visitors: 1,
	}));
	const f = fields(
		buildReport({
			...data,
			range: { since: "2026-09-13T00:41:00.000Z", until: "2026-10-13T00:41:00.000Z" },
			days,
		}),
	);
	assert.equal(f.日別, undefined);
	assert.equal(
		f.週別,
		[
			"09/13〜09/19 7人・14回",
			"09/20〜09/26 7人・14回",
			"09/27〜10/03 7人・62回",
			"10/04〜10/10 7人・14回",
			"10/11〜10/13 3人・6回",
		].join("\n"),
	);
	assert.equal(f.いちばん多かった日, "10/03（土） 50回");
});

test("定期実行は毎日の24時間に加えて、金曜は週間、月末日は月間も送る。どれも 20:00 区切り", () => {
	const names = (now: string) => scheduled(new Date(now)).map((r) => r.name);
	// 木曜
	assert.deepEqual(names("2026-10-15T11:00:00Z"), ["アクセス"]);
	// 金曜は、前の金曜 20:00 からの7日間
	assert.deepEqual(scheduled(new Date("2026-10-16T11:05:00Z"))[1], {
		name: "週間アクセス",
		range: { since: "2026-10-09T11:00:00.000Z", until: "2026-10-16T11:00:00.000Z" },
	});
	// 月末日(土曜)は、前月末日 20:00 からの1か月
	assert.deepEqual(scheduled(new Date("2026-10-31T11:00:00Z")), [
		{
			name: "アクセス",
			range: { since: "2026-10-30T11:00:00.000Z", until: "2026-10-31T11:00:00.000Z" },
		},
		{
			name: "月間アクセス",
			range: { since: "2026-09-30T11:00:00.000Z", until: "2026-10-31T11:00:00.000Z" },
		},
	]);
	// 2月の末日
	assert.deepEqual(names("2027-02-28T11:00:00Z"), ["アクセス", "月間アクセス"]);
	// 金曜で月末日なら3つ
	assert.deepEqual(names("2027-04-30T11:00:00Z"), ["アクセス", "週間アクセス", "月間アクセス"]);
});

test("見出しに、毎日・週間・月間のどれかを書く", () => {
	assert.match(buildReport(data).embeds[0].title, /^コーヒーhouseヒロ アクセス（/);
	assert.match(
		buildReport({ ...data, name: "週間アクセス" }).embeds[0].title,
		/^コーヒーhouseヒロ 週間アクセス（/,
	);
});
