// アクセスレポートの文面づくり。Vercel Web Analytics API の集計結果から、Discord に送る文を作る。

type Count = { pageviews: number; visitors: number };
export type Row = Count & Record<string, unknown>;
export type Range = { since: string; until: string };
export type ReportData = {
	range: Range;
	/** 期間全体の数。訪問者は期間を通した人数 */
	total: Count;
	/** 1時間ごとの数(UTC の時刻) */
	hours: Row[];
	days: Row[];
	pages: Row[];
	referrers: Row[];
	devices: Row[];
	countries: Row[];
};

const DISCORD_LIMIT = 2000;
const WEEKDAYS = "日月火水木金土";
const JST = 9 * 3600e3;

/** 直近の 20:00(日本時間)までの24時間。20:00 に動かすと前日 20:00 から今まで。実行が遅れても区切りは 20:00 のまま */
export function last24Hours(now: Date): Range {
	const at20 = 20 * 3600e3 - JST;
	const until = Math.floor((now.getTime() - at20) / 86400e3) * 86400e3 + at20;
	return { since: new Date(until - 86400e3).toISOString(), until: new Date(until).toISOString() };
}

/** 今から days 日さかのぼった期間(分単位)。手動で動かして、今の様子を見るときに使う */
export function recent(now: Date, days: number): Range {
	const until = Math.floor(now.getTime() / 60e3) * 60e3;
	return {
		since: new Date(until - days * 86400e3).toISOString(),
		until: new Date(until).toISOString(),
	};
}

/** 1時間ごとの数を取る期間を、API の上限(168時間)に収まるよう6日ずつ正時で分ける */
export function hourChunks({ since, until }: Range): Range[] {
	const chunks: Range[] = [];
	let start = since;
	for (;;) {
		const next = Math.floor(Date.parse(start) / 3600e3) * 3600e3 + 6 * 86400e3;
		if (next >= Date.parse(until)) return [...chunks, { since: start, until }];
		const end = new Date(next).toISOString();
		chunks.push({ since: start, until: end });
		start = end;
	}
}

const md = (date: string) => `${date.slice(5, 7)}/${date.slice(8, 10)}`;
const mdw = (date: string) => `${md(date)}（${WEEKDAYS[new Date(date).getUTCDay()]}）`;
/** 日時を日本時間の「10/12（月）20:00」に */
const jst = (iso: string) => {
	const t = new Date(Date.parse(iso) + JST).toISOString();
	return `${mdw(t.slice(0, 10))}${Number(t.slice(11, 13))}:${t.slice(14, 16)}`;
};

/** ページビューの多い時間帯(日本時間)を3つ。日をまたいで同じ時刻どうしを足す */
const busyHours = (hours: Row[]) => {
	const views = new Map<number, number>();
	for (const h of hours) {
		const hour = (new Date(String(h.timestamp)).getUTCHours() + 9) % 24;
		views.set(hour, (views.get(hour) ?? 0) + h.pageviews);
	}
	const top3 = [...views]
		.filter(([, n]) => n > 0)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);
	return top3.length === 0 ? "なし" : top3.map(([hour, n]) => `${hour}時台 ${n}回`).join(" / ");
};

/** 「名前 n人」を並べた1行。空なら「なし」 */
const top = (rows: Row[], key: string, unit: (r: Row) => string) =>
	rows.length === 0
		? "なし"
		: rows.map((r) => `${String(r[key] || "直接・不明")} ${unit(r)}`).join(" / ");

export function buildReport({
	range,
	total,
	hours,
	days,
	pages,
	referrers,
	devices,
	countries,
}: ReportData) {
	const people = (r: Row) => `${r.visitors}人`;
	const oneDay = Date.parse(range.until) - Date.parse(range.since) <= 86400e3;
	const lines = [
		`**コーヒーhouseヒロ アクセス（${jst(range.since)}〜${jst(range.until)}）**`,
		`訪問者 ${total.visitors}人・ページビュー ${total.pageviews}回`,
		...(total.pageviews === 0 ? ["この期間のアクセスはありません。"] : []),
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
		`**アクセスの多い時間帯** ${busyHours(hours)}`,
		`**よく見られたページ** ${top(pages, "requestPath", (r) => `${r.pageviews}回`)}`,
		`**リファラー（参照元）** ${top(referrers, "referrerHostname", people)}`,
		`**端末** ${top(devices, "deviceType", people)}`,
		`**国・地域** ${top(countries, "country", people)}`,
	];
	const text = lines.join("\n");
	return text.length <= DISCORD_LIMIT ? text : `${text.slice(0, DISCORD_LIMIT - 1)}…`;
}
