---
title: adversarial-review 挿入境界（case-run: adapter 委譲内）
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# adversarial-review 挿入境界（case-run: adapter 委譲内）

## adversarial-review 挿入境界（case-run: adapter 委譲内）

本節は case-run における adversarial-review caller integration（REQ-015-010、adapter 委譲内）の挿入境界を正典として所有する（REQ-014-011）。
共通 caller integration 契約の正規所有者は adversarial-review Design であり（REQ-014-003）、本節は case-run の adapter 委譲内固有の挿入位置、発動条件、実装方針限定、blocked 遷移のみを所有する。
adversarial-review 自身の振る舞い契約、再 review 条件、停止条件は adversarial-review Design を正とし、本節で再定義しない。
実装方針形成、review 呼出、結果反映の内部手続きの正規所有者は `agentdev-case-run-execution-adapter` Design「adversarial-review 統合（実装方針→review→結果反映）」節とし、本節は参照する。

### 挿入境界と構造（REQ-015-001）

case-run の adapter 委譲内統合は他の6呼出元（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open）と異なり、review 挿入境界を case-run 本体の処理段階へ直接挿入しない。
代わりに、実行担当サブエージェント起動における adapter 委譲の内部に review 挿入境界を設ける。
発動条件判定と review 呼出の分離（REQ-015-001）は adapter 委譲内で達成され、case-run 本体は review 発動の有無を判定しない。
本節は委譲境界を case-run 呼出の正典として一意に特定し、Workflow Skill（`agentdev-workflow-case-run`）の委譲起動手順が実行時実装先となる。

| 段階 | 対応処理 | 役割 |
|---|---|---|
| 委譲 | case-run 実行担当サブエージェント起動 | adapter skill 経由で委譲を起動し、委譲 prompt 内で実行 command を指定する。実装方針の生成、review、結果反映は委譲内へ委ねる |
| 発動条件判定 | adapter 委譲内（実装方針形成完了後、最初の実装変更前） | skip 条件の該当を実行担当サブエージェントが判定する |
| review 呼出 | adapter 委譲内（発動条件該当時、最初の実装変更前） | 実行担当サブエージェントが adversarial-review を起動し、実装方針を審議対象へ渡す |
| 結果反映 | adapter 委譲内（review 完了後、最初の実装変更前） | accepted finding を実装方針へ反映する。反映後、意味内容変更時は必要な既存検証を再実行する |
| result 返却 | case-run 実行担当サブエージェント result 処理 | result 契約（completed-pr / blocked / failed / delegation-unavailable）で case-run 本体へ返却 |

### case-run 本体は実装方針を生成・審査しない（REQ-015-010）

case-run 本体（全フェーズの orchestration）は実装方針の生成、審査、review を行わない（REQ-015-010）。
実装方針の形成、adversarial-review 呼出、結果反映は委譲内で agentdev-case-run-execution-adapter の委譲契約に従い、最初の実装変更前に実施する。
case-run 本体が実装方針を生成、保持、審査するステップを新設しない。
委譲 result（4状態）のみで adapter 委譲内の結果を受領する。

### 実装方針限定（REQ-015-010）

adapter 委譲内で形成する実装方針は、既確定 Issue 本文、REQ、Decision、Design を実現する内部選択（関数配置、命名、データ構造の選択、実装の並び順等）に限定する（REQ-015-010）。
実装方針は既確定文書へ矛盾しない内部選択の範囲内で review 審議対象となる。
実装方針が既確定 Issue/REQ/Decision/Design の変更、追加、撤回を必要とする場合、実行担当サブエージェントは実装を開始せず blocked へ遷移する。

### blocked 遷移（REQ-015-010、REQ-015-011）

adapter 委譲内で次のいずれかに該当する場合、実行担当サブエージェントは result を `blocked` として case-run へ返却する（REQ-015-010、REQ-015-011）。

- 実装方針が既確定 Issue/REQ/Decision/Design の変更、追加、撤回を必要とする（REQ-015-010）
- 要件、仕様に問題（欠落、矛盾、曖昧さ、実現不可能な条件等）を検出した（REQ-015-011）
- adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残り、実装の最初の変更（不可逆処理）へ進めない（REQ-014-009）

blocked 詳細本文は Issue コメントに SSoT として記録され、case-run の result 処理で扱われる。
実行担当サブエージェントは要件、仕様問題を検出した場合、勝手に仕様変更、REQ 黙示変更、Decision 再解釈を行わず、必ず blocked 経路へ入る（REQ-015-011、REQ 黙示変更禁止制約）。

### 発動条件（REQ-015-002、REQ-015-003）

case-run は adversarial-review を原則実行する（default-on、REQ-015-002）。
発動条件判定は adapter 委譲内で実行担当サブエージェントが行う。
ユーザー明示指定は通常発動の必須条件ではなく、実装方針の意味的決定が存在する場合に発動する。
case-run 本体は発動条件の有無を判定、伝達しない。

- **skip 条件**: adapter 委譲内で実装方針が自明（既確定 Design の機械的反映、単一ファイル編集等）で、実装方針の意味的決定（関数配置、命名、データ構造選択）が存在しない場合、adversarial-review を省略して従来フローを継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。

### 従来フロー維持（REQ-015-003）

skip 条件該当時、呼出失敗時（REQ-014-010）のいずれの場合も、case-run の従来フロー（全フェーズ）を維持する（REQ-015-003）。
review 挿入境界は case-run 本体の既存処理段階を追加、削除、並べ替えせず、委譲内での発動条件判定と review 呼出の分離のみを追加する。
委譲 result が `completed-pr` の場合、従来どおり result 処理で PR 番号を受領しクリーンアップフェーズへ進む。

### 戻り先と反映責務

accepted finding の実装方針への反映は adapter 委譲内の実行担当サブエージェント責務である（REQ-014-006）。
adversarial-review は finding を提示し、合意候補を形成するが、実装方針、実装ファイル、PR 本文への反映を自身では行わない。
反映後に実装方針の意味内容が変更された場合、adapter 委譲内で必要な既存検証（REQ/Decision/Design 整合性再確認、targeted docs guard、QG-3 等）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ adapter 委譲内で再 review を発動できる（REQ-014-007）。
unresolved な本質的争点またはユーザー判断事項が残る場合、実装の最初の変更（不可逆処理）へ進まず blocked へ遷移する（REQ-014-009、前述「blocked 遷移」節）。

### 正規所有者マトリックス参照

本節と adversarial-review Design「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts Design「adversarial-review との委譲契約接続」節、`agentdev-case-run-execution-adapter` Design「adversarial-review 統合（実装方針→review→結果反映）」節との間で意味の重複、矛盾を生じない。
case-run command 固有の挿入境界（委譲内実施、委譲起動位置、実装方針限定、blocked 遷移）のみを本節が所有し、実装方針形成、review 呼出、結果反映の内部手続きの詳細は `agentdev-case-run-execution-adapter` Design を正とする。
