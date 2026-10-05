# STEP-8: adversarial-review 挿入境界（req-define、adversarial-review-integration）

> 本 reference は `agentdev-workflow-req-define` SKILL.md の STEP-8 詳細である。
> req-define の adversarial-review 挿入境界を提供する。
> 挿入境界の正規所有者は req-define command Design（extension 経由）「adversarial-review 挿入境界（req-define）」節であり、本 reference は実行時詳細である。

## STEP-8: adversarial-review

### Purpose

要件候補に対して adversarial-review を原則実行し（default-on）、本質的争点を要件確定前に解消する。

### Input Resolution

1. SSoT 再構成: 要件候補（draft-data、`agreed_items`、`artifact_actions`、Decision判断結果、Scale判断結果）
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: draft-data 下書き

### Preconditions

- STEP-7（Scale判断: feature）または work_type 判定（feature 以外）が完了しており、STEP-9（ドラフト保存）の前であること
- 局所修正・追記を含む場合、draft-generation.md の構造・変更前提検査、決定的組立、差分・完結性検査が完了していること

### Procedure

review に進む前に、ドラフトの構造検査、決定的組立、組立後の差分検査をこの順で完了する（詳細と戻り値契約は [draft-generation.md](draft-generation.md)「決定的な局所組立・検査」を参照）。その後に意味レビューを行い、accepted finding の反映後は構造検査・組立・差分検査を再実行してから意味を再評価する。検査証拠は入力ハッシュと検査範囲が同一の場合のみ再利用し、結果と戻り値を draft の証拠として保持する。

req-define は adversarial-review を原則実行する（default-on）。
発動条件判定と review 呼出を分離する。

adversarial-review は構造・変更前提検査、組立、差分・完結性検査の後に行う意味レビューである。機械検査の成功で意味レビューを代替せず、指摘を反映した場合は影響する依存判断を再評価する。

- **発動条件判定**: default-on で発動する。skip 条件（Scale=L0 で Decision判断対象なし、意味的決定なし）該当時は省略して従来フロー（review を挿入せず STEP-9 へ進む）を継続できる。ユーザーが review の実施を明示的に指示した場合は通常のユーザー指示としてその場で実行する（専用の検出・フラグ・保存・伝播・skip 条件の専用上書き処理を持たない）。skip 判断のためだけの新規 HITL、承認点は追加しない
- **review 呼出**: 発動条件判定で発動と判定された場合、要件候補（draft-data、`agreed_items`、`artifact_actions`、Decision判断結果、Scale判断結果）を対象に adversarial-review を呼び出す。委譲契約は v4-delegation-contracts Design（extension 経由）「adversarial-review との委譲契約接続」節に従う
  - Decision finding は STEP-5（Decision判断）へ戻し再評価する。要件展開に関わる finding は該当 STEP へ戻す。accepted finding の反映は呼出元の責務である
  - 未解決のユーザー判断事項が残る場合、STEP-9（ドラフト保存）へ進まない。工程委譲起源であるため既存 status に unresolved 判断事項を付加する
  - 呼出失敗時は silent skip を禁止し、従来フローを維持する

詳細な挿入境界は req-define command Design（extension 経由）「adversarial-review 挿入境界（req-define）」節を正とする。

### Result

- review 結果反映（accepted finding の draft-data 反映、差し戻し実施）または skip 判定

### Evidence

- review 呼出記録、finding と反映結果、skip 判定の根拠

### Completion Verification

- 発動時: unresolved なユーザー判断事項が残っていないこと（残る場合は STEP-9 へ進まない）。skip 時: skip 条件該当の根拠が記録されていること

### Resume-Idempotency

- review 実行は read-only（書き込み禁止型）であり副作用を持たない。中断再開時は要件候補（durable state 下書き）を再読込して再呼出できる。同一 finding を新証拠なしに再起票しない

## 関連 STEP

- 前: STEP-7（draft-generation.md）
- 次: STEP-9（draft-generation.md）

## 関連 Capability Skill

- `agentdev-adversarial-review`: req-define の review 実行（3論理役割、動的レビュー戦略、read-only 境界）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（壁打ちフェーズのみ）
- 新規 HITL 追加禁止（skip 判断のためだけの承認点を作らない）
