# Workflow Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

Workflow 契約の雛形を定義し、コマンドパイプライン間の入出力関係と前提条件を明確にする（REQ-0104）。

## Pipeline Overview

AgentDevFlow は3つのパイプラインで構成される:

| パイプライン | コマンド | 目的 |
|---|---|---|
| req/case | req-define → req-save → case-open → case-run → case-close → case-update | 要件定義から実装完了まで |
| learning | learning-capture → learning-refine → learning-promote | 学びの蓄積・分析・昇華 |
| intake | intake-capture / intake-from-github → intake-review → intake-promote | 改善候補の収集・審査・昇華 |

## Phase Definitions

### マクロフェーズ

開発ワークフローを3つのマクロフェーズで定義する。

| マクロフェーズ | 定義 | 対応マイクロフェーズ |
|---|---|---|
| 壁打ち | 要件定義・分析・Issue作成前の合意形成 | requirement + analyzed |
| 構造的実行 | Issue作成後の実装・PR作成・進捗管理 | created + in_progress |
| レビュー完了 | PR作成後のレビュー・マージ・完了処理 | review + done |

### マイクロフェーズ

| フェーズ | 状態 | マクロフェーズ |
|---|---|---|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了・Issue未作成 | 壁打ち |
| `created` | Issue作成済み・作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR作成済み・レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む: learning capture + intake capture） | レビュー完了 |

## SSoT Transition Rules

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ | SSoT | 説明 |
|---|---|---|
| 壁打ち | セッション会話 + draft | 壁打ちで合意形成された要件・分析（Issue未作成のため） |
| 構造的実行 | Issue本文 + Work Plan | 要件doc + 実行計画 |
| レビュー完了 | PR + レビュー結果 | コードレビュー結果とマージ状態 |

### draft の定位

draft（`.sisyphus/drafts/req-draft-*.md`）は壁打ちフェーズ内の一時ハンドオフであり、構造的実行以降のSSoTはIssue本文とWork Planである。

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
| `/agentdev/case-update` | Issue 番号 | 更新済み Issue | Issue 存在 |

### learning Pipeline

| コマンド/スキル | 入力 | 出力 | 前提 |
|---|---|---|---|
| `learning-capture`（スキル） | エージェント実行中の観測 | `inbox.md` エントリ | — |
| `/agentdev/learning-refine` | `inbox.md` | `evaluation-report.md` + `archive/active.md` 更新 | inbox.md にエントリ |
| `/agentdev/learning-promote` | `evaluation-report.md` | promoted artifact | refine 完了 |

### intake Pipeline

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/intake-capture` | 手動入力 | inbox item | — |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | inbox item | — |
| `/agentdev/intake-review` | inbox items | accepted / archive | inbox に item |
| `/agentdev/intake-promote` | accepted items | promoted artifact | review 完了 |

### 共通後段

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/backlog-review` | promoted artifact | review draft | promoted 存在 |
| `/agentdev/backlog-save` | review draft | RU（Requirement Unit） | review 完了 |

### コマンド詳細 I/O

| コマンド | 入力SSoT | 出力SSoT | 完了後マクロフェーズ |
|---|---|---|---|
| `/agentdev/req-define` | セッション会話 | 機能追加: `.sisyphus/drafts/req-draft-*.md`、その他: セッション内要件doc | 壁打ち |
| `/agentdev/req-save` | `.sisyphus/drafts/req-draft-*.md` | docs/requirements/REQ, docs/adr/ADR, docs index | 壁打ち |
| `/agentdev/case-open` | 要件doc, specs READ, ADR READ | GitHub Issue | 定義→実行境界 |
| `/agentdev/case-run` | GitHub Issue, specs READ+WRITE, ADR READ | GitHub PR + worktree + ブランチ | レビュー完了 |
| `/agentdev/case-update` | GitHub Issue | GitHub Issue + REQファイル（APPEND/UPDATE対応） | 変更なし |
| `/agentdev/case-close` | GitHub Issue + PR | なし | レビュー完了 |
| `/agentdev/learning-refine` | `.agentdev/learning/inbox.md` | `.agentdev/learning/archive/active.md` + `evaluation-report.md` | 学びパイプライン |
| `/agentdev/learning-promote` | `evaluation-report.md` + `.agentdev/learning/archive/active.md` | `.agentdev/learning/promoted/` | 学びパイプライン |
| `/agentdev/backlog-review` | `.agentdev/intake/promoted/` + `.agentdev/learning/promoted/` | `.agentdev/backlog/drafts/review-draft-*.md` | バックログレビュー |
| `/agentdev/backlog-save` | `.agentdev/backlog/drafts/review-draft-*.md` | `.agentdev/backlog/req-units/RU-*.md` | RU 生成 |
| `/agentdev/intake-capture` | ユーザー入力 | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-from-github` | GitHub Issue/PR | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-review` | `.agentdev/intake/inbox/` | inbox → accepted / archive/rejected ディレクトリ移動 | レビュー |
| `/agentdev/intake-promote` | review済み intake items | `.agentdev/intake/promoted/` | 昇華 |
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンド | `.agentdev/integrity/reports/` | 整合性検査 |
| `/agentdev/req-restructure-review` | ドキュメント・REQ体系 | なし（診断結果出力のみ） | REQ再構成 |

### 参照フロー

| コマンド | specs | ADR | REQ | finding | learning | intake | integrity |
|---|---|---|---|---|---|---|---|
| `/agentdev/req-define` | — | — | READ | READ（明示入力時） | — | — | — |
| `/agentdev/req-save` | — | WRITE | WRITE | WRITE（SPLIT検出時） | — | — | — |
| `/agentdev/case-open` | READ | READ | READ | — | — | — | — |
| `/agentdev/case-run` | READ+WRITE | READ | READ | — | — | — | — |
| `/agentdev/case-close` | — | — | READ | — | WRITE（capture） | WRITE（capture） | — |
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
| feature | `enhancement`, `feature` | 中 | あり（REQ/specs/ADR + 関連docs） | req-define → req-save → case-open → case-run → case-close |
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

Backlogはwork_typeとは独立した専用分類。`intake-from-github` → `backlog-review` → `backlog-save` の経路で処理され、work_type判定の対象外となる。

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
| ADR | アーキテクチャ判断 | `docs/adr/ADR-*.md` |

生きた仕様（Living Specs）:

| 仕様 | 格納先 | 役割 |
|---|---|---|
| system.md | `docs/specs/system.md` | システム全体の現在の仕様 |
| patterns.md | `docs/specs/patterns.md` | 実装パターン・規約 |
| design-principles.md | `docs/specs/design-principles.md` | 設計判断の根拠・指針 |
| quality-specs.md | `docs/specs/quality-specs.md` | 品質基準・検証ルール |

### docs/ 構造

| 区分 | パス | 役割 | 自動操作コマンド |
|---|---|---|---|
| guides/ | docs/guides/ | 開発ガイド（参照のみ） | — |
| requirements/ | docs/requirements/ | 要件管理（目的/要件/適用範囲） | req-save(CREATE), case-open(READ), case-update(UPDATE) |
| adr/ | docs/adr/ | アーキテクチャ決定記録 | agentdev-adr-guidelines(CREATE) |
| specs/ | docs/specs/ | システム仕様 | case-run(READ+WRITE), case-close(VERIFY) |

### テンプレート配置

| テンプレート種別 | 配置先 | 所有スキル |
|---|---|---|
| Issue/コメント系 | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |
| REQ（`doc_requirement.md`） | `.opencode/skills/agentdev-req-file-manager/templates/` | `agentdev-req-file-manager` |
| ADR（`doc_adr.md`） | `.opencode/skills/agentdev-adr-file-manager/templates/` | `agentdev-adr-file-manager` |
| 乖離検出（`report_spec_compliance.md`） | `.opencode/skills/agentdev-spec-compliance/templates/` | `agentdev-spec-compliance` |
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
| RU（Requirement Unit） | `backlog-save` | `req-define`, `req-save`, `case-open` | 永続化完了時 |
| REQ ファイル | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| Issue | `case-open` | `case-run`, `case-close` | なし（永続） |

### RU（Requirement Unit）

- 配置先: `.agentdev/backlog/req-units/RU-*.md`
- 粒度: N:1（複数 artifact → 1 RU 統合）および 1:N（1 artifact → 複数 RU 分割）を許可（REQ-0105）
- promoted artifact の単純コピー（パススルー）は禁止（REQ-0105）
- 矛盾検出時: 矛盾する artifact を RU 化せずユーザーに確認。矛盾しない artifact は通常通り RU 化（partial success）
- `req-save` / `case-open` での永続化完了後に該当 RU を削除

### Promoted Artifact

| パイプライン | 配置先 | 構造 |
|---|---|---|
| intake | `.agentdev/intake/promoted/` | フラット（`*.md`） |
| learning | `.agentdev/learning/promoted/` | フラット（`*.md`） |

- サブディレクトリへのルーティングは行わない（フラット構造）
- RU 生成に成功した promoted artifact は `backlog-save` が削除（REQ-0105）

## Implementation Pattern Taxonomy

コマンドの内部構造に基づく分類軸（REQ-0103-016）。work_type（Issue種別分類）とは直交する概念である。

| Pattern | 主責務 | 許可される副作用 | 禁止される副作用 |
|---|---|---|---|
| **wall-session** | ユーザーとの対話セッションを通じて構造化成果物を生成 | ドラフトファイル作成、任意のアーティファクト読み取り | 既存アーティファクトの変更、git操作、外部API呼び出しによるリソース作成 |
| **file-pipeline** | 定義されたステップに従いファイルを変換・生成 | 指定ディレクトリへのファイル作成・更新、git操作、外部API呼び出し | 大規模な状態機械の実行、サブエージェントの起動 |
| **manager-orchestrator** | 複数フェーズ構成の状態機械・自己修復ループ・サブエージェント | すべてのファイル操作、git操作、外部API呼び出し、サブエージェント起動 | （制限なし） |
| **capture-only** | データを収集・記録しinboxに保存 | inboxディレクトリへの新規ファイル作成のみ、外部APIからの読み取り | レビュー・プロモート・既存ファイルの変更・削除、git操作 |
| **read-only-diagnostic** | アーティファクトを分析しレポートを出力 | レポートファイルの新規作成、intake itemの新規作成（承認時） | 検査対象アーティファクトの変更 |

### Command ↔ Pattern 対応

| コマンド | Primary Pattern |
|---|---|
| `/agentdev/req-define` | wall-session |
| `/agentdev/req-save` | file-pipeline |
| `/agentdev/case-open` | file-pipeline |
| `/agentdev/case-run` | manager-orchestrator |
| `/agentdev/case-update` | file-pipeline |
| `/agentdev/case-close` | file-pipeline |
| `/agentdev/learning-refine` | file-pipeline |
| `/agentdev/learning-promote` | file-pipeline |
| `/agentdev/intake-capture` | capture-only |
| `/agentdev/intake-from-github` | capture-only |
| `/agentdev/intake-review` | wall-session |
| `/agentdev/intake-promote` | file-pipeline |
| `/agentdev/backlog-review` | wall-session |
| `/agentdev/backlog-save` | file-pipeline |
| `/agentdev/integrity-check` | read-only-diagnostic |
| `/agentdev/req-restructure-review` | read-only-diagnostic |

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
4. バリデーション: 前提列に記載された Wave より前に後続 Wave の Issue を実行してはならない。1 Wave内の同時実行子Issue上限は5件

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

## Subagent Protocol

### 起動仕様

```
task(category="unspecified-high", load_skills=[], run_in_background=true, prompt="...")
```

### プロンプト構成

サブエージェントのプロンプトに含める項目:
- Issue番号
- 実行指示（準備→実装→提出フェーズ）
- worktreeパス
- specs更新禁止の明示
- Finding 記録指示（PR本文の `## Findings / Intake候補` セクション）
- 書き込み事後検証の要求

### 親エージェント責務

- Wave開始前のEpicステータス一括更新
- 全サブエージェント完了待機
- specs直列更新
- Findings / Intake候補件数の集約

### フォールバック

サブエージェントが使用できない場合、Sequential Wave（親エージェントがWave内でIssueを1件ずつ順次処理）に切り替え。

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

- 書込み元: case-run（Step 10.5）
- 読取り元: case-close（Step 9b）
- 各 case-run は自身の PR にのみ書込み。`.agentdev/intake/inbox/` は直接変更しない
- intake 候補と learning 候補を別々の成果物として扱う（Split Rule に準拠）
- Epic 横断回収: Epic モード時、case-close は関連子 Issue PR 群の本文を横断走査して Finding を回収

### REQ再構成intake

通常intakeとは独立した配置規約（REQ-0109）。

| 状態 | パス |
|---|---|
| inbox | `.agentdev/intake/inbox/req-restructure/` |
| 採用 | `.agentdev/intake/accepted/req-restructure/` |
| 却下 | `.agentdev/intake/archive/rejected/req-restructure/` |

backlog-review/backlog-saveへのpromote対象外。検知カテゴリ: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT

## Backlog Draft Protocol

`intake-from-github` と `backlog-review`/`backlog-save` 間のバックログdraftのライフサイクルとスキーマ。

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
| RU 生成 | `backlog-save` |
| backlog-extractedコメント投稿 | `backlog-save` |

## Finding Protocol

### Finding の位置づけ

requirements review finding は REQ ファイルへの保存操作ではなく、要件体系の再構成候補を一時的に保持する中間アーティファクト。

- 保存先: `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`
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

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0017）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0018）。
