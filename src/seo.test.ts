import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { PHOTOS } from "./content/photos.ts";
import {
	ADDRESS,
	ADDRESS_PARTS,
	EMAIL,
	INSTAGRAM_URL,
	LINE_URL,
	MAP_URL,
	PAYMENTS,
	POSTAL,
	SHOP_NAME,
	SITE_URL,
} from "./content/shop.ts";
import { placeholders } from "./placeholders.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html");
// ビルドと同じく、目印を src/content の値で埋めてから読む
let filled = html;
for (const [key, value] of Object.entries(placeholders())) filled = filled.replaceAll(key, value);
const ldText = filled.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";
const ld = JSON.parse(ldText);

test("検索エンジン向けの店舗情報は、サイトの店名・住所・連絡先・支払い方法・SNSと同じ", () => {
	assert.equal(ld.name, SHOP_NAME);
	assert.equal(ld.email, EMAIL);
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

// src 以下の全コンポーネントのソース。アイコンの参照を探すのに使う
const SOURCES = readdirSync(new URL("./", import.meta.url), { recursive: true })
	.filter((f) => String(f).endsWith(".tsx"))
	.map((f) => read(`src/${f}`))
	.join("\n");
const IMAGE_FILES = readdirSync(new URL("../public/images/", import.meta.url));
// 写真以外の画像。役割で名前を決めていて、index.html と src 以下のコンポーネントから直接参照している
const ICONS = ["logo.webp", "favicon.png", "apple-touch-icon.png"];

test("写真のファイル名は「2桁の連番_英語の要約」で、番号は1から順に並ぶ", () => {
	const names = PHOTOS.map((p) => p.src.replace("/images/", ""));
	names.forEach((name, i) => {
		assert.match(name, /^\d{2}_[a-z0-9]+(-[a-z0-9]+)*\.jpeg$/, name);
		assert.equal(Number(name.slice(0, 2)), i + 1, name);
	});
});

test("public/images には、写真リストとアイコンにある画像だけを置き、どれも実在する", () => {
	const expected = [...PHOTOS.map((p) => p.src.replace("/images/", "")), ...ICONS];
	assert.deepEqual([...IMAGE_FILES].sort(), [...expected].sort());
	for (const icon of ICONS) {
		assert.ok(html.includes(`/images/${icon}`) || SOURCES.includes(`/images/${icon}`), icon);
	}
});

test("ページの表示に外部のサーバーを使わない（フォントも自前で配信する）", () => {
	// canonical は自分の URL を指すだけで、読み込みは起きない
	const loads = (html.match(/<link [^>]*>/g) ?? []).filter((l) => !l.includes('rel="canonical"'));
	for (const l of loads) assert.doesNotMatch(l, /href="https?:/, l);
	const vercel = JSON.parse(read("vercel.json"));
	const csp: string = vercel.headers[0].headers.find(
		(h: { key: string }) => h.key === "Content-Security-Policy",
	).value;
	assert.doesNotMatch(csp, /https?:/);
});

test("特定商取引法に基づく表記のページはビルドに含め、フッターからリンクし、検索結果には出さない", () => {
	assert.match(read("vite.config.ts"), /"legal\.html"/);
	assert.match(read("legal.html"), /<meta name="robots" content="noindex" \/>/);
	assert.ok(read("src/sections/SiteFooter.tsx").includes('href="/legal"'));
	assert.equal(JSON.parse(read("vercel.json")).cleanUrls, true);
});

test("index.html には店名・住所・連絡先を直接書かず、business.yaml の値をビルド時に入れる", () => {
	for (const v of [SHOP_NAME, POSTAL, ADDRESS_PARTS.street, EMAIL, INSTAGRAM_URL, LINE_URL]) {
		assert.ok(!html.includes(v), v);
		assert.ok(filled.includes(v), v);
	}
});
