# 採用済み成果物: regression_req092_issue_list_discipline.test.ts のファイル名リネーム候補

## 観測内容

`.opencode/skills/repo-agentdev-integrity/scripts/regression_req092_issue_list_discipline.test.ts` は、describe 名を regression_req095 へ更新済みで、ヘッダーの ADF-COVERS 宣言も現行契約（REQ-011-033, REQ-095-001, REQ-095-003）へ現行化済みだが、Issue 本文がファイル名を特定対象として言及するためファイル名は REQ-092 のまま維持した（PR #3439）。

リネーム（regression_req095_issue_list_discipline.test.ts へ）は参照追跡（Issue 本文・PR 本文・検査記録等の言及更新）を伴うため後続候補。

## 影響

ファイル名のみ旧 REQ 番号帯を参照し続ける。機械検査（traceability check の unknown-req-refs 等）への影響はない（宣言は現行化済み）。検索・参照時の読み手の混乱要因。

## 課題

ファイルリネーム + Issue/PR/記録内のファイル名言及の追随更新の対応候補。小規模だが参照追跡を伴うため専用の対応として扱う。

## 既存要件との関連

- REQ-011-033・REQ-095-001・REQ-095-003（当該テストの検証対象行）
- REQ-092 廃止（Epic #3425 Wave 2・PR #3438）後の追随整理

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-regression-req092-test-filename-rename-candidate.md`（分類採用により削除済み）
- 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
- captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
- 現行源検証（intake-promote・ad6e8341・読取のみ）: 当該ファイルが旧ファイル名で現行も存在すること、ヘッダー ADF-COVERS 宣言が REQ-011-033/095-001/095-003 に現行化済みであることを確認
- 関連: 同日の「repo-local テスト REQ-092 参照クリーンアップ」item は宣言現行化をもって解消済み（intake-promote で却下）。本成果物がファイル名残件を引き継ぐ
