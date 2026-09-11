# 配布テンプレートの対応宣言配置

## 背景
配布テンプレート本文へ対応宣言を付与したところ、配布物内部ID契約テストに違反した。

## 問題
テンプレート本文は配布物内部IDを許容しないため、ADF-COVERS宣言を直接付与できない。

## 望ましい変更
テンプレート本文には宣言を置かず、対応宣言を親SKILL.md側へ集約する。

## 対象範囲
### 対象
- 配布templateと対応宣言の配置規則
### 対象外
- 親SKILL.mdで許可された宣言の削除

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| procedures / template | workflow-templates運用手順 | template本文への宣言禁止と親SKILL集約を明記 |

## 既存対策確認
- **確認結果**: 検査gateは存在、配置手順の明文化に補完余地
- **該当ファイル**: `src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: template変更時の宣言配置先が事前に明示されていない

## 制約
template本文に数字付きの配布物内部IDを追加しない。

## 受け入れ条件
- [ ] template本文にADF-COVERS宣言がない
- [ ] 対応宣言が親SKILL.mdに存在する
- [ ] execution/verification contract testsを通過する

## 元learning item / 根拠
- **要約**: template本文への宣言付与禁止
- **根拠**: #16、PR #2760で2件の契約違反を検出し親SKILL集約後に合格
- **再発条件**: template本文へ数字付き宣言を追加する場合
- **横展開可能性**: 配布template全般

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2759
