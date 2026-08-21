---
name: agentdev-workflow-case-open
description: "case-open command の workflow 実装本体。要件定義から GitHub Issue（Epic flow / Standard flow）作成までの制御構造、execution contract 確定、execution_unit 構成、draft/RU 削除クリーンアップを所有する。USE FOR: case-open 実行時の workflow 制御（Issue 本文生成・execution contract 確定・execution_unit 構成・preflight・Epic flow/Standard flow）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---
<!-- ADF-COVERS(implementation): REQ-003-025, REQ-003-027 -->
<!-- ADF-COVERS(implementation): REQ-008-010, REQ-008-011, REQ-008-036, REQ-008-037 -->
<!-- ADF-COVERS(implementation): REQ-030-001, REQ-030-002, REQ-030-003, REQ-030-005, REQ-030-006, REQ-030-014, REQ-030-015, REQ-030-016, REQ-030-017, REQ-030-018, REQ-030-019, REQ-030-020, REQ-030-021 -->

# case-open workflow スキル

case-open command の workflow 実装本体。
要件doc（構造化 `draft-data`）から GitHub Issue（Epic flow または Standard flow）を作成する制御構造、execution contract 確定（EC-{N}〜EC-{N}）、execution_unit 構成（連結成分アルゴリズム + 3軸判断 + preflight）、draft/RU 削除クリーンアップ（Form Zero）を所有する。

case-open command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-open command の公開契約のみを前提とする。Design ディレクトリの内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

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

case-open workflow は次の6 STEP で構成する。
各 STEP は resume point を持つ（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、durable state（draft-data、GitHub Issue、commit hash）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 引き継ぎ・OU選択 | 要件doc 受領 | 処理対象確定（OU 単位） | [references/handoff-and-ou-gate.md](references/handoff-and-ou-gate.md) |
| STEP-2 | Issue本文生成・execution contract 確定 | 処理対象確定 | Issue 本文候補（EC-{N}〜EC-{N} 反映済み、QG-2 検証済み） | [references/issue-body-and-execution-contract.md](references/issue-body-and-execution-contract.md) |
| STEP-3 | 構成判定・preflight | Issue 本文候補確定 | execution structure（Epic vs Standard、Wave 構成、preflight合格） | [references/execution-unit-and-preflight.md](references/execution-unit-and-preflight.md) |
| STEP-4 | adversarial-review（経路F） | execution structure + Issue 本文 + 完了条件の3者確定 | review 結果反映（4パターン再実行ルール） | [references/adversarial-review-integration.md](references/adversarial-review-integration.md) |
| STEP-5 | Issue 作成（Epic flow / Standard flow） | adversarial-review skip または review 完了 | GitHub Issue 作成済み（親Epic + 子Issue群、または Standard Issue） | [references/issue-creation-flows.md](references/issue-creation-flows.md) |
| STEP-6 | 終了処理・クリーンアップ | Issue 作成完了 | コメント追加、draft/RU 削除（Form Zero）、完了報告 | [references/termination-and-cleanup.md](references/termination-and-cleanup.md) |

### STEP 間の依存と分岐

- **Standard flow**: STEP-1 → STEP-2 → STEP-3（Standard ルート）→ STEP-4（skip 条件該当時は省略）→ STEP-5（Standard flow）→ STEP-6
- **Epic flow（単一REQ `scale: large`、マルチREQ、複数 OU）**: STEP-1 → STEP-2 → STEP-3（Epic ルート、execution_unit 構成）→ STEP-4 → STEP-5（Epic flow、子Issue 並列作成）→ STEP-6
- **adversarial-review skip 条件**: Standard flow で単一 OU の機械的確定、Wave 分割なし（REQ-{NNNN}-{NNN}）。ユーザー明示指定時は強制発動（REQ-{NNNN}-{NNN}）

### resume protocol

- 再開点は durable state から再構成する: draft-data（`status`、`auto_gate`、`artifact_actions`）、GitHub Issue の存在と本文、RU ファイルの存在、削除 commit（Form Zero の残存検証）
- 処理済み draft/RU は削除済み（durable state）で判定し、会話コンテキストの記憶に依存しない。Epic/子Issue 作成の進捗は Issue 本文のステータス追跡テーブルが正である

### termination

- 正常終了: 終了処理・クリーンアップ STEP の完了報告出力まで（draft/RU 削除残存検証合格を含む）
- 停止終了: `auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る場合。preflight 不合格、子Issue 上限超過、QG-2 fail

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-issue-management`: Issue 操作の安全手続き、テンプレート選定、委譲接続点
- `agentdev-epic-tracker`: Epic 進捗追跡、Wave 構成、自律構成生成、子Issue 数上限
- `agentdev-quality-gates`: QG-2 完了条件網羅性検証
- `agentdev-gh-cli`: gh CLI I/O 境界（Issue 作成・コメント追加・VERIFY）
- `agentdev-workflow-templates`: Issue/PR/コメントテンプレート選定
- `agentdev-workflow-lifecycle`: 引き継ぎ停止判定（runtime-package-boundary）
- `agentdev-req-file-manager`: RU ファイル削除
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（draft/RU 削除、Form Zero）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-adversarial-review`: 経路F review 呼出
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲（STEP-4/5 で実観測時）

## トレーサビリティ能力の利用

case-open は、上流工程（req-define）で確定した対象要件と実行契約を Issue へ引き継ぐ。
Issue の対象範囲、完了条件、test strategy の確定（STEP-2、STEP-3）は、上流工程の引き継ぎ情報（draft-data、artifact_actions、operation_units）を基に行う。

- req-define と重複して一般的な変更影響探索や依存関係探索を行い、対象範囲を再決定しない
- 引き継ぎ情報に欠落があり変更影響候補の確認が必要な場合は、req-define へ差し戻す
- 必須品質統制の導出は artifact type から品質能力キーへの変換（品質統制 routing Design が定める）に従う

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-open/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、case-open command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **draft-data 入力**: 本スキルは構造化 `draft-data` を入力として読み取る。`auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る場合は停止する。`conflict_resolutions` に記録済みの衝突は再確認しない
- **OU 単位処理**: Issue 化単位は REQ doc 単位ではなく OU 単位（command 不変条件）。子Issue は OU 単位で作成し、Wave 単位のみの子Issue 構造は作成しない（command 不変条件）
- **子Issue 上限**: Epic 1件あたり最大10件（case-open 前出出力検証表 STEP-3 の検証基準）、case-open STEP-5-4 子Issue 作成並列上限は5件（3つの「5件」文脈の (1) に該当）
- **Form Zero**: draft/RU 削除は `git rm <path>` で明示パスをステージし、同一ステップで `git commit -- <path>` により即時コミットし、未ステージ残存を許さない
- **統合先・実証Case識別情報**: Case に割り当てられた統合先（既定値 main）を Issue 本文の execution contract へ記録する。実証Caseの場合は実証Case識別情報（実証フラグ、対象評価ブランチ、所属実証単位）と評価契約を Issue 本文へ永続記録し、評価結果の採否を Issue 完了条件へ含めない。実証Case専用要素を presence-based 判定の新契約必須セクション一覧から除外する（詳細は STEP-2/3/6 各 reference）
- **本文 verbatim・ファイル経由**: Issue 本文は `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF‑8 BOM なし LF 一時ファイル経由で `gh --body-file` へ渡す（G25）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-open command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
