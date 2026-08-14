---
description: 単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。worktree前提、委譲、結果処理を責務とする。3フェーズ構成でべき等性、再開ポイントを提供
---

# 実装パイプライン

Case に対して実装実行を実行担当サブエージェント経由で委譲し、その result を処理する。case-run 本体は orchestration に専念し、実装実行そのものは行わない。常に git worktree を使用

**スコープ**: case-run は単一 Issue または単一 Wave を処理する。Epic 全体（複数 Wave）の処理、Wave 境界（PR マージ）は case-close の責務であり、case-run は扱わない。1 Wave の実行（PR作成まで）で return する。複数 Issue の一括実行、Wave 順序制御にまたがるオーケストレーションは case-auto の責務（workflow-contracts SPEC SC-{NNN}、extension 経由で解決）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-run.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号またはURL（要件doc埋め込み済み）— 単一 Issue 実行モード
- Epic Issue番号またはURL（Epic Wave 実行モード、`case-run #epic`）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-run` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。同スキルは単一 Issue 実行（single workflow）と Epic Wave 実行（epic-wave workflow）を1:N に分離した control plane を所有し、実行契約差異（target cardinality / parallelism / fan-out・fan-in / child task recovery / partial result / Wave-level completion）を明示的に扱う。

### Phase single（単一 Issue 実行モード）

3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。フェーズ間エラー時は再開判定 STEP から再開できる:

- **STEP-S1** フェーズ判定・再開ポイント検出 — 実行モード分岐、引き継ぎ停止判定
- **STEP-S2** Issue 抽出・確認・判定 — execution contract 消費境界適用
- **STEP-S3** Worktree 作成・ブランチ準備・前置 gate 群 — precondition gate、QG-{N} 前置 staleness check、targeted docs guard、配布依存境界 事前チェック、L2 計測
- **STEP-S4** 実行担当サブエージェント委譲 — adapter protocol、経路G（委譲内 adversarial-review）、L2 計測
- **STEP-S5** result 処理・配布依存境界 最終 gate — result 4状態処理、Step 7-1 相当 gate
- **STEP-S6** worktree クリーンアップ確認・完了報告 — L2 内訳含む

### Phase epic-wave（`case-run #epic` 受領時）

現在 ready な Wave の子Issue を並列実行（最大5件、3つの「5件」文脈の (1)）。1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。同一コマンド再実行で次 Wave に進む（べき等、Epic Issue 本文から進行状況判定）:

- **STEP-W1** Epic Issue 解析・Wave 選択 — 入力ソース無区別（本来の Epic flow + Standard flow 起因の独立 OU 自動 Epic 化）
- **STEP-W2** fan-out 準備 — `git fetch origin`、子Issue worktree 群、前置 gate 群適用
- **STEP-W3** fan-out 並列委譲 — 最大5件、子Issue ごとに STEP-S4 と同一委譲契約
- **STEP-W4** fan-in・結果集約 — partial result 保持、child task recovery、compaction 復元
- **STEP-W5** Wave 完了報告・return — result 状態別一覧

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）、実行契約差異表、使用検査ツール（check_changed_docs.ts / check_extensions.ts / check_distribution_boundary.ts / test_strategy）、エラー処理、テスト戦略（TS）標準手順は `agentdev-workflow-case-run` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

### Step 7-1: 配布依存境界の最終変更経路 gate（実装後）

result が `completed-pr` の場合、worktree クリーンアップに進む前に、実装後の実際の worktree HEAD に対して配布依存境界の最終 gate を行う（実装担当サブエージェントが追加した変更も含めて検査する）。

- **実行条件**: result が `completed-pr` であり、PR 対象ファイルに `src/opencode/{commands,skills}/**` 変更を含む場合。当該変更を含まない PR（docs のみ等）ではスキップする
- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`。現在の worktree（実装後 HEAD）の配布物ソースツリーを検査する
- **検出結果の分類**: 検査エラー（読込不能、未分類エントリ、adapter 起動失敗）は全て gate-not-passed として扱う。clean として通過させない
- **違反検出時の停止契約**（adapter result `blocked` とは区別）: 違反検出時は PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録し、クリーンアップへ進まず case-run を停止する。adapter result は `completed-pr` のまま変更せず、adapter result 契約の `blocked`（Issue コメント SSoT を伴う blocker）へ上書きしない。next action は同一 Issue で case-run を再実行し違反を修正する（worktree+ブランチ存活時は委譲 STEP から再開、べき等）。case-close へは進めない（case-close 側で同一 gate が停止するため前段で停止する）

手続きの詳細は `agentdev-workflow-case-run` スキル（references/delegation-and-result.md の STEP-S5）を参照する。

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-run` が所有する。同 Workflow Skill は `/agentdev/case-run` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## ガードレール

### orchestration、委譲境界
- G01: 壁打ち禁止（構造的実行フェーズ、実装は実行担当サブエージェント経由）
- G02: 実装で判明した制約はREQを黙って変更せず、実行担当サブエージェントが乖離として報告しユーザー承認後に反映
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号解決に Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等の open issue 一覧取得は禁止
- G10: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G11/G22/G23/G32: case-run は単一 Issue または単一 Wave（Epic 指定時: 現在 ready な Wave の子Issue を並列実行、最大5件）のみを処理。Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない（Wave 境界は case-close の責務）。実装実行を実行担当サブエージェントへ委譲し、自ら work plan生成、実装、乖離検出、specs更新、PR作成を行わない（adapter protocol は `agentdev-case-run-execution-adapter` 参照）。実行担当サブエージェント result の4状態（completed-pr/blocked/failed/delegation-unavailable）は `agentdev-case-run-execution-adapter` の result 契約に従い、成功成果は PR 作成。Epic Wave 実行モードでは1 Wave のみ実行し PR 作成で return する
- G24: 完了条件チェックボックスの評価、更新は case-close QG-{N} の責務。case-run、実行担当サブエージェントは完了条件チェックボックスを更新しない
- G25: blocked/ failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。一時会話コンテキスト、中間ファイルは SSoT としない
- G26/G29: 外部実行ハーネスの plan artifact 等の中間成果物を AgentDevFlow の永続成果物として扱わず、内部構造に依存した処理・検証を行わない。最終結果は PR URL で受領する
- G30/G31: Step 6（実行担当サブエージェント起動）の前に worktree+ブランチが作成済みであることを Step 5-2 precondition gate で検証すること。未作成時・メインリポジトリにいる場合は実行担当サブエージェントを起動禁止。実行担当サブエージェントへの引き渡しで worktree root（相対パス、`.worktrees/{N}-{type}/`）を必ず含め、メインリポジトリパスを渡さないこと
- G33/G34/G35: case-run は実装作業開始前に QG-{N} 前置 staleness check（ファイルパス現行存在確認、検査結果件数再計測）を実行（REQ、QG-{N} 本体とは独立、QG-{N} deviation 分類運用を変更しない）。差異検出時は検出結果を Step 6 委譲プロンプトで実行担当サブエージェントに引き渡し、PR 本文の `## Findings / Capture候補` に `### stale-reference` 小見出しで記録（実行担当サブエージェント責務）。case-update へ連携し、case-run は Issue 本文を単独で書き換えない（case-update の責務）

### 本筋外発見の退避方針

intake/ learning 境界は `agentdev-workflow-orchestration`（capture-boundaries）を参照。実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する

- G14: スコープ拡大禁止。発見は記録し修正は後続処理に委ねる
- G15/G16/G17/G21: intake 候補、learning 候補を区別して記録し混ぜた単一成果物にしない。`.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md` の直接変更禁止。capture 情報は PR 本文経由のみ case-close に引き継ぐ（capture 境界の詳細は `agentdev-workflow-orchestration` 参照、case-run の capture 責務は記録のみ）
- G27: SPEC確定候補（実装で発見された SPEC レベル詳細）は PR 本文の `## SPEC確定候補` セクションに記録し、`## Findings / Capture候補` とは混在させない。SPEC確定候補の確定、SPEC ファイルへの反映判断は case-close の責務
