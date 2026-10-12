# メニュー・画像の更新

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。メニューの更新は `update-menu` skillに頼みます(「メニュー更新して」とメニュー表の画像を渡す)。手で直すときは、以下の場所を書き換えてください。詳しくは[AIでの更新](ai-maintenance.md)を見てください。

## メニュー・価格

メニューの品名・サイズ・価格は `src/content/menu.ts` だけに書いています。サイトのメニュー表、注文フォーム、検索エンジン向けの価格帯はすべてここから作るので、メニューが変わったときに書き換えるのはこのファイルだけです。

メニューを変えたら、`public/sitemap.xml` の `<lastmod>` をその日の日付にしてください。

## 店舗情報・送料

送料は `src/order/pricing.ts` に、住所・メールアドレス・SNSのURL・LINE公式アカウントのID・支払い方法は `src/content/shop.ts` にあります。

## 画像

画像は `public/images/` に入っています。

写真の一覧(ファイル名・サイズ・代替テキスト)は `src/content/photos.ts` だけに書いています。トップの背景(`HERO`)とConcept欄(`CONCEPT`)にどの写真を使うかも、ここで決めます。SNSで共有したときのサムネイルと検索エンジン向けの店舗情報の画像は、ビルド時にここから入ります。

写真のファイル名は「2桁の連番_英語の要約.jpeg」にします(例: `01_red-hut-exterior.jpeg`)。番号は01から順に並べ、`src/content/photos.ts` の並びと合わせます。写真を足す・外す・名前を変えるときは、ファイルと `src/content/photos.ts` の両方を直してください。食い違っていると `npm test` が失敗します。

写真以外の `logo.webp`(ロゴ)・`favicon.png`(ファビコン)・`apple-touch-icon.png`(iPhoneのホーム画面のアイコン)は、役割で名前を決めているので連番を付けません。
