# STEP-4 / STEP-5: 自動 promote・adversarial-review 経路B（auto-promote-and-review）

> 本 reference は `agentdev-workflow-inspect-promote` SKILL.md の Control Plane STEP-4、STEP-5 詳細である。各 STEP は resume point を持つ（DEC-{N}、`<workflows/step-reference-contract>` SPEC）。

## STEP-4: 自動 promote（`--auto` opt-in 時のみ）

- **Purpose**: 機械的に特定可能で移行先が一意に定まる高確信度検出事項を、HITL を経ずに intake/promoted/ へ自動投入する（fast path）
- **Input Resolution**: STEP-3 の暫定分類結果。自動 promote 対象カテゴリ、安定契約例外、否定文脈の判定基準は workflow-contracts SPEC（extension 経由で解決）を正とする
- **Preconditions**: `--auto` が明示指定されていること、STEP-3 完了
- **Procedure**: 分類結果のうち workflow-contracts SPEC（extension 経由）の自動 promote 対象カテゴリに合致し、かつ安定契約例外および否定文脈を満たさない高確信度検出事項を `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md` へ投入する。各投入を `.agentdev/inspect/promoted/auto-promote-log.md` に追記する（対象検出事項、カテゴリ、投入先ファイル、根拠）。`--auto` 未指定時は本 STEP をスキップし、自動投入を行わない
- **Result**: 自動投入済み検出事項、auto-promote-log 記録
- **Evidence**: `.agentdev/intake/promoted/inspect-auto-*.md` ファイルと auto-promote-log の追記エントリ
- **Completion Verification**: 自動投入対象が全て投入済みで、各投入がログに記録済みであること
- **Resume-Idempotency**: auto-promote-log 記載済みかつ投入先ファイルが存在する検出事項は自動 promote 確定として再投入しない。再開時はログと投入先ファイルの突合により未投入分のみを処理する

## STEP-5: adversarial-review（経路B）

- **Purpose**: 暫定分類結果を adversarial-review による対論的審議へかけ、分類の妥当性を高める
- **Input Resolution**: 手動分類対象の検出事項とその暫定分類結果（promote/defer/reject 判定と根拠）を入力コンテキストとする
- **Preconditions**: review 挿入境界（暫定分類後・HITL 前）への到達。発動条件は後述の判定に従う
- **Procedure**:
  1. **発動条件判定**: inspect-promote は adversarial-review を原則実行する（default-on）。手動分類対象の検出事項（review 対象）が1件以上存在する場合に発動する。ユーザー明示指定は通常発動の必須条件ではない
  2. **skip 条件**: `--auto` 経路（fast path）、または手動分類対象の検出事項が0件（inbox 空、全件 fast path 完了）の場合、省略して従来フロー（STEP-6 HITL 確定）を継続できる。skip 判断のためだけの新規 HITL、承認点は追加しない
  3. **ユーザー明示指定時の必須実行**: ユーザーが本コマンド起動時に adversarial-review を明示的に要求した場合、skip 条件の該当にかかわらず必ず発動する。ただし review 対象（手動分類対象）が存在しない場合は発動しない
  4. **review 呼出**: 手動分類対象の検出事項と暫定分類結果を入力コンテキストとして adversarial-review を呼び出す。adversarial-review は任意助言手段であり、必須工程、QG、承認ゲート、統制ゲートとして導入しない。共通契約（入力コンテキスト、返却契約、呼出失敗時取扱い、再 review 条件、停止条件4点）は adversarial-review SPEC を正とし、本 STEP は再定義しない
  5. **結果反映**: accepted finding を暫定分類結果へ反映する。反映で暫定分類の意味内容が変更された場合、STEP-3（検出事項分類）へ戻し再分類する
- **Result**: review 結果反映済みの暫定分類、または unresolved 停止、または従来フロー継続
- **Evidence**: review 呼出の実行記録、accepted finding の反映記録
- **Completion Verification**: accepted finding の反映が完了していること、または unresolved 判定時に停止していること、または skip 条件該当時に従来フローへ遷移していること
- **Resume-Idempotency**: `--auto` により STEP-4 で自動 promote された検出事項は HITL を経由しない fast path であり、本判定、本 review の対象外とする（review 挿入迂回）。skip 条件該当時、呼出失敗時は STEP-6 を実行せず従来フロー（HITL 確定）を維持する。unresolved な本質的争点が残る場合、STEP-6 へ進まずユーザー判断事項として停止する（adversarial-review 自体を恒久的な統制ゲートとしない）。呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローを維持する

## 関連 STEP

- 前: STEP-3（inbox-scan-and-classification）
- 次: STEP-6（hitl-and-disposition）

## 関連 Capability Skill

- `agentdev-adversarial-review`: 経路B review 呼出（共通契約の正規所有者）
- `agentdev-project-extensions`: workflow-contracts SPEC の extension 経由解決

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G01（ユーザーの明示的な承認なしに採用済み成果物を生成しない。`--auto` による自動 promote 対象を除く）
- G06（`--auto` は明示 opt-in の場合のみ有効。省略時は自動 promote を一切行わない）
- G08（`--auto` 実行の都度、投入対象、根拠を `.agentdev/inspect/promoted/auto-promote-log.md` に記録する。誤検知 revoke 手順は同 SPEC 参照）
