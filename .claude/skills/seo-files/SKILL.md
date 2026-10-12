---
name: seo-files
description: コーヒーhouseヒロのsitemap.xml・robots.txt・lastmod・canonical・OGP・JSON-LD・プリレンダーを保守する。「sitemap更新して」「lastmod直して」「ドメイン変わった」「SEO確認して」と頼まれたとき、またはメニューや店舗情報など本文の内容を変えたときに使う。
---

# SEOファイルの保守

サイトはトップページ1枚だけで、本番URLは`https://coffeehousehiro.vercel.app/`。

## sitemap.xml

`public/sitemap.xml`に載せるURLはトップページの1件だけでよい。`#menu`などのページ内リンクは別ページにならないので載せない。

### lastmodを更新するとき

本文の内容を変えたら、`<lastmod>`をその日の日付(`YYYY-MM-DD`)にする。

| 変更 | lastmod |
|---|---|
| メニュー・価格・送料・改定日 | 更新する |
| 住所・連絡先・LINEやInstagramのURL | 更新する |
| コンセプト文など本文の書き換え | 更新する |
| 色・文字サイズ・余白などデザインだけの変更 | 更新しない |
| 依存パッケージの更新・リファクタ | 更新しない |

日付が実際の更新とずれると、Googleはlastmodを信用しなくなる。ビルドのたびに自動で日付を入れる仕組みは、内容が変わらなくても日付が進むので使わない。

`changefreq`と`priority`はGoogleが無視するので書かない。

## robots.txt

`public/robots.txt`には、全クローラーに全体を許可する指定とsitemapの場所だけを書く。`/assets/`や`/images/`は塞がない。塞ぐとGoogleがページを正しく描画できなくなる。

## 本番URLが書かれている場所

ドメインが変わったら、次をすべて書き換える。

- `src/content/shop.ts`の`SITE_URL`
- `index.html`の`<link rel="canonical">`
- `index.html`の`og:url`
- `index.html`のJSON-LDの`@id`・`url`・`logo`
- `public/robots.txt`の`Sitemap:`
- `public/sitemap.xml`の`<loc>`

`og:image`とJSON-LDの`image`は、ビルド時に`SITE_URL`と`src/content/photos.ts`から作るので書き換えなくてよい。書き換えたら`npm test`を実行する。`src/seo.test.ts`が、`SITE_URL`とほかの場所のURLが食い違っていないかを確かめる。

## 店舗情報(NAP)をそろえる

店名・住所・連絡先は、ページ本文とJSON-LDで同じ表記にする。本文の住所・LINE・InstagramのURLと支払い方法(`PAYMENTS`)は`src/content/shop.ts`にある。JSON-LDは手で書いているので、これらを変えたら`index.html`も直す。食い違うと`npm test`が失敗する。店名は`コーヒーhouseヒロ`(半角スペースなし)、住所は`〒712-8046 岡山県倉敷市福田町福田2370-6`(番地の前にスペースを入れない)。

## プリレンダーを壊さない

`npm run build`は、通常のビルドのあとに`src/entry-server.tsx`でAppをHTMLに書き出す。続いて`prerender.mjs`が、そのHTMLを`dist/index.html`の`<div id="root"></div>`に差し込む。クライアントは`hydrateRoot`でそのHTMLを引き継ぐ。この仕組みを保つため、次の3点を守る。

- ヒーロー(`src/sections/Hero.tsx`)の`motion.div`は`initial={false}`のままにする。`initial="hidden"`に戻すと、JSの読み込みが終わるまでロゴとh1が`opacity:0`になる。
- 描画のたびに値が変わる要素(`new Date()`など)には`suppressHydrationWarning`を付ける。
- `window`や`localStorage`をコンポーネントの描画中に参照しない。参照するとサーバー側のレンダーでエラーになるので、使うときは`useEffect`の中に入れる。

## 価格と画像の目印

`index.html`の次の目印は、`prerender.mjs`がビルド時に置き換える。目印を消したり書き換えたりすると、ビルドがエラーで止まる。

| 目印 | 中身 | 元の値 |
|---|---|---|
| `__PRICE_MIN__` | 説明文の最安値 | `src/content/menu.ts` |
| `__PRICE_RANGE__` | JSON-LDの`priceRange` | `src/content/menu.ts` |
| `__HERO_IMAGE_URL__` | `og:image`とJSON-LDの`image` | `src/content/photos.ts`の`HERO` |
| `__CONCEPT_IMAGE_URL__` | JSON-LDの`image` | `src/content/photos.ts`の`CONCEPT` |

dev serverでは目印がそのまま見えるが、本番のHTMLには残らない。

## セキュリティヘッダー

`vercel.json`でCSPなどのヘッダーを全ページに付けている。外部のスクリプトや画像を足すときは、CSPの`script-src`・`img-src`などに許可を足さないと読み込めない。motionがSSRで出す`style`属性のために`style-src-attr 'unsafe-inline'`が要る。

## 確かめる

```bash
npm run build
grep -c 'キリマンジャロ' dist/index.html              # 本文がHTMLに出ているか
grep -o '<link rel="preload"[^>]*>' dist/index.html  # 先読みはヒーロー背景とロゴの2本だけ
python3 -c "import json,re;s=open('dist/index.html').read();json.loads(re.search(r'ld\+json\">(.*?)</script>',s,re.S).group(1));print('JSON-LD OK')"
```

preloadが3本以上になっていたら、ページ下の画像に`loading="lazy"`が付いているか確かめる。Reactはlazyでない`<img>`を自動でpreloadする。
