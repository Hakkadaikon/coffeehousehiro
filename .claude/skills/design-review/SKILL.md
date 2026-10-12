---
name: design-review
description: コーヒーhouseヒロのサイトをスクショで撮り、デザイナー役のsubagentにレビューさせて、指摘がなくなるまで直す。「デザイン見直して」「もっと映えるように」「文字小さくない？」「スクショで確認して」と頼まれたときに使う。
---

# デザインレビューのループ

## 1. スクショを撮る

dev serverを起動する。すでに3000番で動いていれば、それを使う。

```bash
npm run dev
```

Playwrightはscratchpadのvenvに入れ、リポジトリには入れない。

```bash
python3 -m venv "$SCRATCH/v"
"$SCRATCH/v/bin/pip" install playwright
"$SCRATCH/v/bin/python" -m playwright install chromium
"$SCRATCH/v/bin/python" .claude/skills/design-review/shot.py "$SCRATCH/shots/r1"
```

`shot.py`は、PC(1440px)とスマホ(390px)で、ヒーロー・`#about`・`#instagram`・`#menu`・`#order`・`#access`を1枚ずつ撮る。各セクションは`whileInView`で表示されるので、撮る前にページ全体をスクロールしている。

HMRの再読み込みが重なると`Execution context was destroyed`で失敗する。そのときは撮り直す。

## 2. subagentにレビューさせる

general-purposeのsubagentに、デザイナーとしてレビューさせる。プロンプトには次の4つを入れる。

- スクショのパス。あわせて`src/sections/`・`src/order-form/`の該当ファイルと`src/index.css`を読ませ、編集はさせない
- 見る観点。文字サイズと階層、コントラスト、余白、モバイルの折り返しやはみ出し、CTAの目立ち方
- 出力の形。重要度(高・中・低)、セクション、問題、ファイル名と行番号つきの具体的な修正を、最大12件
- 終わりの合図。直すべき指摘がなければ、1行目を`NO REMAINING FIXABLE ISSUES`にする

2回目以降は、同じsubagentにSendMessageで続きを頼む。前の指摘を覚えているので、直ったかどうかを早く照合できる。

## 3. 直してループする

指摘を反映したらスクショを撮り直し、同じsubagentに再レビューを頼む。高と中の指摘がなくなるまで繰り返す。低の指摘はコードで直せるものだけ直し、残りはユーザーに報告する。

## 守ること

ここに挙げるのは、これまでにオーナーと決めたこと。変えるときはオーナーに確認する。

**LINEが主な注文窓口。** LINEボタンは`#06C755`の塗りで、一番目立たせる。メールは「LINEをご利用でない方」向けとして控えめに扱う。

ロゴは元の写真のままにする。外周の白い余白を詰めただけの`public/images/logo.webp`を使い、六角形の切り抜きや色補正はしない。

PCの文字は大きめにする。目安は、本文17〜20px、メニューの品名・価格24px、ラベル14px以上。PC向けの調整には`md:`や`lg:`を付け、スマホの見た目を崩さない。

文末の「す。」だけが次の行に落ちないよう、本文には`text-pretty`を付ける。見出しは句ごとに`inline-block`の`<span>`で包む。

ヒーロー(`src/sections/Hero.tsx`)の`initial={false}`は戻さない。SEOのプリレンダーで、中身を最初から見せるため。

## 4. コミット

見た目の変更は`style:`で、セクションごとに分けてコミットする(ヒーロー、メニュー、注文、フッターなど)。デザインだけの変更では、sitemapのlastmodを更新しない。
