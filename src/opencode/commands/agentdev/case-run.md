---
description: 単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。worktree前提、委譲、結果処理を責務とする。3フェーズ構成でべき等性、再開ポイントを提供
---

# 実装パイプライン

Case に対して実装実行を実行担当サブエージェント経由で委譲し、その result を処理する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない。
常に git worktree を使用

**スコープ**: case-run は単一 Issue または単一 Wave を処理する。
Epic 全体（複数 Wave）の処理、Wave 境界（PR マージ）は case-close の責務であり、case-run は扱わない。
1 Wave の実行（PR作成まで）で return する。
複数 Issue の一括実行、Wave 順序制御にまたがるオーケストレーションは case-auto の責務（workflow-contracts SPEC SC-{NNN}、extension 経由で解決）

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-case-run`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-case-run.yaml`、kind: workflow-extension）を読み込む（ADR）。
extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。
詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号またはURL（要件doc埋め込み済み）— 単一 Issue 実行モード
- Epic Issue番号またはURL（Epic Wave 実行モード、`case-run #epic`）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-run` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。
同スキルは単一 Issue 実行（single workflow）と Epic Wave 実行（epic-wave workflow）を1:N に分離した control plane を所有し、実行契約差異（target cardinality / parallelism / fan-out・fan-in / child task recovery / partial result / Wave-level completion）を明示的に扱う。

### Phase single（単一 Issue 実行モード）

3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。
フェーズ間エラー時は再開判定 STEP から再開できる。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-S1 フェーズ判定・再開ポイント検出 | Issue 指定あり | 実行モードと再開ポイントの確定 | durable state から再開点が再構成できていること |
| STEP-S2 Issue 抽出・確認・判定 | フェーズ判定済み | Issue 本文の要件doc・受け入れ基準 | Issue が実行可能状態（要件doc埋め込み済み）であること |
| STEP-S3 Worktree 作成・ブランチ準備・前置 gate 群 | Issue 判定済み | worktree・ブランチ・前置 gate 合格結果 | QG 前置 staleness check 通過、worktree 隔離が検証済みであること |
| STEP-S4 実行担当サブエージェント委譲 | 前置 gate 合格 | 委譲 result（4状態） | worktree root（相対パス）を引き渡し、result 契約に従って受領していること |
| STEP-S5 result 処理・配布依存境界 最終 gate | result 受領済み | result 処理結果・最終 gate 結果 | `completed-pr` 時は PR 番号・URL を確認、配布物変更を含む場合は最終 gate 通過であること |
| STEP-S6 worktree クリーンアップ確認・完了報告 | result 処理済み | クリーンアップ確認・完了報告 | worktree 残留がなく、結果状態が報告されていること |

### Phase epic-wave（`case-run #epic` 受領時）

現在 ready な Wave の子Issue を並列実行（最大5件、3つの「5件」文脈の (1)）。
1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。
同一コマンド再実行で次 Wave に進む（べき等、Epic Issue 本文から進行状況判定）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-W1 Epic Issue 解析・Wave 選択 | Epic Issue 指定あり | 対象 Wave と子Issue リスト | Epic Issue 本文のステータス追跡テーブルから ready Wave が特定できていること |
| STEP-W2 fan-out 準備 | Wave 選択済み | 子Issue ごとの worktree・ブランチ・委譲 prompt | 各子Issue の前置 gate が合格であること |
| STEP-W3 fan-out 並列委譲 | 準備完了 | 各子Issue の委譲 result（4状態、最大5件並列） | 全子Issue の委譲が result 受領済みであること |
| STEP-W4 fan-in・結果集約 | 全 result 受領済み | 集約結果（子Issue 状態別） | child task recovery（異常終了検知・復元）が処理済みであること |
| STEP-W5 Wave 完了報告・return | 集約完了 | Wave 完了報告（PR 作成で return） | 1 Wave の実行結果と次 Wave 案内が報告されていること |

**配布依存境界の最終変更経路 gate（実装後）**: result が `completed-pr` かつ PR 対象ファイルに `src/opencode/{commands,skills}/**` 変更を含む場合、worktree クリーンアップの前に実装後の worktree HEAD へ最終 gate を適用する（実行担当サブエージェントが追加した変更も含む。当該変更を含まない PR ではスキップする）。

- 実行コマンド: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`
- 違反検出時は PR 本文の `### distribution-boundary` 小見出しに記録して case-run を停止する。adapter result は `completed-pr` のまま `blocked` へ上書きしない。検出結果の分類、停止契約は `agentdev-workflow-case-run` スキルを参照

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-run` が所有する。
同 Workflow Skill は `/agentdev/case-run` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 本コマンドは orchestration に専念し、実装実行は実行担当サブエージェント経由で委譲する（work plan 生成・実装・乖離検出・specs 更新・PR 作成は委譲先の責務。adapter protocol は `agentdev-case-run-execution-adapter` 参照）
- 処理単位は単一 Issue または単一 Wave（Epic 指定時: 現在 ready な Wave の子Issue を並列実行、最大5件）とする。Epic 全体（複数 Wave）の一括実行と Wave 境界（PR マージ）は case-close の責務であり、Epic Wave 実行モードでは1 Wave のみ実行して PR 作成で return する
- Issue番号の省略は同一セッション内で作成済みの場合に限り、番号解決はユーザー入力またはセッション内会話から行う。work_type 判定基準は `agentdev-workflow-lifecycle` を参照する
- result の4状態（completed-pr/blocked/failed/delegation-unavailable）は `agentdev-case-run-execution-adapter` の result 契約に従う。成功成果は PR 作成である。SSoT は状態別に PR 本文（成功）と Issue コメント（blocked/ failed）とし、一時会話コンテキスト・中間ファイルを SSoT としない
- 外部実行ハーネスの plan artifact 等の中間成果物は AgentDevFlow の永続成果物から除外し、最終結果は PR URL で受領する（内部構造に依存した処理・検証は行わない。委譲契約は I/O 境界 SPEC 参照）
- 実装作業開始前に QG 前置 staleness check（ファイルパス現行存在確認、検査結果件数再計測）を実行する。差異検出時は検出結果を委譲プロンプトで実行担当サブエージェントに引き渡し、PR 本文の `## Findings / Capture候補` に `### stale-reference` 小見出しで記録する（実行担当サブエージェント責務）
- 本筋外の発見は PR 本文に記録して修正は後続処理に委ねる（スコープ拡大は行わない）。intake 候補・learning 候補は区別して記録する（capture 境界（capture-boundaries）は `agentdev-workflow-orchestration` 参照、case-run の capture 責務は記録のみ）
- SPEC確定候補（実装で発見された SPEC レベル詳細）は PR 本文の `## SPEC確定候補` セクションに記録し、`## Findings / Capture候補` とは区別する（確定・反映判断は case-close の責務）

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G02: 実装で判明した制約により REQ を黙って変更しない。乖離として報告し、ユーザー承認後に反映する
- G04: 全ファイル操作は worktree 内で実行する（メインリポジトリでのファイル操作は禁止）
- G15: `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md` への直接変更は行わない（capture 情報は PR 本文経由のみ case-close に引き継ぐ）
- G24: 完了条件チェックボックスの評価・更新は case-close QG-{N} の責務であり、case-run と実行担当サブエージェントは完了条件チェックボックスを更新しない
- G30: STEP-S4（実行担当サブエージェント委譲）の前に worktree+ブランチが作成済みであることを STEP-S3 の precondition gate で検証する。未作成時・メインリポジトリにいる場合は実行担当サブエージェントを起動しない。委譲では worktree root（相対パス、`.worktrees/{N}-{type}/`）を引き渡し、メインリポジトリパスは引き渡さない
- G33: Issue 本文の書き換えは case-update が所有する（case-run が単独で Issue 本文を書き換えない。staleness 差異は case-update へ連携する）
