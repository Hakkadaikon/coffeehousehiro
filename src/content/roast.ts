// 焙煎度スライダーの中身。焙煎度ごとの豆の色・味の強さ(1〜5)・説明。
// 焙煎度の名前は、注文フォームで選べるもの(menu.ts の ROASTS)と同じにする。

export const ROAST_LEVELS = [
	{
		name: "浅煎り",
		color: "#B5804C",
		aroma: "豆によっては、柑橘や花、ベリーのような明るい香り",
		about:
			"酸味がはっきりしていて、すっきりと軽い口当たりです。産地ごとの個性がいちばん出やすい焙煎度です。",
		drink: "ブラックで。少し冷めてから飲むと、甘みと酸味がよく分かります。",
		taste: { acidity: 5, bitterness: 1, body: 2 },
	},
	{
		name: "中煎り",
		color: "#7B4A28",
		aroma: "ナッツやキャラメルのような甘い香り",
		about: "酸味と苦味のバランスがよく、甘みを感じやすい焙煎度です。毎日飲んでも飽きにくい味です。",
		drink: "ブラックでも、少しミルクを入れても合います。",
		taste: { acidity: 3, bitterness: 3, body: 3 },
	},
	{
		name: "中深煎り",
		color: "#4A2B19",
		aroma: "チョコレートやローストしたナッツのような香ばしい香り",
		about: "苦味とコクがしっかりしていて、酸味は控えめです。",
		drink: "カフェオレや、甘いお菓子と一緒に。",
		taste: { acidity: 2, bitterness: 4, body: 4 },
	},
] as const;

export type RoastLevel = (typeof ROAST_LEVELS)[number];
export type Taste = { acidity: number; bitterness: number; body: number };

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
	return { level: ROAST_LEVELS[Math.ceil(t - 0.5)] as RoastLevel, color, taste };
}
