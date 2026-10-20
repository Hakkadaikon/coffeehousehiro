// アクセスレポートの文面づくり。Vercel Web Analytics と PostHog の集計結果から、Discord の埋め込み(embed)を作る。

type Count = { pageviews: number; visitors: number };
export type Row = Count & Record<string, unknown>;
export type Range = { since: string; until: string };
type Funnel = { opened: number; sent: number };
type Opens = { clicks: number; people: number };
/** PostHog から集計した、ページの中での動き */
export type Behavior = {
	/** 押されたボタン・リンクの文言と回数(多い順) */
	buttons: [string, number][];
	forms: { order: Funnel; reserve: Funnel };
	/** Instagram と LINE(お問い合わせ・友だち追加)へのリンクを押した回数と人数 */
	links: { instagram: Opens; line: Opens };
	/** ページを離れたときのスクロール位置ごとの回数。最後まで(90%以上)・半分まで(50%以上)・最初だけ */
	scroll: { end: number; half: number; top: number };
};
export type ReportData = {
	/** 見出しに書く名前。毎日は「アクセス」、ほかに「週間アクセス」「月間アクセス」 */
	name?: string;
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
	/** PostHog の集計。取れなかったときは null、PostHog を使わないときは undefined */
	behavior?: Behavior | null;
};

/** Discord の埋め込みの項目の値の上限 */
const FIELD_LIMIT = 1024;
/** お店の色(caramel) */
const COLOR = 0x8e5a35;
const WEEKDAYS = "日月火水木金土";
const JST = 9 * 3600e3;

/** 直近の 20:00(日本時間)までの24時間。20:00 に動かすと前日 20:00 から今まで。実行が遅れても区切りは 20:00 のまま */
export function last24Hours(now: Date): Range {
	const at20 = 20 * 3600e3 - JST;
	const until = Math.floor((now.getTime() - at20) / 86400e3) * 86400e3 + at20;
	return { since: new Date(until - 86400e3).toISOString(), until: new Date(until).toISOString() };
}

/**
 * 定期実行で送るレポート。金曜は前の金曜 20:00 からの週間、月末日は前月末日 20:00 からの月間。ほかの日は送らない。
 * 曜日と日付は、集計の区切り(20:00 日本時間)の日で決める
 */
export function scheduled(now: Date): { name: string; range: Range }[] {
	const day = last24Hours(now);
	const until = Date.parse(day.until);
	const today = new Date(until + JST);
	const iso = (t: number) => new Date(t).toISOString();
	return [
		...(today.getUTCDay() === 5
			? [{ name: "週間アクセス", range: { since: iso(until - 7 * 86400e3), until: day.until } }]
			: []),
		...(new Date(until + JST + 86400e3).getUTCDate() === 1
			? [
					{
						name: "月間アクセス",
						range: {
							// 前月の末日 20:00(日本時間)
							since: iso(
								Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0) + 20 * 3600e3 - JST,
							),
							until: day.until,
						},
					},
				]
			: []),
	];
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

type Field = { name: string; value: string; inline?: boolean };
type Embed = { title: string; description?: string; color: number; fields?: Field[] };

/** 値が空なら「なし」、長すぎれば上限で切る。inline は横に並べる(1行に3つまで) */
const field = (name: string, lines: string[], inline = true): Field => {
	const value = lines.length === 0 ? "なし" : lines.join("\n");
	return {
		name,
		value: value.length <= FIELD_LIMIT ? value : `${value.slice(0, FIELD_LIMIT - 1)}…`,
		inline,
	};
};

/** ページビューの多い時間帯(日本時間)を3つ。日をまたいで同じ時刻どうしを足す */
const busyHours = (hours: Row[]) => {
	const views = new Map<number, number>();
	for (const h of hours) {
		const hour = (new Date(String(h.timestamp)).getUTCHours() + 9) % 24;
		views.set(hour, (views.get(hour) ?? 0) + h.pageviews);
	}
	return [...views]
		.filter(([, n]) => n > 0)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([hour, n]) => `${hour}時台 ${n}回`);
};

/** 「名前 n人」を1行ずつ */
const top = (rows: Row[], key: string, unit: (r: Row) => string) =>
	rows.map((r) => `${String(r[key] || "直接・不明")} ${unit(r)}`);

const funnel = ({ opened, sent }: Funnel) => [`開いた ${opened}人`, `メッセージをコピー ${sent}人`];

const opens = ({ clicks, people }: Opens) => [`${clicks}回（${people}人）`];

function behaviorEmbed(b: Behavior | null): Embed {
	const title = "ページ内の動き（PostHog）";
	if (!b) return { title, color: COLOR, description: "PostHog の集計は取得できませんでした。" };
	const { end, half, top } = b.scroll;
	const all = end + half + top;
	const pct = (n: number) => `${Math.round((n / all) * 100)}%`;
	return {
		title,
		color: COLOR,
		fields: [
			field(
				"押されたボタン",
				b.buttons.map(([t, n]) => `${t} ${n}回`),
				false,
			),
			field("注文フォーム", funnel(b.forms.order)),
			field("来店予約フォーム", funnel(b.forms.reserve)),
			field(
				"どこまで読まれたか",
				all === 0 ? [] : [`最後まで ${pct(end)}`, `半分まで ${pct(half)}`, `最初だけ ${pct(top)}`],
			),
			field("Instagramを開いた", opens(b.links.instagram)),
			field("LINEを開いた", opens(b.links.line)),
		],
	};
}

const date = (d: Row) => String(d.timestamp).slice(0, 10);
const sum = (rows: Row[], key: keyof Count) => rows.reduce((n, r) => n + r[key], 0);

/** 日ごとの数。9日以上(1週間を選ぶと、期間の始まりの日を含めて8日分返る)は7日ずつの週別にまとめる。どちらも、ページビューがいちばん多かった日を添える */
function dailyFields(days: Row[]): Field[] {
	const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) =>
		days.slice(i * 7, i * 7 + 7),
	);
	const best = days.reduce<Row | undefined>(
		(a, d) => (a && a.pageviews >= d.pageviews ? a : d),
		undefined,
	);
	return [
		days.length <= 8
			? field(
					"日別",
					days.map((d) => `${mdw(date(d))} ${d.visitors}人・${d.pageviews}回`),
					false,
				)
			: field(
					"週別",
					weeks.map(
						(w) =>
							`${md(date(w[0]))}〜${md(date(w[w.length - 1]))} ${sum(w, "visitors")}人・${sum(w, "pageviews")}回`,
					),
					false,
				),
		field(
			"いちばん多かった日",
			best && best.pageviews > 0 ? [`${mdw(date(best))} ${best.pageviews}回`] : [],
		),
	];
}

export function buildReport({
	name = "アクセス",
	range,
	total,
	hours,
	days,
	pages,
	referrers,
	devices,
	countries,
	behavior,
}: ReportData): { embeds: Embed[] } {
	const people = (r: Row) => `${r.visitors}人`;
	const oneDay = Date.parse(range.until) - Date.parse(range.since) <= 86400e3;
	const access: Embed = {
		title: `コーヒーhouseヒロ ${name}（${jst(range.since)}〜${jst(range.until)}）`,
		...(total.pageviews === 0 ? { description: "この期間のアクセスはありません。" } : {}),
		color: COLOR,
		fields: [
			field("訪問者", [`${total.visitors}人`]),
			field("ページビュー", [`${total.pageviews}回`]),
			field("アクセスの多い時間帯", busyHours(hours)),
			...(oneDay ? [] : dailyFields(days)),
			field("リファラー（参照元）", top(referrers, "referrerHostname", people)),
			field("端末", top(devices, "deviceType", people)),
			field("国・地域", top(countries, "country", people)),
			field(
				"よく見られたページ",
				top(pages, "requestPath", (r) => `${r.pageviews}回`),
				false,
			),
		],
	};
	return { embeds: behavior === undefined ? [access] : [access, behaviorEmbed(behavior)] };
}
