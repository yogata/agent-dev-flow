---
name: agentdev-workflow-inspect-promote
description: "inspect-promote command の workflow 実装本体。検出事項（finding）の分類（promote/defer/reject）、自動 promote（--auto opt-in）、adversarial-review 経路B、HITL 確定、promote/reject/defer 処理実行、.agentdev 永続化を、独立 resume point を持つ STEP model（durable state から再開可能）として所有する。USE FOR: inspect-promote 実行時の workflow 制御（inbox スキャン・分類・経路B review・HITL 確定・処理実行・永続化）。DO NOT USE FOR: 検出事項の生成、REQ/Decision/SPEC 変更、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# inspect-promote workflow スキル

inspect-promote command の workflow 実装本体。`.agentdev/inspect/inbox/` の検出事項を分類（promote/defer/reject）し、採用した検出事項を `.agentdev/inspect/promoted/` へ保存、却下した検出事項を即時削除、見送りを inbox に残置する。`--auto` 明示 opt-in 時は高確信度検出事項を `.agentdev/intake/promoted/` へ自動投入する。finding disposition を STEP resume point として所有する。

inspect-promote command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-promote.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と inspect-promote command の公開契約のみを前提とする。SPEC ディレクトリの内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- `.agentdev/inspect/inbox/*.md`（検出事項ファイル群）
- `--auto`（省略可能）: 高確信度検出事項の自動 promote を有効化する明示 opt-in。省略時は従来の手動分類フローのみ

## 出力

- `.agentdev/inspect/promoted/*.md`（手動 promote 採用済み、RU 化対象）
- reject 検出事項は即時削除（reject 時の commit message に却下理由を含める、監査証跡の補強）
- `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時の自動 promote 成果物。backlog-review へ流入）
- `.agentdev/inspect/promoted/auto-promote-log.md`（`--auto` 実行ログ。append-only）
- セッション内完了報告

## 副作用

- `.agentdev/inspect/`（inbox 削除・残置、promoted/ 保存、auto-promote-log 更新）と `.agentdev/intake/`（promoted/ 投入）配下のファイル作成・削除
- 上記配下に限る git commit/push（commit message: `chore(agentdev): promote inspect findings`）
- 検出事項の分類確定状態とユーザー承認状態は durable state（ファイル配置）として保持する

## 3層責務（deterministic check / semantic diagnosis / finding disposition）

| 層 | 担当 | 本スキルの位置づけ |
|---|---|---|
| deterministic check（機械的検査） | docs-check 等の機械検査レイヤ、決定的検証スクリプト | 対象外。機械的検査は前段レイヤが担当する |
| semantic diagnosis（意味診断） | inspect-docs workflow、inspect-skills workflow | 対象外。本スキルは診断を生成しない（前段が生成した検出事項を消費するのみ） |
| finding disposition（検出事項の分類・採用） | inspect-promote workflow（本スキル） | **本スキルの担当**。検出事項の分類・採用・保留・却下とユーザー承認を処理する |

## Control Plane（STEP 一覧）

inspect-promote workflow は次の8 STEP で構成する。各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。会話コンテキストに依存せず、durable state（`.agentdev/inspect/inbox/`、`.agentdev/inspect/promoted/`、`.agentdev/intake/promoted/`、auto-promote-log）から再開点を再構成する。**finding disposition（STEP-3〜STEP-7 の分類・採用・保留・却下）は独立した resume point 群を構成する。**

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 実行前同期 | command 実行開始 | `git pull --ff-only` 完了 | [references/inbox-scan-and-classification.md](references/inbox-scan-and-classification.md) |
| STEP-2 | inbox スキャン | 同期完了 | 検出事項一覧（空時は「対象なし」で終了） | [references/inbox-scan-and-classification.md](references/inbox-scan-and-classification.md) |
| STEP-3 | 検出事項分類（暫定分類） | 検出事項一覧確定 | 暫定分類結果（promote/defer/reject と根拠） | [references/inbox-scan-and-classification.md](references/inbox-scan-and-classification.md) |
| STEP-4 | 自動 promote（`--auto` fast path） | `--auto` 指定かつ暫定分類確定 | `.agentdev/intake/promoted/inspect-auto-*.md` 投入、auto-promote-log 記録 | [references/auto-promote-and-review.md](references/auto-promote-and-review.md) |
| STEP-5 | adversarial-review（経路B） | 挿入境界（暫定分類後・HITL 前）到達、発動条件成立 | review 結果の暫定分類反映、または unresolved 停止、または従来フロー継続 | [references/auto-promote-and-review.md](references/auto-promote-and-review.md) |
| STEP-6 | HITL 確定（手動分類対象） | review 完了または skip | ユーザー承認済み分類結果 | [references/hitl-and-disposition.md](references/hitl-and-disposition.md) |
| STEP-7 | 処理実行（promote / reject / defer） | HITL 承認完了 | promoted/ 保存、inbox 削除（promote）、即時削除（reject）、inbox 残置（defer） | [references/hitl-and-disposition.md](references/hitl-and-disposition.md) |
| STEP-8 | 完了報告・永続化 | 処理実行完了 | 完了報告、`.agentdev/` 変更の commit/push | [references/hitl-and-disposition.md](references/hitl-and-disposition.md) |

### STEP 間の依存と分岐

- **通常（手動分類）**: STEP-1 → STEP-2 → STEP-3 → （`--auto` 未指定時は STEP-4 を skip） → STEP-5（skip 条件該当時は省略） → STEP-6 → STEP-7 → STEP-8
- **`--auto` 指定時**: STEP-4 で自動 promote 対象を fast path として投入し、手動分類対象のみ STEP-5 以降へ進む
- **inbox 空**: STEP-2 で「対象なし」と報告して終了
- **unresolved な本質的争点**: STEP-5 でユーザー判断事項として停止（STEP-6 へ進まない）

## resume protocol（DEC-{N}、会話記憶非依存）

- 各 STEP の再開点は durable state から再構成する（`<workflows/input-resolution-and-durable-state>` SPEC の優先順位に従う）
- **検出事項ごとの分類確定状態の再構成**: inbox に残存する検出事項は未確定（STEP-3 分類から再開）、`.agentdev/inspect/promoted/` に保存済みの検出事項は promote 確定（再保存しない）、auto-promote-log 記載済みかつ `.agentdev/intake/promoted/inspect-auto-*.md` 投入済みは自動 promote 確定（再投入しない）、inbox から削除済みは reject 確定（復元しない）、inbox 残置かつ処理実行済み報告があるものは defer 確定
- **HITL 承認状態**: 承認は処理実行（STEP-7）の完了状態から逆算して再構成する。処理実行が済んでいない検出事項は承認未了と扱い、HITL 確定（STEP-6）から再開する
- 自然言語の前 STEP result のみに依存した再開を行わない

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-adversarial-review`: 経路B review 呼出（共通契約は同 skill が正規所有）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（明示パス stage、`git commit -- <paths>`）
- `agentdev-conventional-commits`: commit message 規約（reject 時の却下理由記載含む）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込契約

本スキルは workflow-extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-promote.yaml`、kind: workflow-extension）を読み込む場合がある。Workflow Skill のみが読み、inspect-promote command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する（fail-open）。破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する。自動 promote 対象カテゴリ、投入先、実行ログ、誤検知 revoke 手順は workflow-contracts SPEC（extension 経由で解決）を正とし、本スキルはカテゴリ定義を重複保持しない。

## 共通制約

- **HITL 承認必須**: 自動 promote 対象（`--auto`）を除き、ユーザーの明示的な承認なしに採用済み成果物を生成しない（G01）
- **reject は即時削除**: `archive/rejected/` への移動は廃止。即時削除以外の取扱を禁止し、reject 時の commit message に却下理由を含める（command 不変条件）
- **defer は inbox 残置**: defer となった検出事項を `.agentdev/inspect/inbox/` から移動しない（command 不変条件）
- **`--auto` は明示 opt-in の場合のみ有効**: 省略時は自動 promote を一切行わない（G06）。自動 promote 対象は workflow-contracts SPEC（extension 経由）が定義する高確信度カテゴリのみとし、意味判断、曖昧な分類、ADR 要否判断を含む検出事項は手動分類へ回す（command 不変条件）
- **実行ログ**: `--auto` 実行の都度、投入対象、根拠を `.agentdev/inspect/promoted/auto-promote-log.md` に記録する（command 不変条件）
- **adversarial-review は任意助言手段**: 必須工程、QG、承認ゲート、統制ゲートとして導入しない。呼出失敗時は silent skip を禁止し、従来フロー（HITL 確定）を維持する

## 終了条件（termination）

- 全検出事項が promote（promoted/ 保存 + inbox 削除）/ reject（即時削除）/ defer（inbox 残置）/ 自動 promote（intake/promoted/ 投入 + ログ記録）のいずれかに確定している
- `.agentdev/inspect/` と `.agentdev/intake/` 配下の変更が commit/push 済みである（変更なし時は「変更なし」報告済み）
- 完了報告 template（`.opencode/commands/agentdev/templates/inspect-promote/standard.md`）に従い、promote/defer/reject/auto-promote の判定結果と後続 route（`--auto` 実行時は投入件数、投入先一覧、ログパスを含む）を報告した

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`<workflows/input-resolution-and-durable-state>` SPEC**: 入力解決優先順位、durable state
- **inspect-promote command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **`agentdev-workflow-inspect-docs` / `agentdev-workflow-inspect-skills`**: 検出事項の生成を担当する前段 workflow skill
