---
title: req-save SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-18
---

# req-save SPEC

## 目的

req-define で壁打ちした成果物を REQ/ADR ファイルとして docs/ に保存し、コミット、プッシュする。
壁打ちフェーズで使用（REQ/ADR 対象 artifact_actions がある場合）。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト、構造化 `draft-data` 形式）

## 出力

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/adr/ADR-{NNNN}.md`（ADR判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）
- ドラフト frontmatter `status: saved` 更新

## 副作用

- ファイル作成/更新: `docs/requirements/**`, `docs/adr/**`, `docs/README.md`, `.agentdev/drafts/**`
- git 操作: commit + push（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- 読込時 hash 記録 → Step 9-1 で `git pull --ff-only` 後 hash 一致検証（G08）
- Issue 作成: 行わない（G11、case-open 責務）
- intake / learning capture: 原則非関与（G12、例外: REQ 再構成 intake のみ生成可能）

## 現在の動作

- Step 1: draft-dataの`artifact_actions`にREQ/ADR対象actionがあるか確認し、存在しない場合はno-opとして完了する。
- Step 2: draftを読み、必須フィールドと入力hashを記録する。
- Step 3: draft構造、文書分類、許可範囲を検証する。
  - OU ID指定時は指定OUに属するREQ/ADR対象actionだけを処理する。
  - OU ID未指定時はdraft全体のREQ/ADR対象actionを処理する。
  - OUが複数存在することだけを理由に停止しない。
- Step 4: REQ/ADR actionを保存し、要件表、ID、frontmatter、採番結果を検証する。
- Step 5: README、DOC-MAP、mapping-tableへの影響を確認し、派生文書を整合させる。
- Step 6: ADR actionを保存する。
- Step 7: changed-docs検査を実行する。
- Step 8: DOC-MAP影響を確認する。
- Step 9: 許可パスとリモート同期を検証する。
- Step 10: draftの保存状態とOU resultを更新する。
- Step 11: commit、pushする。
- Step 12: 保存結果と次工程を報告する。
## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ ファイル整合性検査、DOC-MAP 影響規則、REQ 再構成検出、artifact_actions 工程分岐）
- [quality-gates.md](../quality/quality-gates.md)（QG-1）
- [req-health-metrics.md](../quality/req-health-metrics.md)（SPLIT 検出基準）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（REQ/ADR/SPEC body 品質検査）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（IR-057 obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (REQ-0158-003)

REQ 保存工程で targeted docs guard を実行する。対象は保存工程で変更された REQ ファイルと連動ファイル（`docs/requirements/README.md`、`docs/DOC-MAP.md`、`docs/README.md`、`AGENTS.md`）。

- 実行タイミング: Step 7（docs 変更整合性検証）の直後、Step 8（DOC-MAP 影響確認）の前
- 実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow req-save --files <changed REQ files> --json`
- 検査項目: REQ frontmatter 必須項目、ファイル名・ID の一致、要件行 ID 形式の妥当性、WHAT/HOW 境界逸脱検出、`docs/requirements/README.md` 同期、DOC-MAP 更新要否判定、ADR 参照相互参照更新要否判定、関連 SPEC 候補時の `docs/specs/README.md` 更新要否判定、旧SPEC直下パス混入検出（IR-057）、local版旧生成方式語彙混入検出、文書種別責務と日本語執筆規範の機械化可能範囲の検査
- 失敗時: 検査対象文書（REQ ファイル、`docs/requirements/README.md`、`docs/DOC-MAP.md`、`docs/README.md`、`AGENTS.md`）を修正して再実行する。`full_docs_check_recommended` が true の場合は `/repo/docs-check`（全体監査）の実行を検討する

JSON 出力は `workflow`、`files_checked`、`coupled_files_checked`、`failures`、`warnings`、`doc_map_update_required`、`spec_readme_update_required`、`requirements_readme_update_required`、`full_docs_check_recommended` を含む。`failure` は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ。

### req-save が使用する検査ツール

req-save が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- check_changed_docs.ts（--workflow req-save、REQ files 変更時）: REQ 保存工程で実行（[targeted docs guard (REQ-0158-003)](#targeted-docs-guard-req-0158-003) 参照）

req-save は check_integrity.ts（全体監査）を使用しない（保存工程は変更ファイル限定の targeted 検査が責務。全体監査は /repo/docs-check の責務）。

※肯定表現のみ（REQ-0144-002, REQ-0144-003 準拠）。

## 対象外

- REQ/ADR 対象 artifact_actions がない場合の SPEC ファイル作成、編集（G01、no-op 完了）
- `docs/requirements/**`、`docs/adr/**`、`docs/README.md`、`.agentdev/drafts/**` 以外のファイル作成、編集（G02、G03）
- ドラフトファイル不存在時の実行（G04、エラー中止）
- REQ番号の空き番号再利用（G05、`agentdev-req-file-manager` 採番ルール遵守）
- `doc_requirement.md` テンプレート必須セクションの欠落（G06）
- push 後の status 更新（G07、commit 対象に status 変更を含めること）
- Step 9-1 の hash 一致検証省略（G08）
- Issue 作成（G11、case-open 責務）
- intake / learning capture の実施（G12、例外: REQ 再構成 intake のみ）
- SPEC artifact_actions の処理（spec-save 責務）
- `work_type` 固定分岐による工程判定（G09、`artifact_actions` 有無で判定）

## 検証観点

- QG-1（Definition Integrity Gate）: Step 4 の前置条件として「適用結果の整合性検証」を実行（採番結果の整合性、マージ結果の整合性、インデックスの整合性、変更範囲の妥当性）。内容の品質は req-define の QG-1 の責務（REQ-0102-081/082）
- ADR 妥当性再検証ゲート: ADR 保存直前に技術判断含有確認、REQ/SPEC 相当の内容のみなら停止
- ADR 採番: `agentdev-adr-file-manager` の採番ルール（max+1, 欠番埋め禁止）で確定番号を付与
- 出力制約: 成果物本文（REQ/ADR ファイル本文、commit message）は verbatim で返す（G10）

## case-auto 並列委譲モデル（REQ-0114-087〜093）

req-save は複数 REQ/ADR ファイルの変更案作成、検査を並列化できる（REQ-0114-090）。3 フェーズ分離で実現する:

| フェーズ | 操作 | 実行方法 |
|---|---|---|
| 1. 採番バッチ | 最大番号+N を一括確保（G05 一意性維持） | 直列 |
| 2. ファイル作成 | 各 REQ/ADR ファイル作成、変更（独立パス） | 並列（最大5件） |
| 3. インデックス更新 | README.md への順序挿入、draft status 更新、commit/push | 直列 |

G07（commit 前 status 更新）は フェーズ3 で維持。

## See Also

- [req-define.md](req-define.md)（前段コマンド）
- [spec-save.md](spec-save.md)（後続コマンド（SPEC 候補がある場合））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-req-file-manager` skill（REQ ファイル管理、採番）
- `agentdev-adr-file-manager` skill（ADR ファイル管理、採番）
- `agentdev-doc-map` skill（DOC-MAP 影響確認）
- `agentdev-conventional-commits` skill（コミットメッセージ規約）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- `agentdev-quality-gates` skill（QG-1）
- REQ-0102（要件定義、保存）
- REQ-0138（構造化 req_draft 契約）
- REQ-0137（並列実行安全 git 操作規律）

