# japanese-tech-writing SKILL.md に USE FOR / DO NOT USE FOR 境界がない

## 概要

`japanese-tech-writing` skill の SKILL.md（`.opencode/skills/japanese-tech-writing/SKILL.md`）は frontmatter の `description` のみを持ち、本文に `## USE FOR` / `## DO NOT USE FOR` セクションが存在しない。本文は「整形」「段落と論証の構成」「論証の厳密さ」等の執筆規範のみを記述する。

他の `agentdev-*` skill は明示的な USE FOR / DO NOT USE FOR 境界を持つ（`agentdev-req-analysis` 等）。`japanese-tech-writing` がこの慣行に従わないため、skill 利用境界が不明瞭になる。

## 提案しなかった理由

本 finding は `/repo/docs-check`（機械的整合性検査）の検出結果であり、採否は `intake-promote` に委譲する前提のため。SKILL.md の体裁を他 skill に合わせるか、執筆規範 skill として独自形式を許容するかは判断が分かれる。

## テーマ

- skill 構造・境界明示性
- 関連 REQ: REQ-0108（docs-check / Validation）、REQ-0119（コマンド・スキル・サブエージェント責務分界の再基準化）

## レビューで決めること

- `description` のみで境界十分とするか、本文に明示的な USE FOR / DO NOT USE FOR セクションを追加するか
- 追加する場合、japanese-tech-writing の適用対象（「日本語で技術書の章・草稿・記事・解説文を書く・推敲するとき」）と非適用対象（英語文書、非技術文書 等）を記述する
- 他の非 `agentdev-` prefix skill（`repo-agentdev-integrity` 等）にも同様の境界セクション追加を横展開するか

## 備考

- **Finding 分類**: WARNING / Skill / skill-use-for-boundary
- **Route**: intake
- **根拠**: `/repo/docs-check` 実行（2026-06-25）。`.agentdev/integrity/reports/2026-06-24-integrity-report.md`
- **原因分類**: 確認済（SKILL.md に該当セクション不存在を直接確認）
- 関連 finding: 同 skill の source projection 欠如（NG / source-projection-sync）は別 item として起票済み
