import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBusiness } from "../content/business.ts";
import data from "../content/business.yaml";
import {
	buildReserveMessage,
	formatDay,
	isHoliday,
	isRestDay,
	monthCells,
	startTimes,
} from "./visit.ts";

// 内閣府「国民の祝日について」の一覧(振替休日・国民の休日を含む)
const OFFICIAL = {
	2026: "1-1 1-12 2-11 2-23 3-20 4-29 5-3 5-4 5-5 5-6 7-20 8-11 9-21 9-22 9-23 10-12 11-3 11-23",
	2027: "1-1 1-11 2-11 2-23 3-21 3-22 4-29 5-3 5-4 5-5 7-19 8-11 9-20 9-23 10-11 11-3 11-23",
};

test("祝日は、振替休日と国民の休日を含めて内閣府の一覧と同じ", () => {
	for (const [year, list] of Object.entries(OFFICIAL)) {
		const y = Number(year);
		const found: string[] = [];
		for (let m = 1; m <= 12; m++) {
			for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) {
				if (isHoliday({ y, m, d })) found.push(`${m}-${d}`);
			}
		}
		assert.equal(found.join(" "), list, year);
	}
});

test("土日と祝日は休日、それ以外は平日", () => {
	assert.ok(isRestDay({ y: 2026, m: 10, d: 10 })); // 土
	assert.ok(isRestDay({ y: 2026, m: 10, d: 11 })); // 日
	assert.ok(isRestDay({ y: 2026, m: 10, d: 12 })); // スポーツの日
	assert.ok(!isRestDay({ y: 2026, m: 10, d: 13 }));
});

test("選べる開始時刻は30分ごとで、平日は18時から、休日は10時から、終わりの1時間前まで", () => {
	assert.deepEqual(startTimes({ y: 2026, m: 10, d: 13 }), [
		"18:00",
		"18:30",
		"19:00",
		"19:30",
		"20:00",
		"20:30",
		"21:00",
		"21:30",
		"22:00",
	]);
	const holiday = startTimes({ y: 2026, m: 10, d: 12 });
	assert.equal(holiday[0], "10:00");
	assert.equal(holiday[1], "10:30");
	assert.equal(holiday.at(-1), "22:00");
	assert.equal(holiday.length, 25);
});

test("月のカレンダーは日曜始まりで、前後の月の日で週を埋める", () => {
	const oct = monthCells(2026, 10);
	assert.equal(oct.length, 35);
	assert.deepEqual(oct[0], { y: 2026, m: 9, d: 27, inMonth: false });
	assert.deepEqual(oct[4], { y: 2026, m: 10, d: 1, inMonth: true });
	assert.deepEqual(oct.at(-1), { y: 2026, m: 10, d: 31, inMonth: true });
	const feb = monthCells(2026, 2); // 日曜から始まり、28日で終わる
	assert.equal(feb.length, 28);
	assert.ok(feb.every((c) => c.inMonth));
	const dec = monthCells(2026, 12); // 年をまたぐ
	assert.deepEqual(dec.at(-1), { y: 2027, m: 1, d: 2, inMonth: false });
});

test("日付は曜日付きで書く", () => {
	assert.equal(formatDay({ y: 2026, m: 10, d: 17 }), "2026年10月17日（土）");
});

test("来店予約のメッセージ。ご要望が空なら「なし」と書く", () => {
	const text = buildReserveMessage({
		day: { y: 2026, m: 10, d: 17 },
		time: "14:00",
		guests: 2,
		name: "山田 太郎",
		note: "",
	});
	assert.equal(
		text,
		[
			"【ご来店予約のお願い】",
			"ご希望日：2026年10月17日（土）",
			"ご希望時刻：14:00〜",
			"人数：2名",
			"お名前：山田 太郎",
			"ご要望：なし",
			"",
			"空き状況をご確認のうえ、お返事をお願いします。",
		].join("\n"),
	);
});

test("business.yaml の来店の時間帯は、開始が終わりより前の0〜24時", () => {
	const visit = (patch: object) => {
		const d = data as { shop: { visit: object } };
		return { ...d, shop: { ...d.shop, visit: { ...d.shop.visit, ...patch } } };
	};
	assert.doesNotThrow(() => parseBusiness(data));
	assert.throws(() => parseBusiness(visit({ weekdayHours: [23, 18] })), /weekdayHours/);
	assert.throws(() => parseBusiness(visit({ holidayHours: [10, 25] })), /holidayHours/);
	assert.throws(() => parseBusiness(visit({ maxGuests: 0 })), /maxGuests/);
});
