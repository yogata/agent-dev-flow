# integrity-contracts SPEC の retired REQ-028 行 ID 参照残存（L227/L229）

## 観測

`docs/specs/integrity/integrity-contracts.md` L227「（REQ-028-010）」、L229「（REQ-028-012）」が retired REQ-028 の行 ID を参照している。baseline_status 除外契約の現行所有は REQ-036-022 側。

## 今回扱わない理由

Issue 2243（OU-0041）の対象は要件文書 4文書の注記形式確認であり、SPEC 側文書は対象外。REQ-001-040 の段階的更新の未達部分候補として記録した。

## 影響

現行 SPEC が retired REQ の行 ID に依存する記述を含み、REQ-001-014（再編工程固有識別子の排除）の SPEC 側適用が未達の状態です。

## レビューで決めること

- 参照解決の方式（現行正式 ID（REQ-036-022 等）への振り直し・履歴文脈注記化のいずれを正とするか）
- epic-wave-model.md の旧 REQ-006 行 ID 残存（別 intake item）との一括是正扱い

## 根拠

- Issue 2243 完了判定記録コメント「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/issues/2243#issuecomment-5336194442 ）
