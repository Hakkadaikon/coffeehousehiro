import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanDigits, cleanLine, LIMITS, validate } from "./form.ts";

test("1行の入力は全角を半角に寄せ、制御文字・改行・方向制御文字を消し、上限で切る", () => {
	assert.equal(cleanLine("７１２－８０４６", 10), "712-8046");
	assert.equal(cleanLine("倉敷市\n■合計 ¥0", 200), "倉敷市■合計 ¥0");
	assert.equal(cleanLine("a\u202Eb\u200Bc\u0007", 10), "abc");
	assert.equal(cleanLine("  山田  ", 50), "山田");
	assert.equal(cleanLine("あ".repeat(60), 50).length, 50);
});

test("必須項目・郵便番号・電話番号・支払い方法を検査する", () => {
	const ok = { name: "山田", postal: "712-8046", address: "倉敷市", phone: "", payment: "PayPay" };
	assert.deepEqual(validate(ok), []);
	assert.deepEqual(validate({ ...ok, postal: "7128046" }), []);
	assert.deepEqual(validate({ ...ok, phone: "090-1234-5678" }), []);
	assert.deepEqual(validate({ ...ok, name: "" }), ["name"]);
	assert.deepEqual(validate({ ...ok, postal: "712-804" }), ["postal"]);
	assert.deepEqual(validate({ ...ok, address: "" }), ["address"]);
	assert.deepEqual(validate({ ...ok, phone: "abc" }), ["phone"]);
	assert.deepEqual(validate({ ...ok, payment: "現金" }), ["payment"]);
});

test("郵便番号・電話番号は日本語入力のハイフンや〒も受け付ける", () => {
	const ok = { name: "山田", postal: "", address: "倉敷市", phone: "", payment: "PayPay" };
	for (const postal of ["712ー8046", "712−8046", "712‐8046", "〒712-8046", "〒７１２－８０４６"]) {
		assert.ok(postal.length <= LIMITS.postal, "入力欄の maxLength で切れない");
		const f = { ...ok, postal: cleanDigits(postal, LIMITS.postal) };
		assert.equal(f.postal, "712-8046");
		assert.deepEqual(validate(f), []);
	}
	const phone = cleanDigits("090ー1234ー5678", LIMITS.phone);
	assert.equal(phone, "090-1234-5678");
	assert.deepEqual(validate({ ...ok, postal: "712-8046", phone }), []);
});

test("空のフォームは必須項目をすべて指摘し、電話番号は任意", () => {
	assert.deepEqual(validate({ name: "", postal: "", address: "", phone: "", payment: "" }), [
		"name",
		"postal",
		"address",
		"payment",
	]);
});
