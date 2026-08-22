---
name: agentdev-workflow-orchestration
description: case-run の状態機械、サブエージェント protocol、self-healing loop、CI 対応 loop、1 Issue オーケストレーションの知識ベース。USE FOR: case-run の再開ポイント判定、自律修正ループ判定、CI 対応、subagent起動、障害伝播。DO NOT USE FOR: 単一 Issue の基本的な Step 実行手順、子 Issue 選択や Wave 構成生成。
---

# case-run オーケストレーションナレッジベース

case-run コマンドの状態機械、サブエージェントプロトコル、自律修正ループ、CI 対応ループ、エラー回復の判定基盤を提供する。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-workflow-orchestration` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/designs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-workflow-orchestration.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/designs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/designs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/designs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 状態機械


case-run は単一 Issue または単一 Wave（`#epic` 指定時: 現在 ready な Wave の子Issue を 実行担当サブエージェント（adapter skill 経由、委譲 prompt 内で実行 command を指定）に並列委譲、最大5件）を処理し、Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない（Wave 構成生成は case-open、Wave 境界クローズは case-close の責務）。
Epic 全体の進行は case-auto が case-run(#epic) → case-close(#epic) の反復制御を担い、Wave 内の子Issue 選択、並列委譲は case-run(#epic) が、Wave 境界クローズ、Epic Issue 本文ステータス追跡テーブル更新は case-close(#epic) が担う（単一書き手: ADR、epic-wave-model Design、ADR）。

### case-run internal lifecycle フェーズ構成

case-run は orchestration stage（case-auto が管理する command 間進行、Case 実行オーケストレーション要件 / case-auto 所有）と区別し、単一 Issue または Wave 内の case-run internal lifecycle（Case 実行オーケストレーション要件 / case-run 所有）として次のフェーズを管理する。
本節のフェーズは case-run internal lifecycle に属し、orchestration stage とは混同しない（responsibility-boundary-purification Design「case 実行責務の 4 用語と所有者」参照）。

| フェーズ | Steps | 再開条件 |
|----------|-------|----------|
| 準備フェーズ | 1-4 | worktree+ブランチが存在しない |
| 実装フェーズ | 5-6 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 7-11 | PRが未作成 |

## STEP model（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Workflow Skill として case-run workflow の STEP transition を所有する（control plane）。
STEP 識別子は workflow 内安定識別子であり、STEP reference 8 要素（Purpose / Input Resolution / Preconditions / Procedure / Result / Evidence / Completion Verification / Resume-Idempotency）は `<workflows/step-reference-contract>` Design に従う。
STEP 識別子と durable state から current STEP を復元する契約は `<workflows/input-resolution-and-durable-state>` Design に従う。

### STEP 識別子（case-run workflow）

case-run internal lifecycle フェーズ構成の各フェーズが STEP resume point に対応する。
STEP 識別子は command 固定番号（STEP-1, STEP-2 等）とは区別する。

| STEP 識別子 | 対応フェーズ | 再開条件（precondition） |
|---|---|---|
| `prepare` | 準備フェーズ（Steps 1-4） | worktree+ブランチが存在しない |
| `execute` | 実装フェーズ（Steps 5-6） | work plan未完了 または チェックボックス未完了 |
| `submit` | 提出フェーズ（Steps 7-11） | PR未作成 |

### durable state（case-run workflow）

compaction や中断再開後に current STEP と必要入力を復元するための durable state。
優先順位は `<workflows/input-resolution-and-durable-state>` Design に従う。

1. **SSoT 再構成**: Issue 本文、要件doc、REQ/Decision/Design から再取得・再検証
2. **identifier 保持**: Issue 番号、PR 番号、worktree ブランチ名、STEP 識別子
3. **最小 scalar**: なし（case-run は scalar 状態を保持しない）
4. **runtime artifact**: 要件doc draft、検出事項（REQ-{NNNN} lifecycle に従う）

### Input Resolution（case-run workflow）

各 STEP の開始時に入力を解決する。
自然言語の前STEP result のみに依存せず、durable state 優先順位に従って入力を再構成する。
compaction 後も STEP 識別子と durable state から current STEP を決定し、必要入力を復元できる。

AgentDevFlow 配布契約は「STEP 識別子と durable state から current STEP を復元できる契約」のみを所有する。
ToDo 使用、compaction 検出、current STEP 選択の実処理は harness 固有（AGENTS.md、harness reference）であり、本スキルでは規定しない。

### 並列child task 復元（Epic Wave 実行時）

Epic Wave 実行モードでは child identity（子Issue 番号）と status（`completed-pr` / `blocked` / `failed` / `delegation-unavailable`）を Harness から復元し、完了済み child 状態を durable domain state と再構成して fan-in 判定を行う。
fan-in 判定モデルの詳細は `agentdev-epic-tracker` 参照。

### 準備フェーズの既知の制約（Windows + ジャンクション環境）

- メインリポジトリで `sync-self-opencode.ps1`/ `install-consumer-opencode.ps1` が作成する `.opencode/` 配下のジャンクションリンクは、git worktree（`.worktrees/{N}`）へ伝播しない。worktree 作成後に個別に再作成が必要になる場合がある。
- worktree 内でジャンクション依存の整合性検査（`source-projection-sync` 等）を実行すると、projection 側が存在せず失敗することがある。提出フェーズのローカル検証で整合性検査を含む場合は注意。
- ジャンクション再作成は既存手順に準拠し、本スキルで新規手順は定義しない。詳細、復旧手順は `references/self-healing-and-errors.md` の該当セクションを参照。
- この制約は Windows + ジャンクション環境固有。`resolvePathWithFallback`によるランタイムパス→ソースパスの部分フォールバックはあるが、source/projection 双方向比較を要する検査までは補完しない。

### driver サブエージェント引き継ぎプロンプト制約

Windows + ジャンクション環境の worktree では `.opencode/skills/agentdev-*`、`.opencode/commands/agentdev/` が空になる（ジャンクション未伝播）。
実行担当サブエージェントへ引き継ぐプロンプトには、以下を**必須項目**として明記する。

- 構造化文脈（10意味: 目的、現在の ADF 工程、現在の実行単位、前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、計画変更を識別するための情報）を構造化して含めること（直列化形式は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形参照）
- worktree 内 `.opencode/` は空（ジャンクション未伝播）であること
- source（`src/opencode/`）と projection（`.opencode/`）の編集は手動両辺編集を行うこと
- 同期スクリプト（`sync-self-opencode.ps1` 等）には依存しないこと
- 起動プロンプトテンプレートは `references/subagent-protocol.md` の「driver 起動プロンプトテンプレート（Windows + ジャンクション環境）」を参照

## 参照先

詳細は以下の reference files を参照:

| トピック | 参照先 |
|----------|--------|
| キャプチャ境界定義 | `references/capture-boundaries.md`（Intake/Learning 境界、分割ルール、コマンド責務境界） |
| 自律修正ループ、CI 対応ループ、エラー | `references/self-healing-and-errors.md`（自律修正ループ、CI対応、エラー回復マップ） |
| サブエージェント編集安全手順 | `references/subagent-protocol.md`（oldString最小化、Read検証、大規模ファイル分割、AST-grep推奨、driver 起動プロンプトテンプレート（Windows + ジャンクション環境）） |

case-run コマンドのランタイムパス（projection 先）は `commands/agentdev/case-run.md`。
command 本文内で case-run を参照する場合はこちらを使用。

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定基準、フェーズ定義
- **agentdev-epic-tracker**: Epic ステータス追跡プロトコル



