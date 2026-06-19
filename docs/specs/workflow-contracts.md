---
updated: 2026-06-19
---

# Workflow Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

Workflow 契約の雛形を定義し、コマンドパイプライン間の入出力関係と前提条件を明確にする（REQ-0104）。

## Pipeline Overview

AgentDevFlow は3つのパイプラインで構成される:

| パイプライン | コマンド | 目的 |
|---|---|---|
| req/case | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了まで |
| learning | learning-capture → learning-promote | 学びの蓄積・昇華 |
| intake | intake-capture / intake-from-github → intake-promote | 改善候補の収集・昇華 |

## Command Classification

AgentDevFlow の公開コマンドは以下の5分類のいずれかに属する（REQ-0104-048）。全公開コマンドがいずれかの分類に属すること。

| 分類 | コマンド | 目的 |
|---|---|---|
| 主フロー | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了までの標準ワークフロー |
| 最大自走入口 | case-auto | req-define 完了後の後続工程を一括自走する追加入口。標準フローを置換しない（REQ-0104-049） |
| 補助フロー | intake-capture, intake-from-github, intake-promote, learning-promote, backlog-review | 改善候補収集・学び蓄積・RU化。主フローを補完 |
| 検出フロー | inspect-docs, inspect-skills, inspect-promote | 文書・スキルの意味検出・分類・昇格 |
| repo-local検査 | /repo/docs-check | AgentDevFlow 本体リポジトリ内の機械的整合性検査 |

- case-auto は標準フロー（req-save → spec-save → case-open → case-run → case-close）を内部的に呼び出す追加入口であり、標準フローを置換・廃止しない（REQ-0114-017）。spec-save は draft-meta.spec-candidates が空の場合スキップし、旧形式 draft（spec-candidates フィールドなし）は後方互換で従来順序で実行する（ADR-0123, REQ-0136-014）。
- 補助フロー・検出フロー・repo-local検査は、主フロー・最大自走入口とは独立して実行可能である。
- 検出フローの出力（inspect finding）は、inspect-promote → backlog-review を経て RU 化され、req-define の入力となる。

## Phase Definitions

### マクロフェーズ

開発ワークフローを3つのマクロフェーズで定義する。

| マクロフェーズ | 定義 | 対応マイクロフェーズ |
|---|---|---|
| 壁打ち | 要件定義・分析・Issue作成前の合意形成 | requirement + analyzed |
| 構造的実行 | Issue作成後の実装・PR作成・進捗管理 | created + in_progress |
| レビュー完了 | PR作成後のレビュー・マージ・完了処理 | review + done |

### マイクロフェーズ

> **注意**: 以下の6マイクロフェーズは説明用ラベルであり、状態管理モデルではない（REQ-0112-023）。実際の状態管理は Issue ラベル・GitHub Project で行う（REQ/SPEC 文書内の状態記述については「workflow status 管理」節を参照）。

| フェーズ | 状態 | マクロフェーズ |
|---|---|---|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了・Issue未作成 | 壁打ち |
| `created` | Issue作成済み・作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR作成済み・レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む: learning capture + intake capture） | レビュー完了 |

### workflow status 管理

workflow status（例: "要件定義", "実装", "テスト" 等の6マイクロフェーズに対応する状態語）は Issue ラベル・GitHub Project で管理する（REQ-0108-123、REQ-0101-037）。REQ/SPEC 文書内には状態として埋め込まず、上記のマイクロフェーズはワークフローの説明目的でのみ使用する。

> **スコープ注記**: 本ルールは REQ/ADR/SPEC の各文書にワークフロー状態ラベル（例: 当該文書が「実装中」「レビュー中」等の状態にあると示す標識）を埋め込まないことを定める。SPEC がマイクロフェーズ分類体系そのものを定義・説明すること（本節の記述など）は本ルールの対象外である。

## SSoT Transition Rules

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ | SSoT | 説明 |
|---|---|---|
| 壁打ち | セッション会話 + draft | 壁打ちで合意形成された要件・分析（Issue未作成のため） |
| 構造的実行 | Issue本文 + Work Plan | 要件doc + 実行計画 |
| レビュー完了 | PR + レビュー結果 | コードレビュー結果とマージ状態 |

### draft の定位

draft（`.agentdev/drafts/req-draft-*.md`）は壁打ちフェーズ内の一時ハンドオフであり、構造的実行以降のSSoTはIssue本文とWork Planである。

- ライフサイクル: `draft` → `saved`（req-save完了）→ `issued` + 削除（case-open完了）
- 構造的実行フェーズ以降: draftは存在しない（case-open完了時に削除）。SSoTはIssue本文 + Work Planに完全移行

### フェーズ境界ルール

壁打ち→構造的実行の境界で満たすべき要件: 壁打ちフェーズ完了時、docs変更（REQファイル、READMEインデックス、ADR等）を必ずコミット・プッシュする。これにより構造的実行フェーズのworktreeがdocs変更を継承する。

## Command I/O Contracts

### req/case Pipeline

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/req-define` | ユーザー対話、既存要件情報 | 要件 doc（draft） | — |
| `/agentdev/req-save` | 要件 doc（draft） | REQ/ADR ファイル | req-define 完了 |
| `/agentdev/case-open` | REQ ファイルまたは要件 doc | GitHub Issue | req-save または req-define 完了 |
| `/agentdev/case-run` | GitHub Issue | 実装済みブランチ + PR | case-open 完了 |
| `/agentdev/case-close` | PR | マージ済み + クローズ済み | case-run 完了 |
| `/agentdev/case-auto` | 要件 doc | マージ済み + クローズ済み | req-define 完了（明示指定時のみ） |
| `/agentdev/case-update` | Issue 番号 | 更新済み Issue | Issue 存在 |

### learning Pipeline

| コマンド/スキル | 入力 | 出力 | 前提 |
|---|---|---|---|
| `learning-capture`（スキル） | エージェント実行中の観測 | `inbox.md` エントリ | — |
| `/agentdev/learning-promote` | `inbox.md` + `archive/active.md` | promoted artifact | inbox.md にエントリ |

### intake Pipeline

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/intake-capture` | 手動入力 | inbox item | — |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | inbox item | — |
| `/agentdev/intake-promote` | inbox items | promoted artifact | inbox に item |

### 共通後段

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/backlog-review` | promoted artifact | `RU-*.md` | promoted 存在 |

### コマンド詳細 I/O

| コマンド | 入力SSoT | 出力SSoT | 完了後マクロフェーズ |
|---|---|---|---|
| `/agentdev/req-define` | セッション会話 | 機能追加: `.agentdev/drafts/req-draft-*.md`、その他: セッション内要件doc | 壁打ち |
| `/agentdev/req-save` | `.agentdev/drafts/req-draft-*.md` | docs/requirements/REQ, docs/adr/ADR-01XX, docs index | 壁打ち |
| `/agentdev/spec-save` | `.agentdev/drafts/req-draft-*.md`（SPEC候補: draft-meta.spec-candidates） | docs/specs/SPEC, docs/specs index, DOC-MAP | 壁打ち |
| `/agentdev/case-open` | 要件doc, specs READ, ADR READ | GitHub Issue | 定義→実行境界 |
| `/agentdev/case-run` | GitHub Issue, specs READ+WRITE, ADR READ | GitHub PR + worktree + ブランチ | レビュー完了 |
| `/agentdev/case-auto` | 要件doc（明示/draft/セッション） | req-save〜case-close の各出力 | 自走完了 |
| `/agentdev/case-update` | GitHub Issue | GitHub Issue + REQファイル（APPEND/UPDATE対応） | 変更なし |
| `/agentdev/case-close` | GitHub Issue + PR | なし | レビュー完了 |
| `/agentdev/learning-promote` | `inbox.md` + `.agentdev/learning/archive/active.md` | `.agentdev/learning/promoted/` | 学びパイプライン |
| `/agentdev/backlog-review` | `.agentdev/intake/promoted/` + `.agentdev/learning/promoted/` | `.agentdev/backlog/req-units/RU-*.md` | RU 生成 |
| `/agentdev/intake-capture` | ユーザー入力 | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-from-github` | GitHub Issue/PR | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-promote` | inbox items | `.agentdev/intake/promoted/` | 昇華 |
| `/repo/docs-check` | ドキュメント・スキル・コマンド | `.agentdev/integrity/reports/` | 整合性検査（repo-local、ADR-0106） |
| `/agentdev/inspect-docs` | ドキュメント・REQ体系 | なし（診断結果出力のみ） | REQ再構成・意味レビュー |

### 参照フロー

| コマンド | specs | ADR | REQ | finding | learning | intake | integrity |
|---|---|---|---|---|---|---|---|
| `/agentdev/req-define` | — | — | READ | READ（明示入力時） | — | — | — |
| `/agentdev/req-save` | — | WRITE | WRITE | WRITE（SPLIT検出時） | — | — | — |
| `/agentdev/spec-save` | WRITE | — | — | — | — | — | — |
| `/agentdev/case-open` | READ | READ | READ | — | — | — | — |
| `/agentdev/case-run` | READ+WRITE | READ | READ | — | — | — | — |
| `/agentdev/case-close` | — | — | READ | — | WRITE（capture） | WRITE（capture） | — |
| `/agentdev/case-auto` | READ+WRITE | READ+WRITE | READ+WRITE | — | WRITE（capture） | WRITE（capture） | — |
| `/agentdev/case-update` | — | — | READ+WRITE | — | — | — | — |

## Workflow Routing

work_type と scale により workflow_route を決定する。

### work_type 定義

work_type は bugfix / feature / maintenance / docs_chore の 4 値である（REQ-0112-011, REQ-0104-014）。

| work_type | 日本語名称 |
|---|---|
| bugfix | バグ修正・軽微変更 |
| feature | 機能追加 |
| maintenance | リファクタリング・保守作業 |
| docs_chore | ドキュメント・雑務 |

### work_type 属性

| work_type | 付与ラベル | 規模 | docs/更新 | ワークフロー経路 |
|---|---|---|---|---|
| bugfix | `bug`, `critical` | 小 | 関連docs（矛盾時のみ） | req-define → case-open → case-run → case-close |
| feature | `enhancement`, `feature` | 中 | あり（REQ/specs/ADR + 関連docs） | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close |
| maintenance | `refactor`, `maintenance` | 小 | 関連docs（矛盾時のみ） | req-define → case-open → case-run → case-close |
| docs_chore | `docs`, `chore` | 小 | 関連docs（矛盾時のみ） | req-define → case-open → case-run → case-close |

### 規模判定 (featureのみ)

以下の3条件のいずれか1つでも満たす場合、`scale: large`（Epic）と判定する:

1. 複数モジュールにまたがる機能追加 (e.g., UI + API + DB)
2. 1 Issue (1 case-run) で実装しきれない規模 (PR肥大化リスク)
3. 段階的リリースが必要 (フェーズ分け・マイルストーン分割)

いずれの条件も満たさない場合、`scale: standard`（デフォルト）とする。maintenance/docs_choreはEpic分割に対応しない。

### workflow_route 導出

| work_type | scale | workflow_route |
|---|---|---|
| feature | standard | req_backed_case |
| feature | large | epic_case |
| bugfix | — | direct_case |
| maintenance | — | direct_case |
| docs_chore | — | direct_case |

### ラベルマッピング

| 変更種別 | 付与ラベル |
|---|---|
| バグ修正 | `bug` |
| バグ修正（緊急） | `bug`, `critical` |
| 機能追加 | `enhancement`, `feature` |
| 機能追加（要検討） | `enhancement`, `feature`, `needs-discussion` |
| 機能追加（大規模/Epic） | `enhancement`, `feature`, `epic` |
| リファクタリング | `refactor` |
| 保守作業 | `maintenance` |
| ドキュメント | `docs` |
| 雑務 | `chore` |
| バックログEpic | Epic: `enhancement`, `epic` / 子Issue: `enhancement` |

### Backlog分類

Backlogはwork_typeとは独立した専用分類。`intake-from-github` → `backlog-review` の経路で処理され、work_type判定の対象外となる。

- Epic: ラベル `enhancement`, `epic` を付与
- 子Issue: ラベル `enhancement` を付与（`feature`, `epic` は付与しない）
- Backlog Issuesは規模判定を適用せず、常にEpic + 子Issue構成で作成される

## Artifact Boundaries

### Anchored Development モデル

agentdev系ワークフローはAnchored Developmentモデルに基づく。4つの相互接続アーティファクトで構成される。

| アーティファクト | 役割 | 格納先 |
|---|---|---|
| REQ（要件doc） | ユーザー視点の要件（目的/要件/適用範囲） | `docs/requirements/REQ-{NNNN}.md` |
| コード | 実装そのもの | ソースコード |
| テスト | 振る舞い仕様 | テストファイル |
| ADR | アーキテクチャ判断 | current baseline: `docs/adr/ADR-01XX.md`; retired: `docs/adr/retired/ADR-00XX.md` |

生きた仕様（Living Specs）: 現行の SPEC 一覧は `docs/specs/README.md` の SPEC index を正とする（REQ-0101）。主な SPEC を以下に示す。

| 仕様 | 格納先 | 役割 |
|---|---|---|
| system.md | `docs/specs/system.md` | システム全体の現在の仕様 |
| patterns.md | `docs/specs/patterns.md` | 文書フォーマット規約・テンプレート命名規則・リポジトリ参照リンク規約 |
| design-principles.md | `docs/specs/design-principles.md` | 設計判断の根拠・指針 |
| quality-specs.md | `docs/specs/quality-specs.md` | 品質基準・検証ルール |
| document-model.md | `docs/specs/document-model.md` | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス |
| artifact-contracts.md | `docs/specs/artifact-contracts.md` | Command/Skill/Template/Script の入出力・依存方向 |
| artifact-responsibilities.md | `docs/specs/artifact-responsibilities.md` | 各 artifact 種別の canonical owner と責務 |
| integrity-contracts.md | `docs/specs/integrity-contracts.md` | strict/heuristic/observation 分類と検査カテゴリ |
| integrity-rule-catalog.md | `docs/specs/integrity-rule-catalog.md` | integrity 検査の全 rule 定義 |
| workflow-contracts.md | `docs/specs/workflow-contracts.md` | コマンドパイプラインの入出力・前提条件 |
| runtime-package-boundary.md | `docs/specs/runtime-package-boundary.md` | Repo type 別 `.opencode/` 定義・命名規約・導入方式・sync 範囲 |
| rule-ownership.md | `docs/specs/rule-ownership.md` | rule domain と責任 REQ/SPEC の対応 |
| req-impact-map.md | `docs/specs/req-impact-map.md` | 各 active REQ が影響する integrity rule と artifact |

### docs/ 構造

| 区分 | パス | 役割 | 自動操作コマンド |
|---|---|---|---|
| guides/ | docs/guides/ | 開発ガイド（参照のみ） | — |
| requirements/ | docs/requirements/ | 要件管理（目的/要件/適用範囲） | req-save(CREATE), case-open(READ), case-update(UPDATE) |
| adr/ | docs/adr/ | current baseline ADR（`docs/adr/ADR-01XX.md`）と retired ADR（`docs/adr/retired/ADR-00XX.md`）を区別するアーキテクチャ決定記録（REQ-0112-050, REQ-0112-057） | agentdev-adr-guidelines(CREATE) |
| specs/ | docs/specs/ | システム仕様 | case-run(READ+WRITE), case-close(VERIFY) |

### テンプレート配置

| テンプレート種別 | 配置先 | 所有スキル |
|---|---|---|
| Issue/コメント系 | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |
| REQ（`doc_requirement.md`） | `.opencode/skills/agentdev-req-file-manager/templates/` | `agentdev-req-file-manager` |
| ADR（`doc_adr.md`） | `.opencode/skills/agentdev-adr-file-manager/templates/` | `agentdev-adr-file-manager` |
| PR説明（`pr_desc.md`） | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |

## Artifact Lifecycle

### ライフサイクル概観

```
promoted artifact → RU → REQ / Issue → RU 削除
```

| 成果物 | 生成コマンド | 読取りコマンド | 削除トリガー |
|---|---|---|---|
| promoted artifact（intake） | `intake-promote` | `backlog-review` | RU 化成功時 |
| promoted artifact（learning） | `learning-promote` | `backlog-review` | RU 化成功時 |
| RU（Requirement Unit） | `backlog-review` | `req-define`, `req-save`, `case-open` | case-open の Issue作成 + VERIFY 成功時（REQ-0105-012, REQ-0105-015） |
| REQ ファイル | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| Issue | `case-open` | `case-run`, `case-close` | なし（永続） |

### RU（Requirement Unit）

- 配置先: `.agentdev/backlog/req-units/RU-*.md`
- 粒度: N:1（複数 artifact → 1 RU 統合）および 1:N（1 artifact → 複数 RU 分割）を許可（REQ-0105）
- promoted artifact の単純コピー（パススルー）は禁止（REQ-0105）
- 矛盾検出時: 矛盾する artifact を RU 化せずユーザーに確認。矛盾しない artifact は通常通り RU 化（partial success）
- `case-open` での Issue作成 + VERIFY 成功後に該当 RU を削除（REQ-0105-012, REQ-0105-015）。`req-save` は RU を削除せず、RU 削除を行う唯一のコマンドは `case-open` である

### Promoted Artifact

| パイプライン | 配置先 | 構造 |
|---|---|---|
| intake | `.agentdev/intake/promoted/` | フラット（`*.md`） |
| learning | `.agentdev/learning/promoted/` | フラット（`*.md`） |

- サブディレクトリへのルーティングは行わない（フラット構造）
- intake-promote は inbox から直接読み取り、内部でレビュー・HITL確認後に promoted artifact を生成
- learning-promote は inbox.md + archive/active.md から読み取り、内部で normalize/classify/eval・HITL確認後に promoted artifact を生成
- RU 生成に成功した promoted artifact は `backlog-review` が削除（REQ-0105）

## Implementation Pattern Taxonomy

コマンドの内部構造に基づく分類軸（REQ-0103-016）。work_type（Issue種別分類）とは直交する概念である。

| Pattern | 主責務 | 許可される副作用 | 禁止される副作用 |
|---|---|---|---|
| **wall-session** | ユーザーとの対話セッションを通じて構造化成果物を生成 | ドラフトファイル作成、任意のアーティファクト読み取り | 既存アーティファクトの変更、git操作、外部API呼び出しによるリソース作成 |
| **file-pipeline** | 定義されたステップに従いファイルを変換・生成 | 指定ディレクトリへのファイル作成・更新、git操作、外部API呼び出し、**読み取り専用サブエージェント委譲**（ADR-0112 §3） | 大規模な状態機械の実行 |
| **manager-orchestrator** | 複数フェーズ構成の状態機械・自己修復ループ・サブエージェント | すべてのファイル操作、git操作、外部API呼び出し、サブエージェント起動 | （制限なし） |
| **capture-only** | データを収集・記録しinboxに保存 | inboxディレクトリへの新規ファイル作成のみ、外部APIからの読み取り | レビュー・プロモート・既存ファイルの変更・削除、git操作 |
| **read-only-diagnostic** | アーティファクトを分析しレポートを出力 | レポートファイルの新規作成、intake itemの新規作成（実行時）、**読み取り専用サブエージェント委譲**（ADR-0112 §3） | 検査対象アーティファクトの変更 |

### Command ↔ Pattern 対応

| コマンド | Primary Pattern |
|---|---|
| `/agentdev/req-define` | wall-session |
| `/agentdev/req-save` | file-pipeline |
| `/agentdev/case-open` | file-pipeline |
| `/agentdev/case-run` | manager-orchestrator |
| `/agentdev/case-update` | file-pipeline |
| `/agentdev/case-close` | file-pipeline |
| `/agentdev/learning-promote` | file-pipeline |
| `/agentdev/intake-capture` | capture-only |
| `/agentdev/intake-from-github` | capture-only |
| `/agentdev/intake-promote` | file-pipeline |
| `/agentdev/backlog-review` | wall-session |
| `/repo/docs-check` | read-only-diagnostic |
| `/agentdev/inspect-docs` | read-only-diagnostic |

## General Subagent Delegation Contract

ADR-0112 で定義されたサブエージェント委譲の一般概念に基づく共通契約。manager-orchestrator 以外のコマンドパターンから読み取り専用委譲を行う際の最小契約と制約を定める。`lightweight-delegation` は primary pattern ではなく、主要な実装分類に重ねる委譲の扱いである。

### 委譲時最小契約

委譲時の最小契約は、ADR-0112 §5 に従い以下の4要素を中心に記述する。`delegation_type` と `on_result` は必須 envelope ではなく、必要な場合のみ参考ラベルまたは親側の扱いとして記述する。

```yaml
inputs:
  scope:
    - {対象ファイル、Issue、PR、ログ、成果物パスなど}
  constraints:
    - {参照してよい基準、読んでよい範囲、除外対象}
side_effect_boundary:
  allowed:
    - read_only
  forbidden:
    - file_write
    - issue_pr_update
    - commit
    - push
    - user_confirmation
output_contract:
  status: pass | warn | fail | partial
  summary: {判定結果の要約}
  evidence:
    - {根拠ファイル、行、ログ、観測事実}
  artifact_body: {成果物本文がある場合のみverbatimで返す}
  parent_decision_required:
    - {親エージェントが判断・保存・確認すべき事項}
  side_effects: none
capture_handoff:
  intake_candidates:
    - {具体的な修正候補。保存は親エージェントが判断する}
  learning_candidates:
    - {再発防止知見候補。保存は親エージェントが判断する}
```

### 委譲種別（delegation_type 参考分類）

delegation_type は参考分類であり、Command 本文での使用は任意である。分類ラベルより、実際の入力範囲・副作用境界・返却内容を優先する。

| delegation_type | 用途 | 書き込み | 書き込み許可条件 |
|---|---|---:|---|
| `gate_check` | 完了判定・ガードレール充足確認・保存前/close前検査 | 禁止 | — |
| `semantic_review` | 文書・差分・REQ/ADR/SPECの意味レビュー | 禁止 | — |
| `log_analysis` | テストログ・CIログ・review結果解析 | 禁止 | — |
| `classification` | artifact / finding / intake / learning の分類 | 禁止 | — |
| `extraction` | 候補・論点・未回収事項の抽出 | 禁止 | — |
| `draft_generation` | Issue本文・PR本文・report案などの草案生成 | 禁止 | — |
| `controlled_case_execution` | case-run Epic / 複数Issue実行 | 条件付き | case-run のみ |

### 委譲制約

| 制約 | 説明 |
|---|---|
| 読み取り専用（書き込み禁止型） | gate_check / semantic_review / log_analysis / classification / extraction / draft_generation は対象アーティファクトを変更しない |
| 親コマンド最終判断 | サブエージェントは判断の入力を提供し、最終決定は親コマンドが行う（ADR-0112 §4） |
| 中間成果扱い | サブエージェント出力は中間成果であり、親コマンドは一部を採用・修正・却下できる（ADR-0112 §6） |
| 成果物本文の verbatim | Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物は verbatim で返す |
| 判定結果の圧縮 | 判定結果・調査過程・中間ログ・読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す |
| Script 優先 | 単純な決定的検査は Script 優先。非決定的処理（意味レビュー・分類・抽出等）にサブエージェント委譲を適用 |

### manager-orchestrator と軽量委譲の分離

| 項目 | manager-orchestrator | 軽量委譲 |
|---|---|---|
| 適用コマンド | case-run | 上記初期適用対象6コマンド（ADR-0112） |
| 委譲規模 | 複数サブエージェント統制・Wave scheduling・障害伝播 | 単一タスク委譲 |
| 状態管理 | 大規模な状態機械・自己修復ループ | なし（一方向の入出力） |
| プロトコル | case-run 専用 Subagent Protocol（後述） | 本 General Subagent Delegation Contract |
| 書き込み | すべて許可 | 原則禁止（controlled_case_execution のみ条件付き） |

### 初期適用対象

| コマンド | 委譲種別 | 委譲内容 |
|---|---|---|
| req-define | extraction / classification | 入力整理、既存文書照合、関連文書候補抽出 |
| case-run | gate_check / semantic_review / log_analysis | 検査・解析系ステップ |
| inspect-docs | semantic_review / classification | 意味レビュー、分類一貫性確認 |
| backlog-review | classification / semantic_review / extraction | artifact分析、統合/分割、矛盾検出 |
| learning-promote | classification / gate_check | 分類、評価、既存対策確認 |
| intake-promote | semantic_review / classification / draft_generation | itemレビュー、分類案生成 |

## Epic Orchestrator Contract

scale: large の場合、Epic Orchestrator モードで実行する:

- Epic Issue 本文の `## 実行順序` セクションを SSoT とする
- Wave 単位で子 Issue を直列または並列実行
- 親エージェントは orchestration のみ担当し、実装詳細を抱え込まない
- 失敗時は依存する後続 Wave をスキップ

### Epic検出ルール

| 条件 | 結果 |
|---|---|
| Issue に `epic` ラベルが付与されている | Epic Orchestrator モード |
| Issue 本文に `## 実行順序` セクションがあり、Wave 列を持つ Markdown テーブルが存在する | Epic Orchestrator モード |
| 上記いずれにも該当しない | 単一 Issue または多重 Issue モード |

### Wave解析プロトコル

1. Epic Issue 本文の `## 実行順序` セクションを特定
2. Wave テーブルを抽出: 列構成 `Wave / Issue / 実行方法 / 前提`
3. Wave 番号でグルーピング
4. バリデーション: 前提列に記載された Wave の完了後に後続 Wave の Issue を実行すること。1 Wave内の同時実行子Issue上限は5件

### Epic Orchestrator 実行フロー

1. Epic 本文読み取り
2. Wave テーブル解析
3. Wave 順次実行（Wave番号昇順）:
   - Epic ステータス一括更新（該当Wave内の全子Issueを `☐ 未着手` → `🔄 進行中`）
   - subagent 起動（各子Issue）
   - Wave 完了待機
   - 結果集約（成功/失敗判定）
   - Wave完了後ステータス一括更新
   - Wave間 rebase（`git rebase origin/main`）
   - 後続 Wave 制御（失敗影響評価）
4. 全 Wave 完了後: specs 更新（親エージェントのみ、直列実行）→ 集約完了報告

### Wave失敗時後続制御

| 条件 | アクション |
|---|---|
| 兄弟 Issue が失敗 | 同一 Wave 内の他 Issue は継続 |
| 後続 Wave が失敗 Issue に依存しない | 後続 Wave を継続 |
| 後続 Wave が失敗 Issue に依存する | 該当 Wave をスキップ |
| 依存有無が判定不能 | 安全側: 該当 Wave をスキップ |
| 全 Issue が失敗 | 後続 Wave を実行せず集約失敗報告で停止 |

## Wave Scheduling (多重Issueモード)

### 依存関係レベル

| レベル | 名称 | 定義 | 実行方法 |
|---|---|---|---|
| L0 | 完全独立 | 共通ファイルなし、specs更新なし、他Issueへの参照なし | 並列実行 |
| L1 | Specs共有 | 複数featureが同じspecsセクションを更新する可能性あり | 並列実行（specs更新は直列） |
| L2 | ファイル衝突 | 変更予定ファイルに重複あり | Wave分離（同一Wave並列不可） |
| L3 | 明示的依存 | Issue本文に明示的記述あり | 順次実行 |

### Wave構成ルール

| Wave | 対象Issue | 実行方法 |
|---|---|---|
| Wave 1 | L0 + L1 Issues | 並列実行（L1はspecs更新を直列） |
| Wave 2+ | L2 Issues（1件ずつ別Wave）+ L3 Issues | 直列 |

- 制約: 最大5 Issues / 呼び出し
- specs更新は親エージェントのみ（直列・Issue番号昇順）

### 再開ポイント検出

1. worktree存在 + ブランチ切り替え済み → 準備フェーズ完了
2. worktree内コミットあり + チェックボックス全完了 → 実装フェーズ完了
3. PR既存 → 提出フェーズ完了
4. 上記いずれも該当しない → 準備フェーズから開始

## Subagent Protocol（case-run 専用）

> **注意**: 本プロトコルは case-run の manager-orchestrator パターンにおけるサブエージェント起動仕様である。軽量な一般委譲は前述の「General Subagent Delegation Contract」を参照。subagent-protocol.md（Skill reference）に編集安全手順・大規模ファイル分割委譲・AST-grep 運用を定める。

### 起動仕様

```
task(category="unspecified-high", run_in_background=true, prompt="...")
```

### プロンプト構成

サブエージェントのプロンプトに含める項目:
- Issue番号
- 実行指示（準備→実装→提出フェーズ）
- worktreeパス
- specs更新禁止の明示
- Finding 記録指示（PR本文の `## Findings / Capture候補` セクション）
- 書き込み事後検証の要求

### 親エージェント責務

- Wave開始前のEpicステータス一括更新
- 全サブエージェント完了待機
- specs直列更新
- Findings / Capture候補件数の集約

### フォールバック

サブエージェントが使用できない場合、Sequential Wave（親エージェントがWave内でIssueを1件ずつ順次処理）に切り替え。

## 子Issue単位オーケストレーションモデル

> 本セクションは case-auto の薄いオーケストレーター化（REQ-0114-045〜048, 073〜075）および case-open の自律構成生成（REQ-0132-007〜010）に基づく。従来の Epic Orchestrator Contract（Wave一括実行）は本モデルに置き換えられる。

### OU / Epic / Wave / Issue 階層（SC-001）

```text
OU (Operation Unit):
  要件変更の処理単位。req-define / backlog-review 由来。
  実装順序やIssue分解そのものではない。

Epic:
  case-open が OU を実行可能にするために作る上位 Issue。
  大きな OU を複数 Issue で処理する必要がある場合に作成。
  子 Issue 全体の進捗 SSoT を持つ。

Wave:
  Epic 内の実行段階。case-open が技術的依存関係から作成。
  Wave 内 Issue は同じ前提条件のもとで実行可能。
  Wave 間には順序がある。

Issue:
  case-run が1回で扱う最小実装単位。
  サブエージェント委譲の単位。PR作成・検証・case-close の単位。
```

階層パターン（規模に応じて省略可能）:

| 規模 | 構成 |
|------|------|
| 小規模 OU | OU → Issue |
| 中規模 OU | OU → Epic → Issue |
| 大規模 OU | OU → Epic → Wave → Issue |

### 子Issue 実行状態 enum（SC-002, SC-003）

| status | 意味 | 設定主体 |
|--------|------|----------|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） |
| `ready` | 依存が満たされ、case-auto が次に case-run へ渡せる状態 | case-auto |
| `running` | case-auto が選択し、case-run が実行中の状態 | case-auto |
| `completed` | Issue の実装・検証・必要な case-close が完了した状態 | case-close |
| `blocked` | 要件曖昧性・外部副作用・権限不足・矛盾等により自動継続できない状態 | case-run / case-auto |
| `failed` | 実装・検証・CI・PR 作成などの実行結果として失敗した状態 | case-run |

- `skipped` は採用しない（REQ-0106-030）。前提未達の Issue は `pending` のまま選択対象外となる。
- Wave status は保存しない。Wave 内 Issue 状態から導出する。
- OU / Epic の status は進捗集約として扱い、主たる実行状態は Issue status とする。

### case-open 構成生成基準（SC-005, SC-006）

case-open は要件doc の operation_units を読み取り、以下を自律生成する:

- Epic 要否判定（単一 Issue で完結する場合は Epic を作成しない）
- Issue 分解（OU を実装可能なサイズに分割）
- 依存関係設定（技術的依存に基づく Wave 構成）
- 初期 status 付与（原則 `pending`）

**停止条件**: 以下の場合、case-open は停止し要件の明確化を求める:
- 要件が曖昧で Issue 構造を生成できない場合
- operation_units の要件に矛盾が含まれる場合

**禁止事項**:
- 機能要件・非機能要件・制約・対象外・受け入れ条件の新規作成
- 実装順序・Issue分解についてのユーザー確認要求

### case-auto 子Issue選択・永続状態（SC-007）

case-auto は薄いオーケストレーターとして以下を読み取る:

- Epic Issue 本文の子 Issue 一覧・Wave 構成
- 各子 Issue の status（pending / ready / running / completed / blocked / failed）
- 関連 PR の open / merged 状態

**子Issue選択ロジック**:
1. status が `ready` の子 Issue を1件選択
2. `ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させ選択
3. 選択した Issue を `running` に遷移させ case-run に渡す
4. case-run 完了後、永続状態を再読込し結果を確認

**case-run への最小入力**: Issue 番号・要件docパス（該当 OU の target_req 情報を含む）

### case-run 1 Issue 委譲入力（SC-008）

case-run は case-auto から指定された1 Issue のみを処理する:

- サブエージェントへの委譲入力: Issue 番号・実装指示・worktree パス・specs 更新禁止・Finding 記録指示
- 結果の永続化形式: PR 本文（成功時）・Issue コメント（blocked / failed 時）
- 親コンテキストへの実装過程ログ持ち越し禁止

### 結果状態遷移と出力契約（SC-009）

| case-run 結果 | Issue status 遷移 | case-auto アクション |
|---------------|-------------------|---------------------|
| completed(pr) | `running` → `completed` | case-close 相当処理を実行 |
| blocked | `running` → `blocked` | 停止理由を報告し再開可能コマンドを提示 |
| failed | `running` → `failed` | 正常完了した他 Issue のみ case-close 対象とする |

**親コンテキスト非累積原則**: case-auto は子 Issue の実装詳細・実装過程ログを親コンテキストに保持しない。進行状態は永続状態（Issue / PR / `.agentdev/`）から再読込する。

## 責務分界表

Command・Skill・Script・サブエージェント委譲の責務境界（ADR-0107, ADR-0112）。

| 責務 | 定義場所 | 説明 |
|---|---|---|
| 公開API・入力・出力・ガードレール・高レベルStep | Command定義（`.opencode/commands/agentdev/*.md`） | 利用者向けのインタフェース定義 |
| 再利用可能な判断基準・検査観点の詳細 | Skill references（`references/*.md`） | 宣言的知識。Skill本体（SKILL.md）は原則と概要のみ |
| 委譲インタフェース（共通エンベロープ・delegation_type taxonomy・制約） | 本 SPEC（workflow-contracts.md） | 委譲の共通契約 |
| 委譲のアーキテクチャ判断（一般概念・manager-orchestrator位置づけ・読取専用委譲許容） | ADR-0112 | 意思決定の記録 |
| case-run 専用プロトコル（起動仕様・プロンプト構成・フォールバック） | subagent-protocol.md（Skill reference） | case-run manager-orchestrator の運用詳細 |
| 編集安全手順・AST-grep運用・大規模ファイル分割 | subagent-protocol.md（Skill reference） | サブエージェント共通の安全手順 |
| 委譲定義の最小構成・delegated_check・中間成果基準 | command-authoring-standards.md（Skill reference） | Command 作者向けの委譲記述標準 |
| 決定的な変換・検証・生成 | Script（`scripts/*.js`） | テスト可能な処理 |

## Self-Healing Contract

`case-run` の検証失敗時に自律修正を試みる:

- 最大3回の修正ループ（11a / 11c それぞれ独立カウント）
- 修正範囲は既存要件範囲内に限定
- 7項目の停止条件に該当した場合は即座停止・ユーザー報告

## Capture Boundaries

### Intake / Learning 境界

| 領域 | 定義 | 保存先 | 目的 |
|---|---|---|---|
| **intake** | 今回の作業本筋では扱わないが、後で対応要否を判断すべき具体的な作業候補・不整合・規約違反・未回収課題 | `.agentdev/intake/inbox/` | 積み残し作業の回収・Issue化 |
| **learning** | 作業中の失敗・回避・修正・判断ミス・手順漏れから次回以降の再発防止に使う知見 | `.agentdev/learning/` | 知見の分類・昇華・反映 |

### Split Rule

```
具体的修正対象がある → intake item
再発防止知見がある → learning item
両方ある → 分割（intake item + learning item を別々に作成）
どちらでもない → 記録対象外（完了報告に候補として提示）
```

### PR 本文永続チャネル

case-run で発見した本筋外 Finding の永続化チャネルとして PR 本文を使用する（REQ-0106）。

- 書込み元: case-run（Step 10-5）
- 読取り元: case-close（Step 9-2）
- 各 case-run は自身の PR にのみ書込み。`.agentdev/intake/inbox/` は直接変更しない
- capture 候補を intake 候補と learning 候補に分け、別々の成果物として扱う（Split Rule に準拠）
- Epic 横断回収: Epic モード時、case-close は関連子 Issue PR 群の本文を横断走査して Finding を回収

### REQ再構成intake

通常intakeとは独立した配置規約（REQ-0109）。

| 状態 | パス |
|---|---|
| inbox | `.agentdev/intake/inbox/req-restructure/` |
| 却下 | `.agentdev/intake/archive/rejected/req-restructure/` |

req-define の明示入力としてルーティングする（backlog-review 経由ではない）。検知カテゴリ: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT

## Backlog Draft Protocol

`intake-from-github` と `backlog-review` 間のバックログdraftのライフサイクルとスキーマ。

### draftライフサイクル

```
draft → approved → RU化 + 削除
```

### draft frontmatter

```yaml
---
period: "{since} 〜 {until}"
period-slug: "{period-slug}"
status: draft | approved | issued
created: "{YYYY-MM-DD}"
sources:
  - type: issue | pr
    number: {N}
    closed_at: "{YYYY-MM-DD}"
---
```

### コマンド間責務

| 責務 | コマンド |
|---|---|
| 抽出・分類・解消チェック | `intake-from-github` |
| ドラフト保存 | `intake-from-github` |
| promoted artifact 生成 | `intake-promote` |
| RU 生成 | `backlog-review` |
| backlog-extractedコメント投稿 | `backlog-review` |

## Finding Protocol

### Finding の位置づけ

requirements review finding は要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- 保存先: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`
- 次工程: req-define の明示入力ファイルとして渡される

### Finding frontmatter

```yaml
---
finding_type: SPLIT | MOVE | RETIRE | DUPLICATE | OBSOLETE | DRIFT
source_req: REQ-{NNNN} | null
source_command: req-save
topic_slug: {topic-slug}
created: "{YYYY-MM-DD}"
---
```

### Finding 種別

| 種別 | 説明 | 検出タイミング |
|---|---|---|
| `SPLIT` | 要件が膨張・関心分離の基準に該当し分割が必要 | req-save SPLIT検出時 |
| `MOVE` | 要件が別REQに移動すべき | requirements review時 |
| `RETIRE` | 要件が不要になり廃止すべき | requirements review時 |
| `DUPLICATE` | 複数REQ間で要件が重複 | requirements review時 |
| `OBSOLETE` | 要件が既に古く現在のシステムに適合しない | requirements review時 |
| `DRIFT` | 要件と実装の間に乖離が生じている | requirements review時 |

### inspect-promote 自動 promote

`/agentdev/inspect-promote --auto` は、高確信度の inspect finding を HITL 承認を経ずに intake/backlog パイプラインへ流入させる（REQ-0136-016, REQ-0126-010）。本節は自動 promote の対象カテゴリ・投入先・実行ログ・誤検知 revoke 手順の正である。コマンドは判定表を重複保持しない。

#### 自動 promote 対象カテゴリ

自動 promote は「機械的に特定可能で、移行先 SPEC が一意に定まり、意味判断を要しない」高確信度 finding に限定する。`--auto` は明示 opt-in であり、省略時は手動分類フローのみ動作する。

| カテゴリ | 自動 promote 対象 | 自動 promote 対象外（手動分類へ） |
|---|---|---|
| SPEC分離基準違反（high-specificity） | 具体的証拠を伴う Step 番号・schema field・enum 一覧・fixture detail・作業履歴など、移行先が SPEC/command reference に一意に定まるもの | 安定契約例外（REQ-0101-069）、否定文脈、判定表・内部パラメータなど意味解釈を要するもの |
| 構造的即時是正 | リンク切れ・旧 namespace 残存など、正解が一意で破壊的でない修復 | — |
| 命名・分類の意味判断 | — | SPLIT/MERGE/MOVE/RETIRE/DRIFT 判断、scope 決定、優先度付け（全件手動） |
| ADR 要否判断 | — | ADR閾値判定を含む finding（全件手動） |

自動 promote 対象外の finding は `--auto` 指定時でも手動分類フロー（HITL 承認）に回し、自動投入しない。

#### 投入先・成果物形式

- 投入先: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`（フラット構造）
- backlog-review は既存の intake promoted artifact と同様に読み込み、RU 化対象として処理する
- 自動投入された元 finding の inbox file は、手動 promote と同様に削除する

#### 実行ログ

`--auto` 実行の都度、投入対象を `.agentdev/inspect/promoted/auto-promote-log.md`（append-only）に記録する。

```markdown
## {YYYY-MM-DD HH:MM} auto-promote run

- source finding: .agentdev/inspect/inbox/{file}
- category: {自動 promote 対象カテゴリ}
- destination: .agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md
- evidence: {finding が提示した証拠の要約}
- exempt check: 安定契約例外/否定文脈でないことを確認した旨
```

ログは git 管理対象（`.agentdev/inspect/promoted/` 配下）。各実行のトレーサビリティと誤検知検出の証跡とする。

#### 誤検知 revoke 手順

自動 promote された finding が誤検知と判明した場合、以下の手順で revoke する。revoke は人間の判断により行う。

1. 対象の投入先ファイル `.agentdev/intake/promoted/inspect-auto-*.md` を特定する（`auto-promote-log.md` のエントリから追跡）
2. 当該ファイルが backlog-review により未処理（RU 未生成）の場合: ファイルを削除し、元 finding を `.agentdev/inspect/inbox/` に戻す
3. 当該ファイルが backlog-review により既に RU 化済みの場合: 生成された RU を `.agentdev/backlog/req-units/` から削除し、要件化されていないことを確認する。要件化（REQ/Issue 化）が既に進行している場合はユーザーに停止を依頼する
4. `auto-promote-log.md` の該当エントリに `status: revoked` と revoke 理由を追記する
5. 同種の誤検知が再発しないよう、誤検知となった判定根拠を docs-check rule / IR の false positive 抑制へフィードバックする候補として記録する（intake 経由または PR 本文の Findings セクション）

## REQ File Consistency Check

### 検証項目

| チェック対象 | 検証内容 | 自動修正 |
|---|---|---|
| docs/requirements/ 配下のファイル | 全REQファイルが存在するか | 欠落ファイルは警告のみ |
| docs/requirements/README.md インデックス | 全REQファイルがテーブルに記載されているか | 未記載のREQをテーブルに追加 |
| docs/README.md ドキュメントハブ | 全REQファイルがリンクとして記載されているか | 未記載のREQをリンクとして追加 |
| REQ frontmatter id | ファイル名と一致するか | エラーとして報告（自動修正しない） |

### 実行タイミング

- `req-save` Step 7: 自動修正あり
- `case-close` Step 3: 検証のみ（自動修正は行わない）

## DOC-MAP Impact Rules

REQ CREATE / APPEND / UPDATE 時に `docs/DOC-MAP.md` への影響を確認する（REQ-0101）。

### 影響確認フロー

1. REQ操作実行時、`docs/DOC-MAP.md` に該当領域のセクションが存在するか確認
2. 影響がある場合は同一変更内で更新
3. 影響がない場合は更新不要
4. 更新が必要だが作業範囲を超える場合、REQ保存は中止せず follow-up として明示

### 影響確認対象

| 操作 | 確認対象 |
|---|---|
| REQ追加時 | `docs/requirements/README.md`, `docs/DOC-MAP.md` |
| ADR追加時 | `docs/adr/README.md`, `docs/DOC-MAP.md` |
| SPEC追加/分割/削除時 | `docs/specs/README.md`, `docs/DOC-MAP.md` |

### 矛盾時の優先順位

`docs/DOC-MAP.md` と基準（REQ/ADR/SPEC）が矛盾する場合、基準を優先し DOC-MAP を修正対象とする。

## REQ Restructuring Detection

REQ保存処理中にREQ体系上の歪みを検知した場合、REQ再構成intakeとして保存する（REQ-0109）。

### 検知カテゴリ

| 観点 | 説明 |
|---|---|
| SPLIT | 単一REQの責務が肥大化、複数REQへの分割が適切 |
| MERGE | 複数REQが同じ興味対象を重複して cover、統合が適切 |
| MOVE | REQの要件行やセクションが別REQにより適切に配置される |
| DUPLICATE | 異なるREQ間で要件内容が重複 |
| RETIRE | 対象REQが不要化、廃止が適切 |
| DRIFT | REQの記述が現在の実装や仕様から乖離 |

### 検知時の扱い

検知はSHOULD。検知時は通常のREQ保存処理を妨げず、非同期に保存する。

## artifact_actions ベース工程分岐

case-auto / case-open / req-save / spec-save の工程分岐は `work_type` の固定分岐ではなく、req_draft の `artifact_actions` 存在に基づく動的判定とする（ADR-0123, REQ-0136-014）。

- `req-save` は `artifact_actions` に `artifact: req` または `artifact: adr` の entry が含まれる場合に実行する（`work_type` に依存しない）
- `spec-save` は `artifact_actions` に `artifact: spec` の entry が含まれる場合に実行する（`work_type` に依存しない）
- `case-open` は `req-save` / `spec-save` の後に常に実行する
- `case-auto` はパイプラインの各工程を `work_type` の固定分岐ではなく `artifact_actions` の存在から決定する
- `auto_gate` preflight: `case-auto` は `auto_gate.auto_ready` を確認し、false の場合または未解決 item が残る場合は停止する

## 委譲定義副作用境界YAML推奨例

委譲定義の `side_effect_boundary` には `read_only` のような包括値（blanket value）を使用せず、許可する操作を具体名で列挙すること。以下の YAML を推奨例とする。

```yaml
side_effect_boundary:
  allowed:
    - read_files
    - inspect_content
    - classify_candidates
    - return_summary
    - return_evidence
    - return_artifact_body_when_requested
  forbidden:
    - file_write
    - issue_pr_update
    - commit
    - push
    - user_confirmation
```

> `read_only` を包括値として使用することは禁止する。許可する操作を具体的に列挙すること。

## 文書表記・文意品質ゲート接続

文書表記・文意品質ゲート（REQ-0140）と各 command/skill の接続関係を以下に定義する。

| command/skill | gate connection |
|---|---|
| `req-define` | ADR 判断前の draft body 品質検査 |
| `req-save` | 保存前の REQ/ADR/SPEC body 品質検査 |
| `spec-save` | 保存前の SPEC body 品質検査 |
| `case-run` | PR 作成前の docs/** diff 品質検査 |
| `case-close` | SPEC status 更新の品質検査 |
| `case-auto` | 構成する各 command の gate を継承 |
| `inspect-docs` | 英字混じり抽象用語・読取専用セマンティクスの検出 |
| `/repo/docs-check` | 機械的な表記違反の検出 |

## 外部アーキテクチャ助言エージェント接続

外部アーキテクチャ助言エージェント（oracle）の接続点を定義する。

- **起動点**: `req-define` Step 4（要件展開）→ Step 4-4（アーキテクチャ確認）→ Step 5（ADR判断）
- **oracle 入力**: 要件候補、既存 REQ/ADR/SPEC の矛盾候補、ADR 候補、SPEC 候補、責務境界変更、未解決分岐、具体質問
- **oracle 出力**: 推奨方向、主要な設計リスク、ADR create/update/unnecessary 判断、SPEC 分離候補、矛盾解消提案、根拠参照、確信度
- **親エージェント分類**: oracle の出力を confirmed / inferred / user-decision / blocker のいずれかに分類して取り扱う

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0104）。
