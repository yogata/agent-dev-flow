# Intake Item: SKILL.md が500行閾値を超過（2 skill）

## 発生源

- docs-check 実行日時: 2026-07-18
- 検査スクリプト: lint_skills.ts (References / SKILL.md bloat)
- 検査ルート: intake
- 原因分類: 確認済（閾値超過）

## 問題

以下2件の SKILL.md が500行閾値を超過している。lint_skills.ts の heuristic 検査で WARNING として報告。

| skill | 行数 | 超過 |
|-------|------|------|
| `agentdev-req-file-manager` | 513行 | +13行 |
| `agentdev-skill-authoring` | 523行 | +23行 |

閾値は lint_skills.ts の `SKILL_MD_MAX_LINES = 500`。SKILL.md は frontmatter + USE FOR / DO NOT USE FOR + See Also を含む概要文档であることが期待されており、詳細は `references/*.md` へ分割する設計。500行超過は詳細が SKILL.md に蓄積している兆候。

## 推奨修正対象

各 SKILL.md の内容を精査し、`references/*.md` へ切り出せる詳細セクションを特定の上、分割リファクタリングを実施する。

- `agentdev-req-file-manager/SKILL.md`（513行）: REQ 番号採番ルール、frontmatter 規約等の詳細参照を `references/` 配下へ分離できないか検討。
- `agentdev-skill-authoring/SKILL.md`（523行）: skill 作成手順の詳細、template 仕様等を `references/` 配下へ分離できないか検討。

閾値そのものの見直し（500行 → 600行等）も選択肢だが、まずは分割可能性を優先的に検討する。

昇格先候補: intake-promote で採否判断。2 skill を別々の作業単位として扱うか、SKILL.md bloat 共通課題として1作業単位にまとめるかは intake-promote で判断。

## 関連

- 検出元: lint_skills.ts stdout（References セクション・非永続）
- 対象ファイル:
  - `src/opencode/skills/agentdev-req-file-manager/SKILL.md`
  - `src/opencode/skills/agentdev-skill-authoring/SKILL.md`
- 関連検査: `.opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts`（`SKILL_MD_MAX_LINES`）
