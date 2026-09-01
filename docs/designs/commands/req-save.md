---
title: req-save Design
status: accepted
created: 2026-06-21
updated: 2026-08-21
---

<!-- ADF-COVERS(implementation): REQ-021-012, REQ-021-023 -->
<!-- ADF-COVERS(implementation): REQ-004-011, REQ-004-012, REQ-004-013, REQ-004-021, REQ-004-040, REQ-004-044, REQ-004-045, REQ-006-106, REQ-006-111, REQ-008-014, REQ-008-031, REQ-008-045, REQ-008-046, REQ-008-050 -->

# req-save Design

## 目的

req-define で壁打ちした成果物を REQ/Decision ファイルとして docs/ に保存し、コミット、プッシュする。
壁打ちフェーズで使用（REQ/Decision 対象 artifact_actions がある場合）。

## 承認・HITL 境界

- req-save 自身の承認点を持たない（req-define で壁打ち合意済みの draft を入力として保存する）。
- Decision 保存直前の妥当性再検証で REQ/Design 相当の内容のみと判定した場合は、保存せず停止してユーザー判断を求める。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト、構造化 `draft-data` 形式）

## 出力

- `docs/requirements/REQ-{NNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/decisions/DEC-{NNN}.md`（Decision判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）
- ドラフト frontmatter `status: saved` 更新

## 副作用

- ファイル作成/更新: `docs/requirements/**`, `docs/decisions/**`, `docs/README.md`, `.agentdev/drafts/**`
- git 操作: commit + push（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- 読込時 hash 記録 → リモート同期（`git pull --ff-only`）後の hash 一致検証
- Issue 作成: 行わない（case-open 責務）
- deviation capture: req-save 実行中に実観測した deviation を agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
  保存先は capture-boundaries.md の Split Rule に従う。
  REQ 再構成 intake のみ（現行維持）も本責務に含む。
- git 永続化: capture 成果物を req-save 自身の既存 commit/push 処理内で永続化。
- 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-req-save`）が正規情報源である。

- 事前チェック: draft-data の `artifact_actions` に REQ/Decision 対象 action があるか確認する。存在しない場合は no-op として完了する
- 読込と検証: draft を読み、必須フィールドと入力 hash を記録する。draft 構造、文書分類、許可範囲を検証する
  - OU ID 指定時は指定 OU に属する REQ/Decision 対象 action だけを処理する
  - OU ID 未指定時は draft 全体の REQ/Decision 対象 action を処理する
  - OU が複数存在することだけを理由に停止しない
- 保存: REQ/Decision action を保存し、要件表、ID、frontmatter、採番結果を検証する。README への影響を確認し、派生文書を整合させる
- 検証: changed-docs 検査、README 索引影響確認、許可パスとリモート同期を検証する
- 永続化: draft の保存状態と OU result を更新し、commit、push する
- 報告: 保存結果と次工程を報告する

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/req-save.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（STEP 構成、resume protocol、reference 構成）は Workflow Skill（`agentdev-workflow-req-save`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ ファイル整合性検査、README 索引影響規則、REQ 再構成検出、artifact_actions 工程分岐）
- [quality-gates.md](../quality/quality-gates.md)（QG-1）
- [req-health-metrics.md](../quality/req-health-metrics.md)（SPLIT 検出基準）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（REQ/Decision/Design body 品質検査）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（IR-057 obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (v2:REQ-0158-003)

REQ 保存工程で targeted docs guard を実行する。
対象は保存工程で変更された REQ ファイルと連動ファイル（`docs/requirements/README.md`、`docs/README.md`、`AGENTS.md`）。

- 実行タイミング: docs 変更整合性検証の直後、README 索引影響確認の前
- 実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow req-save --files <changed REQ files> --json`
- 検査項目: REQ frontmatter 必須項目、ファイル名・ID の一致、要件行 ID 形式の妥当性、WHAT/HOW 境界逸脱検出、`docs/requirements/README.md` 同期、README 索引更新要否判定、ADR 参照相互参照更新要否判定、関連 Design 候補時の `docs/designs/README.md` 更新要否判定、旧Design直下パス混入検出（IR-057）、local版旧生成方式語彙混入検出、文書種別責務と日本語執筆規範の機械化可能範囲の検査
- 失敗時: 検査対象文書（REQ ファイル、`docs/requirements/README.md`、`docs/README.md`、`AGENTS.md`）を修正して再実行する。`full_docs_check_recommended` が true の場合は `/repo/docs-check`（全体監査）の実行を検討する

JSON 出力は `workflow`、`files_checked`、`coupled_files_checked`、`failures`、`warnings`、`doc_map_update_required`、`spec_readme_update_required`、`requirements_readme_update_required`、`full_docs_check_recommended` を含む。
`failure` は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ。

### req-save が使用する検査ツール

req-save が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- check_changed_docs.ts（--workflow req-save、REQ files 変更時）: REQ 保存工程で実行（[targeted docs guard (v2:REQ-0158-003)](#targeted-docs-guard-req-0158-003) 参照）

req-save は check_integrity.ts（全体監査）を使用しない（保存工程は変更ファイル限定の targeted 検査が責務。全体監査は /repo/docs-check の責務）。

※肯定表現のみ（REQ-010-002, REQ-010-003 準拠）。

## 対象外

- REQ/Decision 対象 artifact_actions がない場合の Design ファイル作成、編集（no-op 完了）
- トレーサビリティ対応（実装対応、検証対応）の作成（REQ-021-012。req-save は正式な要件IDの保存を担当し、対応宣言を作成する責務を持たない。新規要件の保存時点で対応が存在しないことを理由に req-save を失敗させない）
- `docs/requirements/**`、`docs/decisions/**`、`docs/README.md`、`.agentdev/drafts/**` 以外のファイル作成、編集
- ドラフトファイル不存在時の実行（エラー中止）
- REQ番号の空き番号再利用（`agentdev-req-file-manager` 採番ルール遵守）
- `doc_requirement.md` テンプレート必須セクションの欠落
- push 後の status 更新（commit 対象に status 変更を含めること）
- リモート同期時の hash 一致検証省略
- Issue 作成（case-open 責務）
- intake / learning capture の直接実施。deviation capture は Skill 委譲で実施（「副作用」セクション参照）
- Design artifact_actions の処理（design-save 責務）
- `work_type` 固定分岐による工程判定（`artifact_actions` 有無で判定）

## 検証観点

- QG-1（Definition Integrity Gate）: REQ/Decision ファイル保存の前置条件として「適用結果の整合性検証」を実行（採番結果の整合性、マージ結果の整合性、インデックスの整合性、変更範囲の妥当性）。内容の品質は req-define の QG-1 の責務（REQ-004-033）
- Decision 妥当性再検証ゲート: Decision 保存直前に技術判断含有確認、REQ/Design 相当の内容のみなら停止
- Decision 採番: `agentdev-decision-file-manager` の採番ルール（max+1, 欠番埋め禁止）で確定番号を付与
- 出力制約: 成果物本文（REQ/Decision ファイル本文、commit message）は verbatim で返す

## case-auto 並列委譲モデル（REQ-006-087〜093）

req-save は複数 REQ/Decision ファイルの変更案作成、検査を並列化できる（REQ-006-090）。3 フェーズ分離で実現する:

| フェーズ | 操作 | 実行方法 |
|---|---|---|
| 1. 採番バッチ | 最大番号+N を一括確保（一意性維持） | 直列 |
| 2. ファイル作成 | 各 REQ/Decision ファイル作成、変更（独立パス） | 並列（最大5件） |
| 3. インデックス更新 | README.md への順序挿入、draft status 更新、commit/push | 直列 |

commit 前 status 更新は フェーズ3 で維持。

## 停止状態

- ドラフトファイル不存在時（エラー中止する）。
- 読込時 hash とリモート同期後 hash の不一致検出時（保存処理を中止し、差異を報告する）。
- Decision 妥当性再検証で REQ/Design 相当と判定した場合（保存せず停止し、ユーザー判断を求める）。
- targeted docs guard の検査失敗時（検査対象文書を修正して再実行するまで永続化しない）。

## See Also

- [req-define.md](req-define.md)（前段コマンド）
- [design-save.md](design-save.md)（後続コマンド（Design 候補がある場合））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-workflow-req-save` skill（workflow 実装本体（STEP 構成、resume protocol））
- `agentdev-req-file-manager` skill（REQ ファイル管理、採番）
- `agentdev-decision-file-manager` skill（Decision ファイル管理、採番）
- `agentdev-artifact-validation` skill（README エントリ存在確認）
- `agentdev-conventional-commits` skill（コミットメッセージ規約）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- `agentdev-quality-gates` skill（QG-1）
- REQ-004（要件定義、保存）
- REQ-008（構造化 req_draft 契約）
- v2:REQ-0137（並列実行安全 git 操作規律）
