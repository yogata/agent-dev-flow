# STEP-4: adversarial-review 統合（経路F、adversarial-review-integration）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の Control Plane STEP-4 詳細である。adversarial-review 挿入境界（経路F、REQ-015-009）の発動条件判定と review 呼出、結果反映を提供する。

## 開始条件

- STEP-3 で execution structure が確定している
- STEP-2 で Issue 本文候補・完了条件（QG-2 検証済み）が生成されている

## 挿入境界

execution structure、Issue 本文候補、完了条件を構成した後、**最初の GitHub Issue 作成の前**に挿入する。

- **Epic flow の場合**: STEP-5（テンプレート読込）、Epic Issue 本文生成完了後、Epic Issue 作成の前
- **Standard flow の場合**: preflight（STEP-3）完了後、関連ADR特定の前

## 発動条件判定（REQ-015-002、REQ-015-003）

case-open は adversarial-review を**原則実行する**（default-on、REQ-015-002）。発動条件判定と review 呼出を分離する（REQ-015-001）。

- **skip 条件**: Standard flow で単一 OU の機械的確定、Wave 分割なし（REQ-015-003）。該当時は省略して従来フロー（review を挿入せず最初の GitHub Issue 作成 STEP へ進む）を継続。Epic flow は Epic Issue 作成、Standard flow は Standard Issue 作成へそのまま進む
- **ユーザー明示指定時**: skip 条件にかかわらず必ず発動する（REQ-015-002）
- **skip 判断のためだけの新規 HITL、承認点は追加しない**

## review 呼出（REQ-015-001）

発動条件判定で発動と判定された場合、次の3者を対象に adversarial-review を呼び出す。

1. execution structure（STEP-3 で確定）
2. Issue 本文候補（Epic flow は Epic Issue 本文、Standard flow は Issue 本文）
3. 完了条件（STEP-2 の QG-2 で検証済み）

委譲契約は delegation-contracts SPEC（extension 経由）「adversarial-review との委譲契約接続」節に従う。

## 結果反映

- execution structure に関わる finding は STEP-3（execution-unit-and-preflight）へ戻し再評価
- Issue 本文、完了条件に関わる finding は該当 STEP へ戻す
- accepted finding の反映は呼出元の責務（REQ-014-006）

### 変更影響別の再実行ルール（REQ-015-009）

review の結果反映で review 対象の意味内容が変更された場合、変更影響範囲に応じて4パターンのいずれかを実行する。

| 変更影響 | 再実行パターン |
|---|---|
| 完了条件のみ変更 | QG-2（STEP-2）を再実行 |
| execution structure のみ変更 | preflight（STEP-3）を再実行 |
| 両方が変更 | QG-2、preflight 両方を再実行（順序は QG-2 → preflight） |
| 意味内容変更なし | 再実行不要、最初の GitHub Issue 作成 STEP（STEP-5）へ進む |

### unresolved 判断事項

未解決のユーザー判断事項が残る場合、最初の GitHub Issue 作成 STEP（STEP-5）へ進まない（REQ-014-009）。工程委譲起源であるため既存 status に unresolved 判断事項を付加する（REQ-014-012）。

### 呼出失敗時の扱い

呼出失敗時は silent skip を禁止し、従来フローを維持する（REQ-014-010）。

## resume point

- 発動条件判定結果（発動 / skip）
- review 呼出結果（findings、accepted/rejected）
- 4パターン再実行ルールの実行状態
- unresolved 判断事項の有無

## 関連 STEP

- 前: STEP-3（execution-unit-and-preflight）
- 次: STEP-5（issue-creation-flows）

## 関連 Capability Skill

- `agentdev-adversarial-review`: 経路F review 呼出、3論理役割、動的レビュー戦略
- `agentdev-quality-gates`: QG-2 再実行（review 結果反映時）
