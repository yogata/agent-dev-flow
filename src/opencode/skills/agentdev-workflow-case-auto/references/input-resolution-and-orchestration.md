# STEP-1/2/3: 入力解決・工程分岐・orchestration 実行（input-resolution-and-orchestration）

> 本 reference は `agentdev-workflow-case-auto` SKILL.md の Control Plane STEP-1, STEP-2, STEP-3 詳細である。入力解決、work_type 読取・工程分岐、orchestration 実行（stage モデル、Wave 反復、bg task 管理）を提供する。

## 目次

- STEP-1: 入力解決・開始時刻記録
- STEP-2: work_type 読取・工程分岐
- STEP-3: orchestration 実行

## STEP-1: 入力解決・開始時刻記録

### Purpose

実行開始時刻を記録し、入力モード（Issue番号/URL 入力 or 要件doc入力）を確定する。

### Input Resolution

1. SSoT 再構成: `.agentdev/drafts/req-draft-*.md`（要件doc入力モード時）
2. identifier 保持: Issue番号/URL、draft パス
3. 最小 scalar: `case_auto_started_at`（JST）
4. runtime artifact: なし

### Preconditions

- case-auto command から入力が渡されている

### Procedure

実行開始時刻を JST（Etc/GMT-{N}）で記録し `case_auto_started_at` に保持。STEP-8（停止時報告）・STEP-8（完了報告）での所要時間算出の基準として使用。

- **Issue番号/URL入力モード**: 引数が数値のみまたは GitHub Issue URL の場合、Issue番号として解決し case-run 移行モードへ分岐（STEP-1 の Issue番号/URL入力分岐へ）。要件doc入力より優先。要件doc の入力解決・work_type 読取はスキップ
- **要件doc入力モード**:
  - (1) 引数なし: `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）。1件以上なら全件（1件含む）処理、0件なら停止し req-define 実行またはパス指定を求める。複数draftは無確認で全件処理
  - (2) 明示パス指定: 当該draftのみ。不在時は停止しエラー報告
  - (3) セッション指定キーワード（例: `req-define セッション`、`req-define 上記の内容`）: セッション内要件doc を参照。**暗黙判断は行わない**（AG-{NNN}）
  - (4) 特定不可: 停止
  - 複数draft読み込み時の順序制御は各draftの `operation_units` から `recommended_order` / `depends_on` に基づき決定

### Result

- 入力モード確定（Issue番号/URL入力 or 要件doc入力）
- `case_auto_started_at` 記録

### Evidence

- 入力引数の解釈結果、`case_auto_started_at` の値、対象 draft パス一覧（要件doc入力モード時）

### Completion Verification

- 入力モードが一意に確定していること（特定不可時は停止）

### Resume-Idempotency

- 読取と記録のみで副作用を持たない。`case_auto_started_at` は durable state として停止時報告・完了報告で再利用する

## STEP-2: work_type 読取・工程分岐

### Purpose

`artifact_actions` 存在による動的判定で工程順序を確定し、auto_gate preflight を実施する。

### Input Resolution

1. SSoT 再構成: draft-data（`work_type`、`artifact_actions`、`auto_gate`）
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-1 で入力解決完了

### Procedure

入力要件doc の `draft-data` から work_type を取得（参考情報、パイプライン分岐の判定には使用しない）。

#### 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定）

- **Issue番号/URL入力**: case-run → case-close（req-save、spec-save、case-open、work_type読取をスキップ）。STEP-1 で解決した Issue番号/URL を case-run にそのまま渡す。draft-data の読取は行わない
- **artifact_actions ベース分岐**:
  - `artifact: req` または `artifact: decision` entry → req-save を実行
  - `artifact: spec` entry → spec-save を実行（req-save の後、entry が空ならスキップ、`artifact_actions` フィールド不存在は後方互換で spec-save スキップ）
  - 常に → case-open → case-run → case-close

#### auto_gate preflight

`draft-data` の `auto_gate.auto_ready` が false または未解決 item（unresolved_questions/ unresolved_conflicts/ out_of_repo_operations/ stop_reasons）が残る場合は停止。

### Result

- 工程順序確定（req-save, spec-save, case-open, case-run, case-close の部分集合）

### Evidence

- `artifact_actions` の entry 種別、auto_gate preflight 判定結果

### Completion Verification

- 工程順序が一意に確定していること（auto_gate 不合格時は停止）

### Resume-Idempotency

- draft-data からの読取のみで副作用を持たない

## STEP-3: orchestration 実行

### Purpose

確定した工程順序に従い各工程を委譲起動またはインライン実行し、orchestration stage モデル・Wave 反復・bg task 管理を制御する。

### Input Resolution

1. SSoT 再構成: 各工程の durable state（REQ/Decision/SPEC ファイル、Issue/PR、Epic Issue 本文）
2. identifier 保持: Issue番号、PR番号、OU ID、draft パス、RU パス
3. 最小 scalar: L1 工程別タイムスタンプ、stage 2 並列数（最大5件）
4. runtime artifact: なし（委譲工程内部の過程は親コンテキストに累積しない G28）

### Preconditions

- STEP-2 で工程順序確定

### Procedure

実行モデル原則、工程別契約（req-save+spec-save 統合委譲 AG-{NNN}、case-open、case-run インライン実行 AG-{NNN}/002、case-close）、QG-{N}〜QG-{N} の継承、タイムスタンプ計測（L1）、インライン実行時のコンテキスト管理、結果状態の4次元集約、case-open 完了後の分岐（Standard flow / Epic Issue flow、クリーンアップ検証ゲート）、Wave 反復制御、OU 処理順序、クリーンアップ検証ゲート、委譲起動判定（AG-{NNN}、delegation-unavailable 停止条件）、Subagent 委譲プロトコル（category 選定ガイドライン、MUST NOT DO 必須化）、orchestration stage モデル、子 task bg task 破棄検知時の回復（AG-{NNN}〜AG-{NNN}、3状態分類、ライフサイクル分離）の各詳細は `agentdev-workflow-orchestration`、`agentdev-case-run-execution-adapter`、`agentdev-git-worktree`、各対応 skill を参照。case-run インライン実行時も case-run.md を authoritative source として読み込む。

case-auto は各工程の結果に基づいて次工程へ進むか停止条件（STEP-4）を判定する。req-save/case-open の委譲に draft path と OU ID のみを渡す（OU 本文の切り出しは行わない）。OU の統合・分割・REQ 操作分類・Issue 階層判定を再評価しない（各工程の判定結果に従う）。

#### orchestration stage モデル

| stage | 工程 | 実行方式 | 並列性 |
|---|---|---|---|
| stage 1 | case-open | 直列集約 | 単一 |
| stage 2 | case-run | bg task（最大5件） | 並列（3つの「5件」文脈の (2) に該当） |
| stage 3 | case-close | 直列集約 | 単一 |

順次フォールバック可能（G32）。bg task 破棄検知時の3状態回復は `agentdev-workflow-orchestration` 参照。

#### Wave 反復制御（case-auto 直接制御 AG-{NNN}）

- Epic Issue 本文読み取りのみ（書き込みは case-close 単一書き手、G16）
- 子Issue インライン case-run 並列実行 最大5件
- 委譲 → case-close(#epic)
- 次 Wave 判定
- blocked/ failed の扱い

#### 工程間の状態引き継ぎ

各工程の起動結果（Issue番号、PR番号）を次工程の入力として渡す。加えて以下を最終工程まで保持すること:

1. RU ファイルパス（case-open 委譲の RU 削除で使用）
2. capture 対象情報（case-close 委譲の learning/intake capture で使用）

#### 複数REQ対応

req-save 委譲の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールを使用（G13）。req-save から case-open への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリング・再評価なしでそのまま渡す（G14）。Epic Issue 化の判定には関与しない（G21）。case-open の判定結果に従う。

#### OU処理順序

- 必須依存で結合した execution_unit 群は順次
- 必須依存のない execution_unit 群は並列
- 3つの「5件」文脈の区別に注意

### Result

- 各工程の実行結果（Issue/PR番号、pass/warn/fail）
- orchestration stage 別結果・フォールバック理由・破棄回復記録
- 結果状態の4次元（工程結果 / artifact_action 適用結果 / 定義適用工程の完了状態 / OU ライフサイクル完了状態、warn 変換禁止）
- L1 タイムスタンプ内訳

### Evidence

- 各工程の起動結果（Issue/PR番号）、stage 別結果、L1 工程別タイムスタンプ、結果状態4次元の集約値

### Completion Verification

- 全工程の結果が4状態/結果状態4次元で受領済みであること。停止条件該当時は STEP-4（stop-and-decision-resolution）へ遷移していること

### Resume-Idempotency

- 各工程の durable state（Issue/PR、REQ/Decision/SPEC ファイル、Epic Issue 本文）から進捗を再構成する。完了済み工程を再実行しない（case-open 成功後は draft を読まない G19）

## resume point

- `case_auto_started_at`、入力モード、工程順序
- 各工程の起動結果（Issue/PR番号）、RU パス、capture 対象情報
- L1 工程別タイムスタンプ、orchestration stage 別結果
- bg task 状態、結果状態4次元

## 関連 STEP

- 前: なし（workflow 開始）
- 次: STEP-4（stop-and-decision-resolution、停止条件検出時）、STEP-8（conflict-resolution-and-reporting、完了時）

## 関連 Capability Skill

- `agentdev-workflow-orchestration`: orchestration 詳細プロトコル、bg task 破棄検知・状態別回復、Subagent 委譲プロトコル、capture 境界
- `agentdev-case-run-execution-adapter`: case-run 委譲契約（インライン実行時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル（読取のみ）
- `agentdev-gh-cli`: GitHub Issue/PR/comment/merge/close I/O
- `agentdev-project-extensions`: project extension 読込

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G04（GitHub Issue/PR/comment/merge/close は自走対象）
- G07（委譲工程は各コマンド委譲契約に従い起動、case-run はインライン実行、委譲起動不能時は `delegation-unavailable` として報告）
- G08（工程固有の詳細手順と case-auto 定義が矛盾する場合、工程固有処理は既存コマンド定義を優先）
- G13（case-auto は Issue 階層決定ロジックを持たない、複数 REQ doc または scale:large の場合は case-open のルールに委譲）
- G14（req-save 委譲から case-open 委譲への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価しない）
- G15（Epic Wave 実行時、Wave 反復制御、現在 Wave の ready 子Issue 選択、子Issue 並列委譲 最大5件 を直接担当、case-run(#epic) への委譲は行わない、各子Issue ごとにインライン case-run、Wave 境界のクローズは case-close(#epic) に委譲）
- G16（case-auto は独自の操作単位ステータス追跡を持たない、Epic Issue のステータス追跡テーブルを使用、Epic Issue 本文の書き込みは case-close 単一書き手、case-auto は読み取るのみ）
- G18（case-auto は操作単位キューの管理・制御のみを担い、OU 本文の抽出・変換・REQ 操作解釈を行わない）
- G19（case-auto は orchestration pre-reader として case-open 完了前のみ req_draft を読み込み、case-open 成功後は invalid post-case reader として req_draft を読まない、case-open 成功後の停止・再開・完了処理は Issue と Epic だけで成立、クリーンアップ検証ゲートは case-open 完了後に実行、独自の OU 状態管理を持たない）
- G20（OU 間依存は queue dependency として扱い、依存関係があるだけでは Epic Issue 化しない）
- G21（case-auto は Epic Issue 化の判定に関与しない、case-open の判定結果に従う）
- G27（各工程の起動は工程別契約に従い、inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領）
- G28（委譲工程の完了結果のみを親コンテキストに保持し、委譲工程内部の調査過程・中間ログ・読解メモを親コンテキストに累積しない、case-run インライン実行時のコンテキスト管理は harness 機能で対応し親コンテキスト非累積は例外扱い）
- G29（case-auto の所有対象の限定、bg task API・実行エージェント選定・context 管理・retry・heartbeat・エラー解析は harness 責務）
- G30（subagent 委譲時の category 選定、事務的手続きには `unspecified-high` を推奨、`writing` category は執筆作業のみに限定）
- G31（全ての subagent 委譲 prompt に MUST NOT DO セクションを必須、スコープ外作業を明示列挙）
- G32（case-auto は orchestration stage 2 だけで case-run を並列起動、stage 1 と 3 で case-run を並列起動せず、並列実行を利用できない場合だけ順次フォールバック）
