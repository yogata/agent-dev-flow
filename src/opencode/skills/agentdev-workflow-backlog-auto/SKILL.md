---
name: agentdev-workflow-backlog-auto
description: "backlog-auto command の workflow 実装本体。orchestration stage 構成（stage 1: inspect-docs 単独直列、stage 2: 昇格3系統の並行実行と競合直列化、stage 3: backlog-review）、fan-in 判定、停止伝播、resume 契約を所有する。USE FOR: backlog-auto 実行時の workflow 制御（工程間順序制御、昇格3系統の並行実行と競合処理の直列化、fan-in 判定、停止伝播、再開）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの所有（各子 Workflow Skill が正規の処理主体）。"
---
<!-- ADF-COVERS(implementation): REQ-041-002, REQ-041-003, REQ-041-004, REQ-041-005, REQ-041-006, REQ-041-007, REQ-041-008, REQ-041-009, REQ-041-010, REQ-041-011, REQ-041-012, REQ-041-013, REQ-041-014, REQ-041-015, REQ-041-016 -->

# backlog-auto workflow スキル

backlog-auto command の workflow 実装本体。
backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）の工程間制御（順序、並列と直列化、fan-in、停止伝播、再開）を所有する。
子ワークフロー内部の分類、評価、昇格、RU 生成ロジックは各子 Workflow Skill が正規の処理主体として所有し、本スキルはこれらを複製しない。

backlog-auto command は公開 interface（入出力契約、ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-auto.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と backlog-auto command の公開契約のみを前提とする。Design ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- backlog-auto command から渡される入力（引数なし。対象状態は各子コマンドの durable state から解決する）

## 出力

- 各子コマンドの既存出力（子コマンド公開契約どおり）
- backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）

## 副作用

- 各子ワークフローの既存副作用（`.agentdev/` 配下の成果物作成、削除、git commit / push、ユーザー対話）を子コマンド公開契約どおりに発生させる。本スキルは新規の副作用を追加しない
- 当該 Workflow Skill は worktree root 配下以外を編集しない

## Control Plane（STEP 一覧）

backlog-auto workflow は次の6 STEP で構成する。
各 STEP は resume point を持ち（DEC-{N}、`<workflows/step-reference-contract>` Design）、会話コンテキストに依存せず、durable state（`backlog_auto_started_at`、各子コマンドの durable state）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 開始時刻記録・進行状態初期化 | backlog-auto 起動 | 開始時刻記録、durable state からの進行状態再構成 | [references/stage-execution.md](references/stage-execution.md) |
| STEP-2 | stage 1: inspect-docs 実行 | 開始時刻記録済み | 検出事項生成または検出事項なし完了 | [references/stage-execution.md](references/stage-execution.md) |
| STEP-3 | stage 2: 昇格3系統実行 | stage 1 正常終了 | 系統別実行結果（正常完了 / 対象なし終了 / blocked / failed / 未完了） | [references/stage-execution.md](references/stage-execution.md) |
| STEP-4 | fan-in 判定 | 3系統の結果受領 | backlog-review 開始可否の判定 | [references/fan-in-and-reporting.md](references/fan-in-and-reporting.md) |
| STEP-5 | stage 3: backlog-review 実行 | fan-in 判定が開始可 | RU 生成、成功成果物削除（backlog-review 公開契約どおり） | [references/fan-in-and-reporting.md](references/fan-in-and-reporting.md) |
| STEP-6 | 完了報告 | 全工程完了 or 停止 | 工程別結果、停止理由、再開コマンド提示を含む実行結果報告 | [references/fan-in-and-reporting.md](references/fan-in-and-reporting.md) |

### STEP 間の依存と分岐

- **正常経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6
- **stage 1 停止経路**: STEP-2 で inspect-docs が blocked / failed → 下流工程（stage 2、stage 3）を開始せず STEP-6（停止報告）
- **fan-in 不合格経路**: STEP-4 で1系統でも blocked、failed、未完了 → backlog-review を開始せず STEP-6（停止報告、全体完了報告の抑制）
- **系統内再開**: STEP-3 の各系統は子ワークフローの既存再開契約（STEP model、durable state）で系統内の再開点から再開する

### resume protocol

- 再開点は durable state から再構成する: `backlog_auto_started_at`、stage 1 の完了証跡（直近 inspect-docs 実行の検出事項ファイル群または検出事項なし完了）、stage 2 系統別の durable state（learning は `inbox.md` / `deferred.md` / `evaluation-report.md` / `promoted/`、intake は `inbox/` と `promoted/` の実ファイル状態、inspect は `inbox/` と `promoted/` と auto-promote-log）、stage 3 の durable state（各 `promoted/` 残存成果物、`.agentdev/backlog/req-units/` の `RU-*.md` 実ファイル）
- 完了済み工程を重複実行せず、未完了工程を完了済みと誤認しない。確定不能な工程は未完了として扱う
- inspect-docs は STEP model 対象外であり、実行途中の中断時は先頭から再実行する
- 停止時報告に再開点と再開可能な次コマンド（`/agentdev/backlog-auto` 再実行または対象子コマンドの単独実行）を明示し、会話コンテキストの記憶に依存しない

### termination

- 正常終了: stage 3（backlog-review）完了時の完了報告まで（全系統対象なし終了であっても backlog-review 実行後の完了報告を含む）
- 停止終了: inspect-docs の blocked / failed（下流非開始）、fan-in 判定不合格（blocked / failed / 未完了残存時の backlog-review 非開始）のいずれかの検出時（停止理由分類済み報告）

## 下位 Workflow Skill 連携（上位 orchestrator）

本スキルは上位 orchestrator として次の下位 Workflow Skill を名レベルで参照する。
下位 workflow の契約詳細を複製しない。

- `agentdev-workflow-inspect-docs`: stage 1 工程（診断専用、STEP model 対象外、中断時は先頭再実行）
- `agentdev-workflow-learning-promote`: stage 2 learning 系統
- `agentdev-workflow-intake-promote`: stage 2 intake 系統
- `agentdev-workflow-inspect-promote`: stage 2 inspect 系統（`--auto` は子コマンドの明示 opt-in のみで有効化され、本 workflow の通常実行では渡さない）
- `agentdev-workflow-backlog-review`: stage 3 工程

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-project-extensions`: project extension 読込
- 各子ワークフローが依存する Capability Skill（`agentdev-learning-pipeline`、`agentdev-intake-pipeline`、`agentdev-backlog-integration` 等）は各子 Workflow Skill 経由で継承され、本スキルから直接参照しない

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-auto.yaml`、`kind: workflow-extension`）を読み込む場合がある。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。
Workflow Skill のみが読み、backlog-auto command は直接読まない。

## 共通制約

- **soft guard**: 本スキルは `/agentdev/backlog-auto` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わない
- **順序ゲート**: inspect-docs が正常終了する前に昇格3系統を開始しない。昇格3系統すべてが正常完了または対象なしで終了する前に backlog-review を開始しない
- **直列化契約**: 競合する Git 操作（同期、commit、push）、共有成果物への競合書き込み、ユーザー対話は直列化する。ユーザー対話は系統識別付きで表示する
- **HITL 境界の維持**: 各子ワークフローの HITL 境界、安全境界、停止条件、自動昇格 opt-in を子ワークフロー側の所有として維持し、本スキルは新規の判断境界を追加しない
- **部分停止の非連鎖**: 1系統の blocked、failed で独立して進行可能な他系統を停止しない。blocked、failed、未完了残存時は backlog-review を開始せず、全体完了を報告しない
- **対象なしの正常扱い**: 昇格3系統の対象なし終了は正常終了として扱う。新規 promoted 0件でも backlog-review を実行する（実行前から存在する promoted を処理対象にできる）
- **親コンテキスト非累積**: 系統別の完了結果（結果状態、出力パス、次アクション）のみを親コンテキストに保持し、系統内部の調査過程、中間ログ、読解メモを親コンテキストに累積しない
- **実装分類**: manager-orchestrator（既存の実装分類を利用）。子ワークフロー内部の分類、評価、昇格、RU 生成ロジックは子 Workflow Skill の責務であり、本スキルは工程間の順序制御のみを所有する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **backlog-auto command**: 本スキルの呼出元（公開 interface、ガードレール、dispatch を所有）
