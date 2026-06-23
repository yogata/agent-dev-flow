---
title: ワークフロー契約（横断）
status: accepted
created: 2026-06-21
updated: 2026-06-21
---

# ワークフロー契約（横断）

> **Scope**: 本 SPEC は agent-dev-flow リポジトリに適用される横断契約である。個別 command / skill の現在動作は各 command SPEC（`docs/specs/commands/`）・各 skill SPEC（`docs/specs/skills/`）を参照のこと（AG-008）。横断 SPEC は個別 SPEC の代替ではない。

## 目的

ワークフロー全体像・共通フェーズ・共通状態・artifact lifecycle など、複数コマンド・スキルにまたがる契約を定義する（REQ-0104）。

## パイプライン概要

AgentDevFlow は 3 つのパイプラインで構成される:

| パイプライン | コマンド | 目的 |
|---|---|---|
| req/case | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了まで |
| learning | learning-capture → learning-promote | 学びの蓄積・昇華 |
| intake | intake-capture / intake-from-github → intake-promote | 改善候補の収集・昇華 |

## コマンド分類

AgentDevFlow の公開コマンドは以下の5分類のいずれかに属する（REQ-0104-048）。

| 分類 | コマンド | 目的 |
|---|---|---|
| 主フロー | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了までの標準ワークフロー |
| 最大自走入口 | case-auto | req-define 完了後の後続工程を一括自走する追加入口。標準フローを置換しない（REQ-0104-049） |
| 補助フロー | intake-capture, intake-from-github, intake-promote, learning-promote, backlog-review | 改善候補収集・学び蓄積・RU化。主フローを補完 |
| 検出フロー | inspect-docs, inspect-skills, inspect-promote | 文書・スキルの意味検出・分類・昇格 |
| リポジトリローカル検査 | /repo/docs-check | AgentDevFlow 本体リポジトリ内の機械的整合性検査 |

- case-auto は標準フロー（req-save → spec-save → case-open → case-run → case-close）を内部的に呼び出す追加入口であり、標準フローを置換・廃止しない（REQ-0114-017）。spec-save は `artifact_actions` に `artifact: spec` entry が含まれる場合に実行し、旧形式 draft（同フィールドなし）は後方互換で従来順序で実行する（ADR-0123, REQ-0136-014）。
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

> **注意**: 以下の6マイクロフェーズは説明用ラベルであり、状態管理モデルではない（REQ-0112-023）。実際の状態管理は Issue ラベル・GitHub Project で行う。

| フェーズ | 状態 | マクロフェーズ |
|---|---|---|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了・Issue未作成 | 壁打ち |
| `created` | Issue作成済み・作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR作成済み・レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む） | レビュー完了 |

### ワークフロー状態管理

ワークフロー状態（例: "要件定義", "実装", "テスト" 等）は Issue ラベル・GitHub Project で管理する（REQ-0108-123、REQ-0101-037）。REQ/SPEC 文書内には状態として埋め込まず、上記マイクロフェーズは説明目的でのみ使用する。

## SSoT 遷移規則

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ | SSoT | 説明 |
|---|---|---|
| 壁打ち | セッション会話 + draft | 壁打ちで合意形成された要件・分析 |
| 構造的実行 | Issue本文 + Work Plan | 要件doc + 実行計画 |
| レビュー完了 | PR + レビュー結果 | コードレビュー結果とマージ状態 |

### draft の位置づけ

draft（`.agentdev/drafts/req-draft-*.md`）は壁打ちフェーズ内の一時ハンドオフであり、構造的実行以降のSSoTはIssue本文とWork Planである。

- ライフサイクル: `draft` → `saved`（req-save完了）→ `issued` + 削除（case-open完了）
- 構造的実行フェーズ以降: draft は存在しない（case-open完了時に削除）

### フェーズ境界ルール

壁打ち→構造的実行の境界で満たすべき要件: 壁打ちフェーズ完了時、docs変更を必ずコミット・プッシュする。これにより構造的実行フェーズのworktreeがdocs変更を継承する。

### Local backend の SSoT 位置づけ

Local backend（ローカル版 OpenCode）では、構造的実行以降の SSoT は GitHub Issue / PR ではなくローカル Case ファイル（`.agentdev/cases/case-{NNNN}.md`）である（REQ-0141-021〜023）。

| マクロフェーズ | Local backend の SSoT |
|---|---|
| 壁打ち | セッション会話 + draft（GitHub backend と共通） |
| 構造的実行 | Case ファイル本文 |
| レビュー完了 | Case ファイル `## マージ結果` |

詳細は `docs/specs/local-case-file.md` を参照。

## コマンド I/O 契約（共通）

各コマンドの入力・出力・前提条件の詳細は各 command SPEC（`docs/specs/commands/<command>.md`）を参照。本節は横断 I/O 契約のみを定義する。

### 参照フロー（共通）

| コマンド | specs | ADR | REQ | finding | learning | intake | integrity |
|---|---|---|---|---|---|---|---|
| `/agentdev/req-define` | - || READ | READ（明示入力時） | - || - |
| `/agentdev/req-save` | - | WRITE | WRITE | WRITE（SPLIT検出時） | - || - |
| `/agentdev/spec-save` | WRITE | - || - || - ||
| `/agentdev/case-open` | READ | READ | READ | - || - ||
| `/agentdev/case-run` | READ+WRITE | READ | READ | - || - ||
| `/agentdev/case-close` | - || READ | - | WRITE（capture） | WRITE（capture） | - |
| `/agentdev/case-auto` | READ+WRITE | READ+WRITE | READ+WRITE | - | WRITE（capture） | WRITE（capture） | - |
| `/agentdev/case-update` | - || READ+WRITE | - || - ||

## ワークフロー経路制御

work_type と scale により workflow_route を決定する。work_type は bugfix / feature / maintenance / docs_chore の 4 値である（REQ-0112-011, REQ-0104-014）。scale は feature のみ standard / large をとる（REQ-0112-011）。

| work_type | scale | workflow_route |
|---|---|---|
| feature | standard | req_backed_case |
| feature | large | epic_case |
| bugfix | - | direct_case |
| maintenance | - | direct_case |
| docs_chore | - | direct_case |

ラベルマッピング・規模判定条件の詳細は各 command SPEC および `agentdev-workflow-lifecycle` skill を参照。

## 実装分類（Implementation Pattern Taxonomy）

コマンドの内部構造に基づく分類軸（REQ-0103-016）。work_type とは直交する概念である。

| Pattern | 日本語名称 | 主責務 |
|---|---|---|
| wall-session | 対話セッション型 | ユーザーとの対話セッションを通じて構造化成果物を生成 |
| file-pipeline | ファイル変換パイプライン型 | 定義されたステップに従いファイルを変換・生成 |
| manager-orchestrator | 状態機械統制型 | 複数フェーズ構成の状態機械・自己修復ループ・サブエージェント |
| capture-only | データ収集型 | データを収集・記録しinboxに保存 |
| read-only-diagnostic | 検査対象を直接修正しない診断型 | アーティファクトを分析しレポートを出力 |

各コマンドがどの Pattern に属するかは各 command SPEC を参照。

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。実行時コマンドは SPEC ファイルに依存しない（ADR-0104）。

## See Also

- [delegation-contracts.md](delegation-contracts.md)（サブエージェント委譲契約）
- [capture-boundaries.md](capture-boundaries.md)（キャプチャ境界）
- [epic-wave-model.md](epic-wave-model.md)（Epic / Wave / Issue 実行モデル）
- [backlog-artifact-lifecycle.md](backlog-artifact-lifecycle.md)（RU / 採用済み成果物 / draft lifecycle）
- 各 command SPEC（`docs/specs/commands/`）・各 skill SPEC（`docs/specs/skills/`）
- `agentdev-workflow-routing` skill（work_type ルーティング詳細）
- `agentdev-workflow-lifecycle` skill（work_type 判定・scale 昇格）
