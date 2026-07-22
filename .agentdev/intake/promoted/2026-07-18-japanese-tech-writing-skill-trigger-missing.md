# japanese-tech-writing SKILL.md frontmatter description に trigger 記述不足

## 観測内容

`src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter `description` に、USE FOR / DO NOT USE FOR に相当する trigger 語句が含まれていない。発生源は docs-check（2026-07-18）の lint_skills.ts（Content / USE FOR / DO NOT USE FOR trigger 検査）。WARNING 2件（同一 SKILL.md）として報告された。

検出内容は USE FOR trigger missing と DO NOT USE FOR trigger missing の2件。現状の description は「日本語の技術文書・書籍原稿の文章規範。整形（…）、段落と論証の構成（…）…」と内容説明中心であり、trigger 中心の構成になっていない。

備考: `agentdev-` prefix 非使用（INFO 2件）は既知の仕様である（japanese-tech-writing は agentdev の配布物依存スキルだが、配布物本体ではないため prefix なし）。本 item では trigger 記述不足のみを対象とする。

## 影響

agentdev-doc-writing 経由で呼び出す agent が japanese-tech-writing を発見しにくくなる。重要性は低〜中。japanese-tech-writing は ADR-0134/REQ-0159-001 により配布物依存スキル（`agentdev-doc-writing` が参照）と位置付けられており、発見性低下が運用上の問題を生む。発生頻度は、agentdev-doc-writing から japanese-tech-writing の規範を参照する度に影響する。

## 課題

frontmatter description が trigger 中心の構成になっておらず、skill 発見性が低下している。USE FOR / DO NOT USE FOR に相当する trigger 語句が不在のため、他の agentdev-* skill と一貫しない。

## 既存要件・仕様との関連

- ADR-0134、REQ-0159-001: japanese-tech-writing の配布物依存スキルとしての位置付け。trigger 記述不足はこの位置付けに基づく発見性要求との差分。
- 関連 skill: `agentdev-doc-writing`（japanese-tech-writing を参照する consumer）。

## 対応方針の方向性

`src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter `description` を改訂し、以下を明示する。

1. USE FOR に相当する trigger 語句: 例「日本語で技術書の章、草稿、記事、解説文を書くとき」「推敲・リライトするとき」。
2. DO NOT USE FOR に相当する trigger 語句: 例「英語文書」「コード実装」「設定ファイル編集」。

他の agentdev-* skill の description 記述スタイルを参考に、内容説明中心から trigger 中心の構成へ書き直す。修正は1ファイル frontmatter のみで完結するため小作業。
