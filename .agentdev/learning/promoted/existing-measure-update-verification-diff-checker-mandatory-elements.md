# 検証差分セクション規約へ checker 別必須要素を追加する

## 背景

PR 本文の検証差分記録が textlint hard 件数の申告（36 vs 40 の件数不一致が発生）や traceability 検査種別の部分列挙（9 種中 1 種のみ記載し corpus 系検査の不計上が不可視）に留まり、集合（path:line:column:ruleId）・summary pass/fail 全件との突合を要求しないため、工程間で同一性・由来判定が破綻した（Case #3536）。

## 問題

検証差分セクション規約（8 列テーブル・finding 5 分類）は存在するが、checker 別必須要素（textlint: hard findings 集合の JSON 実測退避、traceability: summary pass/fail + 9 検査種別全列挙）が未規定。記録先割当と意味集合の正規所有者は v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節である。

## 望ましい変更

検証差分セクション規約へ checker 別必須要素を追加する: textlint 行は hard findings 集合（JSON 実測）の退避、traceability 行は summary pass/fail と 9 検査種別全列挙。正規所有 Design の該当節と templates 規約・pr_desc.md テンプレートを整合更新する。

## 対象範囲

### 対象
- docs/designs/foundations/v4-durable-state-and-recovery.md（ADF 実行識別情報の記録契約節）
- src/common/skills/agentdev-workflow-templates/SKILL.md（検証差分セクション規約）
- src/common/skills/agentdev-workflow-templates/templates/pr_desc.md

### 対象外
- 各 checker の出力形式変更（記録様式側の対応）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/foundations/v4-durable-state-and-recovery.md | 記録契約への checker 別必須要素追加（正規所有者） |
| 配布skill | src/common/skills/agentdev-workflow-templates/SKILL.md + templates/pr_desc.md | 必須要素の規約・テンプレート反映（C6 成果物と同一バッチ） |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: workflow-templates SKILL.md L148-167（検証差分セクション規約）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: checker 別必須要素（集合退避・全列挙+summary 突合）が未規定（実測確認済み）

## 制約

- 意味集合の変更は正規所有 Design（v4-durable-state-and-recovery）経由で行う

## 受け入れ条件

- [ ] textlint 行の hard findings 集合退避が必須要素となる
- [ ] traceability 行の summary + 9 種別全列挙が必須要素となる
- [ ] 正規所有 Design・templates 規約・pr_desc.md が整合更新される

## 元learning item / 根拠

- **要約**: 検証差分記録の様式不足（件数申告・部分列挙、2エントリ: Case #3536）
- **根拠**: 件数不一致 36 vs 40、corpus 系検査の不計上が不可視だった実害
- **再発条件**: 変更行由来 0 件を件数突合だけで判定する close 実行
- **横展開可能性**: 全 Case の検証差分記録

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
