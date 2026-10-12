# 公開

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。ドメインの変更やSEO用ファイルの保守は `seo-files` skillに頼みます(「ドメイン変わった」「SEO確認して」)。手で作業するときは、以下の手順に沿ってください。詳しくは[AIでの更新](ai-maintenance.md)を見てください。

本番はVercelで公開しています。GitHubの `main` へのプッシュとプルリクエストでは、GitHub Actionsが型チェック・テスト・ビルドを実行します。

ドメインが変わったときは、`src/content/shop.ts` の `SITE_URL`・`index.html`・`public/robots.txt`・`public/sitemap.xml` に書いた本番URLも書き換えてください。

main以外のブランチはVercelにデプロイしません(`vercel.json` の `git.deploymentEnabled`)。ブランチの確認はCIで行います。

## アクセス解析

訪問数とページの表示回数は、Vercel Web Analyticsで見ます。`src/main.tsx` の `inject()` が、同じドメインの `/_vercel/insights/` から計測用のスクリプトを読み込みます。cookieは使わず、注文フォームの入力内容も送りません。数字はVercelのダッシュボードの「Analytics」で見られます。

集める情報と注文フォームの入力内容の扱いは、フッターの「このサイトでの情報の取り扱い」(`src/sections/SiteFooter.tsx`)に書いています。解析の設定や、外部に送る情報を変えたときは、ここも直してください。

### 週間アクセスレポート(Discord)

毎週月曜の9:00(日本時間)に、先週(月曜〜日曜)のアクセスをDiscordに送ります。GitHubの「Actions」タブで「Weekly analytics report」を選び、「Run workflow」を押すと、すぐに送ることもできます。手動で送るときは、今日を含む直近7日間を集計します。中身は `.github/workflows/analytics-report.yml` と `scripts/analytics/` にあります。

送る内容は、訪問者数とページビュー数、日別の数、よく見られたページ、リファラー(参照元)、端末、国・地域です。訪問者は日ごとに数えるので、週の合計は延べ人数になります。

動かすには、GitHubのリポジトリの Settings → Secrets and variables → Actions に、次のSecretsを登録します。

| 名前 | 中身 |
|---|---|
| `VERCEL_TOKEN` | Vercelのアクセストークン(Account Settings → Tokens で作る) |
| `VERCEL_PROJECT_ID` | VercelのプロジェクトID(プロジェクトの Settings → General にある `prj_` で始まる値) |
| `DISCORD_WEBHOOK_URL` | 送り先チャンネルのWebhook URL(チャンネルの設定 → 連携サービス → ウェブフック) |
| `VERCEL_TEAM_ID` | チームのプロジェクトのときだけ。個人アカウントなら登録しない |

手元で文面だけ確かめるときは、`VERCEL_TOKEN` と `VERCEL_PROJECT_ID` を環境変数に入れて `node scripts/analytics/send.ts --dry-run` を実行します。Discordには送らずに文面を表示します。

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
