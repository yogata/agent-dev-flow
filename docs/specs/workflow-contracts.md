---
updated: 2026-06-21
---

# ワークフロー契約

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

ワークフロー契約の雛形を定義し、コマンドパイプライン間の入出力関係と前提条件を明確にする（REQ-0104）。

## パイプライン概要

AgentDevFlow は 3 つのパイプラインで構成される:

| パイプライン | コマンド | 目的 |
|---|---|---|
| req/case | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了まで |
| learning | learning-capture → learning-promote | 学びの蓄積・昇華 |
| intake | intake-capture / intake-from-github → intake-promote | 改善候補の収集・昇華 |

## コマンド分類

AgentDevFlow の公開コマンドは以下の5分類のいずれかに属する（REQ-0104-048）。全公開コマンドがいずれかの分類に属すること。

| 分類 | コマンド | 目的 |
|---|---|---|
| 主フロー | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了までの標準ワークフロー |
| 最大自走入口 | case-auto | req-define 完了後の後続工程を一括自走する追加入口。標準フローを置換しない（REQ-0104-049） |
| 補助フロー | intake-capture, intake-from-github, intake-promote, learning-promote, backlog-review | 改善候補収集・学び蓄積・RU化。主フローを補完 |
| 検出フロー | inspect-docs, inspect-skills, inspect-promote | 文書・スキルの意味検出・分類・昇格 |
| リポジトリローカル検査 | /repo/docs-check | AgentDevFlow 本体リポジトリ内の機械的整合性検査 |

- case-auto は標準フロー（req-save → spec-save → case-open → case-run → case-close）を内部的に呼び出す追加入口であり、標準フローを置換・廃止しない（REQ-0114-017）。spec-save は draft-meta.spec-candidates が空の場合スキップし、旧形式 draft（spec-candidates フィールドなし）は後方互換で従来順序で実行する（ADR-0123, REQ-0136-014）。
- 補助フロー・検出フロー・リポジトリローカル検査は、主フロー・最大自走入口とは独立して実行可能である。
- 検出フローの出力（検出事項: inspect finding）は、inspect-promote → backlog-review を経て RU 化され、req-define の入力となる。

## フェーズ定義

### マクロフェーズ

開発ワークフローを3つのマクロフェーズで定義する。

| マクロフェーズ | 定義 | 対応マイクロフェーズ |
|---|---|---|
| 壁打ち | 要件定義・分析・Issue作成前の合意形成 | requirement + analyzed |
| 構造的実行 | Issue作成後の実装・PR作成・進捗管理 | created + in_progress |
| レビュー完了 | PR作成後のレビュー・マージ・完了処理 | review + done |

### マイクロフェーズ

> **注意**: 以下の6マイクロフェーズは説明用ラベルであり、状態管理モデルではない（REQ-0112-023）。実際の状態管理は Issue ラベル・GitHub Project で行う（REQ/SPEC 文書内の状態記述については「ワークフロー状態管理」節を参照）。

| フェーズ | 状態 | マクロフェーズ |
|---|---|---|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了・Issue未作成 | 壁打ち |
| `created` | Issue作成済み・作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR作成済み・レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む: learning capture + intake capture） | レビュー完了 |

### ワークフロー状態管理

ワークフロー状態（例: "要件定義", "実装", "テスト" 等の6マイクロフェーズに対応する状態語）は Issue ラベル・GitHub Project で管理する（REQ-0108-123、REQ-0101-037）。REQ/SPEC 文書内には状態として埋め込まず、上記のマイクロフェーズはワークフローの説明目的でのみ使用する。

> **スコープ注記**: 本ルールは REQ/ADR/SPEC の各文書にワークフロー状態ラベル（例: 当該文書が「実装中」「レビュー中」等の状態にあると示す標識）を埋め込まないことを定める。SPEC がマイクロフェーズ分類体系そのものを定義・説明すること（本節の記述など）は本ルールの対象外である。

## SSoT 遷移規則

各マクロフェーズにおけるSingle Source of Truth（SSoT: 唯一の情報源）を定義する。

| マクロフェーズ | SSoT | 説明 |
|---|---|---|
| 壁打ち | セッション会話 + draft | 壁打ちで合意形成された要件・分析（Issue未作成のため） |
| 構造的実行 | Issue本文 + Work Plan | 要件doc + 実行計画 |
| レビュー完了 | PR + レビュー結果 | コードレビュー結果とマージ状態 |

### draft の位置づけ

draft（`.agentdev/drafts/req-draft-*.md`）は壁打ちフェーズ内の一時ハンドオフであり、構造的実行以降のSSoTはIssue本文とWork Planである。

- ライフサイクル: `draft` → `saved`（req-save完了）→ `issued` + 削除（case-open完了）
- 構造的実行フェーズ以降: draftは存在しない（case-open完了時に削除）。SSoTはIssue本文 + Work Planに完全移行

### フェーズ境界ルール

壁打ち→構造的実行の境界で満たすべき要件: 壁打ちフェーズ完了時、docs変更（REQファイル、READMEインデックス、ADR等）を必ずコミット・プッシュする。これにより構造的実行フェーズのworktreeがdocs変更を継承する。

### Local backend の SSoT 位置づけ

Local backend（ローカル版 OpenCode）では、構造的実行以降の SSoT は GitHub Issue / PR ではなくローカル Case ファイル（`.agentdev/cases/case-{NNNN}.md`）である（REQ-0141-021〜023）。

| マクロフェーズ | Local backend の SSoT |
|---|---|
| 壁打ち | セッション会話 + draft（GitHub backend と共通） |
| 構造的実行 | Case ファイル本文 |
| レビュー完了 | Case ファイル `## マージ結果` |

Local backend の SSoT 差分は『コマンド I/O 契約』節の『Local backend（差分）』サブセクションと整合する。Case ファイルの構造・状態遷移は [ローカル Case ファイル](local-case-file.md) を参照。

## コマンド I/O 契約

> **バックエンド既定**: 本節の契約は GitHub backend を既定とする。Local backend は『Local backend（差分）』節による差分適用後の契約に従う（REQ-0141）。

### req/case パイプライン

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/req-define` | ユーザー対話、既存要件情報 | 要件 doc（draft） | — |
| `/agentdev/req-save` | 要件 doc（draft） | REQ/ADR ファイル | req-define 完了 |
| `/agentdev/case-open` | REQ ファイルまたは要件 doc | GitHub Issue | req-save または req-define 完了 |
| `/agentdev/case-run` | GitHub Issue | 実装済みブランチ + PR | case-open 完了 |
| `/agentdev/case-close` | PR | マージ済み + クローズ済み | case-run 完了 |
| `/agentdev/case-auto` | 要件 doc | マージ済み + クローズ済み | req-define 完了（明示指定時のみ） |
| `/agentdev/case-update` | Issue 番号 | 更新済み Issue | Issue 存在 |

### Local backend（差分）

Local backend（ローカル版 OpenCode）は GitHub backend との差分のみを定義する（REQ-0141）。重複定義は行わず、GitHub backend の契約に差分テーブルを適用した結果が Local backend の契約となる。

| コマンド / 対象 | 差分項目 | GitHub backend | Local backend |
|---|---|---|---|
| `case-open` | 出力 | GitHub Issue | `.agentdev/cases/case-{NNNN}.md` |
| `case-run` | 出力 | GitHub PR | Case ファイルへ PR 相当セクション追記 |
| `case-close` | 入力 | Issue + PR | Case ファイル |
| `case-close` | 出力 | GitHub PR 取り込み + Issue クローズ | Case ファイル `## マージ結果` + ローカル Git 取り込み |
| SSoT（構造的実行） | 情報源 | Issue 本文 + Work Plan | Case ファイル本文 |
| SSoT（レビュー完了） | 情報源 | PR + レビュー結果 | Case ファイル `## マージ結果` |

Local backend では GitHub Issue / PR を使わない（REQ-0141-021〜023, 026）。`gh issue` / `gh pr` を必須操作としない。Case ファイルの構造・状態遷移・採番は [ローカル Case ファイル](local-case-file.md) を参照。生成プロセスは [ローカル版 OpenCode 生成](local-generation.md) を参照。

### learning パイプライン

| コマンド/スキル | 入力 | 出力 | 前提 |
|---|---|---|---|
| `learning-capture`（スキル） | エージェント実行中の観測 | `inbox.md` エントリ | — |
| `/agentdev/learning-promote` | `inbox.md` + `archive/active.md` | 採用済み成果物 | inbox.md にエントリ |

### intake パイプライン

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/intake-capture` | 手動入力 | inbox item | — |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | inbox item | — |
| `/agentdev/intake-promote` | inbox items | 採用済み成果物 | inbox に item |

### 共通後段

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/backlog-review` | 採用済み成果物 | `RU-*.md` | promoted 存在 |

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

## ワークフロー経路制御

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

### バックログ分類

Backlog（バックログ）はwork_typeとは独立した専用分類。`intake-from-github` → `backlog-review` の経路で処理され、work_type判定の対象外となる。

- Epic: ラベル `enhancement`, `epic` を付与
- 子Issue: ラベル `enhancement` を付与（`feature`, `epic` は付与しない）
- Backlog Issuesは規模判定を適用せず、常にEpic + 子Issue構成で作成される

## アーティファクト境界

### Anchored Development モデル（アンカード開発モデル）

agentdev系ワークフローはAnchored Developmentモデル（アンカード開発モデル）に基づく。4つの相互接続アーティファクトで構成される。

| アーティファクト | 役割 | 格納先 |
|---|---|---|
| REQ（要件doc） | ユーザー視点の要件（目的/要件/適用範囲） | `docs/requirements/REQ-{NNNN}.md` |
| コード | 実装そのもの | ソースコード |
| テスト | 振る舞い仕様 | テストファイル |
| ADR | アーキテクチャ判断 | 現行基準: `docs/adr/ADR-01XX.md`; 廃止: `docs/adr/retired/ADR-00XX.md` |

生きた仕様（Living Specs）: 現行の SPEC 一覧は `docs/specs/README.md` の SPEC index を正とする（REQ-0101）。主な SPEC を以下に示す。

| 仕様 | 格納先 | 役割 |
|---|---|---|
| system.md | `docs/specs/system.md` | システム全体の現在の仕様 |
| patterns.md | `docs/specs/patterns.md` | 文書フォーマット規約・テンプレート命名規則・リポジトリ参照リンク規約 |
| design-principles.md | `docs/specs/design-principles.md` | 設計判断の根拠・指針 |
| quality-specs.md | `docs/specs/quality-specs.md` | 品質基準・検証ルール |
| document-model.md | `docs/specs/document-model.md` | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス |
| artifact-contracts.md | `docs/specs/artifact-contracts.md` | Command/Skill/Template/Script の入出力・依存方向 |
| artifact-responsibilities.md | `docs/specs/artifact-responsibilities.md` | 各成果物種別の正規所有者（canonical owner）と責務 |
| integrity-contracts.md | `docs/specs/integrity-contracts.md` | strict/heuristic/observation 分類と検査カテゴリ |
| integrity-rule-catalog.md | `docs/specs/integrity-rule-catalog.md` | 整合性検査の全ルール定義 |
| workflow-contracts.md | `docs/specs/workflow-contracts.md` | コマンドパイプラインの入出力・前提条件 |
| runtime-package-boundary.md | `docs/specs/runtime-package-boundary.md` | リポジトリ種別（repo type）別 `.opencode/` 定義・命名規約・導入方式・同期範囲 |
| rule-ownership.md | `docs/specs/rule-ownership.md` | ルールドメインと責任 REQ/SPEC の対応 |
| req-impact-map.md | `docs/specs/req-impact-map.md` | 各現行 REQ が影響する整合性ルールと成果物 |

### docs/ 構造

| 区分 | パス | 役割 | 自動操作コマンド |
|---|---|---|---|
| guides/ | docs/guides/ | 開発ガイド（参照のみ） | — |
| requirements/ | docs/requirements/ | 要件管理（目的/要件/適用範囲） | req-save(CREATE), case-open(READ), case-update(UPDATE) |
| adr/ | docs/adr/ | 現行基準 ADR（`docs/adr/ADR-01XX.md`）と廃止 ADR（`docs/adr/retired/ADR-00XX.md`）を区別するアーキテクチャ決定記録（REQ-0112-050, REQ-0112-057） | agentdev-adr-guidelines(CREATE) |
| specs/ | docs/specs/ | システム仕様 | case-run(READ+WRITE), case-close(VERIFY) |

### テンプレート配置

| テンプレート種別 | 配置先 | 所有スキル |
|---|---|---|
| Issue/コメント系 | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |
| REQ（`doc_requirement.md`） | `.opencode/skills/agentdev-req-file-manager/templates/` | `agentdev-req-file-manager` |
| ADR（`doc_adr.md`） | `.opencode/skills/agentdev-adr-file-manager/templates/` | `agentdev-adr-file-manager` |
| PR説明（`pr_desc.md`） | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |

## アーティファクトライフサイクル

### ライフサイクル概観

```
採用済み成果物 → RU → REQ / Issue → RU 削除
```

| 成果物 | 生成コマンド | 読取りコマンド | 削除トリガー |
|---|---|---|---|
| 採用済み成果物（intake） | `intake-promote` | `backlog-review` | RU 化成功時 |
| 採用済み成果物（learning） | `learning-promote` | `backlog-review` | RU 化成功時 |
| RU（Requirement Unit） | `backlog-review` | `req-define`, `req-save`, `case-open` | case-open の Issue作成 + VERIFY 成功時（REQ-0105-012, REQ-0105-015） |
| REQ ファイル | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| Issue | `case-open` | `case-run`, `case-close` | なし（永続） |

### RU（Requirement Unit）

- 配置先: `.agentdev/backlog/req-units/RU-*.md`
- 粒度: N:1（複数 artifact → 1 RU 統合）および 1:N（1 artifact → 複数 RU 分割）を許可（REQ-0105）
- 採用済み成果物 の単純コピー（パススルー）は禁止（REQ-0105）
- 矛盾検出時: 矛盾する artifact を RU 化せずユーザーに確認。矛盾しない artifact は通常通り RU 化（partial success）
- `case-open` での Issue作成 + VERIFY 成功後に該当 RU を削除（REQ-0105-012, REQ-0105-015）。`req-save` は RU を削除せず、RU 削除を行う唯一のコマンドは `case-open` である

### 採用済み成果物（Promoted Artifact）

| パイプライン | 配置先 | 構造 |
|---|---|---|
| intake | `.agentdev/intake/promoted/` | フラット（`*.md`） |
| learning | `.agentdev/learning/promoted/` | フラット（`*.md`） |

- サブディレクトリへのルーティングは行わない（フラット構造）
- intake-promote は inbox から直接読み取り、内部でレビュー・HITL確認後に採用済み成果物を生成
- learning-promote は inbox.md + archive/active.md から読み取り、内部で normalize/classify/eval・HITL確認後に採用済み成果物を生成
- RU 生成に成功した採用済み成果物は `backlog-review` が削除（REQ-0105）

## 実装分類（Implementation Pattern Taxonomy）

コマンドの内部構造に基づく分類軸（REQ-0103-016）。work_type（Issue種別分類）とは直交する概念である。Pattern 名は識別子（`wall-session` 等）として英字を維持しつつ、日本語主語で運用する。

| Pattern（識別子） | 日本語名称 | 主責務 | 許可される副作用 | 禁止される副作用 |
|---|---|---|---|---|
| **wall-session** | 対話セッション型 | ユーザーとの対話セッションを通じて構造化成果物を生成 | ドラフトファイル作成、任意のアーティファクト読み取り | 既存アーティファクトの変更、git操作、外部API呼び出しによるリソース作成 |
| **file-pipeline** | ファイル変換パイプライン型 | 定義されたステップに従いファイルを変換・生成 | 指定ディレクトリへのファイル作成・更新、git操作、外部API呼び出し、**保存・更新を親に残す検査・分類サブエージェント委譲**（ADR-0112 §3） | 大規模な状態機械の実行 |
| **manager-orchestrator** | 状態機械統制型 | 複数フェーズ構成の状態機械・自己修復ループ・サブエージェント | すべてのファイル操作、git操作、外部API呼び出し、サブエージェント起動 | （制限なし） |
| **capture-only** | データ収集型 | データを収集・記録しinboxに保存 | inboxディレクトリへの新規ファイル作成のみ、外部APIからの読み取り | レビュー・プロモート・既存ファイルの変更・削除、git操作 |
| **read-only-diagnostic** | 検査対象を直接修正しない診断型 | アーティファクトを分析しレポートを出力 | レポートファイルの新規作成、intake itemの新規作成（実行時）、**保存・更新を親に残す検査・分類サブエージェント委譲**（ADR-0112 §3） | 検査対象アーティファクトの変更 |

### コマンド ↔ Pattern 対応

| コマンド | Primary Pattern |
|---|---|
| `/agentdev/req-define` | wall-session |
| `/agentdev/req-save` | file-pipeline |
| `/agentdev/spec-save` | file-pipeline |
| `/agentdev/case-open` | file-pipeline |
| `/agentdev/case-run` | manager-orchestrator |
| `/agentdev/case-auto` | manager-orchestrator（工程 task() 委譲・ADR-0127） |
| `/agentdev/case-update` | file-pipeline |
| `/agentdev/case-close` | file-pipeline |
| `/agentdev/learning-promote` | file-pipeline |
| `/agentdev/intake-capture` | capture-only |
| `/agentdev/intake-from-github` | capture-only |
| `/agentdev/intake-promote` | file-pipeline |
| `/agentdev/backlog-review` | wall-session |
| `/repo/docs-check` | read-only-diagnostic（検査対象を直接修正しない診断型） |
| `/agentdev/inspect-docs` | read-only-diagnostic（検査対象を直接修正しない診断型） |

## 汎用サブエージェント委譲契約

ADR-0112 で定義されたサブエージェント委譲の一般概念に基づく共通契約。manager-orchestrator 以外のコマンドパターンから保存・更新を親に残す検査・分類委譲を行う際の最小契約と制約を定める。`lightweight-delegation`（軽量委譲）は主要パターン（primary pattern）ではなく、主要な実装分類に重ねる委譲の扱いである。

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
| `classification` | 成果物 / 検出事項 / intake / learning の分類 | 禁止 | — |
| `extraction` | 候補・論点・未回収事項の抽出 | 禁止 | — |
| `draft_generation` | Issue本文・PR本文・レポート案などの草案生成 | 禁止 | — |
| `controlled_case_execution` | case-run Epic / 複数Issue実行 | 条件付き | case-run のみ |
| `step_execution` | case-auto からの構成工程（req-save / spec-save / case-open / case-close）の task() 起動（ADR-0127） | 許可 | case-auto からの工程委譲のみ。各工程のコマンド定義ガードレールに従う |

### 委譲制約

| 制約 | 説明 |
|---|---|
| 対象を直接修正しない委譲（書き込み禁止型） | gate_check / semantic_review / log_analysis / classification / extraction / draft_generation は検査対象アーティファクトを変更せず、許可操作は read_files / inspect_content / return_evidence 等に限定する |
| 親コマンド最終判断 | サブエージェントは判断の入力を提供し、最終決定は親コマンドが行う（ADR-0112 §4） |
| 中間成果扱い | サブエージェント出力は中間成果であり、親コマンドは一部を採用・修正・却下できる（ADR-0112 §6） |
| 成果物本文の verbatim | Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物はそのまま（verbatim）返す |
| 判定結果の圧縮 | 判定結果・調査過程・中間ログ・読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す |
| Script 優先 | 単純な決定的検査は Script 優先。非決定的処理（意味レビュー・分類・抽出等）にサブエージェント委譲を適用 |

### manager-orchestrator と軽量委譲の分離

| 項目 | manager-orchestrator | 軽量委譲 |
|---|---|---|
| 適用コマンド | case-run / case-auto | 上記初期適用対象（ADR-0112・case-auto の工程委譲を含む・ADR-0127） |
| 委譲規模 | 複数サブエージェント統制・Wave scheduling・障害伝播 | 単一タスク委譲（case-auto の構成工程委譲は step_execution で各工程単位） |
| 状態管理 | 大規模な状態機械・自己修復ループ | なし（一方向の入出力） |
| プロトコル | case-run 専用サブエージェントプロトコル（後述）・case-auto は工程別委譲契約（ADR-0127） | 本汎用サブエージェント委譲契約 |
| 書き込み | すべて許可 | 原則禁止（controlled_case_execution / step_execution のみ条件付き） |

### 初期適用対象

| コマンド | 委譲種別 | 委譲内容 |
|---|---|---|
| req-define | extraction / classification | 入力整理、既存文書照合、関連文書候補抽出 |
| case-run | gate_check / semantic_review / log_analysis | 検査・解析系ステップ |
| case-auto | step_execution（ADR-0127） | 構成工程（req-save / spec-save / case-open / case-close）の task() 起動。各工程のコマンド定義を authoritative source として実行し、結果（Issue/PR番号・pass/warn/fail）を case-auto に返す |
| inspect-docs | semantic_review / classification | 意味レビュー、分類一貫性確認 |
| backlog-review | classification / semantic_review / extraction | artifact分析、統合/分割、矛盾検出 |
| learning-promote | classification / gate_check | 分類、評価、既存対策確認 |
| intake-promote | semantic_review / classification / draft_generation | itemレビュー、分類案生成 |

## Epic 統率者契約（Epic Orchestrator Contract）

scale: large（Epic）の場合、case-auto は Epic Issue に対し case-run(#epic) → case-close(#epic) の委譲を反復する（REQ-0114-086）:

- case-auto は Epic Issue に対し case-run(#epic) → case-close(#epic) の委譲を反復する
- case-run(#epic) は現在 Wave の子Issue を task() で Sisyphus-Junior(ulw-loop) に並列委譲する（最大5件・1 Wave のみ・ADR-0128 Decision #3）
- case-close(#epic) は現在 Wave の PR マージ・子Issue クローズ・Epic status table 更新を行う（単一書き手: ADR-0125）
- 最終 Wave で case-close が Epic クローズを報告 → case-auto が全体完了

### Epic検出ルール

| 条件 | 結果 |
|---|---|
| Issue に `epic` ラベルが付与されている | Epic 実行モード |
| Issue 本文に `## 実行順序` セクションがあり、Wave 列を持つ Markdown テーブルが存在する | Epic 実行モード |
| 上記いずれにも該当しない | 単一 Issue モード |

### Wave解析プロトコル

1. Epic Issue 本文の `## 実行順序` セクションを特定
2. Wave テーブルを抽出: 列構成 `Wave / Issue / 実行方法 / 前提`
3. Wave 番号でグルーピング
4. バリデーション: 前提列に記載された Wave の完了後に後続 Wave の Issue を実行すること。1 Wave内の同時実行子Issue上限は5件

### Wave失敗時後続制御

| 条件 | アクション |
|---|---|
| 兄弟 Issue が失敗 | 同一 Wave 内の他 Issue は継続 |
| 後続 Wave が失敗 Issue に依存しない | 後続 Wave を継続 |
| 後続 Wave が失敗 Issue に依存する | 該当 Wave をスキップ |
| 依存有無が判定不能 | 安全側: 該当 Wave をスキップ |
| 全 Issue が失敗 | 後続 Wave を実行せず集約失敗報告で停止 |

## Wave スケジューリング（多重Issueモード）

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

## サブエージェントプロトコル（case-run 専用）

> **注意**: 本プロトコルは case-run の Issue 実装委譲仕様である（ADR-0128）。case-run は OpenCode プラグインとして導入された oh-my-openagent のエージェント型（Sisyphus-Junior）を task() 経由で利用し、CLI subprocess（bunx oh-my-openagent run）は使用しない（REQ-0130-016/017, REQ-0139-013）。軽量な一般委譲は前述の「汎用サブエージェント委譲契約」を参照。subagent-protocol.md（Skill reference）に編集安全手順・大規模ファイル分割委譲・AST-grep 運用を定める。

### 起動仕様

case-run は Issue 実装を task() で Sisyphus-Junior(ulw-loop) に委譲する:

```
task(subagent_type="Sisyphus-Junior",
     load_skills=["ulw-loop"],
     prompt="/ulw-loop Implement Issue #N: <Issue本文>")
```

- Sisyphus-Junior は oh-my-openagent 提供の OpenCode ネイティブエージェント型であり、CLI subprocess を介さず oh-my-openagent の実行エンジン（計画駆動実装・検証・PR作成）を直接利用する（REQ-0130-016）
- ulw-loop スキルは evidence-backed な目標達成フレームワークであり、Issue を success criteria に分解し、各 criterion に observable evidence を要求し、品質ゲート（code review + QA review + gate review）を提供する（REQ-0130-019）
- 各ツール呼び出しは120秒 timeout で保護されるため、ハングは構造的に検知される（case-run #971 事例の tui-state cancelled/lastTool:bash/toolCalls:129 で顕在化した CLI subprocess のブラックボックス性は解消）
- ulw-loop の監査トレイル（`.omo/ulw-loop/ledger.jsonl`）は worktree 配下に配置され、worktree 削除時に破棄される（REQ-0139-007）
- 詳細な委譲手順（prompt 構築・evidence 確認・result 受領・task() 起動失敗時の扱い）は `agentdev-case-run-execution-adapter` スキルの `references/oh-my-openagent.md` 参照（REQ-0130-025）

### 委譲プロンプト構成

task() 委譲時に渡す prompt に含める項目（REQ-0130-018）:
- Issue 本文（要件doc・受け入れ基準・実行計画方向性の参考情報を含む）
- worktree root（相対パス・`.worktrees/{N}-{type}/`）
- ブランチ名
- 作業境界指示（worktree内作業・メインブランチ作業禁止・PR発行＝完了）
- 検出事項（Finding）記録指示（PR本文の `## Findings / Capture候補` セクション）

### result 契約

Sisyphus-Junior(ulw-loop) の result 契約は ADR-0114 の3状態を維持する（ADR-0128 決定 #6）:

| status | 意味 |
|---|---|
| `completed(pr)` | 実装・検証・PR作成完了。PR URL を result に含む |
| `blocked` | 要件曖昧性・外部副作用・権限不足・矛盾等により自動継続不可 |
| `failed` | 実装・検証・CI・PR 作成などの実行結果として失敗 |

### Epic Wave 実行モデル（case-run #epic）

case-run が Epic Issue 番号を受領した場合の子Issue 並列委譲プロトコル（ADR-0128 決定 #3, REQ-0130-010）:

1. Epic Issue 本文を読み取り、現在 ready な Wave の子Issue を特定する（`## 実行順序` テーブル・status 列参照）
2. 各子Issue を task(subagent_type="Sisyphus-Junior", load_skills=["ulw-loop"]) で並列起動する（最大5件）
3. 各 Sisyphus-Junior が独立して1子Issue を実装・PR作成する
4. 全 task() の完了通知を待ち、結果（completed(pr) / blocked / failed）を収集する
5. 1 Wave の実行（PR作成まで）で return する。Wave 境界（PR マージ）は扱わない（case-close 責務）
6. 同一コマンド（case-run #epic）の再実行で次 Wave の実行に進む（べき等・再入可能: Epic Issue 本文のステータス追跡テーブルから進行状況を判定）

- case-run は Epic Issue 本文を読み取るのみ（書き込まない）。Epic Issue 本文の更新は case-close のみが行う（last-write-wins 競合防止・ADR-0125 更新）
- 単一 Issue 指定時（case-run #123）は従来通り1 Issue のみ処理する

### Epic Wave クローズモデル（case-close #epic）

case-close が Epic Issue 番号を受領した場合の PR マージ・子Issue クローズプロトコル（ADR-0128 決定 #4, REQ-0131-021〜023）:

1. Epic Issue 本文を読み取り、現在 Wave の PR作成済み子Issue を特定する
2. 各子Issue の PR マージ・子Issue クローズ・Epic status table 更新を行う（Epic Issue 本文の単一書き手は case-close のみ）
3. 最終 Wave の場合（全子Issue がクローズ完了）、Epic Issue 自体をクローズし、Epic レベルの最終処理（intake/learning capture 含む）を実行する
4. 最終 Wave でない場合、残 Wave 状況（完了 Wave・残 Wave・次実行可能 Issue）を通知する

- 単一 Issue 指定時（case-close #123）は従来通り1 Issue のマージ・クローズを行う

### 親エージェント責務（case-auto / case-run / case-close）

- case-auto: pipeline 制御（req-save→spec-save→case-open→case-run→case-close）・Wave 反復制御（case-run #epic → case-close #epic の反復）・OU 逐次処理（REQ-0114-084）
- case-run: Epic Wave 実行時の子Issue 並列委譲・全 task() 完了待機・結果収集・Findings / Capture候補件数の集約
- case-close: Epic Wave クローズ時の PR マージ・子Issue クローズ・Epic Issue 本文（ステータス追跡テーブル）の単一書き手（ADR-0125 更新）

## Epic/Wave 実行モデル

> 本セクションは case-auto 委譲ループ（REQ-0114-086: case-run(#epic) → case-close(#epic) 反復）・case-run 内部モデル（ADR-0128 Decision #3, #5: task() 並列委譲・1 Wave return・べき等）・case-close 単一書き手（ADR-0125: Epic Issue 本文ステータス追跡テーブル更新）に基づく。

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

階層パターン（2階層化・Epic は常に Wave 構造を持つ）:

| 規模 | 構成 |
|------|------|
| 単一 Issue | OU → Issue |
| 複数 Issue | OU → Epic → Wave → Issue |

Epic は常に Wave 構造を持つ。依存関係がない場合は Wave 1 に全 Issue をまとめる。

### 子Issue 実行状態 enum（SC-002, SC-003）

| status | 意味 | 設定主体 |
|--------|------|----------|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） |
| `ready` | 依存が満たされ、case-run が実行可能と判定した状態。永続状態には書き込まれない | case-run 内部判定（永続状態に書き込まない） |
| `running` | case-run が task() 起動し実行中の状態。永続状態には書き込まれない | case-run 内部状態（永続状態に書き込まない） |
| `completed` | Issue の実装・検証・必要な case-close が完了した状態 | case-close |
| `blocked` | 要件曖昧性・外部副作用・権限不足・矛盾等により自動継続できない状態 | case-run / case-close |
| `failed` | 実装・検証・CI・PR 作成などの実行結果として失敗した状態 | case-run |

- `skipped` は採用しない（REQ-0106-030）。前提未達の Issue は `pending` のまま選択対象外となる。
- Wave 状態は保存しない。Wave 内 Issue 状態から導出する。
- OU / Epic の状態は進捗集約として扱い、主たる実行状態は Issue 状態とする。
- `ready` / `running` は case-run(#epic) の内部状態であり、Epic Issue 本文（永続状態）には書き込まれない。永続状態に書き込まれるのは `pending` → `completed` / `blocked` / `failed` の遷移のみ（case-close が単一書き手: ADR-0125）。

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

### case-run Epic 実行モデル（SC-007）

case-run は Epic Issue 指定時、以下を実行する（ADR-0128 Decision #3, REQ-0130-026/027）:

- case-run(#epic) は Epic Issue 本文を読み込む（子Issue 一覧・Wave 構成・各子Issue status・PR 状態）
- case-run(#epic) は現在 Wave の実行可能な子Issue を内部判定する（依存関係充足確認・永続状態には書き込まない）
- case-run(#epic) は各子Issue を task() で Sisyphus-Junior(ulw-loop) に並列委譲する（最大5件・各 task() は1 Issue 処理）
- case-run(#epic) は全 task() 完了を待ち、結果を収集して return する（1 Wave のみ・マージしない）
- case-run(#epic) は再実行時、Epic Issue 本文から進行状況を判定し次 Wave を処理する（べき等）

**Epic Issue 本文の単一書き手制約**: Epic Issue 本文（ステータス追跡テーブル）の更新は case-close(#epic) のみが行う（ADR-0125）。case-run(#epic) は Epic Issue 本文を読み取るのみで書き込まない。

### case-run 1 Issue 委譲入力（SC-008）

case-run は case-auto から指定された1 Issue のみを処理する:

- サブエージェントへの委譲入力: Issue 番号・実装指示・worktree パス・specs 更新禁止・検出事項記録指示
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
| 委譲インタフェース（共通エンベロープ・delegation_type 分類・制約） | 本 SPEC（workflow-contracts.md） | 委譲の共通契約 |
| 委譲のアーキテクチャ判断（一般概念・manager-orchestrator位置づけ・保存・更新を親に残す検査・分類委譲の許容） | ADR-0112 | 意思決定の記録 |
| case-run 専用プロトコル（起動仕様・プロンプト構成・Epic Wave 実行/クローズモデル） | subagent-protocol.md（Skill reference） | case-run manager-orchestrator の運用詳細（ADR-0128） |
| 編集安全手順・AST-grep運用・大規模ファイル分割 | subagent-protocol.md（Skill reference） | サブエージェント共通の安全手順 |
| 委譲定義の最小構成・delegated_check・中間成果基準 | command-authoring-standards.md（Skill reference） | Command 作者向けの委譲記述標準 |
| 決定的な変換・検証・生成 | Script（`scripts/*.js`） | テスト可能な処理 |

## 自己修復契約（Self-Healing Contract）

`case-run` の検証失敗時に自律修正を試みる:

- 最大3回の修正ループ（11a / 11c それぞれ独立カウント）
- 修正範囲は既存要件範囲内に限定
- 7項目の停止条件に該当した場合は即座停止・ユーザー報告

## キャプチャ境界（Capture Boundaries）

### Intake / Learning 境界

| 領域 | 定義 | 保存先 | 目的 |
|---|---|---|---|
| **intake** | 今回の作業本筋では扱わないが、後で対応要否を判断すべき具体的な作業候補・不整合・規約違反・未回収課題 | `.agentdev/intake/inbox/` | 積み残し作業の回収・Issue化 |
| **learning** | 作業中の失敗・回避・修正・判断ミス・手順漏れから次回以降の再発防止に使う知見 | `.agentdev/learning/` | 知見の分類・昇華・反映 |

### 分割ルール（Split Rule）

```
具体的修正対象がある → intake item
再発防止知見がある → learning item
両方ある → 分割（intake item + learning item を別々に作成）
どちらでもない → 記録対象外（完了報告に候補として提示）
```

### PR 本文永続チャネル

case-run で発見した本筋外検出事項（Finding）の永続化チャネルとして PR 本文を使用する（REQ-0106）。

- 書込み元: case-run（Step 10-5）
- 読取り元: case-close（Step 9-2）
- 各 case-run は自身の PR にのみ書込み。`.agentdev/intake/inbox/` は直接変更しない
- capture 候補を intake 候補と learning 候補に分け、別々の成果物として扱う（Split Rule に準拠）
- Epic 横断回収: Epic モード時、case-close は関連子 Issue PR 群の本文を横断走査して検出事項を回収

### REQ再構成intake

通常intakeとは独立した配置規約（REQ-0109）。

| 状態 | パス |
|---|---|
| inbox | `.agentdev/intake/inbox/req-restructure/` |
| 却下 | `.agentdev/intake/archive/rejected/req-restructure/` |

req-define の明示入力としてルーティングする（backlog-review 経由ではない）。検知カテゴリ: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT

## バックログドラフトプロトコル（Backlog Draft Protocol）

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
| 採用済み成果物生成 | `intake-promote` |
| RU 生成 | `backlog-review` |
| backlog-extractedコメント投稿 | `backlog-review` |

## 検出事項プロトコル（Finding Protocol）

### 検出事項の位置づけ

要件レビュー検出事項（requirements review finding）は要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- 保存先: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`
- 次工程: req-define の明示入力ファイルとして渡される

### 検出事項 frontmatter

```yaml
---
finding_type: SPLIT | MOVE | RETIRE | DUPLICATE | OBSOLETE | DRIFT
source_req: REQ-{NNNN} | null
source_command: req-save
topic_slug: {topic-slug}
created: "{YYYY-MM-DD}"
---
```

### 検出事項種別

| 種別 | 説明 | 検出タイミング |
|---|---|---|
| `SPLIT` | 要件が膨張・関心分離の基準に該当し分割が必要 | req-save SPLIT検出時 |
| `MOVE` | 要件が別REQに移動すべき | requirements review時 |
| `RETIRE` | 要件が不要になり廃止すべき | requirements review時 |
| `DUPLICATE` | 複数REQ間で要件が重複 | requirements review時 |
| `OBSOLETE` | 要件が既に古く現在のシステムに適合しない | requirements review時 |
| `DRIFT` | 要件と実装の間に乖離が生じている | requirements review時 |

### inspect-promote 自動 promote

`/agentdev/inspect-promote --auto` は、高確信度の検出事項（inspect finding）を HITL 承認を経ずに intake/backlog パイプラインへ流入させる（REQ-0136-016, REQ-0126-010）。本節は自動 promote の対象カテゴリ・投入先・実行ログ・誤検知 revoke 手順の正である。コマンドは判定表を重複保持しない。

#### 自動 promote 対象カテゴリ

自動 promote は「機械的に特定可能で、移行先 SPEC が一意に定まり、意味判断を要しない」高確信度 finding に限定する。`--auto` は明示 opt-in であり、省略時は手動分類フローのみ動作する。

| カテゴリ | 自動 promote 対象 | 自動 promote 対象外（手動分類へ） |
|---|---|---|
| SPEC分離基準違反（high-specificity） | 具体的証拠を伴う Step 番号・スキーマフィールド・enum 一覧・テストデータ詳細・作業履歴など、移行先が SPEC/コマンドリファレンス に一意に定まるもの | 安定契約例外（REQ-0101-069）、否定文脈、判定表・内部パラメータなど意味解釈を要するもの |
| 構造的即時是正 | リンク切れ・旧名前空間（namespace）残存など、正解が一意で破壊的でない修復 | — |
| 命名・分類の意味判断 | — | SPLIT/MERGE/MOVE/RETIRE/DRIFT 判断、scope 決定、優先度付け（全件手動） |
| ADR 要否判断 | — | ADR閾値判定を含む finding（全件手動） |

自動 promote 対象外の finding は `--auto` 指定時でも手動分類フロー（HITL 承認）に回し、自動投入しない。

#### 投入先・成果物形式

- 投入先: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`（フラット構造）
- backlog-review は既存の intake 採用済み成果物と同様に読み込み、RU 化対象として処理する
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

## REQ ファイル整合性検査

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

## DOC-MAP 影響規則

REQ CREATE / APPEND / UPDATE 時に `docs/DOC-MAP.md` への影響を確認する（REQ-0101）。

### 影響確認フロー

1. REQ操作実行時、`docs/DOC-MAP.md` に該当領域のセクションが存在するか確認
2. 影響がある場合は同一変更内で更新
3. 影響がない場合は更新不要
4. 更新が必要だが作業範囲を超える場合、REQ保存は中止せず後追い課題（follow-up）として明示

### 影響確認対象

| 操作 | 確認対象 |
|---|---|
| REQ追加時 | `docs/requirements/README.md`, `docs/DOC-MAP.md` |
| ADR追加時 | `docs/adr/README.md`, `docs/DOC-MAP.md` |
| SPEC追加/分割/削除時 | `docs/specs/README.md`, `docs/DOC-MAP.md` |

### 矛盾時の優先順位

`docs/DOC-MAP.md` と基準（REQ/ADR/SPEC）が矛盾する場合、基準を優先し DOC-MAP を修正対象とする。

## REQ 再構成検出

REQ保存処理中にREQ体系上の歪みを検知した場合、REQ再構成intakeとして保存する（REQ-0109）。

### 検知カテゴリ

| 観点 | 説明 |
|---|---|
| SPLIT | 単一REQの責務が肥大化、複数REQへの分割が適切 |
| MERGE | 複数REQが同じ興味対象を重複してカバー、統合が適切 |
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

委譲定義の `side_effect_boundary`（副作用境界）には `read_only` のような包括値（blanket value）を使用せず、許可する操作を具体名で列挙すること。以下の YAML を推奨例とする。

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

| command/skill | ゲート接続 |
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

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。実行時コマンドは SPEC ファイルに依存しない（ADR-0104）。
