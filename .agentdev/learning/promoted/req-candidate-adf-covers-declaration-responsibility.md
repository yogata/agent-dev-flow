# ADF-COVERS 宣言付与の責務定義と Definition 品質検査への確認組込み

## 背景

ADF-COVERS(implementation) 宣言付与は case-run トレーサビリティ契約上の実行担当の標準責務であるが、運用の周知不足と品質検査の未組込みにより2形態の失敗が発生している。

## 問題

- case-run 委譲プロンプトの抑制文言（declare ONLY rows the artifact genuinely implements）が過度に狭く働き、実装した REQ 行への宣言付与が行われず traceability check の missing-implementation 検出で差し戻しが発生した（Case #2898、PR #2901 Findings ①、DEL-2898-002）
- 新規 REQ CREATE を含む Definition PR（REQ-087、PR #2919）で、REQ 実現面の成果物への宣言付与責務が case-open / case-ready のいずれにあるか明文化されておらず、宣言欠落のまま merge され case-run で補完した（Case #2917、PR #2923）
- REQ 行 APPEND の場合と新規 REQ CREATE の場合で宣言対象成果物の範囲が異なる点も未整備

## 望ましい変更

- case-run delegation 指針へ「実際に実装する REQ 行への ADF-COVERS(implementation) 宣言付与は標準責務」を正の義務として明記（inventing 抑制は「実際に実装しない行を宣言しない」限定）
- case-open / case-ready の Definition 品質検査へ、artifact_actions で宣言した成果物の ADF-COVERS 宣言存在確認を組込む

## 対象範囲

### 対象

- case-run の delegation 指針（委譲プロンプトの宣言義務記述）
- case-open / case-ready の Definition 品質検査（検証対象の追加）
- 新規 REQ CREATE と REQ 行 APPEND の宣言対象範囲の整理

### 対象外

- agentdev-traceability の check 仕様自体（検出ロジックは現行どおり）
- REQ-087 Case 自体の是正（PR #2923 で補完済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| REQ | docs/requirements/REQ-030.md / REQ-061.md 系（case-open / case-ready 実行契約） | Definition 品質検査への宣言存在確認の検証対象追加 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-run/ delegation 指針 | 宣言付与の標準責務の正の明記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/ , agentdev-workflow-case-ready/ 品質検査 | 宣言存在確認の組込み |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: agentdev-traceability（check による missing-implementation / missing-verification 検出）、deferred L1771（req-save で REQ 行を是正した場合の ADF-COVERS 宣言確認、宣言網羅性 deferred 2026-09-01 との統合再評価待ち）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 検出側（check）は存在するが予防側（委譲指針の正の義務、Definition 品質検査の確認項目）が不在。検出→差し戻し→補完のコストが構造的に発生する

## 制約

- 宣言付与の判断境界（inventing 抑制）は「実際に実装しない行を宣言しない」限定として維持する
- 品質検査への組込みは既存の case-open / case-ready 検証フローに追加する形とする

## 受け入れ条件

- [ ] case-run 委譲プロンプトに宣言付与の標準責務が正の義務として明記されている
- [ ] Definition 品質検査で ADF-COVERS 宣言の存在確認が行われる
- [ ] 新規 REQ CREATE を含む Case で宣言欠落の merge が発生しない

## 元learning item / 根拠

- **要算**: ADF-COVERS 宣言付与の責務定義不在と Definition 品質検査の確認未組込み
- **根拠**: Case #2898（委譲抑制文言による宣言省略 → DEL-2898-002 差し戻し → 9ファイルへ宣言付与で解消）、Case #2917（REQ-087-001 宣言欠落のまま merge → PR #2923 で補完）+ deferred L1771（req-save 系の同一課題、統合再評価待ちを吸収する形で昇華）
- **再発条件**: 対応宣言を明示的義務として書かない case-run 委譲プロンプト、宣言付与チェックなしの Definition PR merge
- **横展開可能性**: REQ 実装を伴う全 case・新規 REQ CREATE を含む Definition PR

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Case #2898, Case #2917
