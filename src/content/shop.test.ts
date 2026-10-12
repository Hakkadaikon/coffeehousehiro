import assert from "node:assert/strict";
import { test } from "node:test";
import { LINE_CHAT_URL } from "./shop.ts";

test("LINEのトーク画面URLには本文や個人情報を入れない", () => {
	assert.equal(LINE_CHAT_URL, "https://line.me/R/oaMessage/%40992mqixg/");
});
