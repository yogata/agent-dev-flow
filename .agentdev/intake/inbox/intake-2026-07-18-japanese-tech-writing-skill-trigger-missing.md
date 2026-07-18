# Intake Item: japanese-tech-writing SKILL.md frontmatter description に trigger 記述不足

## 発生源

- docs-check 実行日時: 2026-07-18
- 検査スクリプト: lint_skills.ts (Content / USE FOR / DO NOT USE FOR trigger)
- 検査ルート: intake
- 原因分類: 確認済（frontmatter description の trigger 記述不足）

## 問題

`src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter `description` に、USE FOR / DO NOT USE FOR に相当する trigger 語句が含まれていない。lint_skills.ts が WARNING 2件として報告。

検出2件（同一 SKILL.md）:

- USE FOR trigger missing
- DO NOT USE FOR trigger missing

japanese-tech-writing は ADR-0134/REQ-0159-001 により配布物依存スキル（`agentdev-doc-writing` が参照）と位置付けられている。trigger 記述不足は、agentdev-doc-writing 経由で呼び出す agent が japanese-tech-writing を発見しにくくなる運用上の問題を生む。

備考: `agentdev-` prefix 非使用（INFO 2件）は既知の仕様（japanese-tech-writing は agentdev の配布物依存スキルだが、配布物本体ではないため prefix なし）。本 item では trigger 記述不足のみを対象とする。

## 推奨修正対象

`src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter `description` を改訂し、以下を明示する。

1. USE FOR に相当する trigger 語句: 例「日本語で技術書の章、草稿、記事、解説文を書くとき」「推敲・リライトするとき」
2. DO NOT USE FOR に相当する trigger 語句: 例「英語文書」「コード実装」「設定ファイル編集」

現状の description は「日本語の技術文書・書籍原稿の文章規範。整形（…）、段落と論証の構成（…）…」と内容説明中心。これを trigger 中心の構成へ書き直す。他の agentdev-* skill の description 記述スタイルを参考にする。

昇格先候補: intake-promote で採否判断。修正は1ファイル frontmatter のみで完結するため小作業。

## 関連

- 検出元: lint_skills.ts stdout（Content セクション・非永続）
- 対象ファイル: `src/opencode/skills/japanese-tech-writing/SKILL.md`
- 関連 REQ/ADR: ADR-0134、REQ-0159-001（japanese-tech-writing の配布物依存スキルとしての位置付け）
- 関連 skill: `agentdev-doc-writing`（japanese-tech-writing を参照）
