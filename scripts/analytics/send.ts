// 先週のアクセスを Vercel Web Analytics API から集計し、Discord に送る。GitHub Actions(analytics-report.yml)から動かす。
// 環境変数: VERCEL_TOKEN, VERCEL_PROJECT_ID, DISCORD_WEBHOOK_URL(必須)、VERCEL_TEAM_ID(チームのプロジェクトのときだけ)
// --dry-run を付けると、Discord に送らずに文面を表示する。REPORT_RECENT=true で今日を含む直近7日間を集計する。
import { buildReport, lastWeek, type Row, recentWeek } from "./report.ts";

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
// 手動実行(REPORT_RECENT=true)は今日を含む直近7日間、定期実行は先週の月曜〜日曜
const range = (process.env.REPORT_RECENT === "true" ? recentWeek : lastWeek)(new Date());

/** visits/aggregate を by で分けて取る */
async function visits(by: string, limit?: number): Promise<Row[]> {
	const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
	const params = {
		projectId,
		since: range.since,
		until: range.until,
		by,
		limit: limit?.toString(),
	};
	for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, value);
	if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
	const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`Vercel API ${by}: ${res.status} ${await res.text()}`);
	return (await res.json()).data;
}

const [days, pages, referrers, devices, countries] = await Promise.all([
	visits("day"),
	visits("requestPath", 5),
	visits("referrerHostname", 10),
	visits("deviceType"),
	visits("country", 5),
]);
// Actions のログで、API から何件返ったかを確かめられるようにする
console.log(
	`${range.since}〜${range.until}: days=${days.length} pages=${pages.length} referrers=${referrers.length} devices=${devices.length} countries=${countries.length}`,
);
const content = buildReport({ range, days, pages, referrers, devices, countries });

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
