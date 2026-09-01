# Skill 側で確定済みの運用内容の Design 反映（8件統合）

## 背景

case-run / case-close / quality-gates の workflow Skill 側で確定済みの運用内容（bun test 正規形、QG-4 機械受理、tmp 残存確認、gate 意味論、em-dash ゲート、AUTOGEN 免除、typecheck 対象）が、対応する Design に未反映のまま残存している。

## 問題

Skill（実行時投影）と Design（正規所有者）の記述が乖離し、Design を参照した更新・検証が実態と合わない。

## 望ましい変更

Skill 側で確定済みの内容を各 Design へ反映する。

## 対象範囲

### 対象

| item | 対応 |
|---|---|
| case-close-bun-test-contract-section-update | docs-and-design-promotion.md L80-87 の単一 suite 形態を現行（3 cwd 分割）へ |
| quality-gates-design-bun-test-canonical-form | agentdev-quality-gates.md L72-82 へ bun test 正規形（3 cwd）を反映 |
| quality-gates-design-qg4-machine-acceptance | QG-4 機械受理基準の Design 反映 |
| workflow-spec-tmp-residual-step-reflect | case-run/case-close SKILL の tmp 残存確認内容（L70,80 / L70-71）を Design 側へ |
| case-run-design-gate-semantics-reflection | case-run gate（S3-6/S5-1）の Design 反映漏れ |
| em-dash-introduction-gate-check | em-dash 導入時ゲートの組込み（checker/検査設計への反映） |
| autogen-block-exemption-unapplied | AUTOGEN retired 参照行領域の免除未実装の反映（checker 実装 or baseline 運用の確定） |
| check-integrity-typecheck-coverage | check_integrity の typecheck 対象外範囲と既存型エラーの扱いを Design へ明記 |

### 対象外

- Skill 側本文の変更（既に確定済み）
- checker 実装の変更（typecheck 対象拡張は範囲判断を含む）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/designs/commands/case-close.md、docs/designs/skills/agentdev-workflow-case-close、docs/designs/skills/agentdev-workflow-case-run、docs/designs/skills/agentdev-quality-gates、docs/designs/integrity/checker-execution-contracts.md | 上表の Design 反映 |

## 既存対策確認

- **確認結果**: Skill 側に対策あり、Design 側が未追随
- **ギャップ分類**: application miss（反映先 Design への未適用）

## 制約

- Design 反映は現行 Skill の記述を正として行う
- checker 実装変更が必要な項目（em-dash ゲート・AUTOGEN 免除）は Design に方針を明記し実装は別 Case

## 受け入れ条件

- [ ] 上表8件の内容が対応 Design に反映されている
- [ ] Skill と Design の記述が乖離していないことを再確認できる

## 元learning item / 根拠

- **根拠**: 各 intake item の Skill 側現行記述確認（行番号実証済み）
- **横展開可能性**: Skill/Design 二層構造の全領域

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
