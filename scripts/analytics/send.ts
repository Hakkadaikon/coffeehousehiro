// 前日 20:00 から今日 20:00 までのアクセスを Vercel Web Analytics API から集計し、Discord に送る。GitHub Actions(analytics-report.yml)から動かす。
// 環境変数: VERCEL_TOKEN, VERCEL_PROJECT_ID, DISCORD_WEBHOOK_URL(必須)、VERCEL_TEAM_ID(チームのプロジェクトのときだけ)、
// POSTHOG_API_KEY(PostHog の Personal API key。Query の読み取り権限だけ。無ければ PostHog の段落を省く)
// --dry-run を付けると、Discord に送らずに文面を表示する。REPORT_PERIOD=24時間|1週間|1か月 で、今からさかのぼった期間を集計する。
import { type Behavior, buildReport, hourChunks, last24Hours, type Row, recent } from "./report.ts";

const dryRun = process.argv.includes("--dry-run");
const env = (name: string) => {
	const value = process.env[name];
	if (!value)
		throw new Error(
			`環境変数 ${name} が設定されていません（GitHub の Secrets を確認してください）`,
		);
	return value;
};

const token = env("VERCEL_TOKEN");
const projectId = env("VERCEL_PROJECT_ID");
const webhook = dryRun ? "" : env("DISCORD_WEBHOOK_URL");
// 手動実行は REPORT_PERIOD で選んだ期間を今からさかのぼる。定期実行(REPORT_PERIOD なし)は前日 20:00 からの24時間
const PERIODS: Record<string, number> = { "24時間": 1, "1週間": 7, "1か月": 30 };
const period = process.env.REPORT_PERIOD;
if (period && !PERIODS[period])
	throw new Error(`REPORT_PERIOD は ${Object.keys(PERIODS).join("・")} のどれか`);
const range = period ? recent(new Date(), PERIODS[period]) : last24Hours(new Date());

/** visits/aggregate を by で分けて取る(by は必須) */
async function visits(by: string, limit?: number, { since, until } = range): Promise<Row[]> {
	const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
	const params = {
		projectId,
		since,
		until,
		by,
		limit: limit?.toString(),
	};
	for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, value);
	if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
	const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`Vercel API ${by}: ${res.status} ${await res.text()}`);
	return (await res.json()).data;
}

/** 1時間ごとの数。分けて取り、区切りの時間が両方に出たら多いほうを残す */
async function hourly(): Promise<Row[]> {
	const byTime = new Map<string, Row>();
	for (const part of await Promise.all(hourChunks(range).map((c) => visits("hour", undefined, c))))
		for (const r of part) {
			const key = String(r.timestamp);
			if (r.pageviews >= (byTime.get(key)?.pageviews ?? -1)) byTime.set(key, r);
		}
	return [...byTime.values()];
}

/** PostHog に HogQL で問い合わせ、結果の行を返す */
async function hogql(query: string): Promise<unknown[][]> {
	const res = await fetch("https://us.posthog.com/api/projects/@current/query/", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
	});
	if (!res.ok) throw new Error(`PostHog: ${res.status} ${await res.text()}`);
	return (await res.json()).results;
}

/**
 * ページの中での動きを PostHog から集計する。フォームは、クリックした要素かその親の id(details#order-form)か、
 * リンク先(href="#order-form")で見分ける。「送った」は、フォームの中のコピーのボタン(「コピーしてLINEを開く」など)
 */
async function behavior(): Promise<Behavior | null> {
	const utc = (iso: string) => `toDateTime('${iso.slice(0, 19).replace("T", " ")}', 'UTC')`;
	const when = `timestamp >= ${utc(range.since)} AND timestamp < ${utc(range.until)}`;
	const clicks = `FROM events WHERE event = '$autocapture' AND ${when}`;
	const people = (cond: string) => `count(DISTINCT if(${cond}, distinct_id, NULL))`;
	const sent = (form: string) =>
		people(`elements_chain LIKE '%attr__id="${form}"%' AND properties.$el_text LIKE '%コピー%'`);
	try {
		const [buttons, [forms], [scroll]] = await Promise.all([
			hogql(
				`SELECT properties.$el_text AS label, count() AS n ${clicks} AND notEmpty(coalesce(label, '')) GROUP BY label ORDER BY n DESC LIMIT 5`,
			),
			hogql(
				`SELECT ${people("elements_chain LIKE '%order-form%'")}, ${sent("order-form")}, ${people("elements_chain LIKE '%reserve-form%'")}, ${sent("reserve-form")} ${clicks}`,
			),
			hogql(
				`SELECT countIf(s >= 0.9), countIf(s >= 0.5 AND s < 0.9), countIf(s < 0.5) FROM (SELECT toFloat(properties.$prev_pageview_max_scroll_percentage) AS s FROM events WHERE event = '$pageleave' AND ${when})`,
			),
		]);
		const n = (rows: unknown[], i: number) => Number(rows[i]);
		return {
			buttons: buttons.map(([label, count]) => [String(label), Number(count)]),
			forms: {
				order: { opened: n(forms, 0), sent: n(forms, 1) },
				reserve: { opened: n(forms, 2), sent: n(forms, 3) },
			},
			scroll: { end: n(scroll, 0), half: n(scroll, 1), top: n(scroll, 2) },
		};
	} catch (e) {
		// PostHog が取れなくても、Vercel の集計は送る
		console.error(e);
		return null;
	}
}

const [hours, days, pages, referrers, devices, countries] = await Promise.all([
	hourly(),
	visits("day"),
	visits("requestPath", 5),
	visits("referrerHostname", 10),
	visits("deviceType"),
	visits("country", 5),
]);
const ph = process.env.POSTHOG_API_KEY ? await behavior() : undefined;
// by なしでは取れないので、期間全体の数は端末の種類ごとの数を足す
const total = {
	pageviews: devices.reduce((n, r) => n + r.pageviews, 0),
	visitors: devices.reduce((n, r) => n + r.visitors, 0),
};
// Actions のログで、API から何件返ったかを確かめられるようにする
console.log(
	`${range.since}〜${range.until}: posthog=${JSON.stringify(ph)} total=${JSON.stringify(total)} hours=${hours.length} days=${days.length} pages=${pages.length} referrers=${referrers.length} devices=${devices.length} countries=${countries.length}`,
);
const content = buildReport({
	range,
	total,
	hours,
	days,
	pages,
	referrers,
	devices,
	countries,
	behavior: ph,
});

if (dryRun) {
	console.log(content);
} else {
	const res = await fetch(webhook, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
	});
	if (!res.ok) throw new Error(`Discord: ${res.status} ${await res.text()}`);
	console.log(`送信しました（${range.since}〜${range.until}）`);
}
