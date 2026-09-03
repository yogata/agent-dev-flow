# agentdev-inspect-skills references 内の不在ファイル参照 contracts.md 16 箇所

## 観測内容

2026-09-03 の docs-check（check_integrity）で、`src/opencode/skills/agentdev-inspect-skills/references/` 配下の文書から `references/contracts.md` を指す参照 16 箇所が reference-path-existence [NG] として検出された（semantic-diagnostic-perspectives.md ×1、spec-operation-contract-consistency.md ×15）。

`references/contracts.md` は `src/opencode/skills/agentdev-inspect-skills/references/` にも `.opencode` 投影にも存在しない。`git log -- src/opencode/skills/agentdev-inspect-skills/references/contracts.md` で作成履歴なし（一度も存在していない）。

原因分類: 確認済（対象ファイルの不在と履歴不在は機械確認済み）/ 発端（16 箇所の参照を誰がどの意図で書いたか）は不明。

2026-09-03 現行確認: `Test-Path` で標準版・投影版とも contracts.md 不在を確認済み。spec-operation-contract-consistency.md は各 skill の references/contracts.md とのフィールド一致性判定基準を記載する運用ビューであり、参照先の不在が本件の実体。

## 影響

- 配布 skill 内の相対参照が恒常的に broken となり、参照を辿る利用者・エージェントが失敗する
- check_integrity の新規 NG として残り続け、baseline 運用の delta 判定を圧迫する

## 課題（レビューで決めること）

- `references/contracts.md` を新規作成するか、16 箇所の参照を実在する正規参照（例: SKILL.md 本体、他 references ファイル）へ修正するかの判断
- 修正する場合の参照先の特定（spec-operation-contract 系の正規原本の所在確認）

## 既存要件・契約との関連

- inspect-skills の診断観点「Design 操作契約テーブル ↔ references/contracts.md フィールド一致性」（spec-operation-contract-consistency.md が判定基準を所有）、reference-path-existence 検査（check_integrity）。

## 根拠

- check_integrity レポート `.agentdev/integrity/reports/2026-09-03-integrity-report.md`（NG reference-path-existence ×16）
- 機械確認: `Test-Path src/opencode/skills/agentdev-inspect-skills/references/contracts.md` = False、`Test-Path .opencode/skills/agentdev-inspect-skills/references/contracts.md` = False、`git log` 履歴なし
