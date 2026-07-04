# 配布物既存違反303件の一括是正（別Issue化推奨）

## 観測

PR #1411（Epic #1403 Wave 3, Issue #1407）で新設した `check_distribution_boundary.ts` を worktree root で実行した結果、配布 command/skill 本文に ADR/REQ/SPEC 具体参照が **303件**（concrete_id 301 + concrete_path 2、56ファイル）残存していることを検出。

内訳:
- `src/opencode/commands/agentdev/**`: 17ファイル
- `src/opencode/skills/agentdev-*/**`: 39ファイル
- concrete_id 違反（`ADR-NNNN`, `REQ-NNNN` の4桁数字パターン）: 301件
- concrete_path 違反（`docs/(adr|requirements|specs)/<file>.md` 直参照）: 2件
- fixed_url 違反: 0件

Top 5 files:
| file | concrete_id | concrete_path | total |
|------|-------------|---------------|-------|
| src/opencode/commands/agentdev/case-auto.md | 39 | 0 | 39 |
| src/opencode/commands/agentdev/case-close.md | 21 | 0 | 21 |
| src/opencode/commands/agentdev/spec-save.md | 19 | 0 | 19 |
| src/opencode/commands/agentdev/req-define.md | 18 | 0 | 18 |
| src/opencode/commands/agentdev/req-save.md | 14 | 2 | 16 |

多くは `REQ-NNNN-NNN` 形式（サブ要件番号）の引用。

## 影響

- ADR-0135「具体参照禁止」決定事項と配布物実態が乖離。SPEC `docs/specs/foundations/project-extensions.md` は「具体ID 記述禁止」を厳格に定義するが、実運用では `REQ-NNNN-NNN` サブ要件引用が広く普及している。
- PR #1411 は検査機構の実装に限定し、配布物本文の修正は行わなかった（スコープ拡大回避）。`agentdev-gh-cli` SKILL.md See Also の直接リンク 4件のみ解消済み。

## レビューで決めること

- 303件の一括是正を1 Issue（または機械処理 batch）として case-open するか
- 是正方式: サブ要件番号 `REQ-NNNN-NNN` 引用を generic 表記へ置換する機械処理スクリプト（`apply-mechanical-replacement.ps1` 等の拡張）が候補
- SPEC `docs/specs/foundations/project-extensions.md` を運用実態に合わせて緩和するか、配布物を一括で SPEC 厳格解釈へ是正するかの判断（関連 intake: `spec-concrete-id-strictness-divergence`）

## 根拠

PR #1411 Findings/Capture候補 #1 より。Wave 3 case-close で回収。Issue #1407 AC5（具体参照残存0件確認）はスコープ外項目として `> ℹ️ 別途確認` 形式へ変換済み（既存技術的負債、別Issue化）。
