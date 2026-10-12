import assert from "node:assert/strict";
import { test } from "node:test";
import { ROASTS } from "./menu.ts";
import { parseCoffee, ROAST_LEVELS, roastAt } from "./roast.ts";

test("スライダーの焙煎度は、注文フォームで選べる焙煎度と同じ並び", () => {
	assert.deepEqual(
		ROAST_LEVELS.map((l) => l.name),
		ROASTS.filter((r) => r !== "おまかせ"),
	);
});

test("両端と真ん中では、その焙煎度の色と味になる", () => {
	for (const [pos, level] of [
		[0, ROAST_LEVELS[0]],
		[50, ROAST_LEVELS[1]],
		[100, ROAST_LEVELS[2]],
	] as const) {
		const r = roastAt(pos);
		assert.equal(r.level, level);
		assert.equal(r.color, level.color.toLowerCase());
		assert.deepEqual(r.taste, level.taste);
	}
});

test("焙煎度の間では、色と味が連続して変わり、近い方の焙煎度を表示する", () => {
	const r = roastAt(25);
	assert.equal(r.level, ROAST_LEVELS[0]);
	assert.equal(roastAt(26).level, ROAST_LEVELS[1]);
	const [a, b] = [ROAST_LEVELS[0].taste.acidity, ROAST_LEVELS[1].taste.acidity];
	assert.equal(r.taste.acidity, (a + b) / 2);
});

test("範囲外の位置は端の焙煎度にする", () => {
	assert.equal(roastAt(-10).level, ROAST_LEVELS[0]);
	assert.equal(roastAt(120).level, ROAST_LEVELS[2]);
});

test("coffee.yaml の形が違うときは、読み込んだ時点で失敗する", () => {
	const level = ROAST_LEVELS[0];
	const bad = (patch: object) => ({ roastLevels: [{ ...level, ...patch }, ROAST_LEVELS[1]] });
	assert.doesNotThrow(() => parseCoffee({ roastLevels: ROAST_LEVELS }));
	assert.throws(() => parseCoffee({}), /roastLevels/);
	assert.throws(() => parseCoffee({ roastLevels: [level] }), /roastLevels/);
	assert.throws(() => parseCoffee(bad({ color: "brown" })), /color/);
	assert.throws(() => parseCoffee(bad({ about: "" })), /about/);
	assert.throws(() => parseCoffee(bad({ taste: { ...level.taste, body: 6 } })), /body/);
});
