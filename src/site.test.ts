import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PAYMENTS } from "./order.ts";
import { ADDRESS, INSTAGRAM_URL, LINE_URL, MAP_URL, POSTAL, SITE_URL } from "./shop.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html");
const ldText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";
// ビルド時に入る目印を仮の値に置き換えてから読む
const ld = JSON.parse(ldText.replaceAll("__PRICE_RANGE__", "¥1〜¥2"));

test("検索エンジン向けの店舗情報は、サイトの住所・支払い方法・SNSと同じ", () => {
	const a = ld.address;
	assert.equal(a.postalCode, POSTAL);
	assert.equal(`${a.addressRegion}${a.addressLocality}${a.streetAddress}`, ADDRESS);
	assert.equal(ld.paymentAccepted, PAYMENTS.join(", "));
	assert.deepEqual(ld.sameAs, [INSTAGRAM_URL, LINE_URL]);
});

test("本番URLはcanonical・OGP・店舗情報・sitemap・robots.txtでそろっている", () => {
	assert.ok(html.includes(`<link rel="canonical" href="${SITE_URL}" />`));
	assert.ok(html.includes(`<meta property="og:url" content="${SITE_URL}" />`));
	assert.equal(ld.url, SITE_URL);
	assert.ok(ld["@id"].startsWith(SITE_URL));
	assert.ok(read("public/sitemap.xml").includes(`<loc>${SITE_URL}</loc>`));
	assert.ok(read("public/robots.txt").includes(`Sitemap: ${SITE_URL}sitemap.xml`));
});

test("sitemapのlastmodはYYYY-MM-DDで、未来の日付にしない", () => {
	const lastmod = read("public/sitemap.xml").match(/<lastmod>(.*)<\/lastmod>/)?.[1] ?? "";
	assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/);
	const todayJst = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
	assert.ok(lastmod <= todayJst);
});

test("Googleマップのリンクは住所で検索する", () => {
	const url = new URL(MAP_URL);
	assert.equal(url.origin + url.pathname, "https://www.google.com/maps/search/");
	assert.equal(url.searchParams.get("api"), "1");
	assert.equal(url.searchParams.get("query"), ADDRESS);
});
