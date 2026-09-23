# IR-055 baseline 更新（run3 docs/designs/ 参照の runtime-unresolved-reference 追加）

## 観測内容

Case #3063（run3 backlog 運用堅牢化）Wave 2 の PR #3076 で、pr_desc.md テンプレート verify-only 根拠欄コメント内の壊れリンク 2件が正しい相対パス（docs/designs/commands/case-run.md・case-close.md）へ張替えられた（Issue #3070・2026-09-19 commit 3801398d 由来壊れリンク修復）。これにより、pr_desc.md:39 の docs/designs/ 相対参照 2件が IR-055 runtime-unresolved-reference（heuristic・baseline 対象・finding_route: intake）として新規検出される。

intake-promote 実行時（2026-09-23、commit 9cf787b0 時点）に `check_integrity --profile source` を再実行し、当該 delta を機械的に再現した。検出明細は次のとおり。

- `src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md:39` — 2件（case-run.md / case-close.md への docs/designs/ 相対参照、run3 由来）
- Wave 1 マージ済みファイル由来 6件（各 1件ずつ、指摘行は再現結果と一致）:
  - `src/opencode/skills/agentdev-workflow-backlog-review/references/analysis-composition-and-review.md:245`
  - `src/opencode/skills/agentdev-workflow-case-ready/references/execution-structure.md:69`
  - `src/opencode/skills/agentdev-workflow-inspect-promote/references/auto-promote-and-review.md:68`
  - `src/opencode/skills/agentdev-workflow-intake-promote/references/classification-and-review.md:123`
  - `src/opencode/skills/agentdev-workflow-learning-promote/references/analysis-and-review.md:213`
  - `src/opencode/skills/agentdev-workflow-req-define/references/requirement-development.md:173`

合計 8件はいずれも「New heuristic violation: docs/designs/ reference（IR-055 delta from baseline）」として報告され、全件 finding_route: intake である。baseline（`.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`）に当該検出分の登録が存在しないことは baseline 内容の確認により検証済みである。

IR-055 ルール本文（docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md）の triage_action は「新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。既存違反の段階解消は docs-check report / intake / backlog 経由で処理する。baseline 0 到達後に full audit を fail gate 化する（REQ-010-007）」を規定する。Case #3063 run3 の委譲実行では baseline を変更していない。

## 影響

- check_integrity --profile source の IR-055 delta from baseline が run3 由来分（8件）で継続表示される（新規違反ではなく heuristic baseline 未登録分）
- baseline 未登録のままでは、以降の実行で同一検出が新規 delta として繰り返し表示され、真の新規増加の識別を妨げる
- 実装修正を伴わない checker baseline の運用更新で対応可能であり、baseline 0 到達前の full audit は報告のみ（fail なし）のため gate 阻害は発生しない

## 課題

- run3 由来の IR-055 heuristic 検出分（pr_desc.md:39 の 2件 + Wave 1 由来 6件、計 8件）が baseline 未登録のまま残り、以降の実行で delta として繰り返し表示される

## 提案する修正対象

- IR-055 baseline 更新（`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ir055-baseline`、profile source）を Case #3063 run3 の継続運用事項として実行し、上記検出分（8件）を baseline（`.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`）へ登録する
- baseline 更新後、check_integrity --profile source の IR-055 delta from baseline が 0件になることを確認する。baseline ファイルの更新は docs/designs/integrity/integrity-contracts.md「更新実行手順」に従い commit する

## 既存要件との関連

- IR-055（runtime-unresolved-reference）ルールの triage_action 規定および段階導入運用（REQ-010-007）に基づく運用更新である。REQ 行の変更を伴わない
- baseline 更新手順は docs/designs/integrity/integrity-contracts.md に文書化済みであり、新たな REQ 拡張や Design 追加を要しない

## 分類根拠（change_nature）

- 変更種別: parameter_adjustment（checker baseline 運用状態の登録調整）。REQ 拡張候補: なし
- observed_evidence: 本文「観測内容」の checker 再現結果（8件の検明明細と baseline 未登録確認）
- target_stakeholder: ADF 開発者、checker 運用者
- user_visible_change: なし（checker 報告の IR-055 delta 表示が解消されるのみ）
- 備考: change_nature は soft contract（DEC-003）であり、最終確定は req-define が行う
