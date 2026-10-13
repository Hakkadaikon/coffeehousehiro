// 毎日のアクセスレポートの文面づくり。Vercel Web Analytics API の集計結果から、Discord に送る文を作る。

type Count = { pageviews: number; visitors: number };
export type Row = Count & Record<string, unknown>;
export type Range = { since: string; until: string };
export type ReportData = {
	range: Range;
	days: Row[];
	pages: Row[];
	referrers: Row[];
	devices: Row[];
	countries: Row[];
};

const DISCORD_LIMIT = 2000;
const WEEKDAYS = "日月火水木金土";
const JST = 9 * 3600e3;

const isoDate = (t: number) => new Date(t).toISOString().slice(0, 10);

const todayJst = (now: Date) => Date.parse(isoDate(now.getTime() + JST));

/** 直近の 20:00(日本時間)までの24時間。20:00 に動かすと前日 20:00 から今まで。実行が遅れても区切りは 20:00 のまま */
export function last24Hours(now: Date): Range {
	const at20 = 20 * 3600e3 - JST;
	const until = Math.floor((now.getTime() - at20) / 86400e3) * 86400e3 + at20;
	return { since: new Date(until - 86400e3).toISOString(), until: new Date(until).toISOString() };
}

/**
 * 今日を含む直近7日間(日本時間)。手動で動かして、今の様子を見るときに使う。
 * 日別の集計は UTC の日付で区切られる(日本時間の 9:00 が日の変わり目)ので、UTC の日付で最終日の終わりまでを渡す
 */
export function recentWeek(now: Date): Range {
	const today = todayJst(now);
	return {
		since: `${isoDate(today - 6 * 86400e3)}T00:00:00.000Z`,
		until: `${isoDate(today)}T23:59:59.999Z`,
	};
}

const md = (date: string) => `${date.slice(5, 7)}/${date.slice(8, 10)}`;
const mdw = (date: string) => `${md(date)}（${WEEKDAYS[new Date(date).getUTCDay()]}）`;
/** 日時を日本時間の「10/12（月）20:00」に */
const jst = (iso: string) => {
	const t = new Date(Date.parse(iso) + JST).toISOString();
	return `${mdw(t.slice(0, 10))}${Number(t.slice(11, 13))}:${t.slice(14, 16)}`;
};
const sum = (rows: Row[], key: keyof Count) => rows.reduce((n, r) => n + r[key], 0);

/** 「名前 n人」を並べた1行。空なら「なし」 */
const top = (rows: Row[], key: string, unit: (r: Row) => string) =>
	rows.length === 0
		? "なし"
		: rows.map((r) => `${String(r[key] || "直接・不明")} ${unit(r)}`).join(" / ");

export function buildReport({ range, days, pages, referrers, devices, countries }: ReportData) {
	const people = (r: Row) => `${r.visitors}人`;
	const oneDay = Date.parse(range.until) - Date.parse(range.since) <= 86400e3;
	const lines = [
		`**コーヒーhouseヒロ アクセス（${jst(range.since)}〜${jst(range.until)}）**`,
		// 訪問者は日ごとに数えるので、複数日の合計は延べ人数
		`訪問者 ${sum(days, "visitors")}人・ページビュー ${sum(days, "pageviews")}回`,
		...(days.length === 0 ? ["この期間のアクセスはありません。"] : []),
		"",
		...(oneDay
			? []
			: [
					"**日別**",
					...(days.length === 0
						? ["なし"]
						: days.map(
								(d) => `${mdw(String(d.timestamp).slice(0, 10))} ${d.visitors}人・${d.pageviews}回`,
							)),
					"",
				]),
		`**よく見られたページ** ${top(pages, "requestPath", (r) => `${r.pageviews}回`)}`,
		`**リファラー（参照元）** ${top(referrers, "referrerHostname", people)}`,
		`**端末** ${top(devices, "deviceType", people)}`,
		`**国・地域** ${top(countries, "country", people)}`,
	];
	const text = lines.join("\n");
	return text.length <= DISCORD_LIMIT ? text : `${text.slice(0, DISCORD_LIMIT - 1)}…`;
}
