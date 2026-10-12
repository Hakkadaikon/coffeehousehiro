import assert from "node:assert/strict";
import { test } from "node:test";
import { CERTIFICATE, INSTAGRAM_TILES, PHOTOS } from "./photos.ts";

test("Instagram欄には、資格の認定証を除く写真をすべて1回ずつ並べる", () => {
	const shopPhotos = PHOTOS.filter((p) => p !== CERTIFICATE);
	assert.equal(INSTAGRAM_TILES.length, shopPhotos.length);
	assert.deepEqual(new Set(INSTAGRAM_TILES), new Set(shopPhotos));
});
