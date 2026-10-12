# コーヒーhouseヒロ ランディングページ (LP)

岡山県倉敷市の週末限定ロースター「コーヒーhouseヒロ」の公式ランディングページです。
ReactとViteで作った1ページだけの静的サイトで、https://coffeehousehiro.vercel.app/ で公開しています。

## 技術スタック

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Motion** (アニメーション)
- **Lucide React** (アイコン)

## ローカル開発

```bash
npm ci
npm run dev
```

開発サーバーは `http://localhost:3000` で起動します。

## テスト

```bash
npm test
```

送料・合計金額・LINEで送る注文メッセージの組み立てと、保存した注文内容の読み込みを確かめます。

## ビルド

```bash
npm run build
```

ビルド成果物は `dist` フォルダに生成されます。ビルドの最後に `prerender.mjs` がページの中身を `dist/index.html` に書き出すので、JavaScriptを読み込む前から本文が表示され、検索エンジンにも読まれます。

## メニュー・価格の更新

メニューの品名・サイズ・価格は `src/menu.ts` だけに書いています。サイトのメニュー表、注文フォーム、検索エンジン向けの価格帯はすべてここから作るので、メニューが変わったときに書き換えるのはこのファイルだけです。送料とLINE公式アカウントのIDは `src/order.ts` にあります。

メニューを変えたら、`public/sitemap.xml` の `<lastmod>` をその日の日付にしてください。

## ホスティング（公開）方法

本番はVercelで公開しています。GitHubの `main` へのプッシュとプルリクエストでは、GitHub Actionsがテストとビルドを実行します。

静的なWebサイトとして動作するため、Netlify、Cloudflare Pagesなどのホスティングサービスや、一般的なレンタルサーバーでも公開できます。ただし、CSPなどのセキュリティヘッダーとキャッシュの設定は `vercel.json` に書いているので、Vercel以外ではそのサービスの方法で同じ設定をしてください。

ドメインが変わったときは、`index.html`・`public/robots.txt`・`public/sitemap.xml` に書いた本番URLも書き換えてください。

### Vercel / Netlify / Cloudflare Pages

GitHubにプッシュし、ホスティングサービスと連携するのが最も簡単な方法です。

- **フレームワークプリセット**: `Vite`
- **ビルドコマンド**: `npm run build`
- **公開ディレクトリ**: `dist`

### レンタルサーバー（エックスサーバー、さくらのレンタルサーバ等）

1. ローカル環境でビルドします。
   ```bash
   npm ci
   npm run build
   ```
2. `dist` フォルダの**中身すべて**を、FTPソフト（FileZillaなど）でサーバーの公開ディレクトリ（`public_html` など）にアップロードしてください。

## コード整形（Biome）

このプロジェクトでは [Biome](https://biomejs.dev/) をコードフォーマッター・リンターとして使用しています。

### インストール

```bash
npm ci
```

`@biomejs/biome` は `devDependencies` に含まれているため、上記コマンドで自動的にインストールされます。

### 整形コマンド

| コマンド | 内容 |
|---|---|
| `npm run format` | コードを自動整形する |
| `npm run check` | 整形 + lint を一括実行して自動修正する |
| `npm run lint` | TypeScript の型チェックのみ実行する |

```bash
# フォーマットのみ
npm run format

# フォーマット + lint + import 自動ソート
npm run check
```

### 主な設定（biome.json）

| 設定項目 | 値 |
|---|---|
| インデント | タブ |
| 行の最大幅 | 100文字 |
| クォート | ダブルクォート |
| セミコロン | あり |
| 末尾カンマ | あり |
| import 自動ソート | 有効 |

## アセット（画像）の変更手順

画像は `public/images/` に格納されています。差し替える場合は同名ファイルを上書きしてください。

| ファイル | 用途 |
|---|---|
| `public/images/logo.webp` | ロゴ画像 |
| `public/images/favicon.png` | ファビコン |
| `public/images/apple-touch-icon.png` | iPhoneのホーム画面に追加したときのアイコン |
| `public/images/IMAGE_7.jpeg` | トップの背景画像、SNSで共有したときのサムネイル |
| `public/images/IMAGE_1.jpeg` | Concept欄の写真 |
| `public/images/IMAGE_1.jpeg` 〜 `IMAGE_10.jpeg`（`IMAGE_6` を除く） | Instagram欄に並べる写真 |

写真を足したり外したりするときは、`src/App.tsx` の写真リストも書き換えてください。
