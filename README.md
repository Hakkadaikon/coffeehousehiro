# コーヒーhouseヒロ ランディングページ (LP)

岡山県倉敷市の週末限定ロースター「コーヒーhouseヒロ」の公式ランディングページです。
React と Vite を使用して構築された静的シングルページアプリケーション（SPA）です。

## 技術スタック

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS v4**
- **Motion** (アニメーション)
- **Lucide React** (アイコン)

## ローカル開発

```bash
npm ci
npm run dev
```

開発サーバーは `http://localhost:3000` で起動します。

## ビルド

```bash
npm run build
```

ビルド成果物は `dist` フォルダに生成されます。

## ホスティング（公開）方法

静的なWebサイトとして動作するため、Vercel、Netlify、Cloudflare Pages などのモダンなホスティングサービスや、一般的なレンタルサーバーで公開できます。

### Vercel / Netlify / Cloudflare Pages

GitHubにプッシュし、ホスティングサービスと連携するのが最も簡単な方法です。

- **フレームワークプリセット**: `Vite`
- **ビルドコマンド**: `npm run build`
- **公開ディレクトリ**: `dist`

### レンタルサーバー（エックスサーバー、さくらのレンタルサーバ等）

1. ローカル環境でビルドします。
   ```bash
   npm install
   npm run build
   ```
2. `dist` フォルダの**中身すべて**を、FTPソフト（FileZillaなど）でサーバーの公開ディレクトリ（`public_html` など）にアップロードしてください。

## アセット（画像）の変更手順

画像は `public/images/` に格納されています。差し替える場合は同名ファイルを上書きしてください。

| ファイル | 用途 |
|---|---|
| `public/images/logo.jpg` | ロゴ画像 |
| `public/images/favicon.png` | ファビコン |
| `public/images/IMAGE_1.jpeg` 〜 `IMAGE_10.jpeg` | スライドショー画像 |
