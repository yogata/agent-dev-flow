---
updated: 2026-08-14
status: accepted
---

# システム仕様

> **縮小済み**: 本 SPEC は文書体系再構築により縮小した。
> コマンドシステム概要のみを残し、個別動作（Epic フロー、自律修正ループ、達成判定プロトコル、Capture、ID 体系、REQ 基準構造、分類ゲート）は各 SPEC へ移管した。

## コマンドシステム

### AgentDevFlow コマンド群

AgentDevFlow（`/agentdev/*` コマンド体系）は 3 つのパイプラインで構成され、開発ワークフローを提供する。
各コマンドの目的、責務、入出力は後述の表および各コマンド専用 SPEC に記述する。実行エージェントの選定、起動方法は harness の責務であり、本 SPEC の対象外（v2:ADR-0136）。

#### req/case パイプライン

| コマンド | 役割 | 詳細 |
|---|---|---|
| `/agentdev/req-define` | 要件定義（壁打ち） | [commands/req-define.md](../commands/req-define.md) |
| `/agentdev/req-save` | 要件定義の保存 | [commands/req-save.md](../commands/req-save.md) |
| `/agentdev/spec-save` | SPEC 候補の保存、確定 | [commands/spec-save.md](../commands/spec-save.md) |
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

docs-check は `/repo/*` コマンド体系の配布対象リポジトリ内コマンドである（REQ-001、REQ-010-156）。
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
詳細は同 SPEC および [skills/agentdev-quality-gates.md](../skills/agentdev-quality-gates.md) を参照。

### 移管済みセクション（参照先）

以下のセクションは個別 SPEC へ移管済み。
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
| 整合性検査スキル（repo-`agentdev-integrity`） | (repo-local、配布対象外、SPEC 対象外) |

## Workflow Architecture Inventory

全公開Command（16件）の Workflow Architecture Inventory を恒久カタログとして統合する。
各Command の11分析軸（公開契約・主要処理段階・分岐・副作用・HITL・並列性・resume・durable state・Harness依存・Capability依存・内部workflow候補）を記載する。
個別Workflow Skill 移行（Wave 2）および Capability Skill 抽出の参照証拠とする。

本カタログは architecture view である。各項目の権威情報源は以下の所有関係に従う。

- public contract（入出力契約、副作用、安全性、承認境界、stop state、ordering contract）
  → Command SPEC が正規文書、Command 定義はその実行時投影。両者不一致時は Command SPEC を正とする。
- workflow implementation → Workflow Skill
- durable state contract → Workflow / STEP SPEC

「Command 定義が SSoT である」という旧表現は workflow 実装の権威情報源が Command にあることを
含意するため使用しない。

### 一覧表

| Command | 主入力 | 主出力 | workflow 系統 |
|---|---|---|---|
| `/agentdev/req-define` | セッション会話 / RU | 要件doc（draft） | req/case |
| `/agentdev/req-save` | 要件doc | REQ/Decision ファイル | req/case |
| `/agentdev/spec-save` | 要件doc | SPEC ファイル | req/case |
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
| `/agentdev/inspect-docs` | docs 全体スキャン | 検出事項 | inspect |
| `/agentdev/inspect-skills` | Command/Skill 定義 | 検出事項 | inspect |
| `/agentdev/inspect-promote` | 検出事項 | 採用済み成果物 | inspect |

### `/agentdev/req-define`

- **公開契約**: 自然言語による要件説明 / Issue URL / 明示入力ファイル（RU 含む） → `.agentdev/drafts/req-draft-{topic-slug}.md`（構造化 `draft-data`）。壁打ちフェーズ専用、実装コード生成禁止。
- **主要処理段階**: Step 1 セッションコンテキスト検知 → Step 2 明示入力読込 → Step 3 壁打ち → Step 4 既存REQ照合 → Step 5 要件展開（5-1〜5-6 変更影響抽出・分類ゲート・Decision要否・実行主体・test strategy）→ Step 6 Decision判断 → Step 7 要件doc生成 → Step 8 work_type → Step 9 Scale → 経路A adversarial-review → Step 10 ドラフト保存 → Step 11 確認 → Step 12 完了報告。
- **分岐**: 引数あり/なし、Standard vs Epic（`scale: large`）、work_type（feature/bugfix/maintenance/docs_chore）、前工程引き継ぎ（`agentdev_handoff: true`）、Decision要否（5-4 → architecture-advisory）、SPLIT予兆計測（4-2/11-2）、adversarial-review skip 条件（L0/Decision対象なし）。
- **副作用**: `.agentdev/drafts/**` のみ作成・編集（G03）。`docs/`、`.opencode/`、git、Issue/PR は触れない。
- **HITL**: Step 3 壁打ち対話、Step 9 Scale=large 分解計画協議、Step 11 要件doc提示（承認は求めず、次コマンド実行を確定意思表示とする）、SPLIT 要否提案、architecture-advisory の「ユーザー確認事項」ラベル。
- **並列性**: 持たない（単一の壁打ちセッションを前提）。
- **resume**: ドラフトファイル（`.agentdev/drafts/req-draft-*.md`）が永続 resume 入力。Step 3 差し戻し、Step 4 SPLIT候補、5-4 blocked、6 blocked が明示的再開点。
- **durable state**: `draft-data`（`agreed_items` / `artifact_actions` / `operation_units` / `test_strategy` / `review_dispositions` / `case_open_hints` / `auto_gate`）、`status` frontmatter（未確定→確定）。会話コンテキストに依存しない（DEC-011 原則）。
- **Harness依存**: LLM 推論による壁打ち、subagent 起動（`agentdev-architecture-advisory`、`agentdev-adversarial-review`）、拡張読込（`agentdev-project-extensions`）。
- **Capability依存**: `agentdev-req-analysis`、`agentdev-req-file-manager`（照合）、`agentdev-decision-guidelines`、`agentdev-decision-file-manager`（参照のみ）、`agentdev-architecture-advisory`、`agentdev-workflow-lifecycle`、`agentdev-workflow-templates`（template 読込）、`agentdev-project-extensions`、`agentdev-adversarial-review`（経路A）。
- **内部workflow候補**: 壁打ち対話workflow（Step 1〜3、5）、既存REQ照合workflow（Step 4 + 4-1/4-2 定量計測）、要件展開と分類ゲートworkflow（Step 5-1〜5-6）、Decision判断workflow（Step 6 + 副ステップ）、ドラフト保存workflow（Step 7 + 10 + 11）。Step 5-6 の test strategy 定義は Capability Skill 候補。

### `/agentdev/req-save`

- **公開契約**: `.agentdev/drafts/req-draft-*.md`（REQ/Decision artifact_actions 含む） → `docs/requirements/REQ-*.md` / `docs/decisions/DEC-*.md` + README 更新 + commit/push。`work_type` 依存廃止、`artifact_actions` の有無で判定。
- **主要処理段階**: Step 1 事前チェック → Step 2 ドラフト読込（hash 記録）→ Step 3 検証（3-1/3-2/3-3 artifact_actions ゲート）→ Step 4 REQ操作（4-0 QG-1 / 4-1/4-2/4-3 3フェーズ分離）→ Step 5 インデックス・ハブ → Step 6 Decision作成 → Step 7 docs整合性 → Step 8 README索引（targeted docs guard）→ Step 9 変更範囲（check-change-impact）→ Step 10 status 更新 → Step 11 commit/push（明示パス）→ Step 12 完了報告。
- **分岐**: artifact_actions 有無（no-op）、CREATE/APPEND/UPDATE/SPLIT、Decision entry 有無（Step 6）、SPLIT 検出（`requirements-review-finding`）、REQ再構成候補検知（`intake/inbox/req-restructure`）、extension 更新要否、`full_docs_check_recommended` で `/repo/docs-check` 提案。
- **副作用**: `docs/requirements/**` / `docs/decisions/**` / `docs/README.md` / `.agentdev/drafts/**`（status更新）の編集。git commit/push（main ブランチ、明示パスステージング）。`.agentdev/intake/inbox/req-restructure/**` 生成（例外）。Issue 作成は禁止（G11）。
- **HITL**: targeted docs guard の strict 違反時の停止指示待ち、check-change-impact violation 時の指示待ち、extension 更新のユーザー指示、`full_docs_check_recommended` true 時の `/repo/docs-check` 提案。
- **並列性**: case-auto 並列委譲モデルあり（REQ/093）。採番バッチ[直列] → ファイル作成[並列 最大5件] → インデックス更新[直列]。直列集約対象（採番/index/draft/commit/push）は並列完了後に実行。
- **resume**: `draft-data.status`（`saved`）、読込時 commit hash と pull 後 hash の一致検証（G08）。Step 4-0 QG-1 fail → req-define 差し戻し。
- **durable state**: REQ/Decision ファイル、README 索引、draft status、commit hash、artifact_actions 処理結果（Step 11-1）と OU 結果の書き戻し。
- **Harness依存**: bash による決定的スクリプト呼出、並列実行安全ステージングプロシージャ、subagent 起動（委譲接続点）、拡張読込。
- **Capability依存**: `agentdev-req-file-manager`、`agentdev-decision-file-manager`、`agentdev-conventional-commits`、`agentdev-quality-gates`（QG-1）、`agentdev-artifact-validation`（check-entry-existence / check-change-impact / id↔filename）、`agentdev-git-worktree`（並列ステージング）、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts）。
- **内部workflow候補**: REQ保存workflow（採番→作成→QG-1→push、3フェーズ分離を含む）、Decision保存workflow（Step 6 + 妥当性再検証ゲート）、docs整合性確認workflow（Step 7-9 targeted docs guard + check-change-impact）。

### `/agentdev/spec-save`

- **公開契約**: `.agentdev/drafts/req-draft-*.md`（SPEC artifact_actions 含む） → `docs/specs/**/*.md` + README 一覧登録 + commit/push。`work_type` 依存廃止。
- **主要処理段階**: Step 1 事前チェック → Step 2 SPEC artifact_actions 読込 → Step 3 配置先解決（search-target-area.ts）→ Step 4 SPEC分離基準最終確認 → Step 5 SPEC操作（5-1 並列 / 5-2 宣言付与）→ Step 6 インデックス（check-entry-existence）→ Step 7 一覧整合（targeted docs guard / extension 更新要否）→ Step 8 status 更新 → Step 9 変更範囲（check-change-impact）→ Step 10 commit/push → Step 11 完了報告。
- **分岐**: artifact_actions 有無（no-op）、`artifact: spec` 有無、create vs update、`target_area` 指定有無（置換 vs 追記）、`target_area` 複数マッチ（置換拒否 G09）、`target_area` 空（スキップ+follow-up）、安定契約例外除外、`full_docs_check_recommended`、SPEC 移動による extension 参照先変更（エラー停止）。
- **副作用**: `docs/specs/**` / `.agentdev/drafts/**`（status更新）の編集、`docs/specs/README.md`（SPEC 一覧）。git commit/push。REQ/Decision/command/skill/template 編集禁止（G03）。
- **HITL**: targeted docs guard strict 違反時停止、`spec_readme_update_required`、extension 参照先 SPEC 移動時のユーザー判断、`full_docs_check_recommended` true 時の `/repo/docs-check` 提案、配置先 SPEC 特定不能時の follow-up 明示。
- **並列性**: case-auto 並列委譲モデルあり（REQ/093）。異なる `target` パスの create/update は L0 完全独立のため並列可能（最大5件）。同一 SPEC ファイルへの複数 action は順序依存のため直列サブセット。
- **resume**: `draft-data` SPEC 消費済みフラグ、target_area マッチ結果、SPEC `status: draft` frontmatter。
- **durable state**: SPEC ファイル（frontmatter: title/status/created/updated + 宣言節）、SPEC README 一覧エントリ、draft SPEC 消費フラグ。
- **Harness依存**: bash による決定的スクリプト呼出（search-target-area.ts / check-entry-existence.ts / check-change-impact.ts）、並列実行安全ステージング、拡張読込。
- **Capability依存**: `agentdev-spec-file-manager`（target-area-matching / spec-lifecycle-application）、`agentdev-conventional-commits`、`agentdev-artifact-validation`、`agentdev-git-worktree`、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts）。
- **内部workflow候補**: SPEC保存workflow（配置先解決→操作→宣言付与→push）、target_area セクション置換workflow（Step 5 + search-target-area ロジック）、SPEC 一覧整合workflow（Step 6 + 7）。

### `/agentdev/case-open`

- **公開契約**: 要件doc（構造化 `draft-data`） → GitHub Issue（ラベル付き、要件doc埋め込み）。壁打ち→構造的実行フェーズの境界。
- **主要処理段階**: Step 1 引き継ぎ停止判定（1-1 OU選択ゲート）→ Step 2 Issue本文生成（2-1/1a/1b QG-2 / 2-2 test_strategy / 2-3/4/5 識別子中心 / 2-6 EC-1〜EC-8 execution contract 確定）→ Step 3 マルチREQ判定（3-1 自律構成生成）→ Step 4 規模判定（4-1 preflight）→ 経路F adversarial-review → Epic flow（Step 5-9）/ Standard flow（Step 10-12）→ Step 13 コメント追加 → Step 14 draft/RU削除（Form Zero + 即時push）→ Step 15 完了報告。
- **分岐**: 引き継ぎ停止（self-hosting vs consumer）、OU ID 指定有無、Standard flow vs 単一REQ Epic flow vs マルチREQ Epic flow、`scale: standard` vs `large`、子Issue 10件上限（G05）、preflight 5項目、adversarial-review skip（Standard + 単一OU 機械的確定）、review 結果による QG-2/preflight 再実行 4パターン。
- **副作用**: GitHub Issue 作成（agentdev-gh-cli）、コメント追加、draft/RU の `git rm` + commit + 即時 push（Form Zero）。`.agentdev/` 配下の capture 成果物保存（委譲）。Issue 本文のファイル経由渡し（G25、`[System.IO.File]::WriteAllText` UTF8 BOM なし LF）。REQ/Decision/SPEC ファイル編集は禁止。
- **HITL**: adversarial-review 由来の unresolved 判断事項、preflight 失敗時の停止、QG-2 fail 時の req-define 差し戻し、execution contract EC-6 scope-affecting impact の確認、Capture結果 小節の保存報告。
- **並列性**: Step 8 子Issue 作成の並列化（最大5件、3つの「5件」文脈の(1)に該当）。Epic Issue 作成・Wave 1 配置・ステータステーブル更新は親が直列集約。
- **resume**: Issue番号（Standard）、Epic Issue番号 + ステータス追跡テーブル、OU の `result` フィールド（作成 Issue/Epic 番号の書き戻し）、draft/RU 削除残存検証（Step 14-2）。
- **durable state**: GitHub Issue 本文（要件doc 埋め込み、execution contract 必須セクション、EC-7 adversarial-review 発動契約永続化）、Epic Issue ステータス追跡テーブル、Issue 番号、draft/RU 削除状態。
- **Harness依存**: gh CLI（agentdev-gh-cli 経由）、subagent 起動（REQ 読解・テンプレート充足・完了条件抽出、adversarial-review）、ファイル経由 UTF8 BOM なし LF 一時ファイル、並列実行安全ステージング、拡張読込。
- **Capability依存**: `agentdev-issue-management`、`agentdev-epic-tracker`、`agentdev-workflow-templates`、`agentdev-workflow-lifecycle`、`agentdev-quality-gates`（QG-2）、`agentdev-gh-cli`、`agentdev-git-worktree`、`agentdeq-req-file-manager`（RU削除）、`agentdev-project-extensions`、`agentdev-adversarial-review`（経路F）、`agentdev-learning-capture`/`agentdev-intake-pipeline`（deviation capture 委譲）。
- **内部workflow候補**: execution_unit 構成workflow（Step 3-1 連結成分アルゴリズム + 3軸判断）、Epic flow Issue作成workflow（Step 5-9）、Standard flow Issue作成workflow（Step 10-12）、execution contract 確定workflow（Step 2-6 EC-1〜EC-8）、draft/RU 削除クリーンアップworkflow（Step 14 + Form Zero）。EC-2 必須品質統制導出と EC-6 scope-affecting impact 探索は Capability Skill 候補。

### `/agentdev/case-run`

- **公開契約**: Issue番号 / Epic Issue番号 → 実装済みブランチ + GitHub PR（実行担当サブエージェント作成）。case-run internal lifecycle 3フェーズ構成（準備・委譲・クリーンアップ）、べき等。
- **主要処理段階**: Step 1 フェーズ判定（実行モード分岐: 単一Issue / Epic Wave）→ Step 2-4 抽出・確認・判定（4-1 execution contract 消費境界）→ Step 5 worktree作成（5-1 親Epic / 5-2 precondition gate / 5-3 QG-3 前置 staleness check / 5-4 targeted docs guard）→ Step 6 実行担当サブエージェント委譲（6-1 経路G adapter 内 adversarial-review）→ Step 7 result処理（4状態）→ Step 8 クリーンアップ + 完了報告（L2 タイムスタンプ）。
- **分岐**: 単一Issue 実行 vs Epic Wave 実行（最大5件並列）、再開フェーズ（準備/委譲/クリーンアップ）、`agentdev_handoff: true`、execution contract 消費原則（必須セクション有無で新旧Issue識別）、QG-3 前置 staleness check 差異、targeted docs guard 実行条件、result 4状態（completed-pr/blocked/failed/delegation-unavailable）、adversarial-review skip（自明な機械的反映）。
- **副作用**: worktree 作成（`.worktrees/{N}-{type}/`）、ブランチ作成。実行担当サブエージェント経由で PR 作成、Issue コメント追加（blocked/failed SSoT）。case-run 本体は worktree root 配下以外を触れない（G04/G30/G31）。完了条件チェックボックスは更新しない（G24、case-close 責務）。
- **HITL**: blocked/failed の停止・ユーザー報告、delegation-unavailable の pending 戻し、未コミット変更あり時のユーザー指示待ち（Step 8）、委譲内 adversarial-review の unresolved 判断事項。
- **並列性**: Epic Wave 実行モードで現在 ready な Wave の子Issue を最大5件並列委譲。1 Wave の実行（PR作成まで）で return、Wave 境界（マージ）は扱わない（case-close 責務）。
- **resume**: 3フェーズのべき等性（準備: worktree+ブランチ存在 / 委譲: PR未作成 or result未確定 / クリーンアップ: result=completed-pr）。PR番号、PR URL、Issue コメント（blocked/failed SSoT）。
- **durable state**: GitHub PR 本文（`## Findings / Capture候補` / `## SPEC確定候補` / `### stale-reference` / `### docs-integrity`）、Issue コメント（blocked/failed）、PR 番号、worktree+ブランチ、L2 タイムスタンプ。
- **Harness依存**: 実行担当サブエージェント起動（adapter skill 経由委譲、外部実行基盤）、bg task、worktree 隔離検証ヘルパー、bash による check_changed_docs.ts / check_extensions.ts 呼出、タイムスタンプ計測（JST）、拡張読込。
- **Capability依存**: `agentdev-workflow-orchestration`（再開判定）、`agentdev-req-analysis`（品質基準）、`agentdev-workflow-lifecycle`（work_type）、`agentdev-git-worktree`（worktree・precondition gate・ staleness）、`agentdev-epic-tracker`（Epic Wave）、`agentdev-gh-cli`（PR/Issue I/O）、`agentdev-quality-gates`（QG-3 前置 staleness）、`agentdev-case-run-execution-adapter`（委譲契約）、`agentdev-adversarial-review`（経路G adapter 内）、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts / check_extensions.ts）。
- **内部workflow候補**: 準備フェーズworkflow（Step 1-5、worktree作成+前置検査群）、委譲起動workflow（Step 6 + adapter 契約）、result処理+クリーンアップworkflow（Step 7-8 + L2 計測）。adapter 委譲内の adversarial-review 統合（経路G）と test-fix ループは Workflow Skill 候補。実行担当サブエージェントは外部実行基盤（I/O 境界 SPEC 所有）。

### `/agentdev/case-update`

- **公開契約**: Issue番号 + 更新内容（`--body`/`--comment`/`--req`/`--review-ng`） → 更新されたIssue本文 / コメント / REQファイル / レビューNGコメント。主にレビューNG時対応。
- **主要処理段階**: Step 1 Issue番号解決 → Step 2 現在状態取得（フェーズ判定）→ Step 3 更新内容に応じて分岐（`--body` / `--comment` / `--req` / `--review-ng`、各テンプレート維持・必須セクション検査）→ Step 4 完了報告。
- **分岐**: 更新種別4値（`--body`/`--comment`/`--req`/`--review-ng`）、APPEND vs UPDATE（REQファイル）、`--review-ng` 時の QG-3 乖離検出引用、フェーズ不変（G01）、CI/CD修正・自律修正ループは対象外（G02、case-run 責務）。
- **副作用**: Issue本文更新 / コメント追加（agentdev-gh-cli）。`--req` は直接 commit+push（req-save 委譲しない、G03 対象外の明示例外）。`--review-ng` はコメント投稿とREQ更新判断。
- **HITL**: 更新種別推論不能時のユーザー指定要求停止。各分岐で親エージェントが最終確定。
- **並列性**: 持たない（単一Issue 単位）。
- **resume**: Issue番号、現在のフェーズ（workflow-lifecycle）、更新種別、APPEND/UPDATE 判定結果。
- **durable state**: Issue 本文、コメント、REQ ファイル、commit。
- **Harness依存**: gh CLI（agentdev-gh-cli 経由）、subagent 起動（候補番号抽出・本文案・必須セクション検査）、拡張読込。
- **Capability依存**: `agentdev-workflow-routing`、`agentdev-workflow-lifecycle`、`agentdev-quality-gates`（QG-3、`--review-ng`）、`agentdev-gh-cli`、`agentdev-workflow-templates`、`agentdev-project-extensions`。
- **内部workflow候補**: 更新種別別 dispatch workflow（Step 3 の4分岐）。`--review-ng` フロー（乖離タイプ分類+推奨アクション）は Capability Skill 候補。

### `/agentdev/case-close`

- **公開契約**: Issue番号 + PR番号（自動検出可）/ Epic Issue番号 → マージ済みPR + クローズ済みCase + 削除済みブランチ・worktree。Epic Issue番号時は現在 Wave の一括クローズ。
- **主要処理段ーズ**: Step 1 Issue番号解決（Epic判定）→ Epic Wave クローズ（E1-E6）or 単一Issueクローズ（Step 1-1 重複ファイルチェック → Step 2 QG-4 前提確認 → Step 3 docs検証 / 3-1 検査ツール / 3-2 SPEC確定フロー → Step 4 PRマージ（4-0 UNKNOWNポーリング / 4-1 先行commit検出 / 4-2 コンフリクト rebase）→ Step 5 Post-merge テスト戦略 → Step 6 Issueクローズ → Step 7 worktree削除 → Step 8 親Epic更新 → Step 9 実行前同期（9-1/9-2）→ Step 10 学び検知+Capture回収 → Step 11 永続化 → Step 12 完了報告）。
- **分岐**: Epic Wave クローズ vs 単一Issue、mergeable UNKNOWN ポーリング、squash merge コンフリクト（Level 1 rebase → case-auto Level 2/3 エスカレーション）、QG-4 観点8（PR対象範囲 vs 全体）、SPEC確定候補処理3パターン（昇格/spec-save提案/見送り）、Epic自動クローズ判定（全子Issue CLOSED）、auto-close 回避（commit message フォーマット）。
- **副作用**: PR squash merge（`--delete-branch` 禁止、Step 7 で独立削除）、Issue close、worktree+ブランチ削除（local+remote）、Epic Issue 本文ステータステーブル更新（case-close 単一書き手）、SPEC `status` draft→accepted 昇格、`.agentdev/` commit/push、完了条件チェックボックス評価・更新（case-close 専任責務 G08/G20）。
- **HITL**: docs/ 更新なし警告（G09）、targeted docs guard strict 違反停止、IR-056 違反停止、QG-4 未達チェックボックス停止（G08/G20）、SPEC確定候補の見送り判断、Capture回収の分離。
- **並列性**: Epic Wave クローズ E4 で各子Issue の PRマージ・クローズ・完了条件評価・Capture回収・コンフリクト解消準備を「準並列化」（REQ）。
- **resume**: HEAD commit hash（squash merge 後）、PR mergeable 状態、Issue OPEN/CLOSED 状態、Epic ステータステーブル、SPEC status、学びinbox/intake inbox。
- **durable state**: マージコミット、クローズ済みIssue、削除済みブランチ/worktree、`.agentdev/learning/inbox.md`、`.agentdev/intake/inbox/`、SPEC status（draft→accepted）、Epic Issue ステータステーブル。
- **Harness依存**: gh CLI（merge/mergeable ポーリング/close/ラベル）、git（pull --ff-only / rebase / reset / checkout 隔離worktreeのみ）、worktree 操作、subagent 起動（learning-capture）、タイムスタンプ、bash による check_changed_docs.ts / check_extensions.ts、拡張読込。
- **Capability依存**: `agentdev-quality-gates`（QG-4 Final Acceptance Gate）、`agentdev-gh-cli`（merge/UNKNOWNポーリング/retry）、`agentdev-git-worktree`（重複チェック/rebaseパス/同期リスク検出/先行commit）、`agentdev-epic-tracker`（E1-E6）、`agentdev-spec-file-manager`（spec-lifecycle-application、Step 3-2）、`agentdev-workflow-templates`、`agentdev-learning-capture`、`agentdev-learning-pipeline`（deferred）、`agentdev-intake-pipeline`、`agentdev-workflow-orchestration`（capture境界）、`agentdev-project-extensions`、`repo-agentdev-integrity`（check_changed_docs.ts / check_extensions.ts）。
- **内部workflow候補**: PRマージworkflow（Step 4 + 4-0/4-1/4-2 コンフリクト解消）、QG-4 達成判定workflow（Step 2 + 観点8 + 完了条件チェックボックス）、SPEC確定workflow（Step 3-2）、Capture回収workflow（Step 10、PR本文→intake/learning分離）、Epic Wave クローズworkflow（E1-E6）。Level 1 コンフリクト解消と SPEC status 昇格判断は Capability Skill 候補。

### `/agentdev/case-auto`

- **公開契約**: 要件doc / Issue番号・URL → req-save → spec-save → case-open → case-run → case-close を順次自走しマージまで完了。明示指定時のみの追加入口（標準workflowの置換えではない）。
- **主要処理段階**: Step 1 入力解決（JST 開始時刻記録）→ Step 2 work_type 読取（参考）→ Step 3 工程分岐（artifact_actions 動的判定 / auto_gate preflight）→ Step 4 各工程実行（委譲起動 / case-run インライン / orchestration stage モデル / Wave 反復）→ Step 5 工程間状態引き継ぎ → Step 6 複数REQ対応 → Step 7 停止条件検出（11項目）→ Step 7-1 停止理由分類 → 経路H adversarial-review 停止伝播 → bounded parent decision resolution → Step 8 完了報告（L1 タイムスタンプ + 4次元集約 + OU処理ループ）。
- **分岐**: 入力モード（Issue番号/URL vs 要件doc 4パターン）、artifact_actions ベース分岐（req-save/spec-saveスキップ可）、Epic Wave 反復（子Issue並列最大5件、直接制御 AG-003）、Standard flow vs Epic Issue flow、停止条件11項目、停止理由分類（7軸 + 上位合意矛盾/新規ユーザー判断）、コンフリクト Level 1/2/3 エスカレーション、経路H user-decision-required、bounded parent decision resolution（自律解決/作業仮定/上位合意矛盾/新規ユーザー判断）、delegation-unavailable。
- **副作用**: req-save/spec-save/case-open/case-close の各委譲起動、case-run インライン実行（実行担当サブエージェント委譲を含む）、GitHub Issue/PR/comment/merge/close（自走対象 G04）、remote branch 削除（自作branch限定 G05）、docs/ 更新（G06）。DB migration実行/deploy/apply/外部SaaS/認証は対象外（G02/G03）。Epic Issue 本文への直接書込はしない（G16、case-close 単一書き手）。
- **HITL**: Step 7 停止条件（11項目）、経路H user-decision-required 待機、bounded parent decision resolution の上位合意矛盾/新規ユーザー判断、draft 0件時の req-define 実行要求。
- **並列性**: orchestration stage モデル（stage 1 case-open 直列 / stage 2 case-run bg task 最大5件 / stage 3 case-close 直列集約）。OU 間は必須依存で結合した群は順次、必須依存なし群は並列。3つの「5件」文脈の区別（Wave 内子Issue/Phase 2 同時起動/execution_unit 全体）。順次フォールバック可能（G32）。bg task 破棄検知時の3状態回復。
- **resume**: 入力解決結果、各工程の起動結果（Issue/PR番号）、RU パス、capture 対象情報、`case_auto_started_at`、L1 工程別タイムスタンプ、orchestration stage 別結果、bg task 状態、結果状態4次元。
- **durable state**: 各工程の永続成果物（REQ/Decision/SPEC/Issue/PR/RU削除）、`case_auto_started_at`、L1 タイムスタンプ内訳、Epic Issue ステータステーブル（case-close が書込、case-auto は読取のみ）。
- **Harness依存**: bg task API（最大5件）、subagent 起動（委譲工程）、context 管理（親コンテキスト非累積 G28）、タイムスタンプ計測（L1）、委譲起動判定、bg task 破棄検知・状態別回復、インライン case-run 実行、拡張読込。
- **Capability依存**: `agentdev-workflow-orchestration`、`agentdev-case-run-execution-adapter`、`agentdev-git-worktree`、各工程の Capability Skill を継承（req-save/spec-save/case-open/case-run/case-close の依存スキル群）、`agentdev-adversarial-review`（経路H 伝播受領、直接起動しない）、`agentdev-project-extensions`。
- **内部workflow候補**: orchestration workflow（Step 3-6 + stage モデル + Wave 反復）、bounded parent decision resolution workflow（decision_context 解決）、コンフリクト解消 Level 2/3 workflow（インライン case-run 再実行 + オーケストレーション級判断）、停止理由分類workflow（Step 7-1）。これらは case-auto 固有の orchestration として Workflow Skill 抽出の有力候補。bounded parent decision resolution と Wave 反復制御は Capability Skill 候補。

### `/agentdev/intake-capture`

- **公開契約**: 手動入力 → `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md`（推奨標準形、frontmatter/状態値非必須）。保存専用、Issue 作成・採否判断はしない。
- **主要処理段階**: Step 1 入力受領 → Step 2 intake item 生成（推測補完禁止）→ Step 3 ファイル名生成（3-1 実行前同期）→ Step 4 保存（4-1 commit/push）→ Step 5 完了報告。
- **分岐**: セクション省略（推測不能時）、同名ファイル連番付与、git pull/push 失敗時の構造化エラー停止。
- **副作用**: `.agentdev/intake/inbox/` への保存、`.agentdev/intake/` 配下の commit/push（`chore(agentdev): capture intake item`）。他ディレクトリ保存禁止（G12）。Issue/PR 作成・採否・review・整形は禁止。
- **HITL**: なし（保存専用、G11 でユーザー入力を過度に解釈しない）。
- **並列性**: 持たない（単一 item 保存）。
- **resume**: intake item ファイル（日付+topic-slug）、git 変更状態。
- **durable state**: `.agentdev/intake/inbox/*.md`、commit hash、push 成否。
- **Harness依存**: git（pull/commit/push、並列実行安全ステージング）、拡張読込。
- **Capability依存**: `agentdev-git-worktree`（ドメイン状態永続化プロシージャ）、`agentdev-workflow-orchestration`（Split Rule 参照）、`agentdev-project-extensions`。
- **内部workflow候補**: 持たない（単純保存ワークフロー、Workflow Skill 抽出対象外）。

### `/agentdev/intake-from-github`

- **公開契約**: 期間指定 / Issue・PR番号 → `.agentdev/intake/inbox/*.md`（候補ごと1ファイル）+ 抽出サマリーレポート。保存専用。
- **主要処理段階**: Step 1 期間解釈 → Step 2 データ取得（gh CLI）→ Step 3 構造的検出 → Step 4 LLM 全文解析 → Step 5 item 生成（5-1 実行前同期）→ Step 6 保存（6-1 commit/push）→ Step 7 サマリーレポート → Step 8 完了報告。
- **分岐**: 期間指定 vs 番号指定、候補0件、同名ファイル連番、git pull/push 失敗時停止。
- **副作用**: `.agentdev/intake/inbox/` への保存、`.agentdev/intake/` 配下 commit/push（`chore(agentdev): capture intake items from github`）。オープン中 Issue/PR は対象外（G10）、GitHub API 直接呼出不可（G09）。
- **HITL**: なし（抽出・保存専用、サマリーレポートでユーザー確認）。
- **並列性**: データ取得・LLM 解析は複数 Issue/PR を横断するが case-auto のような明示的並列モデルは持たない。
- **resume**: 対象期間、対象 Issue/PR 一覧、抽出候補、保存ファイル一覧。
- **durable state**: `.agentdev/intake/inbox/*.md`、抽出サマリー、commit hash。
- **Harness依存**: gh CLI（agentdev-gh-cli 経由）、LLM 全文解析、git、拡張読込。
- **Capability依存**: `agentdev-intake-pipeline`、`agentdev-gh-cli`、`agentdev-git-worktree`、`agentdev-project-extensions`。
- **内部workflow候補**: GitHub 抽出workflow（期間解釈→データ取得→構造的検出→LLM 解析→item 生成）。抽出アルゴリズムとキーワードリストは Capability Skill 候補（既に `agentdev-intake-pipeline` が所有）。

### `/agentdev/intake-promote`

- **公開契約**: `.agentdev/intake/inbox/*.md` + ユーザーコンテキスト → `.agentdev/intake/promoted/*.md`（採用）+ 分類結果レポート。review/分類/整形を行い Issue 作成はしない。
- **主要処理段階**: Step 1 inbox確認 → Step 2 item読込 → Step 3 review/評価 → Step 4 分類提示（4a 経路C adversarial-review 発動条件判定 / 4b review 呼出）→ Step 5 ユーザー確認（分類確定後 自動実行 REQ）→ Step 6 採用item整形 → Step 7 promoted保存 → Step 8 振り分け → Step 9 実行前同期 → Step 10 commit/push → Step 11 完了報告。
- **分岐**: inbox 空、分類3値（採用/保留/却下）、adversarial-review skip（1件で自明/inbox空）、ユーザー明示指定時の必須発動、破壊的変更の明示承認維持（G18）、`accepted/` 廃止（G13/G14）、採用item inbox削除（G17）/reject item 即時削除（G19）。
- **副作用**: `.agentdev/intake/promoted/` 保存、採用item の inbox 元ファイル削除、reject item の即時削除（commit message に却下理由）、`.agentdev/intake/` 配下 commit/push。Issue 作成・backlog-review 自動起動はしない（G01/G03）。
- **HITL**: Step 5 ユーザー確認（分類確定、明示承認 G06/G07/G08）、破壊的変更の別承認（G18）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（対話的 review、親エージェントが集約）。
- **resume**: inbox item 一覧、暫定分類、ユーザー承認状態、分類確定状態。
- **durable state**: `.agentdev/intake/promoted/*.md`、inbox 削除状態、分類結果レポート、commit hash。
- **Harness依存**: subagent 起動（item 読込・整形案・review）、git（pull/commit/push、並列実行安全ステージング）、`agentdev-adversarial-review`（経路C）、拡張読込。
- **Capability依存**: `agentdev-intake-pipeline`、`agentdev-git-worktree`、`agentdev-adversarial-review`（経路C）、`agentdev-project-extensions`。
- **内部workflow候補**: review/分類workflow（Step 2-5 + 経路C）、採用item整形+保存+振り分けworkflow（Step 6-8）。分類ロジック（採用/保留/却下）は Capability Skill 候補（`agentdev-intake-pipeline` が所有）。

### `/agentdev/learning-promote`

- **公開契約**: `.agentdev/learning/inbox.md`（必須）+ `deferred.md`（任意） → `.agentdev/learning/promoted/{category}-{name}.md` + evaluation-report.md + deferred.md 追記 + inbox.md クリア。`.opencode/` 直接反映禁止、必ず backlog-review 経由。
- **主要処理段階**: Step 1 inbox読込 → Step 2 deferred読込 → Step 3 正規化 → Step 4 問題クラス分類 → Step 5 8軸評価 → Step 6 evaluation-report生成 → Step 7 廃棄判定（11カテゴリ+duplicate、昇華可能性評価）→ Step 8 既存対策確認 → Step 8-R1 経路D adversarial-review 発動条件判定 → Step 8-R2 review 呼出（Step 6 戻しループ）→ Step 9 判定結果提示 → Step 10 ユーザー承認 → Step 11 実行前同期 → Step 12 採用済み成果物生成 → Step 13 deferred移動（原子的）→ Step 14 昇華時prune → Step 15 commit/push → Step 16 完了報告。
- **分岐**: inbox 空、エントリ0件、廃棄判定13パターン、昇華可能性（無条件自動REQ化禁止 G10）、living pool 維持（deferred）、adversarial-review skip（1件重複確実/inbox空）、Step 6 戻しループ（review 反映時）、prune 対象/非対象、git pull/push 失敗停止。
- **副作用**: `.agentdev/learning/promoted/` 保存、`.agentdev/learning/evaluation-report.md` 生成/更新、`.agentdev/learning/deferred.md` 追記（原子的操作）、`.agentdev/learning/inbox.md` クリア、prune、`.agentdev/learning/` 配下 commit/push（明示パス、`chore(agentdev): promote learning findings`）。`.opencode/` 直接書込禁止（G01）、case-run への直接受け渡し禁止（G03）。
- **HITL**: Step 9-10 判定結果確認・修正・承認（判断確定 REQ）、Step 14 prune は Step 10 承認と同時に承認済み（自動実行 REQ）、破壊的変更の明示承認（G09）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（inbox エントリを順次評価、原子的操作で inbox/deferred を一括処理）。
- **resume**: inbox.md エントリ、deferred.md living pool、evaluation-report.md、廃棄判定結果、ユーザー承認状態。
- **durable state**: `.agentdev/learning/promoted/*.md`、`evaluation-report.md`、`deferred.md`、`inbox.md`（ヘッダーのみクリア）、commit hash。
- **Harness依存**: LLM 推論（8軸評価・廃棄判定）、subagent 起動（`agentdev-adversarial-review` 経路D）、git（pull/commit/push、並列実行安全ステージング）、原子的ファイル操作、拡張読込。
- **Capability依存**: `agentdev-learning-pipeline`（8軸評価/廃棄判定/既存対策照合）、`agentdev-learning-capture`（参照）、`agentdev-git-worktree`、`agentdev-adversarial-review`（経路D）、`agentdev-project-extensions`。
- **内部workflow候補**: 正規化/評価workflow（Step 3-8 + 8軸スコアリング）、廃棄判定+昇華可能性評価workflow（Step 7）、HITL+prune+永続化workflow（Step 9-15）。8軸評価ロジックと廃棄判定カテゴリは Capability Skill 候補（`agentdev-learning-pipeline` が所有）。

### `/agentdev/backlog-review`

- **公開契約**: `.agentdev/{intake,learning,inspect}/promoted/*.md` → `.agentdev/backlog/req-units/RU-*.md` + 成功成果物削除。ユーザー承認後に RU を生成（承認は RU 作成承認を兼ねる）。
- **主要処理段階**: Step 1 実行前同期 → Step 2 成果物検出（引数なし/あり）→ Step 3 読込+分析+暫定分類付与 → Step 4 統合/分割判定+depends_on依存解決（4-1 経路E adversarial-review）→ Step 5 矛盾検出+追加判断 → Step 6 RU生成（session由来RU含む）→ Step 7 成功成果物削除 → Step 8 Git永続化 → Step 9 完了報告。
- **分岐**: 成果物0件（正常終了）、引数指定、統合/分割判定、depends_on 依存解決、矛盾検出（partial success）、session由来RU（二段階承認）、adversarial-review skip（RU構成要素1件）、ユーザー明示指定時必須発動、矛盾なしの単一承認（REQ-015-008）。
- **副作用**: `.agentdev/backlog/req-units/RU-*.md` 生成、成功成果物の削除、`.agentdev/` 配下 commit/push（明示パス、`chore(agentdev): generate requirement units via backlog-review`）。REQ ファイル保存（G01）/Issue 作成（G02）/inbox・deferred 更新（G04）は禁止。矛盾の自動解決はしない（G05）。
- **HITL**: Step 4 後半ユーザー承認（構成案）、Step 5 矛盾検出時の追加判断（partial success）、Step 6 RU 生成承認（矛盾なければ Step 4 と単一承認）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（対話的 review、親エージェントが集約）。
- **resume**: 成果物検出結果、RU 構成案、統合/分割判定、depends_on 解決結果、矛盾検出結果、ユーザー承認状態。
- **durable state**: `.agentdev/backlog/req-units/RU-*.md`、promoted 削除状態、commit hash。
- **Harness依存**: LLM 推論（統合/分割/矛盾検出）、subagent 起動（`agentdev-adversarial-review` 経路E）、git（pull/commit/push、並列実行安全ステージング）、拡張読込。
- **Capability依存**: `agentdev-backlog-integration`、`agentdev-git-worktree`、`agentdev-adversarial-review`（経路E）、`agentdev-project-extensions`。
- **内部workflow候補**: 統合/分割判定workflow（Step 4 前半）、矛盾検出workflow（Step 5）、RU生成+削除+永続化workflow（Step 6-8）。統合/分割判定基準と depends_on 依存解決ルールは Capability Skill 候補（`agentdev-backlog-integration` が所有）。

### `/agentdev/inspect-docs`

- **公開契約**: なし（全対象成果物を自動スキャン） → 診断結果（セッション内 + `.agentdev/inspect/inbox/inspect-docs-finding-*.md`）。診断専用、検査対象を直接修正しない。
- **主要処理段階**: Step 1 スキャン対象収集 → Step 2 REQ参照ID整合性 → Step 3 第一参照導線 → Step 4 現行/廃止/世代境界 → Step 5 SPEC意味診断 → Step 6 Decision意味診断 → Step 7 guides意味診断 → Step 8 README索引診断 → Step 9 REQ structure review（6観点）→ Step 10 文書分類一貫性検査 → Step 11 配布物整合性検査 → Step 12 docs-check route判定 → Step 13 未処理artifact確認 → Step 14 検出事項出力 → Step 15 実行前同期 → Step 16 commit/push → Step 17 完了報告。
- **分岐**: スキャン対象ディレクトリ存在/不存在、ファイル読込失敗、source-of-truth priority（現行REQ > 承認済みADR > SPEC > guides）、NG分類（false positive/pre-existing/今回修正対象）、inspect-* routing（docs vs skills vs 両方）。
- **副作用**: `.agentdev/inspect/inbox/inspect-docs-finding-*.md` 生成、`.agentdev/inspect/` 配下 commit/push（`chore(agentdev): capture inspect-docs finding`）。ファイル変更/作成/削除（G01 例外除く）、Issue/PR 作成（G02）、worktree（G03）、intake/learning/RU（G04）は禁止。
- **HITL**: なし（診断専用、検出事項を提示するのみ）。source-of-truth priority は機械的（G05）。
- **並列性**: 明示的並列モデルは持たない（全対象スキャン、検査項目は順次）。
- **resume**: スキャン対象一覧、検出事項リスト、source-of-truth 判定結果、NG分類。
- **durable state**: `.agentdev/inspect/inbox/inspect-docs-finding-*.md`、commit hash。
- **Harness依存**: LLM 推論（意味診断）、subagent 起動（`agentdev-req-structure-diagnostics` 等）、git、拡張読込。
- **Capability依存**: `agentdev-req-structure-diagnostics`、`agentdev-doc-diagnostics`、`agentdev-doc-writing`（参照）、`agentdev-git-worktree`、`agentdev-project-extensions`。
- **内部workflow候補**: docs 横断診断workflow（Step 1-13 + 6観点 review + 文書分類検査 + 配布物整合性）。診断カテゴリの routing と検査ロジックは Capability Skill 候補（`agentdev-doc-diagnostics`/`agentdev-req-structure-diagnostics` が所有）。

### `/agentdev/inspect-skills`

- **公開契約**: Command/Skill 定義ファイル群 → 診断レポート（セッション内 + `.agentdev/inspect/inbox/inspect-skills-finding-*.md`）。診断専用、検査対象を直接修正しない。
- **主要処理段階**: Step 1 診断対象読込 → Step 2 各診断観点評価（`agentdev-inspect-skills`）→ Step 3 配布物構文健全性・責務整合診断 → Step 4 分類（NG分類表）→ Step 5 route提示 → Step 6 検出事項出力 → Step 7 実行前同期 → Step 8 commit/push → Step 9 完了報告。
- **分岐**: 対象ファイル存在/不存在、参照先 Skill 存在/不存在、source-of-truth、NG分類、inspect-* routing、自動修正しない（G05）。
- **副作用**: `.agentdev/inspect/inbox/inspect-skills-finding-*.md` 生成、`.agentdev/inspect/` 配下 commit/push（`chore(agentdev): capture inspect-skills finding`）。ファイル変更/削除（G01例外）、Issue/PR（G02）、RU/intake/learning/backlog（G03）、branch/worktree（G04）は禁止。
- **HITL**: なし（診断専用、推奨 route の提示に留める G05）。
- **並列性**: 明示的並列モデルは持たない。
- **resume**: 診断対象一覧、検出事項リスト、診断分類ラベル、推奨 route。
- **durable state**: `.agentdev/inspect/inbox/inspect-skills-finding-*.md`、commit hash。
- **Harness依存**: LLM 推論（構文健全性・責務整合診断）、git、拡張読込。
- **Capability依存**: `agentdev-inspect-skills`、`agentdev-git-worktree`、`agentdev-project-extensions`。
- **内部workflow候補**: 参照妥当性診断workflow（Step 1-2）、配布物構文健全性・責務整合診断workflow（Step 3、docs-spec-rebuild-integrity 検査パターン）。診断観点（粒度・段階的開示・責務境界・canonical name・内部構造依存）は Capability Skill 候補（`agentdev-inspect-skills` が所有）。

### `/agentdev/inspect-promote`

- **公開契約**: `.agentdev/inspect/inbox/*.md` + `--auto`（省略可） → `.agentdev/inspect/promoted/*.md`（手動 promote）/ `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時）/ `auto-promote-log.md`（append-only）。分類・採用を行い Issue 作成はしない。
- **主要処理段階**: Step 1 実行前同期 → Step 2 inboxスキャン → Step 3 検出事項分類（promote/defer/reject）→ Step 4 自動 promote（`--auto` opt-in 時）→ Step 4-1 経路B adversarial-review 発動条件判定 → Step 4-2 review 呼出 → Step 5 HITL確定（手動分類対象）→ Step 6 promote処理 → Step 7 reject処理（即時削除）→ Step 8 defer処理（残置）→ Step 9 完了報告 → Step 10 commit/push。
- **分岐**: inbox 空（終了）、`--auto` opt-in 有無（fast path vs 手動分類）、自動 promote 対象カテゴリ（安定契約例外・否定文脈除外）、adversarial-review skip（`--auto` 経路/手動0件）、ユーザー明示指定時必須発動、reject 即時削除（`archive/rejected/` 廃止）、defer 残置、ユーザー全件 defer、promote/defer/reject/intake-or-learning 送付推奨。
- **副作用**: `.agentdev/inspect/promoted/*.md` 保存、`.agentdev/intake/promoted/inspect-auto-*.md` 投入（`--auto`）、`.agentdev/inspect/promoted/auto-promote-log.md` 更新（append-only）、promote inbox 削除、reject 即時削除（commit message に却下理由）、defer 残置、`.agentdev/inspect/`+`.agentdev/intake/` 配下 commit/push（`chore(agentdev): promote inspect findings`）。
- **HITL**: Step 5 HITL 確定（手動分類対象、`--auto` 対象外）、adversarial-review unresolved 判断事項。
- **並列性**: 持たない（対話的 review、`--auto` fast path は一括処理）。
- **resume**: inbox 検出事項一覧、暫定分類、`--auto` 実行ログ、HITL 承認状態。
- **durable state**: `.agentdev/inspect/promoted/*.md`、`.agentdev/intake/promoted/inspect-auto-*.md`、`auto-promote-log.md`、inbox 削除状態、commit hash。
- **Harness依存**: LLM 推論（分類）、subagent 起動（`agentdev-adversarial-review` 経路B）、git（pull/commit/push）、拡張読込。
- **Capability依存**: workflow-contracts SPEC（自動 promote 対象カテゴリ、extension 経由）、`agentdev-git-worktree`、`agentdev-adversarial-review`（経路B）、`agentdev-project-extensions`。
- **内部workflow候補**: 分類workflow（Step 3 + promote/defer/reject）、`--auto` fast path workflow（Step 4 + カテゴリマッチング + 自動投入）、HITL+永続化workflow（Step 5-10）。自動 promote 対象カテゴリと誤検知 revoke 手順は Capability Skill 候補（workflow-contracts SPEC が所有）。

### 横断観察（Cross-cutting observations）

- **共通 Harness 依存**: 全 Command が `agentdev-git-worktree`（並列実行安全ステージング、ドメイン状態永続化）、`agentdev-project-extensions`（5セクション読込、fail-open）、`agentdev-conventional-commits`（commit message）に依存する。これらは Capability Skill として横断抽出済み。
- **共通 Capability Skill**: `agentdev-gh-cli`（gh CLI I/O 境界、Windows encoding 初期化）は case-open/case-run/case-close/case-update/case-auto/intake-from-github が利用。REQ/Decision/SPEC 系は `agentdev-{req,decision,spec}-file-manager` + `agentdev-artifact-validation`（決定的スクリプト）に集約。
- **adversarial-review 経路**: 7経路が Command 定義に挿入境界を持つ（経路A req-define / B inspect-promote / C intake-promote / D learning-promote / E backlog-review / F case-open / G case-run adapter 内）。case-auto は経路H で停止伝播のみ受領（直接起動しない）。全経路で default-on + skip policy + 呼出失敗時従来フロー維持が共通（REQ-015-002/003、REQ-014-010）。
- **resume と durable state**: 全 Command が GitHub Issue/PR（公開状態）と `.agentdev/`（ドメイン状態）を durable state とする。draft/RU/promoted/inbox/deferred/RU/REQ/Decision/SPEC が工程間引き継ぎの権威情報源。会話コンテキストは権威情報源としない（DEC-011 原則、`status` frontmatter + commit hash 検証で再開点を再構成）。
- **HITL 密度**: req-define（壁打ち・Scale協議・SPLIT提案）、case-open（execution contract・preflight）、intake-promote/learning-promote/backlog-review（分類承認）、inspect-promote（手動分類確定）が高 HITL。case-run/case-close/intake-capture/intake-from-github/inspect-docs/inspect-skills は低 HITL（委任・診断・保存専用）。case-auto は停止条件11項目と bounded parent decision resolution で本質的 HITL に集約。
- **並列性の集中**: 並列実行モデルを持つ Command は req-save（3フェーズ分離）、spec-save（異なる target で最大5件）、case-open（子Issue 作成最大5件）、case-run（Epic Wave 最大5件）、case-auto（orchestration stage 2 最大5件、execution_unit 全体は上限なし）、case-close（Epic Wave 準並列化）。3つの「5件」文脈の区別を要する（epic-wave-model SPEC）。それ以外は単一ワークフロー。
- **内部workflow候補の分布**: case-open（execution_unit 構成・Epic flow・Standard flow・execution contract 確定・クリーンアップ）、case-close（PRマージ・QG-4 達成判定・SPEC確定・Capture回収・Epic Wave クローズ）、case-auto（orchestration・bounded parent decision resolution・コンフリクト解消 Level 2/3・停止理由分類）が Workflow Skill 抽出の有力候補。req-define（壁打ち・照合・要件展開・Decision判断）、req-save/spec-save（保存3フェーズ）、intake-promote/learning-promote/backlog-review（review/分類ワークフロー）、inspect-docs（診断カタログ）も抽出候補。intake-capture/intake-from-github/case-update/inspect-skills/inspect-promote は単純または既存 Capability Skill でカバーされており抽出優先度低。
- **Capability Skill 候補**: 全 Command 共通の git/gh I/O・決定的スクリプト・並列ステージング・target_area マッチング・8軸評価・廃棄判定カテゴリ・統合分割判定基準・自動 promote カテゴリ・adversarial-review 共通契約は既存 Capability Skill 群が所有。新規 Capability Skill 抽出の余地は test strategy 定義（req-define Step 5-6）、EC-2 必須品質統制導出（case-open）、EC-6 scope-affecting impact 探索（case-open）、コンフリクト Level 1 解消判断、SPEC status 昇格判断、bounded parent decision resolution、Wave 反復制御あたり。

## 代表ケース検証（REQ-027-003、DEC-010/011）

新 workflow model（STEP reference, resume point, Input Resolution, durable state）の妥当性を代表ケース4種で検証した結果（REQ-027-003）。検証基準は workflow-skill-model SPEC、step-reference-contract SPEC、input-resolution-and-durable-state SPEC、DEC-010/011。

### 検証対象と結果

| 代表ケース | 検証対象の性質 | 結果 | 備考 |
|---|---|---|---|
| case-run / case-auto | orchestration・resume・single/Epic Wave・parallelism・compaction | pass | Workflow Skill（`agentdev-workflow-orchestration`、`agentdev-workflow-case-auto`）が STEP model を所有。durable state、Input Resolution、並列child task 復元、3つの「5件」文脈の区別、compaction 復元契約を明示 |
| req-define | interactive / HITL / loop を持つ workflow | pass with observations | `agentdev-req-analysis` Capability Skill は STEP model 連携を明示。command 本体は workflow 実装を直接所有（Workflow Skill 抽出は候補）。interactive 壁打ちセッションは harness 固有領域、ドラフト保存（Step 10）後の再開は durable state から復元可能 |
| req-save / spec-save | deterministic mutation / verification / commit を持つ workflow | pass with observations | 決定的スクリプト呼出（REQ番号採番、target_area 検索、`check-change-impact`）、QG-1、targeted docs guard、変更範囲検証を各所で実施。Capability Skill（`agentdev-req-file-manager`、`agentdev-spec-file-manager`、`agentdev-artifact-validation`）は STEP model 連携を明示。command 本体は workflow 実装を直接所有（Workflow Skill 抽出は候補） |
| intake-promote | classification / review / approval / irreversible action 境界を持つ workflow | pass with observations | 分類3値（採用/保留/却下）、adversarial-review 経路C、ユーザー承認（G06/G07/G08）、破壊的変更別承認（G18）、REQ-014-009 不可逆処理停止、分類承認後の自動実行（REQ）が明確。Capability Skill（`agentdev-intake-pipeline`）へ STEP model 連携セクションを付与済み（本 Issue で修正）。command 本体は workflow 実装を直接所有（Workflow Skill 抽出は候補） |

### capture-only 型・read-only-diagnostic 型の除外（Issue 完了条件）

capture-only 型（`learning-capture` スキル等）、read-only-diagnostic 型（`inspect-docs`、`inspect-skills` 等）は resume point / export / import を持たないため STEP model 対象外とし、代表ケースから除外した（Issue 補足情報「capture-only型・read-only-diagnostic型の除外」参照）。

### 検証で発見された問題と修正内容

1. **case-auto Workflow Skill 名の不一致**（Epic #2060 Wave 3 残課題）: PR #2071 と #2072 で case-auto Workflow Skill 名が不一致（`agentdev-workflow-case-auto` と `agentdev-workflow-auto-orchestration`）だった。新アーキテクチャ（DEC-010/011/012 準拠、references 分割、Capability Skill 連携、skill extension 契約）に合致する `agentdev-workflow-case-auto` を正とし、`agentdev-workflow-auto-orchestration` を削除。case-auto.md command の参照11箇所を更新。
2. **case-auto.md の節参照の不正確さ**: case-auto.md から新SKILL.md への節名参照3箇所（`「adversarial-review 停止伝播（経路H）」節`、`「bounded parent decision resolution」節`、`「コンフリクト解消モデル（3レベルエスカレーション）」節`）が、新SKILL.md の構造（references 配下の STEP 別 reference ファイル）と不一致だった。各参照を `references/stop-and-decision-resolution.md`（STEP-5/6）、`references/conflict-resolution-and-reporting.md`（STEP-7）へ修正。
3. **`agentdev-intake-pipeline` SKILL.md の STEP model 連携セクション欠落**: 他の Capability Skill（`agentdev-req-analysis`、`agentdev-req-file-manager`、`agentdev-case-run-execution-adapter`）は STEP model 連携セクションを持つが、`agentdev-intake-pipeline` は持たなかった。SKILL.md へ STEP model 連携セクションを追記し、durable state、Input Resolution の扱いを明示。

### 結論

代表ケース4種全てで新 workflow model が成立する。command が workflow 実装を直接所有するケース（req-define、req-save、spec-save、intake-promote）は Workflow Skill 抽出候補として位置付けられ、Capability Skill 側が STEP model 連携を担うことで部分的 STEP model 適用を許容する。Workflow Skill 抽出済みの case-open/case-close/case-auto/case-run は完全 STEP model 適用で整備済み。

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは SPEC ファイルに依存しない（REQ-001）。

## See Also

- [README.md](../README.md)（SPEC インデックス（3 層構造））
- [workflows/](../workflows/)（横断ワークフロー契約）
- [commands/](../commands/)（command SPEC）
- [skills/](../skills/)（skill SPEC）
