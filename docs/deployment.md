# 公開

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。ドメインの変更やSEO用ファイルの保守は `seo-files` skillに頼みます(「ドメイン変わった」「SEO確認して」)。手で作業するときは、以下の手順に沿ってください。詳しくは[AIでの更新](ai-maintenance.md)を見てください。

本番はVercelで公開しています。GitHubの `main` へのプッシュとプルリクエストでは、GitHub Actionsが型チェック・テスト・ビルドを実行します。

ドメインが変わったときは、`src/shop.ts`・`index.html`・`public/robots.txt`・`public/sitemap.xml` に書いた本番URLも書き換えてください。

## ほかのホスティングサービスで公開するとき

静的なWebサイトとして動作するため、Netlify、Cloudflare Pagesなどのホスティングサービスや、一般的なレンタルサーバーでも公開できます。ただし、CSPなどのセキュリティヘッダーとキャッシュの設定は `vercel.json` に書いているので、Vercel以外ではそのサービスの方法で同じ設定をしてください。

### Vercel / Netlify / Cloudflare Pages

GitHubにプッシュし、ホスティングサービスと連携するのが最も簡単な方法です。

- フレームワークプリセット: `Vite`
- ビルドコマンド: `npm run build`
- 公開ディレクトリ: `dist`

### レンタルサーバー(エックスサーバー、さくらのレンタルサーバなど)

1. ローカル環境でビルドします。
   ```bash
   npm ci
   npm run build
   ```
2. `dist` フォルダの**中身すべて**を、FTPソフト(FileZillaなど)でサーバーの公開ディレクトリ(`public_html` など)にアップロードしてください。
