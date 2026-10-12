# 開発

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。デザインの見直しは `design-review` skillに頼みます(「デザイン見直して」「スクショで確認して」)。このページは、手で開発するときや、AIの作業結果を確かめるときに使ってください。詳しくは[AIでの更新](ai-maintenance.md)を見てください。

## 技術スタック

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Motion(アニメーション)
- Lucide React(アイコン)

## コードの構成

```
src/
  App.tsx              ページ全体。セクションを上から並べるだけ
  main.tsx             ブラウザでの起動(プリレンダーしたHTMLを引き継ぐ)
  entry-server.tsx     ビルド時のプリレンダーと、index.html の目印に入れる値
  content/             お店のデータ。メニュー、写真、店舗情報、ナビと注文手順の文言
  order/               注文の計算と検査。React に依存しない関数だけを置く
    pricing.ts         金額と送料
    form.ts            お届け先の入力の整形と検査
    cart.ts            カートの操作(reducer)と、注文の行への変換
    message.ts         LINE で送る注文メッセージ
    draft.ts           端末に保存する下書きの形と、読み込んだ値の検証
    draftStore.ts      下書きの保存先(IndexedDB)の読み書き
  order-form/          かんたん注文フォーム
    OrderForm.tsx      状態を持つ親。表示は子の部品に任せる
    use*.ts            商品選択・下書き保存・コピー・開閉のフック
    *.tsx              表示だけの部品と、入力部品(controls.tsx)
  sections/            ページのセクション。1ファイル1セクション
  components/          セクションをまたいで使う部品(外部リンク、アイコン、アニメーション)
```

置き場所は次の考え方で決めています。

- 文言や値を変えるだけなら `content/` を直します。セクションのファイルには、レイアウトとクラスだけを書きます。
- 計算や検査は `order/` に関数として置き、テストを書きます。テストは `node --test` で動かすので、`.tsx` ではなく `.ts` に置きます。
- 注文フォームの状態は `OrderForm.tsx` に集め、子の部品にはpropsで渡します。状態管理のライブラリやcontextは使っていません。
- 新しいタブで開くリンクは `components/ExternalLink.tsx` を使います。`rel="noopener noreferrer"` の付け忘れを防ぐためです。

### クラスを書くときの注意

Tailwind CSS はソースの文字列から使うクラスを探します。`grid-cols-${n}` のように組み立てたクラスは見つけられないので、クラス名は省略せずに書いてください。コメントや変数名に書いた `hidden` や `table` などの単語もクラスとして拾われ、CSS が増えることがあります。

## 開発サーバー

```bash
npm ci
npm run dev
```

開発サーバーは `http://localhost:3000` で起動します。

## テスト

```bash
npm test
```

テストは各ファイルの横にある `*.test.ts` です。送料・合計金額・LINEで送る注文メッセージの組み立て、カートの操作、保存した注文内容の読み込みを確かめます。メニューのデータの整合性と、検索エンジン向けの店舗情報・sitemap・robots.txtがサイトの内容と食い違っていないかも確かめます。

## ビルド

```bash
npm run build
```

ビルド成果物は `dist` フォルダに生成されます。ビルドの最後に `prerender.mjs` がページの中身を `dist/index.html` に書き出すので、JavaScriptを読み込む前から本文が表示され、検索エンジンにも読まれます。

## コード整形(Biome)

[Biome](https://biomejs.dev/) をコードフォーマッター・リンターとして使っています。`npm ci` で一緒にインストールされます。

| コマンド | 内容 |
|---|---|
| `npm run format` | コードを自動整形する |
| `npm run check` | 整形・lint・importの並べ替えをまとめて実行し、自動で直す |
| `npm run lint` | TypeScriptの型チェックだけを実行する |

主な設定(`biome.json`)は次のとおりです。

| 設定項目 | 値 |
|---|---|
| インデント | タブ |
| 行の最大幅 | 100文字 |
| クォート | ダブルクォート |
| セミコロン | あり |
| 末尾カンマ | あり |
| importの自動ソート | 有効 |
