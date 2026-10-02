# intake: REQ-003-055 phantom citation（v4-responsibility-boundaries.md・REQ-003.md）他、docs整合 Case #3293 Wave 1 検出分

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

1. **REQ-003-055 phantom citation**: docs/designs/foundations/v4-responsibility-boundaries.md:44,:67、docs/requirements/REQ-003.md:56 に REQ-003-055 参照が残存するが、当該要件行は現存しない（main/worktree 同一検出・Case #3293 非起因）。check_integrity 8 new unmanaged NG のうち 3件の原因
2. **REQ-032.md frontmatter updated (2026-09-29) ≠ last content-change commit date (2026-10-01)**（IR-072・2026-10-01 別 merge 起因。Definition PR #3294 が REQ-032 本文を更新した際に frontmatter updated が追随していない可能性）
3. **REQ-061-021 に design 対応 0 件（traceability missing-design）**: base 95d32719 と同一状態で本 Case 非起因。Design 対応 sidecar 登録要否の確認候補

## 影響・課題

- phantom citation は check_integrity の恒常 NG（3件）の原因であり、docs 整合性の指標を劣化させている
- IR-072 は Wave 1 merge 起因の既存起因（learning deferred に同主題の観測記録あり: 既存起因波及の運用知見）
- 本 item の元記載のうち「case-run 系横断残存（src/opencode/skills 配下旧語彙）」は Wave 1 PR #3305/#3306 の修正後再検証で 0 件となっており解消済みのため、本成果物の対象から除外する

## 既存要件・成果物との関連

- REQ-003（参照元 REQ。REQ-003-055 は廃止済み行）
- docs/designs/foundations/v4-responsibility-boundaries.md
- docs/designs/integrity/rules/IR-072-req-updated-freshness.md
- REQ-061-021（design 対応未登録）
- inspect-docs 検出事項（2026-10-02 実行分）の phantom ×3 は本 item が既知の保持者（intake 3293 既知重複として整理済み）

## 対応候補

- 上記1は citation 付け替えまたは行参照の現行化
- 上記2は frontmatter updated の更新日時是正
- 上記3は sidecar 登録確認

## 元 item

- 観測元: Root Case #3293（docs-current-model-alignment-and-compression-foundation）Wave 1 case-close（PR #3305/#3306/#3307）
- 記録日: 2026-10-01
