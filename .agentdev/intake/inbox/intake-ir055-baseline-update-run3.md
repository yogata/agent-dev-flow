# IR-055 baseline 更新（run3 docs/designs/ 参照の runtime-unresolved-reference 追加）

## 観測内容

Case #3063（run3 backlog 運用堅牢化）Wave 2 の PR #3076 で、pr_desc.md テンプレート verify-only 根拠欄コメント内の壊れリンク 2件を正しい相対パス（docs/designs/commands/case-run.md・case-close.md）へ張替えた（Issue #3070・2026-09-19 commit 3801398d 由来壊れリンク修復）。これにより、pr_desc.md:39 の docs/designs/ 相対参照 2件が IR-055 runtime-unresolved-reference（heuristic・baseline 対象・finding_route: intake）として新規検出される（check_integrity --profile source で「IR-055 delta from baseline」として記録）。

同種 delta は Wave 1 マージ済みファイルにも存在する（analysis-composition-and-review.md:245、execution-structure.md:69、auto-promote-and-review.md:68、classification-and-review.md:123、analysis-and-review.md:213、requirement-development.md:173 の各 docs/designs/ 参照計 6件）。

IR-055 ルール本文（docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md）の triage_action は「新規検出時は baseline に追加し、既存違反の段階解消は intake 経由で処理」を規定。本委譲実行では baseline を変更していない。

## 影響

- check_integrity --profile source の IR-055 delta from baseline が run3 由来分で継続表示される（新規違反ではなく heuristic baseline 未登録分）
- 実装修正を伴わない checker baseline の運用更新

## 課題

- run3 由来の IR-055 heuristic 検出分（pr_desc.md:39 の 2件 + Wave 1 由来 6件）が baseline 未登録のまま残り、以降の実行で delta として繰り返し表示される

## 提案する修正対象

- IR-055 baseline 更新（--update-ir055-baseline）を Case #3063 run3 の継続運用事項として実行し、上記検出分を baseline へ登録する
- baseline 更新後、check_integrity --profile source の IR-055 delta from baseline が 0件になることを確認する

## 既存要件との関連

- IR-055（runtime-unresolved-reference）ルールの triage_action 規定に基づく運用更新。REQ 行の変更を伴わない

## 出典

- case-close-capture、Case #3063 / PR #3076（Findings/ Capture候補・intake セクション）、captured_at 2026-09-23。
