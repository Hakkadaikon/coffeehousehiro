// 焙煎度スライダーの中身。値は coffee.yaml に書き、ここでは形を検査して、スライダーの位置での色と味を計算する。
import data from "./coffee.yaml";

export type Taste = { acidity: number; bitterness: number; body: number };
export type RoastLevel = {
	name: string;
	color: string;
	about: string;
	aroma: string;
	drink: string;
	taste: Taste;
};

const fail = (path: string, want: string): never => {
	throw new Error(`coffee.yaml の ${path} は、${want}で書いてください`);
};
const text = (v: unknown, path: string) =>
	typeof v === "string" && v !== "" ? v : fail(path, "空でない文字列");
const record = (v: unknown, path: string) =>
	typeof v === "object" && v !== null && !Array.isArray(v)
		? (v as Record<string, unknown>)
		: fail(path, "「項目名: 値」の並び");
const strength = (v: unknown, path: string) =>
	typeof v === "number" && v >= 1 && v <= 5 ? v : fail(path, "1〜5の数");

/** 形が違えば読み込んだ時点で例外にして、テストとビルドを止める */
export function parseCoffee(data: unknown): { roastLevels: RoastLevel[] } {
	const { roastLevels } = record(data, "全体");
	if (!Array.isArray(roastLevels) || roastLevels.length < 2) {
		return fail("roastLevels", "2つ以上の焙煎度のリスト");
	}
	return {
		roastLevels: roastLevels.map((v, i) => {
			const path = `roastLevels の${i + 1}件目`;
			const l = record(v, path);
			const taste = record(l.taste, `${path}の taste`);
			const color = text(l.color, `${path}の color`);
			return {
				name: text(l.name, `${path}の name`),
				color: /^#[0-9A-Fa-f]{6}$/.test(color) ? color : fail(`${path}の color`, "#RRGGBB"),
				about: text(l.about, `${path}の about`),
				aroma: text(l.aroma, `${path}の aroma`),
				drink: text(l.drink, `${path}の drink`),
				taste: {
					acidity: strength(taste.acidity, `${path}の taste.acidity`),
					bitterness: strength(taste.bitterness, `${path}の taste.bitterness`),
					body: strength(taste.body, `${path}の taste.body`),
				},
			};
		}),
	};
}

export const ROAST_LEVELS = parseCoffee(data).roastLevels;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

/** スライダーの位置(0〜100)での豆の色と味。表示する焙煎度は近い方(ちょうど中間なら浅い方) */
export function roastAt(pos: number) {
	const t = (Math.min(Math.max(pos, 0), 100) / 100) * (ROAST_LEVELS.length - 1);
	const i = Math.min(Math.floor(t), ROAST_LEVELS.length - 2);
	const [from, to] = [ROAST_LEVELS[i], ROAST_LEVELS[i + 1]];
	const f = t - i;
	const [c1, c2] = [rgb(from.color), rgb(to.color)];
	const color = `#${c1
		.map((c, k) =>
			Math.round(lerp(c, c2[k], f))
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")}`;
	const taste: Taste = {
		acidity: lerp(from.taste.acidity, to.taste.acidity, f),
		bitterness: lerp(from.taste.bitterness, to.taste.bitterness, f),
		body: lerp(from.taste.body, to.taste.body, f),
	};
	return { level: ROAST_LEVELS[Math.ceil(t - 0.5)], color, taste };
}
