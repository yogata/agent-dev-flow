# traceability sidecar のパス×role 登録状況の事前確認手順の追記

処分区分: 5 既存対策の更新（fix gap）

## 背景

Case #3289 で、新規 REQ 成果物が既存 sidecar 登録済みファイルに跨る変更を行った際、traceability sidecar は artifact パス × role を単一情報源で保持する制約に触れた。既存 sidecar の登録内容を確認せずに新規 relation を追加すると、同一パスの role 競合・重複登録が生じ得る。

## 問題

sidecar-and-policy.md の authoring 手順に「既存 sidecar のパス × role 登録状況の事前確認」ステップがない。新規 REQ・Design 成果物が既存 sidecar 管理下のファイルに跨る場合の確認手順が未整備である。

## 望ましい変更

sidecar-and-policy.md の authoring 手順に、新規成果物の relation 追加前に (1) 対象パスが既存 sidecar に登録済みか、(2) 登録済みの場合その role と矛盾しないか、を確認するステップを追記する。

## 対象範囲

### 対象

- src/common/skills/agentdev-traceability/references/sidecar-and-policy.md（authoring 手順節）

### 対象外

- traceability check スクリプトの変更（手順文書の追記が主）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-traceability/references/sidecar-and-policy.md | authoring 手順へ既存 sidecar のパス×role 登録状況の事前確認を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: sidecar-and-policy.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: authoring 手順に既存登録との突合ステップなし

## 制約

- sidecar の単一情報源原則（パス × role）を維持する

## 受け入れ条件

- [ ] authoring 手順に事前確認ステップが追記されている

## 元learning item / 根拠

- **要約**: 新規 REQ 成果物が既存 sidecar 登録済みファイルに跨る場合の対処知見
- **根拠**: 2026-10-01 Case #3289（PR #3295 Findings）: sidecar は artifact パス × role を単一情報源で保持する制約の適用事象
- **再発条件**: 既存 sidecar 管理下ファイルに跨る新規成果物の relation 追加時
- **横展開可能性**: traceability sidecar を編集する全 Case

## 推奨Issue分類

- **分類**: chore（ドキュメント追記）
- **推奨ラベル**: documentation
- **関連Issue**: Case #3289（PR #3295）
