# メニュー・画像の更新

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。メニューの更新は `update-menu` skillに頼みます(「メニュー更新して」とメニュー表の画像を渡す)。手で直すときは、以下の場所を書き換えてください。詳しくは[AIでの更新](ai-maintenance.md)を見てください。

## メニュー・価格

メニューの品名・サイズ・価格は `src/menu.ts` だけに書いています。サイトのメニュー表、注文フォーム、検索エンジン向けの価格帯はすべてここから作るので、メニューが変わったときに書き換えるのはこのファイルだけです。

メニューを変えたら、`public/sitemap.xml` の `<lastmod>` をその日の日付にしてください。

## 店舗情報・送料

送料とLINE公式アカウントのIDは `src/order.ts` に、住所とSNSのURLは `src/shop.ts` にあります。

## 画像

画像は `public/images/` に入っています。差し替えるときは同じ名前のファイルで上書きしてください。

| ファイル | 用途 |
|---|---|
| `public/images/logo.webp` | ロゴ画像 |
| `public/images/favicon.png` | ファビコン |
| `public/images/apple-touch-icon.png` | iPhoneのホーム画面に追加したときのアイコン |
| `public/images/IMAGE_7.jpeg` | トップの背景画像、SNSで共有したときのサムネイル |
| `public/images/IMAGE_1.jpeg` | Concept欄の写真 |
| `public/images/IMAGE_1.jpeg` 〜 `IMAGE_10.jpeg`(`IMAGE_6` を除く) | Instagram欄に並べる写真 |

写真を足したり外したりするときは、`src/App.tsx` の写真リストも書き換えてください。
