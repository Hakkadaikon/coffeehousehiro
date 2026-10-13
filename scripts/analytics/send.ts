// 前日 20:00 から今日 20:00 までのアクセスを Vercel Web Analytics API から集計し、Discord に送る。GitHub Actions(analytics-report.yml)から動かす。
// 環境変数: VERCEL_TOKEN, VERCEL_PROJECT_ID, DISCORD_WEBHOOK_URL(必須)、VERCEL_TEAM_ID(チームのプロジェクトのときだけ)
// --dry-run を付けると、Discord に送らずに文面を表示する。REPORT_PERIOD=24時間|1週間|1か月 で、今からさかのぼった期間を集計する。
import { buildReport, last24Hours, type Row, recent } from "./report.ts";

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

/** visits/aggregate を by で分けて取る。by が空なら期間全体の1行 */
async function visits(by: string, limit?: number): Promise<Row[]> {
	const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
	const params = {
		projectId,
		...range,
		by,
		limit: limit?.toString(),
	};
	for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, value);
	if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
	const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`Vercel API ${by}: ${res.status} ${await res.text()}`);
	return (await res.json()).data;
}

const [[total = { pageviews: 0, visitors: 0 }], hours, days, pages, referrers, devices, countries] =
	await Promise.all([
		visits(""),
		visits("hour"),
		visits("day"),
		visits("requestPath", 5),
		visits("referrerHostname", 10),
		visits("deviceType"),
		visits("country", 5),
	]);
// Actions のログで、API から何件返ったかを確かめられるようにする
console.log(
	`${range.since}〜${range.until}: total=${JSON.stringify(total)} hours=${hours.length} days=${days.length} pages=${pages.length} referrers=${referrers.length} devices=${devices.length} countries=${countries.length}`,
);
const content = buildReport({ range, total, hours, days, pages, referrers, devices, countries });

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
