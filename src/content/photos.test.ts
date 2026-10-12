import assert from "node:assert/strict";
import { test } from "node:test";
import { INSTAGRAM_TILES, PHOTOS } from "./photos.ts";

test("Instagram欄には写真をすべて1回ずつ並べる", () => {
	assert.equal(INSTAGRAM_TILES.length, PHOTOS.length);
	assert.deepEqual(new Set(INSTAGRAM_TILES), new Set(PHOTOS));
});
