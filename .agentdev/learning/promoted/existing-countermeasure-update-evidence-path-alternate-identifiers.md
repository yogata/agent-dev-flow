# 既存対策の更新: Case Issue 本文の evidence path へ prune 後耐久識別子の併記

## 背景

case-run SSoT 再取得（Case #3107、PR #3127）で、Case Issue 本文のレビュー判断（RD-001/RD-002）が参照する evidence path（`.agentdev/learning/promoted/existing-countermeasure-update-junction-os-command-differences.md`、`.agentdev/learning/promoted/existing-countermeasure-update-worktree-operations-backslash-path-note.md`）が、本 Case の SSoT 再取得時点で worktree・main とも存在しなかった。
backlog-review の prune（成功成果物削除）による正常なライフサイクルの可能性が高いが、本文からは prune 済みなのか欠落なのか判別できない。
実装阻害なし（REQ-018-006/007 行本文に学びの内容が合意済み投影として凝縮済み）として case-close を継続し、本観察を learning inbox へ回収した。

## 問題

採用済み学びの evidence path を Case Issue 本文へ絶対パスで記録する構成は、promoted 成果物の削除（prune）後に参照不能になる。
prune は成功成果物の正常な削除であり、参照側の本文に tombstone もライフサイクル記録も残らない。path 単独の参照は後工程（case-revise・監査）での証跡追跡を弱め得る。

## 望ましい変更

Case Issue 本文の evidence path は、参照先成果物のライフサイクル（prune）を跨いで耐える識別子（promoted 時の RU 番号・learning タイトル・関連 Case 番号）と併記する記録規約を導入する。

- Issue 本文テンプレートの evidence 記録規約に「path + prune 後も識別可能な代替識別子（RU 番号・タイトル）の併記」を追加する。
- backlog-review 側の prune 記録との突合手順を明記する（prune 済み / 欠落の判別可能性の確保）。

## 対象範囲

### 対象

- Issue / PR 本文テンプレートの evidence 記録規約
- backlog-review の prune 記録との突合手順の明記（運用手順）

### 対象外

- prune（成功成果物の削除）ライフサイクル自体の変更
- Case Issue 本文の既存記録の遡及書換え
- REQ-018-006/007 の契約変更（本学びの内容は同行に合意済み投影として凝縮済み〔エントリ申告〕）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| template | src/opencode/commands/agentdev/templates/（Issue 本文テンプレート・req-define が該当テンプレートを特定） | evidence 記録規約への代替識別子併記の追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-templates/SKILL.md | evidence 記録規約の選択規則への代替識別子併記の追記要否 |
| 配布skill | src/opencode/skills/agentdev-backlog-integration/SKILL.md | prune 記録との突合手順（prune 済み / 欠落の判別）の明記要否 |

## 既存対策確認

- **確認結果**: 既存対策あり（promoted 成果物の prune は証拠保存方針〔staged エントリ除去時に「元learning item / 根拠」セクションに証拠保存〕に従う。エントリ申告の REQ-018-006/007 に学びの内容が凝縮済み）
- **該当ファイル**: src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md（Prune 方針・証拠保存）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: prune 側の証拠保存は規定されているが、参照側（Case Issue 本文の evidence path 記録）に prune を跨ぐ代替識別子の併記規約がなく、prune 済み / 欠落の判別が本文からできない。

## 制約

- テンプレート変更は間接影響（既存 Case 本文との表記差）を伴うため、req-define の変更影響分析で影響範囲を確認する。
- 遡及書換えは行わない。以後の記録から規約を適用する。

## 受け入れ条件

- [ ] evidence 記録規約に prune 後も識別可能な代替識別子（RU 番号・learning タイトル・関連 Case 番号）の併記が明記されている
- [ ] prune 記録との突合（prune 済み / 欠落の判別）手順が確認できる

## 元learning item / 根拠

- **要約**: Case Issue 本文のレビュー判断 evidence path が backlog-review prune 後に参照不能になる構造（prune を跨ぐ識別子併記の規約ギャップ）。ユーザーHITL承認（2026-09-25）により既存対策の更新として確定。
- **根拠**: Case #3107（PR #3127）の SSoT 再取得時観察。RD-001/RD-002 の evidence path が worktree・main とも不在。prune（正常ライフサイクル）と欠落の判別不能。実装阻害なしとして case-close 継続（REQ-018-006/007 行本文に学びの内容が合意済み投影として凝縮済み〔エントリ申告〕）。
- **再発条件**: learning promoted 成果物を参照する Case Issue 本文が backlog-review prune 以降に後工程で再読込された場合。
- **横展開可能性**: evidence path を本文に記録する Case Issue 全般（case-revise・監査での証跡追跡）に共通する記録規約の知見。

## 推奨Issue分類

- **分類**: refactor
- **推奨ラベル**: documentation（記録規約追記）
- **関連Issue**: Case #3107（PR #3127）
