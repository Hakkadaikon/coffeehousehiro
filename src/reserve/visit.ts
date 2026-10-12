// 来店予約フォームの中身。日付と曜日・祝日、選べる時刻、LINE で送るメッセージを作る。
// 空き状況や営業日は扱わない(営業日は Instagram で知らせ、空きは店主が返事で伝える)。
import { VISIT } from "../content/shop.ts";

/** 日付。m は 1〜12 */
export type Day = { y: number; m: number; d: number };

/** 月や日がはみ出しても Date が繰り上げるので、そのまま足し引きしてよい */
const date = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const key = (t: Date) => `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
const weekday = ({ y, m, d }: Day) => date(y, m, d).getDay();

/** m月の第n月曜日 */
const nthMonday = (y: number, m: number, n: number) =>
	1 + ((8 - date(y, m, 1).getDay()) % 7) + (n - 1) * 7;

/** 春分・秋分の日。2099年まで使える近似式 */
const equinox = (y: number, base: number) =>
	Math.floor(base + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));

const cache = new Map<number, Set<string>>();

/** その年の祝日(振替休日と国民の休日を含む)。2020年・2021年の五輪による移動は扱わない */
const holidaysOf = (y: number) => {
	const hit = cache.get(y);
	if (hit) return hit;
	const base = [
		[1, 1],
		[1, nthMonday(y, 1, 2)],
		[2, 11],
		[2, 23],
		[3, equinox(y, 20.8431)],
		[4, 29],
		[5, 3],
		[5, 4],
		[5, 5],
		[7, nthMonday(y, 7, 3)],
		[8, 11],
		[9, nthMonday(y, 9, 3)],
		[9, equinox(y, 23.2488)],
		[10, nthMonday(y, 10, 2)],
		[11, 3],
		[11, 23],
	].map(([m, d]) => date(y, m, d));
	const baseKeys = new Set(base.map(key));
	const all = new Set(baseKeys);
	for (const t of base) {
		const [m, d] = [t.getMonth() + 1, t.getDate()];
		// 日曜の祝日は、その後のいちばん近い祝日でない日を休日にする
		if (t.getDay() === 0) {
			let k = 1;
			while (baseKeys.has(key(date(y, m, d + k)))) k++;
			all.add(key(date(y, m, d + k)));
		}
		// 祝日にはさまれた日は休日にする
		const next = date(y, m, d + 1);
		if (baseKeys.has(key(date(y, m, d + 2))) && !baseKeys.has(key(next)) && next.getDay() !== 0) {
			all.add(key(next));
		}
	}
	cache.set(y, all);
	return all;
};

export const isHoliday = ({ y, m, d }: Day) => holidaysOf(y).has(key(date(y, m, d)));

/** 土日・祝日 */
export const isRestDay = (day: Day) => [0, 6].includes(weekday(day)) || isHoliday(day);

/** その日に選べる来店の開始時刻。終わりの1時間前まで、30分ごと */
export const startTimes = (day: Day) => {
	const [open, close] = isRestDay(day) ? VISIT.holidayHours : VISIT.weekdayHours;
	return Array.from({ length: (close - open) * 2 - 1 }, (_, i) => {
		const minutes = open * 60 + i * 30;
		return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
	});
};

/** 月のカレンダーのマス。日曜始まりで、前後の月の日で週を埋める */
export const monthCells = (y: number, m: number) => {
	const first = 1 - date(y, m, 1).getDay();
	const last = date(y, m + 1, 0);
	const end = last.getDate() + 6 - last.getDay();
	return Array.from({ length: end - first + 1 }, (_, i) => {
		const t = date(y, m, first + i);
		return {
			y: t.getFullYear(),
			m: t.getMonth() + 1,
			d: t.getDate(),
			inMonth: t.getMonth() === m - 1,
		};
	});
};

export const formatDay = (day: Day) =>
	`${day.y}年${day.m}月${day.d}日（${"日月火水木金土"[weekday(day)]}）`;

export type Reservation = { day: Day; time: string; guests: number; name: string; note: string };

/** LINE でお店に送る来店予約のメッセージ */
export const buildReserveMessage = (r: Reservation) =>
	[
		"【ご来店予約のお願い】",
		`ご希望日：${formatDay(r.day)}`,
		`ご希望時刻：${r.time}〜`,
		`人数：${r.guests}名`,
		`お名前：${r.name}`,
		`ご要望：${r.note || "なし"}`,
		"",
		"空き状況をご確認のうえ、お返事をお願いします。",
	].join("\n");
