---
name: update-menu
description: コーヒーhouseヒロのメニュー・価格・送料・改定日を更新する。メニュー表の画像やテキストを渡されて「メニュー更新して」「価格変わった」「新しい豆を追加」「〇〇を削除して」と頼まれたときに使う。価格の変更に合わせてSEO用のメタ情報とsitemapのlastmodも更新する。
---

# メニュー・価格の更新

メニューのデータは`src/App.tsx`冒頭の定数にまとまっている。表示用のJSXは触らずに、データだけを書き換える。

## 1. 元資料を読む

メニュー表の画像はReadで開き、全品目の品名・補足(産地や農園)・100g/200gの価格・カテゴリを書き出す。画像の誤字はサイト側で直し(例: `SINGRE`をシングルに)、直した箇所をユーザーへの報告に含める。

単位がほかと違う品目(例: パナマの20g/100g)は画像のとおりに転記し、報告で確認を求める。画像に載っていない既存の品目は勝手に消さず、ユーザーに確認する。

画像にLINEなどのQRコードがあれば、OpenCVの`wechat_qrcode_WeChatQRCode`でURLを読める。通常の`QRCodeDetector`は、中央にロゴがあるQRコードを読めない。

## 2. `src/App.tsx`を書き換える

| 定数・箇所 | 内容 |
|---|---|
| `MENU_START_DATE` | 改定日。`"2026年10月1日"`の形式 |
| `MENU` | カテゴリごとの`title`・`note`・`unit`・`items` |
| `items`の各要素 | `[品名, 補足, 価格]`。補足がなければ`""`。価格は`"¥450 / ¥850"`の形式 |
| 送料 | `¥270`の`<span>`と、その前後の文言 |
| `LINE_URL` | LINE公式アカウントのURL |

カテゴリの番号(01〜04)は配列の順番から自動で付く。枠とLIMITEDラベルが付くのは`title`が`"スペシャル"`のカテゴリだけなので、名前を変えるときはJSXの条件もそろえる。品目の`key`は品名と補足をつなげて作っているため、同じ品名を並べるときは補足を変える。

## 3. SEO用の値をそろえる

価格や商品構成が変わったら、`index.html`の次の箇所を合わせる。

- `<meta name="description">`の「100g ¥450〜」(最安値)
- JSON-LDの`priceRange`(最安値〜最高値。例: `"¥450〜¥2,200"`)
- JSON-LDの`paymentAccepted`(支払い方法が変わったときだけ)

そのあと`public/sitemap.xml`の`<lastmod>`を今日の日付にする。手順は`seo-files` skillに従う。

## 4. 確かめる

```bash
npm run build
grep -o '¥450 / ¥850' dist/index.html | head -1   # 新しい価格がHTMLに出ているか
```

ビルドの最後にプリレンダーが実行され、`dist/index.html`にメニューが書き出される。新しい品名と価格がgrepで見つかれば反映できている。

見た目は`npm run dev`を実行し、http://localhost:3000 の`#menu`で確かめる。スマホ幅(390px)で品名や価格が折り返していないかも見る。

## 5. コミット

conventional commitで`feat: update menu and prices from YYYY-MM-DD`のように書き、改定日をメッセージに入れる。
