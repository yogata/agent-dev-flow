# 件数突合系 gate の証跡退避を case-close 検証差分記録の必須項目へ追加する

## 背景

close_mechanical_steps.ts の integrityGates 報告 JSON が exitCode 集約のみで stdout/stderr 証跡（件数突合 N/M・fail 明細・textlint hard findings 集合）を保持しないため、Case #3532 と Case #3536 の 2 Case 連続で、fail 発生時に由来分類（既知欠陥・環境依存・当該変更起因）と件数突合ができず再実行が発生した。

## 問題

case-close Design 機械工程節（L330-334）の報告 JSON 契約（case-open Design と同一規律）に、件数突合・集合比較が必要な gate を script 外で個別実行+分離退避する要件が存在しない。

## 望ましい変更

件数突合系 gate（check_integrity・textlint final gate）は close_mechanical_steps.ts の報告 JSON に頼らず、個別実行+stdout/stderr の分離退避を検証差分記録の必須項目として明記する。報告契約拡張（stdout 退避機能の script 追加）は Decision/REQ 候補として req-define へ引き渡す。

## 対象範囲

### 対象
- docs/designs/commands/case-close.md（機械工程節・検証差分記録）
- src/common/skills/agentdev-workflow-templates/SKILL.md 検証差分セクション規約（C8 成果物と同一編集バッチで統合反映）

### 対象外
- close_mechanical_steps.ts 自体の報告契約拡張（別案件候補）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/commands/case-close.md | 件数突合系 gate の個別実行+退避の必須項目化 |
| 配布skill | src/common/skills/agentdev-workflow-templates/SKILL.md | 検証差分記録への証跡退避要件（C8 と統合） |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: case-close.md 機械工程節（報告 JSON 契約）、close_mechanical_steps.ts
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 報告 JSON が証跡を保持しないことへの運用要件（個別実行+退避）が未整備

## 制約

- script 契約変更は req-define 判断（本成果物は工程側手順の補足を主とする）

## 受け入れ条件

- [ ] case-close の検証差分記録に件数突合系 gate の証跡退避が必須項目として明記される
- [ ] C8 成果物（checker 別必須要素）と同一編集バッチで反映される

## 元learning item / 根拠

- **要約**: close_mechanical_steps 報告 JSON の証跡非保持（2エントリ: Case #3532・#3536）
- **根拠**: 2 Case 連続で証跡欠落により由来分類不能→再実行の実害。報告 JSON 契約の実測確認
- **再発条件**: full integrity suite・textlint gate で fail が発生した close 実行
- **横展開可能性**: 報告 JSON に証跡を保持しない機械工程 script を使う場面一般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
