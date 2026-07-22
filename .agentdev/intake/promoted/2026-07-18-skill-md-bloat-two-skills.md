# SKILL.md が500行閾値を超過（2 skill）

## 観測内容

2026-07-18 の docs-check（検査スクリプト: `lint_skills.ts` References / SKILL.md bloat、検査ルート: intake）で検出。原因分類: 確認済（閾値超過）。

以下2件の SKILL.md が500行閾値を超過している。`lint_skills.ts` の heuristic 検査で WARNING として報告。

| skill | 行数 | 超過 |
|-------|------|------|
| `agentdev-req-file-manager` | 513行 | +13行 |
| `agentdev-skill-authoring` | 523行 | +23行 |

閾値は `lint_skills.ts` の `SKILL_MD_MAX_LINES = 500`。SKILL.md は frontmatter + USE FOR / DO NOT USE FOR + See Also を含む概要文档であることが期待されており、詳細は `references/*.md` へ分割する設計。500行超過は詳細が SKILL.md に蓄積している兆候。

- 対象ファイル: `src/opencode/skills/agentdev-req-file-manager/SKILL.md`、`src/opencode/skills/agentdev-skill-authoring/SKILL.md`
- 関連検査: `.opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts`（`SKILL_MD_MAX_LINES`）

## 影響

機能破壊はない。設計期待（SKILL.md=概要文档、references=詳細）からの逸脱で、可読性・メンテナンス性の懸念。severity: 低（heuristic 警告、超過幅も小: +13行/+23行）。

## 課題

2件の SKILL.md が500行閾値を超過しており、詳細を `references/` へ分割する設計期待から逸脱している。

## 既存要件・仕様との関連

特になし（`lint_skills.ts` の `SKILL_MD_MAX_LINES` 設計基準に基づく検出。特定の REQ/ADR/SPEC/IR ID は関与しない）。

## 対応方針の方向性

各 SKILL.md の内容を精査し、`references/*.md` へ切り出せる詳細セクションを特定の上、分割リファクタリングを実施する。

- `agentdev-req-file-manager/SKILL.md`（513行）: REQ 番号採番ルール、frontmatter 規約等の詳細参照を `references/` 配下へ分離できないか検討。
- `agentdev-skill-authoring/SKILL.md`（523行）: skill 作成手順の詳細、template 仕様等を `references/` 配下へ分離できないか検討。

閾値そのものの見直し（500行 → 600行等）も選択肢だが、まずは分割可能性を優先的に検討する。2 skill を別々の作業単位として扱うか、SKILL.md bloat 共通課題として1作業単位にまとめるかは backlog-review で判断する。
