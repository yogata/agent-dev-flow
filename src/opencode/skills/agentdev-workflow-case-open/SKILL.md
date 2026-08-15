---
name: agentdev-workflow-case-open
description: "case-open command の workflow 実装本体。要件定義から GitHub Issue（Epic flow / Standard flow）作成までの制御構造、execution contract 確定、execution_unit 構成、draft/RU 削除クリーンアップを所有する。USE FOR: case-open command 実行時の workflow 制御（Issue本文生成・execution contract 確定・execution_unit 構成・preflight・Epic flow/Standard flow・draft/RU 削除・Form Zero）。DO NOT USE FOR: 要件doc 作成（req-define）、REQ/Decision 保存（req-save）、Issue 実装（case-run）、PR マージ・Issue close（case-close）、work_type 判定・フェーズ定義（agentdev-workflow-lifecycle）、gh CLI I/O 手続き（agentdev-gh-cli）、Issue 操作の安全手続き（agentdev-issue-management）、Epic 進捗追跡・Wave 構成（agentdev-epic-tracker）、品質ゲート QG-{N}（agentdev-quality-gates）、直接起動（Workflow Skill。対応する /agentdev/* command の工程経由で利用し、単独の skill 起動は REQ-{NNNN}-{NNN} soft guard で抑制）。"
---

# case-open workflow スキル

case-open command の workflow 実装本体。要件doc（構造化 `draft-data`）から GitHub Issue（Epic flow または Standard flow）を作成する制御構造、execution contract 確定（EC-{N}〜EC-{N}）、execution_unit 構成（連結成分アルゴリズム + 3軸判断 + preflight）、draft/RU 削除クリーンアップ（Form Zero）を所有する。

case-open command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-open command の公開契約のみを前提とする。SPEC ディレクトリの内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## USE FOR

- case-open command の実行時 workflow 制御（全 STEP）
- Issue 本文生成と execution contract 確定（EC-{N}〜EC-{N}）
- execution_unit 構成（連結成分アルゴリズム、3軸判断、Epic vs Standard ルーティング）
- 構成生成事前検証（preflight 5項目）
- adversarial-review 挿入境界（経路F）の発動条件判定と review 呼出
- Epic flow（Step 5-9）と Standard flow（Step 10-12）の制御
- draft/RU 削除クリーンアップ（Form Zero、即時 commit/push、削除残存検証）
- 子Issue 作成の並列化（最大5件、3つの「5件」文脈の (1) に該当）

## DO NOT USE FOR

- 要件doc 作成、壁打ち（`/agentdev/req-define`、`agentdev-req-analysis`）
- REQ/Decision ファイル保存（`/agentdev/req-save`、`agentdev-req-file-manager`、`agentdev-decision-file-manager`）
- SPEC ファイル保存（`/agentdev/spec-save`、`agentdev-spec-file-manager`）
- Issue 実装、実行担当サブエージェント委譲（`/agentdev/case-run`、`agentdev-case-run-execution-adapter`）
- PR マージ、Issue close、完了条件チェックボックス評価（`/agentdev/case-close`）
- case-auto 自走 orchestration（`/agentdev/case-auto`）
- work_type 判定、フェーズ定義、ラベル体系（`agentdev-workflow-lifecycle`）
- gh CLI I/O 手続き、VERIFY（`agentdev-gh-cli`）
- Issue 操作の安全手続き、テンプレート選定（`agentdev-issue-management`、`agentdev-workflow-templates`）
- Epic 進捗追跡、Wave 構成（`agentdev-epic-tracker`）
- QG-{N} 完了条件網羅性検証（`agentdev-quality-gates`）

## 入力

- case-open command から渡される要件doc（構造化 `draft-data` 形式、`agreed_items` / `artifact_actions` / `operation_units` / `test_strategy` / `review_dispositions` / `case_open_hints` / `auto_gate` / `conflict_resolutions`）
- OU ID 指定（任意、OU モード時）

## 出力

- GitHub Issue（Standard flow または Epic flow + 子Issue群）。ラベル付き、要件doc埋め込み
- 完了報告（Standard / Epic / マルチREQ Epic テンプレート別）
- draft/RU 削除結果（Form Zero + 即時 push）

## 副作用

- GitHub Issue 作成、コメント追加（`agentdev-gh-cli` 経由）
- `.agentdev/drafts/req-draft-*.md` 削除、`.agentdev/backlog/req-units/RU-*.md` 削除（Form Zero、`git rm` + 即時 commit + push）
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-open command の worktree 隔離に従う）

## Control Plane（STEP 一覧）

case-open workflow は次の6 STEP で構成する。各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。会話コンテキストに依存せず、durable state（draft-data、GitHub Issue、commit hash）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-{N} | 引き継ぎ・OU選択 | 要件doc 受領 | 処理対象確定（OU 単位） | [references/handoff-and-ou-gate.md](references/handoff-and-ou-gate.md) |
| STEP-{N} | Issue本文生成・execution contract 確定 | 処理対象確定 | Issue 本文候補（EC-{N}〜EC-{N} 反映済み、QG-{N} 検証済み） | [references/issue-body-and-execution-contract.md](references/issue-body-and-execution-contract.md) |
| STEP-{N} | 構成判定・preflight | Issue 本文候補確定 | execution structure（Epic vs Standard、Wave 構成、preflight合格） | [references/execution-unit-and-preflight.md](references/execution-unit-and-preflight.md) |
| STEP-{N} | adversarial-review（経路F） | execution structure + Issue 本文 + 完了条件の3者確定 | review 結果反映（4パターン再実行ルール） | [references/adversarial-review-integration.md](references/adversarial-review-integration.md) |
| STEP-{N} | Issue 作成（Epic flow / Standard flow） | adversarial-review skip または review 完了 | GitHub Issue 作成済み（親Epic + 子Issue群、または Standard Issue） | [references/issue-creation-flows.md](references/issue-creation-flows.md) |
| STEP-{N} | 終了処理・クリーンアップ | Issue 作成完了 | コメント追加、draft/RU 削除（Form Zero）、完了報告 | [references/termination-and-cleanup.md](references/termination-and-cleanup.md) |

### STEP 間の依存と分岐

- **Standard flow**: STEP-{N} → STEP-{N} → STEP-{N}（Standard ルート）→ STEP-{N}（skip 条件該当時は省略）→ STEP-{N}（Standard flow）→ STEP-{N}
- **Epic flow（単一REQ `scale: large`、マルチREQ、複数 OU）**: STEP-{N} → STEP-{N} → STEP-{N}（Epic ルート、execution_unit 構成）→ STEP-{N} → STEP-{N}（Epic flow、子Issue 並列作成）→ STEP-{N}
- **adversarial-review skip 条件**: Standard flow で単一 OU の機械的確定、Wave 分割なし（REQ-{NNNN}-{NNN}）。ユーザー明示指定時は強制発動（REQ-{NNNN}-{NNN}）

### resume protocol

- 再開点は durable state から再構成する: draft-data（`status`、`auto_gate`、`artifact_actions`）、GitHub Issue の存在と本文、RU ファイルの存在、削除 commit（Form Zero の残存検証）
- 処理済み draft/RU は削除済み（durable state）で判定し、会話コンテキストの記憶に依存しない。Epic/子Issue 作成の進捗は Issue 本文のステータス追跡テーブルが正である

### termination

- 正常終了: 終了処理・クリーンアップ STEP の完了報告出力まで（draft/RU 削除残存検証合格を含む）
- 停止終了: `auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る場合。preflight 不合格、子Issue 上限超過、QG-{N} fail

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-issue-management`: Issue 操作の安全手続き、テンプレート選定、委譲接続点
- `agentdev-epic-tracker`: Epic 進捗追跡、Wave 構成、自律構成生成、子Issue 数上限
- `agentdev-quality-gates`: QG-{N} 完了条件網羅性検証
- `agentdev-gh-cli`: gh CLI I/O 境界（Issue 作成・コメント追加・VERIFY）
- `agentdev-workflow-templates`: Issue/PR/コメントテンプレート選定
- `agentdev-workflow-lifecycle`: 引き継ぎ停止判定（runtime-package-boundary）
- `agentdev-req-file-manager`: RU ファイル削除
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（draft/RU 削除、Form Zero）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-adversarial-review`: 経路F review 呼出
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲（STEP-{N}/5 で実観測時）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-open/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。いずれも Workflow Skill のみが読み、case-open command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する。

## 共通制約

- **draft-data 入力**: 本スキルは構造化 `draft-data` を入力として読み取る。`auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る場合は停止する。`conflict_resolutions` に記録済みの衝突は再確認しない
- **OU 単位処理**: Issue 化単位は REQ doc 単位ではなく OU 単位（G19/G20/G21）。子Issue は OU 単位で作成し、Wave 単位のみの子Issue 構造は作成しない（G14）
- **子Issue 上限**: Epic 1件あたり最大10件（G05）、case-open Step 8 子Issue 作成並列上限は5件（3つの「5件」文脈の (1) に該当）
- **Form Zero**: draft/RU 削除は `git rm <path>` で明示パスをステージし、同一ステップで `git commit -- <path>` により即時コミットし、未ステージ残存を許さない
- **本文 verbatim・ファイル経由**: Issue 本文は `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF‑8 BOM なし LF 一時ファイル経由で `gh --body-file` へ渡す（G25）

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-open command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
