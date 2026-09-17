# verification 宣言の同一論理関係は inline 既存宣言への集約を優先する運用規則の明文化

## 背景

REQ-012-054 の missing-verification 解消で、traceability_coverage.test.ts への verification 登録を sidecar 新設ではなく既存 inline 宣言への追記で行う判断を要した（Case #2936、PR #2953、2026-09-18）。sidecar 新設ルート（inline 宣言の sidecar 移行）も論理的に成立するため、配置先の優先順位が規則として明文化されていない状態で都度判断が発生する。

## 問題

同一論理関係（artifact パス × verification role）の宣言を 1 情報源に集約する duplicate-inconsistencies 規則は存在するが、inline 既存宣言と sidecar 新設の優先順位（配置先集約の一般規則）が明文化されていない。優先順位が不明のまま作業すると duplicate-inconsistencies が発火し、差し戻し修正コストが生じる。

## 望ましい変更

「同一論理関係（artifact パス × role）の追加対応は、該当 artifact が既存 inline 宣言を保持する場合は inline 宣言への追記を優先し、sidecar 新設は inline 宣言がない場合の選択肢とする」運用規則を agentdev-traceability の運用知識へ明文化する。

## 対象範囲

### 対象

- agentdev-traceability の運用知識（宣言配置先の判断規則）
- verification / implementation 対応登録を行う case-run・case-close 修正の手順

### 対象外

- duplicate-inconsistencies 検出ロジック自体の変更
- 既存 sidecar 宣言の inline への移行（既存配置の正規性は個別判断）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-traceability/（運用知識・SKILL.md または references） | inline 既存宣言優先・sidecar は inline なし場合の選択肢という配置先集約規則の追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: agentdev-traceability の duplicate-inconsistencies 規則（同一論理対応の重複宣言の不整合検出）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 重複検出規則は存在するが、発火前の配置先判断規則（inline 優先）が明文化されていない

## 制約

- repo-local artifact は inline 宣言保持が正規配置先規則に適合するという既存判断を前提とする
- 検出規則（duplicate-inconsistencies）との整合を維持する

## 受け入れ条件

- [ ] 同一論理関係の追加対応時の配置先判断規則が明文化されている
- [ ] duplicate-inconsistencies 発火による差し戻しが予防手順で回避できる

## 元learning item / 根拠

- **要約**: verification 同一論理関係の配置先（inline vs sidecar）優先順位の不明確さによる都度判断と差し戻しリスク
- **根拠**: Case #2936 / PR #2953（REQ-012-054 の missing-verification 解消で inline 追記を採用、sidecar 併存を回避し check で findings 0 を確認。REQ-012-045 の verification 宣言を既に保持するテストファイルへの追記判断）
- **再発条件**: 既存 inline 宣言を持つ artifact への同一論理関係の verification / implementation 対応追加が必要な case-run・case-close 修正
- **横展開可能性**: sidecar と inline の 2 情報源が併存するモデル全般。プロジェクトのトレーサビリティ構成に固有

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Case #2936
