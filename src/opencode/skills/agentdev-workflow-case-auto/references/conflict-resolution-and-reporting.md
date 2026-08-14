# STEP-{N}/8: コンフリクト解消 Level 2/3・完了報告（conflict-resolution-and-reporting）

> 本 reference は `agentdev-workflow-case-auto` SKILL.md の Control Plane STEP-{N}, STEP-{N} 詳細である。コンフリクト解消 Level 2/3（インライン case-run 再実行、オーケストレーション級判断）と完了報告（L1 タイムスタンプ、4次元集約、OU処理ループ）を提供する。

## STEP-{N}: コンフリクト解消 Level 2/3

### Purpose

case-close からエスカレーションされた PR マージコンフリクトを Level 2（インライン case-run 再実行）と Level 3（オーケストレーション級判断）で解消する。

### Input Resolution

1. SSoT 再構成: 両 PR の diff、コンフリクト箇所、マージ順序候補
2. identifier 保持: PR番号群、Issue番号群
3. 最小 scalar: Level 2 再実行回数（最大2回、元の並列実行を含む計3回）
4. runtime artifact: なし

### Preconditions

- PR マージコンフリクト発生時（case-close から Level 1 失敗エスカレーション受領時）

### Procedure

PR マージコンフリクト発生時は、以下3レベルのエスカレーションで解消を図る。各レベルを試行しても解消できない場合のみ次のレベルへ進む。**機械的競合（rebase で自動解決可能）は停止条件に含まず**、Level 1 で case-close が解消する（Level 1 は case-close の責務、本 STEP では Level 2/3 の case-auto 責務を定義する）。

| Level | 担当 | 手順 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消、自動解決時は再マージ | case-auto へエスカレーション |
| Level 2 | case-auto | 両PR の diff を読み取りコンフリクト箇所を特定しコンフリクト文脈を付けてインライン case-run を再実行、最大2回（元の並列実行を含む計3回の case-run 実行 AG-{NNN}） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離 | 停止（STEP-{N} 停止条件 (8)） |

Level 2 コンフリクト文脈付きインライン case-run 再実行（AG-{NNN}）、Level 3 オーケストレーション級判断、発生元非依存、停止条件の段階化の詳細は `agentdev-workflow-orchestration` を参照。

### Result

- コンフリクト解消（Level 2 or 3 で解消時）→ STEP-{N} へ戻り再マージ
- 解消不能時（Level 3 失敗）→ STEP-{N} 停止経路（停止条件 (8)）

### Evidence

- Level 別の試行記録（再実行回数、マージ順序変更、blocked 隔離）、解消/停止の判定結果

### Completion Verification

- 各レベルを試行しても解消できない場合のみ次レベルへ進んでいること。機械的競合を停止条件に含めていないこと

### Resume-Idempotency

- Level 2 再実行は回数上限（最大2回）を durable に数え、上限到達時は Level 3 へ遷移する。解消済みコンフリクトの再処理は行わない

## STEP-{N}: 完了報告

### Purpose

全工程完了または停止判定時の完了報告を、L1 タイムスタンプと結果状態4次元の集約を含めて出力する。

### Input Resolution

1. SSoT 再構成: 各工程の完了結果、Epic Issue 本文ステータス追跡テーブル（読取のみ）、L1 工程別タイムスタンプ
2. identifier 保持: Issue番号、PR番号、OU ID
3. 最小 scalar: 開始時刻・終了時刻・所要時間
4. runtime artifact: なし

### Preconditions

- 全工程完了 または 停止判定（STEP-{N}/5/6/7 のいずれか）

### Procedure

最終工程（case-close 委譲）の完了報告をそのまま出力する。Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り、case-auto は書き込まない、G16）。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する。

完了報告には以下を含める（停止時フォーマットを含む）。

- **停止理由分類**: STEP-{N} 経由、または経路H の user-decision-required
- **開始時刻・終了時刻・所要時間**: 人間が読みやすい形式
- **工程別タイムスタンプ内訳（L1）**: req-save+spec-save 統合委譲 / case-open / case-run / case-close、スキップした工程は除外可、case-run の L2 内訳は case-run result から読み取って含める
- **インライン実行の記録**: case-run をインライン実行した旨
- **orchestration stage 別結果・フォールバック理由・破棄回復記録**:
  - stage 1 case-open / stage 2 case-run / stage 3 case-close
  - stage 2 を順次フォールバック時は理由
  - bg task 破棄を検知して回復した場合は状態区分と回復結果
- **結果状態の4次元報告**:
  - (1) 工程結果 pass/warn/fail
  - (2) artifact_action 適用結果 applied/skipped/failed/no-op
  - (3) 定義適用工程の完了状態: 定義適用完了・警告付き工程完了・定義適用未完了
  - (4) OU ライフサイクル完了状態: Issue 作成・PR 作成・PR マージ・Issue クローズ の各完了/未完了
  - **warn を pass へ変換して集約しない**
  - **Phase 0 成功と OU 完了は別々に報告**

#### OU処理ループ

Standard flow の case-close 完了後に未処理 OU が残存する場合は次 OU の処理を STEP-{N} から開始（全 OU 処理完了時のみ全体完了報告）。

### Result

- 完了報告出力（停止時フォーマットを含む）
- L1 タイムスタンプ、4次元集約、OU処理ループ状態

### Evidence

- 完了報告出力（停止理由分類、タイムスタンプ内訳、stage 別結果、結果状態4次元、OU処理ループ状態）

### Completion Verification

- warn を pass へ変換せず集約していること。Phase 0 成功と OU 完了を別々に報告していること。Epic Issue 本文のステータス追跡テーブルから読み取りのみで書き込んでいないこと（G16）

### Resume-Idempotency

- 報告のみで副作用を持たない。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを durable state（Issue/Epic）から再構成して報告する

## resume point

- コンフリクト解消状態（Level 1/2/3 の進行、解消/停止）
- 完了報告出力状態
- L1 タイムスタンプ内訳、4次元集約結果

## 関連 STEP

- 前: STEP-{N}（input-resolution-and-orchestration）、STEP-{N}（stop-and-decision-resolution）、STEP-{N}（bounded parent decision resolution 上位合意矛盾/新規ユーザー判断時）
- 次: なし（workflow 終了、または OU処理ループで STEP-{N} へ戻る）

## 関連 Capability Skill

- `agentdev-workflow-orchestration`: コンフリクト解消 Level 2/3 詳細、オーケストレーション級判断、停止条件の段階化、bg task 破棄検知時の回復
- `agentdev-case-run-execution-adapter`: Level 2 インライン case-run 再実行時の委譲契約
- `agentdev-git-worktree`: コンフリクト解消 rebase パス補助、並列実行安全ステージング
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル（読取のみ、G16）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G10（成果物本文 verbatim、判定結果・調査過程・中間ログ・読解メモは要約）
- G16（case-auto は独自の操作単位ステータス追跡を持たない、Epic Issue 本文書き込みは case-close 単一書き手、case-auto は読取のみ）
- G28（委譲工程の完了結果のみを親コンテキストに保持）
