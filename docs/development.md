# 開発

## 技術スタック

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Motion(アニメーション)
- Lucide React(アイコン)

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

送料・合計金額・LINEで送る注文メッセージの組み立てと、保存した注文内容の読み込みを確かめます。メニューのデータの整合性と、検索エンジン向けの店舗情報・sitemap・robots.txtがサイトの内容と食い違っていないかも確かめます。

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
