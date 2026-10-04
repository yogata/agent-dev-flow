# REQ 行変更 Definition PR の索引再生成は REQ commit 後に実行する手順明示

## 背景

REQ-099-020 行追加の Definition 変更で、REQ commit 前に generate_indexes.ts を実行して req-health-metrics.md を再生成すると、req-metrics-measurement-example の計測日が REQ 群の commit 前日付のまま確定し、REQ commit 後の check_integrity で req-updated-freshness（IR-072）と index-generation-consistency（IR-061/SC-002）が NG として残る事象が観測された（Case #3334・OU-004・PR #3351）。

## 問題

generate_indexes の req-metrics 計測日（deriveReqMetricsMeasureDate）は REQ 群の最終 content-change commit（git log %cI）から導出される設計のため、REQ 行変更を commit する前に派生物を再生成すると計算基準の commit が存在せず古い計測日のまま確定する。手順 2.5 の「索引再生成後に checker の結果を取得」は commit 後の再生成を含意するが、commit 前後の実行順序は明文化されていない。

## 望ましい変更

case-open references（definition-pr-and-idempotency.md 手順 2.5）へ「REQ 行変更を commit した後に索引再生成を実行し、再生成された派生物を同一 PR へ含める」ことを明示する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（手順 2.5）

### 対象外

- generate_indexes.ts の計測日導出設計（現行どおり）
- checker の検出基準

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | REQ commit と索引再生成の実行順序の明示 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: definition-pr-and-idempotency.md 手順 2.5（索引再生成後に checker 結果を取得）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: commit 前後の実行順序が明文化されていない

## 制約

- 同一 PR へ派生物を含める運用は現行どおり

## 受け入れ条件

- [ ] 手順 2.5 に REQ commit 後の索引再生成と同一 PR 包含が明記される

## 元learning item / 根拠

- **要約**: REQ 行変更 Definition PR の索引再生成は REQ commit 後に実行する（計測日導出の関係）（1件）
- **根拠**: Case #3334・PR #3351（commit d8df3022 後の再実行・追加 commit 294b3fc4 で解消し検出鮮度違反 0 件）
- **再発条件**: REQ 行変更を伴う Definition PR で commit 前に索引再生成を実行する場合
- **横展開可能性**: REQ 行変更を伴う全 Definition PR

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
