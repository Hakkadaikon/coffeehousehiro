# 公開

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。ドメインの変更やSEO用ファイルの保守は `seo-files` skillに頼みます(「ドメイン変わった」「SEO確認して」)。手で作業するときは、以下の手順に沿ってください。詳しくは[AIでの更新](ai-maintenance.md)を見てください。

本番はVercelで公開しています。GitHubの `main` へのプッシュとプルリクエストでは、GitHub Actionsが型チェック・テスト・ビルドを実行します。

ドメインが変わったときは、`src/content/shop.ts` の `SITE_URL`・`index.html`・`public/robots.txt`・`public/sitemap.xml` に書いた本番URLも書き換えてください。

main以外のブランチはVercelにデプロイしません(`vercel.json` の `git.deploymentEnabled`)。ブランチの確認はCIで行います。

依存パッケージの更新はRenovateが行います(`renovate.json`)。minorとpatchの更新は、公開から3日たってCIが通れば自動でmainに入り、そのまま本番に出ます。公開直後に乗っ取られた版を取り込まないよう、3日待つ設定にしています。majorの更新はプルリクエストになるので、確かめてからマージしてください。GitHub Actionsの部品(`actions/checkout` など)は、差し替えられても影響を受けないようコミットのIDで指定し、IDの更新もRenovateに任せています。

## アクセス解析

訪問数とページの表示回数は、Vercel Web Analyticsで見ます。`src/main.tsx` の `inject()` が、同じドメインの `/_vercel/insights/` から計測用のスクリプトを読み込みます。cookieは使わず、注文フォームの入力内容も送りません。数字はVercelのダッシュボードの「Analytics」で見られます。

集める情報と注文フォームの入力内容の扱いは、フッターの「このサイトでの情報の取り扱い」(`src/sections/SiteFooter.tsx`)に書いています。解析の設定や、外部に送る情報を変えたときは、ここも直してください。

### 毎日のアクセスレポート(Discord)

毎日20:00(日本時間)に、前日20:00からその日の20:00までのアクセスをDiscordに送ります。GitHub Actionsの定期実行は数分〜数十分遅れることがありますが、集計の区切りは20:00のままなので、前後の回と重なったり抜けたりはしません。GitHubの「Actions」タブで「Daily analytics report」を選び、「Run workflow」を押すと、すぐに送ることもできます。手動で送るときは、「24時間」「1週間」「1か月(30日)」から期間を選び、今からさかのぼって集計します。中身は `.github/workflows/analytics-report.yml` と `scripts/analytics/` にあります。

送る内容は、訪問者数とページビュー数、アクセスの多い時間帯(上位3つ)、よく見られたページ、リファラー(参照元)、端末、国・地域です。訪問者数は期間を通した人数です。時間帯は、ページビューを日本時間の時刻ごとに足して比べます。1週間・1か月を選んだときは、日別の数も付けます。日別の区切りはVercelに合わせてUTCなので、1日は日本時間の9:00から翌日の8:59までです。

動かすには、GitHubのリポジトリの Settings → Secrets and variables → Actions に、次のSecretsを登録します。

| 名前 | 中身 |
|---|---|
| `VERCEL_TOKEN` | Vercelのアクセストークン(Account Settings → Tokens で作る) |
| `VERCEL_PROJECT_ID` | VercelのプロジェクトID(プロジェクトの Settings → General にある `prj_` で始まる値) |
| `DISCORD_WEBHOOK_URL` | 送り先チャンネルのWebhook URL(チャンネルの設定 → 連携サービス → ウェブフック) |
| `VERCEL_TEAM_ID` | チームのプロジェクトのときだけ。個人アカウントなら登録しない |

手元で文面だけ確かめるときは、`VERCEL_TOKEN` と `VERCEL_PROJECT_ID` を環境変数に入れて `node scripts/analytics/send.ts --dry-run` を実行します。`REPORT_PERIOD=1週間` のように期間を付けると、手動実行と同じ期間で集計します。Discordには送らずに文面を表示します。

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
