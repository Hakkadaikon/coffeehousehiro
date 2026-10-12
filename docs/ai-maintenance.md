# AIでの更新

このサイトの更新は、Claude Codeにskillsを使って頼むことをある程度前提にしています。メニューの変更やSEO用ファイルの保守では、書き換える場所が複数あります。手順と確認方法をskillsに書いておき、AIがそれに沿って作業する仕組みです。

skillsは `.claude/skills/` にあります。リポジトリでClaude Codeを起動し、次のように頼むと、対応するskillが使われます。

| skill | 頼み方の例 | すること |
|---|---|---|
| `update-menu` | 「メニュー更新して」(メニュー表の画像を渡す)、「価格変わった」「新しい豆を追加」 | `src/content/menu.ts` を書き換え、テストとビルドで確かめ、sitemapのlastmodも更新する |
| `update-changelog` | 「更新履歴を更新して」「更新履歴に〇〇を追加」 | `src/content/changelog.yaml` に、お客さんから見て分かる変更を日付ごとに足す |
| `seo-files` | 「sitemap更新して」「ドメイン変わった」「SEO確認して」 | sitemap.xml・robots.txt・canonical・OGP・JSON-LD・プリレンダーを保守する |
| `design-review` | 「デザイン見直して」「文字小さくない？」「スクショで確認して」 | PCとスマホのスクショを撮り、デザイナー役のAIのレビューで指摘がなくなるまで直す |

手で更新することもできます。そのときは、ほかのdocsと各skillの `SKILL.md` に書いた手順に沿って作業し、最後に `npm test` と `npm run build` が通ることを確かめてください。

skillsに書いたことと実際のコードがずれると、AIが古い手順で作業してしまいます。ファイルの置き場所や手順を変えたときは、該当する `SKILL.md` も直してください。
