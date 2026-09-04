---
title: システム仕様
status: accepted
created: 2026-08-20
updated: 2026-08-17
---
<!-- ADF-COVERS(implementation): REQ-001-033 -->
<!-- ADF-COVERS(implementation): REQ-002-009, REQ-002-010, REQ-002-012 -->
<!-- ADF-COVERS(implementation): REQ-034-008, REQ-034-009 -->

# システム仕様

> **縮小済み**: 本 Design は文書体系再構築により縮小した。
> コマンドシステム概要のみを残し、個別動作（Epic フロー、自律修正ループ、達成判定プロトコル、Capture、ID 体系、REQ 基準構造、分類ゲート）は各 Design へ移管した。

## コマンドシステム

### AgentDevFlow コマンド群

AgentDevFlow（`/agentdev/*` コマンド体系）は 3 つのパイプラインで構成され、開発ワークフローを提供する。
各コマンドの目的、責務、入出力は後述の表および各コマンド専用 Design に記述する。
実行エージェントの選定、起動方法は harness の責務であり、本 Design の対象外（v2:ADR-0136）。

#### req/case パイプライン

| コマンド | 役割 | 詳細 |
|---|---|---|
| `/agentdev/req-define` | 要件定義（壁打ち） | [commands/req-define.md](../commands/req-define.md) |
| `/agentdev/req-save` | 要件定義の保存 | [commands/req-save.md](../commands/req-save.md) |
| `/agentdev/design-save` | Design 候補の保存、確定 | [commands/design-save.md](../commands/design-save.md) |
| `/agentdev/case-open` | Issue 登録（連結成分ベース複数 Standard/Epic 構成生成、3軸判断） | [commands/case-open.md](../commands/case-open.md) |
| `/agentdev/case-run` | 実装パイプライン（3 フェーズ構成） | [commands/case-run.md](../commands/case-run.md) |
| `/agentdev/case-update` | Issue 更新 | [commands/case-update.md](../commands/case-update.md) |
| `/agentdev/case-close` | 完了処理（達成判定プロトコル付き完了ゲート） | [commands/case-close.md](../commands/case-close.md) |
| `/agentdev/case-auto` | 最大自走モード（複数 execution_unit 並列 orchestration、blocked 部分停止） | [commands/case-auto.md](../commands/case-auto.md) |

#### learning パイプライン

| コマンド/スキル | 役割 | 層 | 詳細 |
|---|---|---|---|
| `agentdev-learning-capture`（スキル） | エージェント主体で学びを検知、抽出、自律蓄積 | キャプチャ層 | [skills/agentdev-learning-capture.md](../skills/agentdev-learning-capture.md) |
| `/agentdev/learning-promote` | learning entry を分析、分類、昇華判定 | 昇華層 | [commands/learning-promote.md](../commands/learning-promote.md) |
| `/agentdev/backlog-review` | 採用済み成果物を分析、統合し RU を生成 | backlog 層 | [commands/backlog-review.md](../commands/backlog-review.md) |

#### intake ワークフロー

| コマンド | 役割 | 詳細 |
|---|---|---|
| `/agentdev/intake-capture` | 手動で気づき、課題を inbox に記録 | [commands/intake-capture.md](../commands/intake-capture.md) |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出 | [commands/intake-from-github.md](../commands/intake-from-github.md) |
| `/agentdev/intake-promote` | inbox item を採用済み成果物に整形 | [commands/intake-promote.md](../commands/intake-promote.md) |

#### integrity ワークフロー

docs-check は `/repo/*` コマンド体系の配布対象リポジトリ内コマンドである（REQ-001、REQ-010-001）。
AgentDevFlow の配布コマンドではなく、AgentDevFlow 本体リポジトリの自己監査コマンドである。

| コマンド | 役割 |
|---|---|
| `/repo/docs-check` | AgentDevFlow 本体リポジトリの自己監査（配布対象外） |

#### inspect ワークフロー

| コマンド | 役割 | 詳細 |
|---|---|---|
| `/agentdev/inspect-docs` | docs 全体の意味整合レビューと REQ 再構成診断 | [commands/inspect-docs.md](../commands/inspect-docs.md) |
| `/agentdev/inspect-skills` | Command/Skill 参照妥当性、構造の検出 | [commands/inspect-skills.md](../commands/inspect-skills.md) |
| `/agentdev/inspect-promote` | 検出事項（finding）の分類、昇格 | [commands/inspect-promote.md](../commands/inspect-promote.md) |

### 品質ゲート

品質ゲート（QG-1〜QG-4）は [quality-gates.md](../quality/quality-gates.md) で定義する。
case-run が QG-1〜QG-3（ローカル検証、CI 検証、乖離検出）、case-close が QG-4（最終完了判定ゲート）を担う。
詳細は同 Design および [skills/agentdev-quality-gates.md](../skills/agentdev-quality-gates.md) を参照。

### 移管済みセクション（参照先）

以下のセクションは個別 Design へ移管済み。
本ファイルでは概要のみを残す。

| 旧セクション | 移行先 |
|---|---|
| Epic（大規模 Issue 分割フロー）、Epic 自動クローズ、Epic ステータス追跡 | [workflows/epic-wave-model.md](../workflows/epic-wave-model.md) |
| 自律修正ループ（Self-Healing Loop） | [commands/case-run.md](../commands/case-run.md) |
| case-close 達成判定プロトコル | [commands/case-close.md](../commands/case-close.md) |
| Post-Run Capture（実行後キャプチャ） | [workflows/capture-boundaries.md](../workflows/capture-boundaries.md) |
| 関連ドキュメントの要件達成対象化 | [commands/case-run.md](../commands/case-run.md), [commands/case-close.md](../commands/case-close.md) |
| ID 体系（REQ/Decision/IR 桁数） | [patterns.md](patterns.md), [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md) |
| REQ 体系基準構造 | [req-health-metrics.md](../quality/req-health-metrics.md), [document-model.md](document-model.md) |
| REQ 分類ゲート | [commands/req-define.md](../commands/req-define.md), [commands/req-save.md](../commands/req-save.md) |
| Issue テンプレート完了条件セクション | [skills/agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md), [commands/case-open.md](../commands/case-open.md) |
| .opencode/ ディレクトリ責務、スクリプト配置方針、テスト配布方針 | [runtime-package-boundary.md](../local/runtime-package-boundary.md) |
| 安全性スキル（gh-cli） | [skills/agentdev-gh-cli.md](../skills/agentdev-gh-cli.md) |
| 整合性検査スキル（repo-`agentdev-integrity`） | (repo-local、配布対象外、Design 対象外) |

## Workflow Architecture Inventory

全公開Command（17件）の Workflow Architecture Inventory を恒久カタログとして統合する。
各Command の11分析軸（公開契約・主要処理段階・分岐・副作用・HITL・並列性・resume・durable state・Harness依存・Capability依存・内部workflow候補）を記載する。
個別Workflow Skill 移行（Wave 2）および Capability Skill 抽出の参照証拠とする。

本カタログは architecture view である。
各項目の権威情報源は以下の所有関係に従う。

- public contract（入出力契約、副作用、安全性、承認境界、stop state、ordering contract）
  → Command Design が正規文書、Command 定義はその実行時投影。
両者不一致時は Command Design を正とする。
- workflow implementation → Workflow Skill
- durable state contract → Workflow / STEP Design

Command 定義を権威情報源とする旧表現は、workflow 実装の権威情報源が Command 側にあると含意するため使用しない。

### 一覧表

| Command | 主入力 | 主出力 | workflow 系統 |
|---|---|---|---|
| `/agentdev/req-define` | セッション会話 / RU | 要件doc（draft） | req/case |
| `/agentdev/req-save` | 要件doc | REQ/Decision ファイル | req/case |
| `/agentdev/design-save` | 要件doc | Design ファイル | req/case |
| `/agentdev/case-open` | 要件doc | GitHub Issue | req/case |
| `/agentdev/case-run` | Issue | 実装済みブランチ + PR | req/case |
| `/agentdev/case-update` | Issue | 更新済み Issue / REQ | req/case |
| `/agentdev/case-close` | Issue + PR | マージ済み + クローズ済み | req/case |
| `/agentdev/case-auto` | 要件doc / Issue番号 | マージ済み + クローズ済み | req/case |
| `/agentdev/intake-capture` | 手動入力 | `inbox/` item | intake |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | `inbox/` item | intake |
| `/agentdev/intake-promote` | inbox item | `promoted/` 成果物 | intake |
| `/agentdev/learning-promote` | `inbox.md` + `deferred.md` | `promoted/` 成果物 | learning |
| `/agentdev/backlog-review` | `promoted/` 成果物 | `RU-*.md` | backlog |
| `/agentdev/backlog-auto` | なし（durable state から解決） | 検出事項、採用済み成果物、`RU-*.md` | backlog |
| `/agentdev/inspect-docs` | docs 全体スキャン | 検出事項 | inspect |
| `/agentdev/inspect-skills` | Command/Skill 定義 | 検出事項 | inspect |
| `/agentdev/inspect-promote` | 検出事項 | 採用済み成果物 | inspect |

### `/agentdev/req-define`

- **公開契約**: 自然言語による要件説明 / Issue URL / 明示入力ファイル（RU 含む） → `.agentdev/drafts/req-draft-{topic-slug}.md`（構造化 `draft-data`）。壁打ちフェーズ専用、実装コード生成禁止。
- **主要処理段階**: STEP-1 セッションコンテキスト検知・入力解決 → STEP-2 壁打ち対話 → STEP-3 既存REQ照合 → STEP-4 要件展開（変更影響抽出・分類ゲート・Decision要否・実行主体・test strategy）→ STEP-5 Decision判断 → STEP-6 要件doc生成 → STEP-7 work_type・Scale 判定 → STEP-8 adversarial-review → STEP-9 ドラフト保存 → STEP-10 要件doc確認 → STEP-11 完了報告。
- **分岐**: 引数あり/なし、Standard vs Epic（`scale: large`）、work_type（feature/bugfix/maintenance/docs_chore）、前工程引き継ぎ（`agentdev_handoff: true`）、Decision要否（STEP-4 → architecture-advisory）、SPLIT予兆計測（STEP-3/10）、adversarial-review skip 条件（L0/Decision対象なし）。
- **副作用**: `.agentdev/drafts/**` のみ作成・編集。`docs/`、`.opencode/`、git、Issue/PR は触れない。
- **HITL**: STEP-2 壁打ち対話、STEP-7 Scale=large 分解計画協議、STEP-10 要件doc提示（承認は求めず、次コマンド実行を確定意思表示とする）、SPLIT 要否提案、architecture-advisory の「ユーザー確認事項」ラベル。
- **並列性**: 持たない（単一の壁打ちセッションを前提）。
- **resume**: ドラフトファイル（`.agentdev/drafts/req-draft-*.md`）が永続 resume 入力。STEP-2 差し戻し、STEP-3 SPLIT候補、STEP-4 blocked、STEP-5 blocked が明示的再開点。
- **durable state**: `draft-data`（`agreed_items` / `artifact_actions` / `operation_units` / `test_strategy` / `review_dispositions` / `case_open_hints` / `auto_gate`）、`status` frontmatter（未確定→確定）。会話コンテキストに依存しない（DEC-011 原則）。
- **Harness依存**: LLM 推論による壁打ち、subagent 起動（`agentdev-architecture-advisory`、`agentdev-adversarial-review`）、拡張読込（`agentdev-project-extensions`）。
- **Capability依存**: `agentdev-req-analysis`、`agentdev-req-file-manager`（照合）、`agentdev-decision-guidelines`、`agentdev-decision-file-manager`（参照のみ）、`agentdev-architecture-advisory`、`agentdev-workflow-lifecycle`、`agentdev-workflow-templates`（template 読込）、`agentdev-project-extensions`、`agentdev-adversarial-review`。
- **内部workflow候補**: 壁打ち対話workflow（STEP-1〜2）、既存REQ照合workflow（STEP-3 + 定量計測）、要件展開と分類ゲートworkflow（STEP-4）、Decision判断workflow（STEP-5 + 副ステップ）、ドラフト保存workflow（STEP-6 + 9 + 10）。STEP-4 の test strategy 定義は Capability Skill 候補。

### `/agentdev/req-save`

- **公開契約**: `.agentdev/drafts/req-draft-*.md`（REQ/Decision artifact_actions 含む） → `docs/requirements/REQ-*.md` / `docs/decisions/DEC-*.md` + README 更新 + commit/push。`work_type` 依存廃止、`artifact_actions` の有無で判定。
- **主要処理段階**: STEP-1 事前チェック → STEP-2 ドラフト読込（hash 記録）→ STEP-3 ドラフト検証・処理対象確定（artifact_actions ゲート）→ STEP-4 REQファイル操作（QG-1 相当検証、3フェーズ分離）→ STEP-5 インデックス・ハブ → STEP-6 Decision作成 → STEP-7 docs整合性 → STEP-8 README索引（targeted docs guard）→ STEP-9 変更範囲・リモート同期（check-change-impact）→ STEP-10 status 更新 → STEP-11 commit/push（明示パス、OU 結果書き戻し）→ STEP-12 完了報告。
- **分岐**: artifact_actions 有無（no-op）、CREATE/APPEND/UPDATE/SPLIT、Decision entry 有無（STEP-6）、SPLIT 検出（`requirements-review-finding`）、REQ再構成候補検知（`intake/inbox/req-restructure`）、extension 更新要否、`full_docs_check_recommended` で `/repo/docs-check` 提案。
- **副作用**: `docs/requirements/**` / `docs/decisions/**` / `docs/README.md` / `.agentdev/drafts/**`（status更新）の編集。git commit/push（main ブランチ、明示パスステージング）。`.agentdev/intake/inbox/req-restructure/**` 生成（例外）。Issue 作成は禁止（case-open 責務）。
- **HITL**: targeted docs guard の strict 違反時の停止指示待ち、check-change-impact violation 時の指示待ち、extension 更新のユーザー指示、`full_docs_check_recommended` true 時の `/repo/docs-check` 提案。
- **並列性**: case-auto 並列委譲モデルあり（REQ/093）。採番バッチ[直列] → ファイル作成[並列 最大5件] → インデックス更新[直列]。直列集約対象（採番/index/draft/commit/push）は並列完了後に実行。
- **resume**: `draft-data.status`（`saved`）、読込時 commit hash と pull 後 hash の一致検証。STEP-4 QG-1 fail → req-define 差し戻し。
- **durable state**: REQ/Decision ファイル、README 索引、draft status、commit hash、artifact_actions 処理結果と OU 結果の書き戻し（STEP-11）。
- **Harness依存**: bash による決定的スクリプト呼出、並列実行安全ステージングプロシージャ、subagent 起動（委譲接続点）、拡張読込。
- **Capability依存**: `agentdev-req-file-manager`、`agentdev-decision-file-manager`、`agentdev-conventional-commits`、`agentdev-quality-gates`（QG-1）、`agentdev-artifact-validation`（check-entry-existence / check-change-impact / id↔filename）、`agentdev-git-worktree`（並列ステージング）、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts）。
- **内部workflow候補**: REQ保存workflow（採番→作成→QG-1→push、3フェーズ分離を含む）、Decision保存workflow（STEP-6 + 妥当性再検証ゲート）、docs整合性確認workflow（STEP-7〜9 targeted docs guard + check-change-impact）。

### `/agentdev/design-save`

- **公開契約**: `.agentdev/drafts/req-draft-*.md`（Design artifact_actions 含む） → `docs/designs/**/*.md` + README 一覧登録 + commit/push。`work_type` 依存廃止。
- **主要処理段階**: STEP-1 事前チェック → STEP-2 Design artifact_actions 読込 → STEP-3 配置先解決（search-target-area.ts）→ STEP-4 Design分離基準最終確認 → STEP-5 Designファイル操作（並列化・宣言付与）→ STEP-6 インデックス整合（check-entry-existence）→ STEP-7 一覧整合（targeted docs guard / extension 更新要否）→ STEP-8 status 更新 → STEP-9 変更範囲検証（check-change-impact）→ STEP-10 commit/push → STEP-11 完了報告。
- **分岐**: artifact_actions 有無（no-op）、`artifact: design` 有無、create vs update、`target_area` 指定有無（置換 vs 追記）、`target_area` 複数マッチ（置換拒否）、`target_area` 空（スキップ+follow-up）、安定契約例外除外、`full_docs_check_recommended`、Design 移動による extension 参照先変更（エラー停止）。
- **副作用**: `docs/designs/**` / `.agentdev/drafts/**`（status更新）の編集、`docs/designs/README.md`（Design 一覧）。git commit/push。REQ/Decision/command/skill/template 編集禁止。
- **HITL**: targeted docs guard strict 違反時停止、`spec_readme_update_required`、extension 参照先 Design 移動時のユーザー判断、`full_docs_check_recommended` true 時の `/repo/docs-check` 提案、配置先 Design 特定不能時の follow-up 明示。
- **並列性**: case-auto 並列委譲モデルあり（REQ/093）。異なる `target` パスの create/update は L0 完全独立のため並列可能（最大5件）。同一 Design ファイルへの複数 action は順序依存のため直列サブセット。
- **resume**: `draft-data` Design 消費済みフラグ、target_area マッチ結果、Design `status: draft` frontmatter。
- **durable state**: Design ファイル（frontmatter: `title`/`status`/`created`/`updated` + 宣言節）、Design README 一覧エントリ、draft Design 消費フラグ。
- **Harness依存**: bash による決定的スクリプト呼出（search-target-area.ts / check-entry-existence.ts / check-change-impact.ts）、並列実行安全ステージング、拡張読込。
- **Capability依存**: `agentdev-design-file-manager`（target-area-matching / design-lifecycle-application）、`agentdev-conventional-commits`、`agentdev-artifact-validation`、`agentdev-git-worktree`、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts）。
- **内部workflow候補**: Design保存workflow（配置先解決→操作→宣言付与→push）、target_area セクション置換workflow（STEP-5 + search-target-area ロジック）、Design 一覧整合workflow（STEP-6〜7）。

### `/agentdev/case-open`

- **公開契約**: 要件doc（構造化 `draft-data`） → GitHub Issue（ラベル付き、要件doc埋め込み）。壁打ち→構造的実行フェーズの境界。
- **主要処理段階**: STEP-1 引き継ぎ・OU選択 → STEP-2 Issue本文生成・execution contract 確定（QG-2 / test_strategy / 識別子中心 / EC-1〜EC-8）→ STEP-3 構成判定・preflight → STEP-4 adversarial-review → STEP-5 Issue 作成（Epic flow / Standard flow）→ STEP-6 終了処理・クリーンアップ（コメント追加、draft/RU 削除、Form Zero + 即時push、完了報告）。
- **分岐**: 引き継ぎ停止（self-hosting vs consumer）、OU ID 指定有無、Standard flow vs 単一REQ Epic flow vs マルチREQ Epic flow、`scale: standard` vs `large`、子Issue 10件上限、preflight 6項目、adversarial-review skip（Standard + 単一OU 機械的確定）、review 結果による QG-2/preflight 再実行 4パターン。
- **副作用**: GitHub Issue 作成（agentdev-gh-cli）、コメント追加、draft/RU の `git rm` + commit + 即時 push（Form Zero）。`.agentdev/` 配下の capture 成果物保存（委譲）。Issue 本文のファイル経由渡し（`POL-gh-io-delegation`、`[System.IO.File]::WriteAllText` UTF8 BOM なし LF）。REQ/Decision/Design ファイル編集は禁止。
- **HITL**: adversarial-review 由来の unresolved 判断事項、preflight 失敗時の停止、QG-2 fail 時の req-define 差し戻し、execution contract EC-6 scope-affecting impact の確認、Capture結果 小節の保存報告。
- **並列性**: STEP-5 子Issue 作成の並列化（最大5件、3つの「5件」文脈の(1)に該当）。Epic Issue 作成・Wave 1 配置・ステータステーブル更新は親が直列集約。
- **resume**: Issue番号（Standard）、Epic Issue番号 + ステータス追跡テーブル、OU の `result` フィールド（作成 Issue/Epic 番号の書き戻し）、draft/RU 削除残存検証（STEP-6）。
- **durable state**: GitHub Issue 本文（要件doc 埋め込み、execution contract 必須セクション、EC-7 adversarial-review 発動契約永続化）、Epic Issue ステータス追跡テーブル、Issue 番号、draft/RU 削除状態。
- **Harness依存**: gh CLI（agentdev-gh-cli 経由）、subagent 起動（REQ 読解・テンプレート充足・完了条件抽出、adversarial-review）、ファイル経由 UTF8 BOM なし LF 一時ファイル、並列実行安全ステージング、拡張読込。
- **Capability依存**: `agentdev-issue-management`、`agentdev-epic-tracker`、`agentdev-workflow-templates`、`agentdev-workflow-lifecycle`、`agentdev-quality-gates`（QG-2）、`agentdev-gh-cli`、`agentdev-git-worktree`、`agentdeq-req-file-manager`（RU削除）、`agentdev-project-extensions`、`agentdev-adversarial-review`、`agentdev-learning-capture`/`agentdev-intake-pipeline`（deviation capture 委譲）。
- **内部workflow候補**: execution_unit 構成workflow（STEP-3 連結成分アルゴリズム + 3軸判断）、Issue作成workflow（STEP-5、Epic flow / Standard flow）、execution contract 確定workflow（STEP-2、EC-1〜EC-8）、draft/RU 削除クリーンアップworkflow（STEP-6 + Form Zero）。EC-2 必須品質統制導出と EC-6 scope-affecting impact 探索は Capability Skill 候補。

### `/agentdev/case-run`

- **公開契約**: Issue番号 / Epic Issue番号 → 実装済みブランチ + GitHub PR（実行担当サブエージェント作成）。case-run internal lifecycle 3フェーズ構成（準備・委譲・クリーンアップ）、べき等。
- **主要処理段階**: Phase single: STEP-S1 フェーズ判定・再開ポイント検出 → STEP-S2 Issue 抽出・確認・判定（execution contract 消費境界）→ STEP-S3 Worktree 作成・ブランチ準備・前置 gate 群（QG-3 前置 staleness check / targeted docs guard）→ STEP-S4 実行担当サブエージェント委譲（adapter 委譲内 adversarial-review）→ STEP-S5 result 処理・配布依存境界 最終 gate（4状態）→ STEP-S6 クリーンアップ + 完了報告（L2 タイムスタンプ）。Phase epic-wave: STEP-W1 Epic Issue 解析・Wave 選択 → STEP-W2 fan-out 準備 → STEP-W3 fan-out 並列委譲 → STEP-W4 fan-in・結果集約 → STEP-W5 Wave 完了報告。
- **分岐**: 単一Issue 実行 vs Epic Wave 実行（最大5件並列）、再開フェーズ（準備/委譲/クリーンアップ）、`agentdev_handoff: true`、execution contract 消費原則（必須セクション有無で新旧Issue識別）、QG-3 前置 staleness check 差異、targeted docs guard 実行条件、result 4状態（completed-pr/blocked/failed/delegation-unavailable）、adversarial-review skip（自明な機械的反映）。
- **副作用**: worktree 作成（`.worktrees/{N}-{type}/`）、ブランチ作成。実行担当サブエージェント経由で PR 作成、Issue コメント追加（blocked/failed SSoT）。case-run 本体は worktree root 配下以外を触れない（`POL-worktree-isolation`、worktree precondition gate・相対パス引き渡しの各制約）。完了条件チェックボックスは更新しない（case-close 責務、`POL-completion-checkbox-single-writer`）。
- **HITL**: blocked/failed の停止・ユーザー報告、delegation-unavailable の pending 戻し、未コミット変更あり時のユーザー指示待ち（STEP-S6）、委譲内 adversarial-review の unresolved 判断事項。
- **並列性**: Epic Wave 実行モードで現在 ready な Wave の子Issue を最大5件並列委譲。1 Wave の実行（PR作成まで）で return、Wave 境界（マージ）は扱わない（case-close 責務）。
- **resume**: 3フェーズのべき等性（準備: worktree+ブランチ存在 / 委譲: PR未作成 or result未確定 / クリーンアップ: result=completed-pr）。PR番号、PR URL、Issue コメント（blocked/failed SSoT）。
- **durable state**: GitHub PR 本文（`## Findings / Capture候補` / `## Design確定候補` / `### stale-reference` / `### docs-integrity`）、Issue コメント（blocked/failed）、PR 番号、worktree+ブランチ、L2 タイムスタンプ。
- **Harness依存**: 実行担当サブエージェント起動（adapter skill 経由委譲、外部実行基盤）、bg task、worktree 隔離検証ヘルパー、bash による check_changed_docs.ts / check_extensions.ts 呼出、タイムスタンプ計測（JST）、拡張読込。
- **Capability依存**: `agentdev-workflow-orchestration`（再開判定）、`agentdev-req-analysis`（品質基準）、`agentdev-workflow-lifecycle`（work_type）、`agentdev-git-worktree`（worktree・precondition gate・ staleness）、`agentdev-epic-tracker`（Epic Wave）、`agentdev-gh-cli`（PR/Issue I/O）、`agentdev-quality-gates`（QG-3 前置 staleness）、`agentdev-case-run-execution-adapter`（委譲契約）、`agentdev-adversarial-review`（adapter 委譲内）、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts / check_extensions.ts）。
- **内部workflow候補**: 準備フェーズworkflow（STEP-S1〜S3、worktree作成+前置検査群）、委譲起動workflow（STEP-S4 + adapter 契約）、result処理+クリーンアップworkflow（STEP-S5〜S6 + L2 計測）。adapter 委譲内の adversarial-review 統合と test-fix ループは Workflow Skill 候補。実行担当サブエージェントは外部実行基盤（I/O 境界 Design 所有）。

### `/agentdev/case-update`

- **公開契約**: Issue番号 + 更新内容（`--body`/`--comment`/`--req`/`--review-ng`） → 更新されたIssue本文 / コメント / REQファイル / レビューNGコメント。主にレビューNG時対応。
- **主要処理段階**: STEP-1 Issue番号解決 → STEP-2 現在状態取得（フェーズ判定）→ STEP-3 更新内容に応じて分岐（`--body` / `--comment` / `--req` / `--review-ng`、各テンプレート維持・必須セクション検査）→ STEP-4 完了報告。
- **分岐**: 更新種別4値（`--body`/`--comment`/`--req`/`--review-ng`）、APPEND vs UPDATE（REQファイル）、`--review-ng` 時の QG-3 乖離検出引用、フェーズ不変、CI/CD修正・自律修正ループは対象外（case-run 責務）。
- **副作用**: Issue本文更新 / コメント追加（agentdev-gh-cli）。`--req` は直接 commit+push（req-save 委譲しない、REQ ファイル操作対象外の明示例外）。`--review-ng` はコメント投稿とREQ更新判断。
- **HITL**: 更新種別推論不能時のユーザー指定要求停止。各分岐で親エージェントが最終確定。
- **並列性**: 持たない（単一Issue 単位）。
- **resume**: Issue番号、現在のフェーズ（workflow-lifecycle）、更新種別、APPEND/UPDATE 判定結果。
- **durable state**: Issue 本文、コメント、REQ ファイル、commit。
- **Harness依存**: gh CLI（agentdev-gh-cli 経由）、subagent 起動（候補番号抽出・本文案・必須セクション検査）、拡張読込。
- **Capability依存**: `agentdev-workflow-routing`、`agentdev-workflow-lifecycle`、`agentdev-quality-gates`（QG-3、`--review-ng`）、`agentdev-gh-cli`、`agentdev-workflow-templates`、`agentdev-project-extensions`。
- **内部workflow候補**: 更新種別別 dispatch workflow（STEP-3 の4分岐）。`--review-ng` フロー（乖離タイプ分類+推奨アクション）は Capability Skill 候補。

### `/agentdev/case-close`

- **公開契約**: Issue番号 + PR番号（自動検出可）/ Epic Issue番号 → マージ済みPR + クローズ済みCase + 削除済みブランチ・worktree。Epic Issue番号時は現在 Wave の一括クローズ。
- **主要処理段階**: STEP-1 Issue番号解決・ルーティング（Epic判定）→ Epic Wave クローズ（STEP-E1〜E6）or 単一Issueクローズ（STEP-2 QG-4 達成判定 → STEP-3 docs検証・Design確定（配布依存境界 最終 gate 含む）→ STEP-4 PRマージ・コンフリクト解消（mergeable UNKNOWN ポーリング / 先行commit検出 / Level 1 rebase）→ STEP-5 Post-merge・Issueクローズ → STEP-6 クリーンアップ・Capture回収・永続化（実行前同期、worktree/ブランチ削除、親Epic更新、完了報告））。
- **分岐**: Epic Wave クローズ vs 単一Issue、mergeable UNKNOWN ポーリング、squash merge コンフリクト（Level 1 rebase → case-auto Level 2/3 エスカレーション）、QG-4 観点8（PR対象範囲 vs 全体）、Design確定候補処理3パターン（昇格/design-save提案/見送り）、Epic自動クローズ判定（全子Issue CLOSED）、auto-close 回避（commit message フォーマット）。
- **副作用**: PR squash merge（`--delete-branch` 禁止、STEP-6 で独立削除）、Issue close、worktree+ブランチ削除（local+remote）、Epic Issue 本文ステータステーブル更新（case-close 単一書き手）、Design `status` draft→accepted 昇格、`.agentdev/` commit/push、完了条件チェックボックス評価・更新（case-close 専任責務、`POL-completion-checkbox-single-writer`）。
- **HITL**: docs/ 更新なし警告、targeted docs guard strict 違反停止、IR-056 違反停止、QG-4 未達チェックボックス停止（完了条件評価専任責務）、Design確定候補の見送り判断、Capture回収の分離。
- **並列性**: Epic Wave クローズ STEP-E4 で各子Issue の PRマージ・クローズ・完了条件評価・Capture回収・コンフリクト解消準備を「準並列化」（REQ）。
- **resume**: HEAD commit hash（squash merge 後）、PR mergeable 状態、Issue OPEN/CLOSED 状態、Epic ステータステーブル、Design status、学びinbox/intake inbox。
- **durable state**: マージコミット、クローズ済みIssue、削除済みブランチ/worktree、`.agentdev/learning/inbox.md`、`.agentdev/intake/inbox/`、Design status（draft→accepted）、Epic Issue ステータステーブル。
- **Harness依存**: gh CLI（merge/mergeable ポーリング/close/ラベル）、git（pull --ff-only / rebase / reset / checkout 隔離worktreeのみ）、worktree 操作、subagent 起動（learning-capture）、タイムスタンプ、bash による check_changed_docs.ts / check_extensions.ts、拡張読込。
- **Capability依存**: `agentdev-quality-gates`（QG-4 Final Acceptance Gate）、`agentdev-gh-cli`（merge/UNKNOWNポーリング/retry）、`agentdev-git-worktree`（重複チェック/rebaseパス/同期リスク検出/先行commit）、`agentdev-epic-tracker`（STEP-E1〜E6）、`agentdev-design-file-manager`（design-lifecycle-application、STEP-3）、`agentdev-workflow-templates`、`agentdev-learning-capture`、`agentdev-learning-pipeline`（deferred）、`agentdev-intake-pipeline`、`agentdev-workflow-orchestration`（capture境界）、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts / check_extensions.ts）。
- **内部workflow候補**: PRマージworkflow（STEP-4、コンフリクト解消 Level 1）、QG-4 達成判定workflow（STEP-2 + 観点8 + 完了条件チェックボックス）、Design確定workflow（STEP-3）、Capture回収workflow（STEP-6、PR本文→intake/learning分離）、Epic Wave クローズworkflow（STEP-E1〜E6）。Level 1 コンフリクト解消と Design status 昇格判断は Capability Skill 候補。

### `/agentdev/case-auto`

- **公開契約**: 要件doc / Issue番号・URL → req-save → design-save → case-open → case-run → case-close を順次自走しマージまで完了。明示指定時のみの追加入口（標準workflowの置換えではない）。
- **主要処理段階**: STEP-1 入力解決・開始時刻記録（JST）→ STEP-2 work_type 読取・工程分岐（artifact_actions 動的判定 / auto_gate preflight）→ STEP-3 orchestration 実行（委譲起動 / case-run インライン / orchestration stage モデル / Wave 反復）→ STEP-4 停止条件検出・停止理由分類（11項目、7軸＋上位合意矛盾/新規ユーザー判断）→ STEP-5 adversarial-review 由来の停止伝播 → STEP-6 bounded parent decision resolution → STEP-7 コンフリクト解消 Level 2/3 → STEP-8 完了報告（L1 タイムスタンプ + 4次元集約 + OU処理ループ）。
- **分岐**: 入力モード（Issue番号/URL vs 要件doc 4パターン）、artifact_actions ベース分岐（req-save/design-saveスキップ可）、Epic Wave 反復（子Issue並列最大5件、直接制御 AG-003）、Standard flow vs Epic Issue flow、停止条件11項目、停止理由分類（7軸 + 上位合意矛盾/新規ユーザー判断）、コンフリクト Level 1/2/3 エスカレーション、adversarial-review 由来の user-decision-required、bounded parent decision resolution（自律解決/作業仮定/上位合意矛盾/新規ユーザー判断）、delegation-unavailable。
- **副作用**: req-save/design-save/case-open/case-close の各委譲起動、case-run インライン実行（実行担当サブエージェント委譲を含む）、GitHub Issue/PR/comment/merge/close（自走対象）、remote branch 削除（自作branch限定）、docs/ 更新。DB migration実行/deploy/apply/外部SaaS/認証は対象外。Epic Issue 本文への直接書込はしない（case-close 単一書き手、`POL-epic-tracking-single-writer`）。
- **HITL**: STEP-4 停止条件（11項目）、adversarial-review 由来の user-decision-required 待機、bounded parent decision resolution の上位合意矛盾/新規ユーザー判断、draft 0件時の req-define 実行要求。
- **並列性**: orchestration stage モデル（stage 1 case-open 直列 / stage 2 case-run bg task 最大5件 / stage 3 case-close 直列集約）。OU 間は必須依存で結合した群は順次、必須依存なし群は並列。3つの「5件」文脈の区別（Wave 内子Issue/Phase 2 同時起動/execution_unit 全体）。順次フォールバック可能。bg task 破棄検知時の3状態回復。
- **resume**: 入力解決結果、各工程の起動結果（Issue/PR番号）、RU パス、capture 対象情報、`case_auto_started_at`、L1 工程別タイムスタンプ、orchestration stage 別結果、bg task 状態、結果状態4次元。
- **durable state**: 各工程の永続成果物（REQ/Decision/Design/Issue/PR/RU削除）、`case_auto_started_at`、L1 タイムスタンプ内訳、Epic Issue ステータステーブル（case-close が書込、case-auto は読取のみ）。
- **Harness依存**: bg task API（最大5件）、subagent 起動（委譲工程）、context 管理（親コンテキスト非累積）、タイムスタンプ計測（L1）、委譲起動判定、bg task 破棄検知・状態別回復、インライン case-run 実行、拡張読込。
- **Capability依存**: `agentdev-workflow-orchestration`、`agentdev-case-run-execution-adapter`、`agentdev-git-worktree`、各工程の Capability Skill を継承（req-save/design-save/case-open/case-run/case-close の依存スキル群）、`agentdev-adversarial-review`（停止伝播のみ受領、直接起動しない）、`agentdev-project-extensions`。
- **内部workflow候補**: orchestration workflow（STEP-3 + stage モデル + Wave 反復）、bounded parent decision resolution workflow（decision_context 解決）、コンフリクト解消 Level 2/3 workflow（インライン case-run 再実行 + オーケストレーション級判断）、停止理由分類workflow（STEP-4）。これらは case-auto 固有の orchestration として Workflow Skill 抽出の有力候補。bounded parent decision resolution と Wave 反復制御は Capability Skill 候補。

### `/agentdev/intake-capture`

- **公開契約**: 手動入力 → `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md`（推奨標準形、frontmatter/状態値非必須）。保存専用、Issue 作成・採否判断はしない。
- **主要処理段階**: STEP-1 入力受領 → STEP-2 intake item 生成（推測補完禁止）→ STEP-3 ファイル名生成（STEP-3-1 実行前同期）→ STEP-4 保存（STEP-4-1 commit/push）→ STEP-5 完了報告。
- **分岐**: セクション省略（推測不能時）、同名ファイル連番付与、git pull/push 失敗時の構造化エラー停止。
- **副作用**: `.agentdev/intake/inbox/` への保存、`.agentdev/intake/` 配下の commit/push（`chore(agentdev): capture intake item`）。他ディレクトリ保存禁止。Issue/PR 作成・採否・review・整形は禁止。
- **HITL**: なし（保存専用、ユーザー入力を過度に解釈しない）。
- **並列性**: 持たない（単一 item 保存）。
- **resume**: intake item ファイル（日付+topic-slug）、git 変更状態。
- **durable state**: `.agentdev/intake/inbox/*.md`、commit hash、push 成否。
- **Harness依存**: git（pull/commit/push、並列実行安全ステージング）、拡張読込。
- **Capability依存**: `agentdev-git-worktree`（ドメイン状態永続化プロシージャ）、`agentdev-workflow-orchestration`（Split Rule 参照）、`agentdev-project-extensions`。
- **内部workflow候補**: 持たない（単純保存ワークフロー、Workflow Skill 抽出対象外）。

### `/agentdev/intake-from-github`

- **公開契約**: 期間指定 / Issue・PR番号 → `.agentdev/intake/inbox/*.md`（候補ごと1ファイル）+ 抽出サマリーレポート。保存専用。
- **主要処理段階**: STEP-1 期間解釈 → STEP-2 データ取得（gh CLI）→ STEP-3 構造的検出 → STEP-4 LLM 全文解析 → STEP-5 item 生成（STEP-5-1 実行前同期）→ STEP-6 保存（STEP-6-1 commit/push）→ STEP-7 サマリーレポート → STEP-8 完了報告。
- **分岐**: 期間指定 vs 番号指定、候補0件、同名ファイル連番、git pull/push 失敗時停止。
- **副作用**: `.agentdev/intake/inbox/` への保存、`.agentdev/intake/` 配下 commit/push（`chore(agentdev): capture intake items from github`）。オープン中 Issue/PR は対象外（クローズ済みのみ）、GitHub API 直接呼出不可（gh CLI のみ使用）。
- **HITL**: なし（抽出・保存専用、サマリーレポートでユーザー確認）。
- **並列性**: データ取得・LLM 解析は複数 Issue/PR を横断するが case-auto のような明示的並列モデルは持たない。
- **resume**: 対象期間、対象 Issue/PR 一覧、抽出候補、保存ファイル一覧。
- **durable state**: `.agentdev/intake/inbox/*.md`、抽出サマリー、commit hash。
- **Harness依存**: gh CLI（agentdev-gh-cli 経由）、LLM 全文解析、git、拡張読込。
- **Capability依存**: `agentdev-intake-pipeline`、`agentdev-gh-cli`、`agentdev-git-worktree`、`agentdev-project-extensions`。
- **内部workflow候補**: GitHub 抽出workflow（期間解釈→データ取得→構造的検出→LLM 解析→item 生成）。抽出アルゴリズムとキーワードリストは Capability Skill 候補（既に `agentdev-intake-pipeline` が所有）。

### `/agentdev/intake-promote`

- **公開契約**: `.agentdev/intake/inbox/*.md` + ユーザーコンテキスト → `.agentdev/intake/promoted/*.md`（採用）+ 分類結果レポート。review/分類/整形を行い Issue 作成はしない。
- **主要処理段階**: STEP-1 classification（inbox 確認・item 読込・review/評価・暫定分類提示・自律確定候補判定）→ STEP-2 review（adversarial-review、発動条件判定 / review 呼出）→ STEP-3 HITL（ユーザー確認・分類承認、分類確定後 自動実行 REQ）→ STEP-4 persistence（採用item整形・promoted保存）→ STEP-5 destructive handling（振り分け・inbox削除・実行前同期・commit/push）→ STEP-6 完了報告。
- **分岐**: inbox 空、分類3値（採用/保留/却下）、adversarial-review skip（1件で自明/inbox空）、ユーザー明示指定時の必須発動、破壊的変更の明示承認維持（`POL-destructive-change-explicit-approval`）、`accepted/` 廃止、採用item inbox削除/reject item 即時削除。
- **副作用**: `.agentdev/intake/promoted/` 保存、採用item の inbox 元ファイル削除、reject item の即時削除（commit message に却下理由）、`.agentdev/intake/` 配下 commit/push。Issue 作成・backlog-review 自動起動はしない。
- **HITL**: STEP-3 ユーザー確認（分類確定、採用済み成果物生成の明示承認・分類結果の提示・分類未確定時の自動進行禁止）、破壊的変更の別承認（`POL-destructive-change-explicit-approval`）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（対話的 review、親エージェントが集約）。
- **resume**: inbox item 一覧、暫定分類、ユーザー承認状態、分類確定状態。
- **durable state**: `.agentdev/intake/promoted/*.md`、inbox 削除状態、分類結果レポート、commit hash。
- **Harness依存**: subagent 起動（item 読込・整形案・review）、git（pull/commit/push、並列実行安全ステージング）、`agentdev-adversarial-review`、拡張読込。
- **Capability依存**: `agentdev-intake-pipeline`、`agentdev-git-worktree`、`agentdev-adversarial-review`、`agentdev-project-extensions`。
- **内部workflow候補**: review/分類workflow（STEP-1〜3 + adversarial-review）、採用item整形+保存+振り分けworkflow（STEP-4〜5）。分類ロジック（採用/保留/却下）は Capability Skill 候補（`agentdev-intake-pipeline` が所有）。

### `/agentdev/learning-promote`

- **公開契約**: `.agentdev/learning/inbox.md`（必須）+ `deferred.md`（任意） → `.agentdev/learning/promoted/{category}-{name}.md` + evaluation-report.md + deferred.md 追記 + inbox.md クリア。`.opencode/` 直接反映禁止、必ず backlog-review 経由。
- **主要処理段階**: STEP-1 入力読込・正規化（inbox + deferred）→ STEP-2 評価（問題クラス分類・8軸評価・evaluation-report生成）→ STEP-3 判定（廃棄判定 11カテゴリ+duplicate、昇華可能性評価、既存対策確認）→ STEP-4 review（adversarial-review、発動条件判定 / review 呼出、evaluation-report 戻しループ）→ STEP-5 判定確定（自律確定・HITL 承認）→ STEP-6 永続化（採用済み成果物生成・deferred移動・昇華時prune・commit/push、原子的）→ STEP-7 完了報告。
- **分岐**: inbox 空、エントリ0件、廃棄判定13パターン、昇華可能性（無条件自動REQ化禁止）、living pool 維持（deferred）、adversarial-review skip（1件重複確実/inbox空）、evaluation-report 戻しループ（STEP-4、review 反映時）、prune 対象/非対象、git pull/push 失敗停止。
- **副作用**: `.agentdev/learning/promoted/` 保存、`.agentdev/learning/evaluation-report.md` 生成/更新、`.agentdev/learning/deferred.md` 追記（原子的操作）、`.agentdev/learning/inbox.md` クリア、prune、`.agentdev/learning/` 配下 commit/push（明示パス、`chore(agentdev): promote learning findings`）。`.opencode/` 直接書込禁止、case-run への直接受け渡し禁止（backlog-review 経由のみ）。
- **HITL**: STEP-5 判定結果確認・修正・承認（判断確定 REQ）、STEP-6 prune は STEP-5 承認と同時に承認済み（自動実行 REQ）、破壊的変更の明示承認、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（inbox エントリを順次評価、原子的操作で inbox/deferred を一括処理）。
- **resume**: inbox.md エントリ、deferred.md living pool、evaluation-report.md、廃棄判定結果、ユーザー承認状態。
- **durable state**: `.agentdev/learning/promoted/*.md`、`evaluation-report.md`、`deferred.md`、`inbox.md`（ヘッダーのみクリア）、commit hash。
- **Harness依存**: LLM 推論（8軸評価・廃棄判定）、subagent 起動（`agentdev-adversarial-review`）、git（pull/commit/push、並列実行安全ステージング）、原子的ファイル操作、拡張読込。
- **Capability依存**: `agentdev-learning-pipeline`（8軸評価/廃棄判定/既存対策照合）、`agentdev-learning-capture`（参照）、`agentdev-git-worktree`、`agentdev-adversarial-review`、`agentdev-project-extensions`。
- **内部workflow候補**: 正規化/評価workflow（STEP-1〜2 + 8軸スコアリング）、廃棄判定+昇華可能性評価workflow（STEP-3）、HITL+prune+永続化workflow（STEP-5〜6）。8軸評価ロジックと廃棄判定カテゴリは Capability Skill 候補（`agentdev-learning-pipeline` が所有）。

### `/agentdev/backlog-review`

- **公開契約**: `.agentdev/{intake,learning,inspect}/promoted/*.md` → `.agentdev/backlog/req-units/RU-*.md` + 成功成果物削除。ユーザー承認後に RU を生成（承認は RU 作成承認を兼ねる）。
- **主要処理段階**: STEP-1 実行前同期・成果物検出（引数なし/あり）→ STEP-2 分析・暫定分類付与 → STEP-3 統合/分割判定+depends_on依存解決 → STEP-4 review（adversarial-review、発動条件判定 / review 呼出）→ STEP-5 HITL（ユーザー承認、RU 生成承認を兼ねる）→ STEP-6 矛盾検出+追加判断 → STEP-7 RU生成（session由来RU含む）+成功成果物削除 → STEP-8 Git永続化・完了報告。
- **分岐**: 成果物0件（正常終了）、引数指定、統合/分割判定、depends_on 依存解決、矛盾検出（partial success）、session由来RU（二段階承認）、adversarial-review skip（RU構成要素1件）、ユーザー明示指定時必須発動、矛盾なしの単一承認（REQ-015-008）。
- **副作用**: `.agentdev/backlog/req-units/RU-*.md` 生成、成功成果物の削除、`.agentdev/` 配下 commit/push（明示パス、`chore(agentdev): generate requirement units via backlog-review`）。REQ ファイル保存、Issue 作成、inbox・deferred 更新は禁止。矛盾の自動解決はしない。
- **HITL**: STEP-5 ユーザー承認（構成案、RU 生成承認を兼ねる）、STEP-6 矛盾検出時の追加判断（partial success、矛盾なければ単一承認）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（対話的 review、親エージェントが集約）。
- **resume**: 成果物検出結果、RU 構成案、統合/分割判定、depends_on 解決結果、矛盾検出結果、ユーザー承認状態。
- **durable state**: `.agentdev/backlog/req-units/RU-*.md`、promoted 削除状態、commit hash。
- **Harness依存**: LLM 推論（統合/分割/矛盾検出）、subagent 起動（`agentdev-adversarial-review`）、git（pull/commit/push、並列実行安全ステージング）、拡張読込。
- **Capability依存**: `agentdev-backlog-integration`、`agentdev-git-worktree`、`agentdev-adversarial-review`、`agentdev-project-extensions`。
- **内部workflow候補**: 統合/分割判定workflow（STEP-3）、矛盾検出workflow（STEP-6）、RU生成+削除+永続化workflow（STEP-7〜8）。統合/分割判定基準と depends_on 依存解決ルールは Capability Skill 候補（`agentdev-backlog-integration` が所有）。

### `/agentdev/backlog-auto`

- **公開契約**: 引数なし → backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1回起動で実行し RU 生成まで一巡。追加入口（標準の backlog 整理フローを置換しない）。子ワークフロー内部の分類、評価、昇格、RU 生成ロジックは再実装しない。
- **主要処理段階**: STEP-1 開始時刻記録・進行状態初期化（durable state 再構成）→ STEP-2 stage 1 inspect-docs 単独直列 → STEP-3 stage 2 昇格3系統（learning-promote / intake-promote / inspect-promote、競合処理の直列化）→ STEP-4 fan-in 判定 → STEP-5 stage 3 backlog-review → STEP-6 完了報告（工程別結果、停止理由、再開コマンド提示）。
- **分岐**: stage 1 停止経路（inspect-docs blocked/failed で下流非開始）、fan-in 判定（全系統正常完了 or 対象なし終了で開始可、1系統でも blocked・failed・未完了で開始不可）、系統別結果状態の読み替え（対象なし終了を正常扱い、learning-promote の inbox.md 不在を対象なし扱い）、部分停止時の独立系統継続、新規 promoted 0件でも backlog-review 実行、inspect-promote --auto 非有効化。
- **副作用**: 各子コマンドの既存副作用のみ（`.agentdev/` 配下の成果物作成・削除、git commit/push、ユーザー対話）。backlog-auto 自身は新規副作用を追加しない。capture 系コマンド、inspect-skills、req-define、req-save、Issue/PR 作成の自動起動はしない。
- **HITL**: 各子ワークフローの既存 HITL 境界を維持（新規判断境界を追加しない）。複数系統が判断待ちの場合はユーザー対話を直列化し系統識別付きで表示。
- **並列性**: orchestration stage 構成（stage 1 単独直列 / stage 2 昇格3系統は系統相互の先行依存なし、競合 Git 操作・共有成果物書き込み・ユーザー対話のみ直列化 / stage 3 単独）。並行実行を利用できない場合は順次インターリーブ。部分停止時も独立系統は連鎖停止しない。
- **resume**: `backlog_auto_started_at`、stage 別完了状態、stage 2 系統別結果状態、直列化キュー実行記録。各系統内の再開は子ワークフローの既存 STEP model 再開契約に委譲。inspect-docs は中断時先頭再実行。
- **durable state**: 各子コマンドの durable state（learning は inbox.md/deferred.md/evaluation-report.md/promoted/、intake は inbox//promoted/、inspect は inbox//promoted//auto-promote-log、backlog-review は promoted/ 残存と `RU-*.md` 実ファイル）から工程進行を再構成。
- **Harness依存**: stage 2 の系統並行実行機構（利用できない場合は順次インターリーブ）、ユーザー対話の直列化表示、タイムスタンプ計測、拡張読込。
- **Capability依存**: `agentdev-project-extensions`。子ワークフロー依存の Capability Skill（`agentdev-learning-pipeline`、`agentdev-intake-pipeline`、`agentdev-backlog-integration` 等）は各子 Workflow Skill 経由で継承。
- **内部workflow候補**: orchestration workflow（stage 実行 + 直列化キュー + fan-in 判定 + 停止伝播）。Workflow Skill（`agentdev-workflow-backlog-auto`）として実装済み。

### `/agentdev/inspect-docs`

- **公開契約**: なし（全対象成果物を自動スキャン） → 診断結果（セッション内 + `.agentdev/inspect/inbox/inspect-docs-finding-*.md`）。診断専用、検査対象を直接修正しない。
- **主要処理段階**: STEP-1 スキャン対象収集 → STEP-2 REQ体系・文書種別別意味診断（REQ参照ID整合性、第一参照導線、現行/廃止/世代境界、REQ/Decision/Design/guides/README 意味診断、REQ structure review 6観点、文書分類一貫性検査）→ STEP-3 配布物整合性検査・docs-check route判定（未処理artifact確認）→ STEP-4 検出事項出力・実行前同期・commit/push・完了報告。
- **分岐**: スキャン対象ディレクトリ存在/不存在、ファイル読込失敗、source-of-truth priority（現行REQ > 承認済みDecision > Design > guides）、NG分類（false positive/pre-existing/今回修正対象）、inspect-* routing（docs vs skills vs 両方）。
- **副作用**: `.agentdev/inspect/inbox/inspect-docs-finding-*.md` 生成、`.agentdev/inspect/` 配下 commit/push（`chore(agentdev): capture inspect-docs finding`）。ファイル変更/作成/削除（finding 生成の例外を除く）、Issue/PR 作成、worktree、intake/learning/RU は禁止。
- **HITL**: なし（診断専用、検出事項を提示するのみ）。source-of-truth priority は機械的。
- **並列性**: 明示的並列モデルは持たない（全対象スキャン、検査項目は順次）。
- **resume**: スキャン対象一覧、検出事項リスト、source-of-truth 判定結果、NG分類。
- **durable state**: `.agentdev/inspect/inbox/inspect-docs-finding-*.md`、commit hash。
- **Harness依存**: LLM 推論（意味診断）、subagent 起動（`agentdev-req-structure-diagnostics` 等）、git、拡張読込。
- **Capability依存**: `agentdev-req-structure-diagnostics`、`agentdev-doc-diagnostics`、`agentdev-doc-writing`（参照）、`agentdev-git-worktree`、`agentdev-project-extensions`。
- **内部workflow候補**: docs 横断診断workflow（STEP-1〜3 + 6観点 review + 文書分類検査 + 配布物整合性）。診断カテゴリの routing と検査ロジックは Capability Skill 候補（`agentdev-doc-diagnostics`/`agentdev-req-structure-diagnostics` が所有）。

### `/agentdev/inspect-skills`

- **公開契約**: Command/Skill 定義ファイル群 → 診断レポート（セッション内 + `.agentdev/inspect/inbox/inspect-skills-finding-*.md`）。診断専用、検査対象を直接修正しない。
- **主要処理段階**: STEP-1 診断対象読込 → STEP-2 各診断観点評価・分類・route提示（`agentdev-inspect-skills`、配布物構文健全性・責務整合診断を含む）→ STEP-3 検出事項出力・実行前同期・commit/push・完了報告。
- **分岐**: 対象ファイル存在/不存在、参照先 Skill 存在/不存在、source-of-truth、NG分類、inspect-* routing、自動修正しない。
- **副作用**: `.agentdev/inspect/inbox/inspect-skills-finding-*.md` 生成、`.agentdev/inspect/` 配下 commit/push（`chore(agentdev): capture inspect-skills finding`）。ファイル変更/削除（finding 生成の例外を除く）、Issue/PR、RU/intake/learning/backlog、branch/worktree は禁止。
- **HITL**: なし（診断専用、推奨 route の提示に留める）。
- **並列性**: 明示的並列モデルは持たない。
- **resume**: 診断対象一覧、検出事項リスト、診断分類ラベル、推奨 route。
- **durable state**: `.agentdev/inspect/inbox/inspect-skills-finding-*.md`、commit hash。
- **Harness依存**: LLM 推論（構文健全性・責務整合診断）、git、拡張読込。
- **Capability依存**: `agentdev-inspect-skills`、`agentdev-git-worktree`、`agentdev-project-extensions`。
- **内部workflow候補**: 参照妥当性診断workflow（STEP-1〜2）、配布物構文健全性・責務整合診断workflow（STEP-2 診断観点、docs-spec-rebuild-integrity 検査パターン）。診断観点（粒度・段階的開示・責務境界・canonical name・内部構造依存）は Capability Skill 候補（`agentdev-inspect-skills` が所有）。

### `/agentdev/inspect-promote`

- **公開契約**: `.agentdev/inspect/inbox/*.md` + `--auto`（省略可） → `.agentdev/inspect/promoted/*.md`（手動 promote）/ `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時）/ `auto-promote-log.md`（append-only）。分類・採用を行い Issue 作成はしない。
- **主要処理段階**: STEP-1 実行前同期 → STEP-2 inboxスキャン → STEP-3 検出事項分類（暫定分類 promote/defer/reject）→ STEP-4 自動 promote（`--auto` opt-in 時、fast path）→ STEP-5 adversarial-review（発動条件判定 / review 呼出）→ STEP-6 確定（自律確定判定と HITL 確定）→ STEP-7 処理実行（promote / reject 即時削除 / defer 残置）→ STEP-8 完了報告・永続化（commit/push）。
- **分岐**: inbox 空（終了）、`--auto` opt-in 有無（fast path vs 手動分類）、自動 promote 対象カテゴリ（安定契約例外・否定文脈除外）、adversarial-review skip（`--auto` 経路/手動0件）、ユーザー明示指定時必須発動、reject 即時削除（`archive/rejected/` 廃止）、defer 残置、ユーザー全件 defer、promote/defer/reject/intake-or-learning 送付推奨。
- **副作用**: `.agentdev/inspect/promoted/*.md` 保存、`.agentdev/intake/promoted/inspect-auto-*.md` 投入（`--auto`）、`.agentdev/inspect/promoted/auto-promote-log.md` 更新（append-only）、promote inbox 削除、reject 即時削除（commit message に却下理由）、defer 残置、`.agentdev/inspect/`+`.agentdev/intake/` 配下 commit/push（`chore(agentdev): promote inspect findings`）。
- **HITL**: STEP-6 HITL 確定（手動分類対象、`--auto` 対象外）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（対話的 review、`--auto` fast path は一括処理）。
- **resume**: inbox 検出事項一覧、暫定分類、`--auto` 実行ログ、HITL 承認状態。
- **durable state**: `.agentdev/inspect/promoted/*.md`、`.agentdev/intake/promoted/inspect-auto-*.md`、`auto-promote-log.md`、inbox 削除状態、commit hash。
- **Harness依存**: LLM 推論（分類）、subagent 起動（`agentdev-adversarial-review`）、git（pull/commit/push）、拡張読込。
- **Capability依存**: workflow-contracts Design（自動 promote 対象カテゴリ、extension 経由）、`agentdev-git-worktree`、`agentdev-adversarial-review`、`agentdev-project-extensions`。
- **内部workflow候補**: 分類workflow（STEP-3 + promote/defer/reject）、`--auto` fast path workflow（STEP-4 + カテゴリマッチング + 自動投入）、HITL+永続化workflow（STEP-6〜8）。自動 promote 対象カテゴリと誤検知 revoke 手順は Capability Skill 候補（workflow-contracts Design が所有）。

### `/agentdev/third-party-sync`

- **公開契約**: 対象 Skill 名（省略時全件）、dry-run 指定 → 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況。セッション内テキスト出力）。dry-run 指定時は実行予定の計画表示のみで取得・配置の変更は行わない。
- **主要処理段階**: STEP-1 入力解決 → STEP-2 宣言（skills.yaml）読込と検証、対象選択と管理外衝突の事前判定 → STEP-3 取得実行（third-party Skill 取得専用 Custom Tool 委譲）→ STEP-4 結果検証・報告。
- **分岐**: 対象指定（個別/全件）、dry-run 指定有無、既存管理外衝突の検出（取得を拒否して報告）、取得失敗時の前状態復元。
- **副作用**: `.opencode/skills/<name>/` 配下への Skill 取得・配置（非破壊制御は Custom Tool 操作契約が所有）。skills.yaml の編集は行わない。
- **HITL**: あり（取得・配置を人間確認を開いて実行する。dry-run は確認材料の提供）。
- **並列性**: 持たない（宣言に基づく逐次取得）。
- **resume**: STEP model 対象外（取得実行は Custom Tool 操作契約で完結し、失敗時は開始前状態を保持して再実行を可能とする）。
- **durable state**: `.opencode/skills/<name>/` 配置結果、skills.yaml（宣言データ）。
- **Harness依存**: git（実行前同期）、Custom Tool（third-party Skill 取得）。
- **Capability依存**: `agentdev-workflow-third-party-sync`（workflow 本体）、`third-party-skill-management` Design（正規仕様）。
- **内部workflow候補**: なし（取得実行主体は Custom Tool 操作契約、workflow 制御は `agentdev-workflow-third-party-sync` が所有）。

### 横断観察（Cross-cutting observations）

- **共通 Harness 依存**: 全 Command が `agentdev-git-worktree`（並列実行安全ステージング、ドメイン状態永続化）、`agentdev-project-extensions`（5セクション読込、fail-open）、`agentdev-conventional-commits`（commit message）に依存する。これらは Capability Skill として横断抽出済み。
- **共通 Capability Skill**: `agentdev-gh-cli`（gh CLI I/O 境界、Windows encoding 初期化）は case-open/case-run/case-close/case-update/case-auto/intake-from-github が利用。REQ/Decision/Design 系は `agentdev-{req,decision,spec}-file-manager` + `agentdev-artifact-validation`（決定的スクリプト）に集約。
- **adversarial-review 呼出元**: 7呼出元（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run adapter 委譲内）が Command 定義に挿入境界を持つ。case-auto は停止伝播のみ受領（直接起動しない）。全呼出元で default-on + skip policy + 呼出失敗時従来フロー維持が共通（REQ-015-002/003、REQ-014-010）。
- **resume と durable state**: 全 Command が GitHub Issue/PR（公開状態）と `.agentdev/`（ドメイン状態）を durable state とする。draft/RU/promoted/inbox/deferred/RU/REQ/Decision/Design が工程間引き継ぎの権威情報源。会話コンテキストは権威情報源としない（DEC-011 原則、`status` frontmatter + commit hash 検証で再開点を再構成）。
- **HITL 密度**: req-define（壁打ち・Scale協議・SPLIT提案）、case-open（execution contract・preflight）、intake-promote/learning-promote/backlog-review（分類承認）、inspect-promote（手動分類確定）が高 HITL。case-run/case-close/intake-capture/intake-from-github/inspect-docs/inspect-skills は低 HITL（委任・診断・保存専用）。case-auto は停止条件11項目と bounded parent decision resolution で本質的 HITL に集約。
- **並列性の集中**: 並列実行モデルを持つ Command は req-save（3フェーズ分離）、design-save（異なる target で最大5件）、case-open（子Issue 作成最大5件）、case-run（Epic Wave 最大5件）、case-auto（orchestration stage 2 最大5件、execution_unit 全体は上限なし）、case-close（Epic Wave 準並列化）。3つの「5件」文脈の区別を要する（epic-wave-model Design）。それ以外は単一ワークフロー。
- **内部workflow候補の分布**: case-open（execution_unit 構成・Epic flow・Standard flow・execution contract 確定・クリーンアップ）、case-close（PRマージ・QG-4 達成判定・Design確定・Capture回収・Epic Wave クローズ）、case-auto（orchestration・bounded parent decision resolution・コンフリクト解消 Level 2/3・停止理由分類）が Workflow Skill 抽出の有力候補。req-define（壁打ち・照合・要件展開・Decision判断）、req-save/design-save（保存3フェーズ）、intake-promote/learning-promote/backlog-review（review/分類ワークフロー）、inspect-docs（診断カタログ）も抽出候補。intake-capture/intake-from-github/case-update/inspect-skills/inspect-promote は単純または既存 Capability Skill でカバーされており抽出優先度低。
- **Capability Skill 候補**: 全 Command 共通の git/gh I/O・決定的スクリプト・並列ステージング・target_area マッチング・8軸評価・廃棄判定カテゴリ・統合分割判定基準・自動 promote カテゴリ・adversarial-review 共通契約は既存 Capability Skill 群が所有。新規 Capability Skill 抽出の余地は test strategy 定義（req-define STEP-4）、EC-2 必須品質統制導出（case-open）、EC-6 scope-affecting impact 探索（case-open）、コンフリクト Level 1 解消判断、Design status 昇格判断、bounded parent decision resolution、Wave 反復制御あたり。

## 代表ケース検証（REQ-027-003、DEC-010/011）

新 workflow model（STEP reference, resume point, Input Resolution, durable state）の妥当性を代表ケース4種で検証した結果（REQ-027-003）。
検証基準は workflow-skill-model Design、step-reference-contract Design、input-resolution-and-durable-state Design、DEC-010/011。

### 検証対象と結果

| 代表ケース | 検証対象の性質 | 結果 | 備考 |
|---|---|---|---|
| case-run / case-auto | orchestration・resume・single/Epic Wave・parallelism・compaction | pass | Workflow Skill（`agentdev-workflow-orchestration`、`agentdev-workflow-case-auto`）が STEP model を所有。durable state、Input Resolution、並列child task 復元、3つの「5件」文脈の区別、compaction 復元契約を明示 |
| req-define | interactive / HITL / loop を持つ workflow | pass with observations | `agentdev-req-analysis` Capability Skill は STEP model 連携を明示。command 本体は workflow 実装を直接所有（Workflow Skill 抽出は候補）。interactive 壁打ちセッションは harness 固有領域、ドラフト保存（STEP-9）後の再開は durable state から復元可能 |
| req-save / design-save | deterministic mutation / verification / commit を持つ workflow | pass with observations | 決定的スクリプト呼出（REQ番号採番、target_area 検索、`check-change-impact`）、QG-1、targeted docs guard、変更範囲検証を各所で実施。Capability Skill（`agentdev-req-file-manager`、`agentdev-design-file-manager`、`agentdev-artifact-validation`）は STEP model 連携を明示。command 本体は workflow 実装を直接所有（Workflow Skill 抽出は候補） |
| intake-promote | classification / review / approval / irreversible action 境界を持つ workflow | pass with observations | 分類3値（採用/保留/却下）、adversarial-review、ユーザー承認（採用済み成果物生成の明示承認・分類結果の提示・分類未確定時の自動進行禁止）、破壊的変更別承認、REQ-014-009 不可逆処理停止、分類承認後の自動実行（REQ）が明確。Capability Skill（`agentdev-intake-pipeline`）へ STEP model 連携セクションを付与済み（本 Issue で修正）。command 本体は workflow 実装を直接所有（Workflow Skill 抽出は候補） |

### capture-only 型・read-only-diagnostic 型の除外（Issue 完了条件）

capture-only 型（`learning-capture` スキル等）、read-only-diagnostic 型（`inspect-docs`、`inspect-skills` 等）は resume point / export / import を持たないため STEP model 対象外とし、代表ケースから除外した（Issue 補足情報「capture-only型・read-only-diagnostic型の除外」参照）。

### 検証で発見された問題と修正内容

1. **case-auto Workflow Skill 名の不一致**（Epic #2060 Wave 3 残課題）: PR #2071 と #2072 で case-auto Workflow Skill 名が不一致（`agentdev-workflow-case-auto` と `agentdev-workflow-auto-orchestration`）だった。
新アーキテクチャ（DEC-010/011/012 準拠、references 分割、Capability Skill 連携、skill extension 契約）に合致する `agentdev-workflow-case-auto` を正とし、`agentdev-workflow-auto-orchestration` を削除。
case-auto.md command の参照11箇所を更新。
2. **case-auto.md の節参照の不正確さ**: case-auto.md から新SKILL.md への節名参照3箇所（`「adversarial-review 停止伝播」節`、`「bounded parent decision resolution」節`、`「コンフリクト解消モデル（3レベルエスカレーション）」節`）が、新SKILL.md の構造（references 配下の STEP 別 reference ファイル）と不一致だった。
各参照を `references/stop-and-decision-resolution.md`（STEP-5/6）、`references/conflict-resolution-and-reporting.md`（STEP-7）へ修正。
3. **`agentdev-intake-pipeline` SKILL.md の STEP model 連携セクション欠落**: 他の Capability Skill（`agentdev-req-analysis`、`agentdev-req-file-manager`、`agentdev-case-run-execution-adapter`）は STEP model 連携セクションを持つが、`agentdev-intake-pipeline` は持たなかった。
SKILL.md へ STEP model 連携セクションを追記し、durable state、Input Resolution の扱いを明示。

### 結論

代表ケース4種全てで新 workflow model が成立する。
command が workflow 実装を直接所有するケース（req-define、req-save、design-save、intake-promote）は Workflow Skill 抽出候補として位置付けられ、Capability Skill 側が STEP model 連携を担うことで部分的 STEP model 適用を許容する。
Workflow Skill 抽出済みの case-open/case-close/case-auto/case-run は完全 STEP model 適用で整備済み。

## 適用範囲宣言

`docs/designs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは Design ファイルに依存しない（REQ-001）。

## See Also

- [README.md](../README.md)（Design インデックス（3 層構造））
- [workflows/](../workflows/)（横断ワークフロー契約）
- [commands/](../commands/)（command Design）
- [skills/](../skills/)（skill Design）
