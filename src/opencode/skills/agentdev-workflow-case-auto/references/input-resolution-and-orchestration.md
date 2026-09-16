# STEP-1/2/3: 入力解決・工程分岐・orchestration 実行（input-resolution-and-orchestration）

> 本 reference は `agentdev-workflow-case-auto` SKILL.md の制御平面（STEP 一覧）STEP-1, STEP-2, STEP-3 詳細である。
> 入力解決、工程分岐、orchestration 実行（stage モデル、クリーンアップ検証ゲート、Wave 反復、bg task 管理）を提供する。

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

実行開始時刻を JST（Etc/GMT-{N}）で記録し `case_auto_started_at` に保持。
STEP-8（停止時報告）・STEP-8（完了報告）での所要時間算出の基準として使用。

- **Issue番号/URL入力モード**: 引数が数値のみまたは GitHub Issue URL の場合、Root Case として解決し、Issue の durable state に基づく継続工程（case-ready / case-run / case-close）へ分岐。要件doc入力より優先。要件doc の入力解決はスキップ
- **要件doc入力モード**:
  - (1) 引数なし: `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）。1件以上なら全件（1件含む）処理、0件なら停止し req-define 実行またはパス指定を求める。複数draftは無確認で全件処理
  - (2) 明示パス指定: 当該draftのみ。不在時は停止しエラー報告
  - (3) セッション指定キーワード（例: `req-define セッション`、`req-define 上記の内容`）: セッション内要件doc を参照。**暗黙判断は行わない**
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

## STEP-2: 工程分岐（継続工程確定）

### Purpose

入力種別、`artifact_actions`、Root Case の durable state に基づく動的判定で工程順序を確定し、auto_gate preflight を実施する。`work_type` は参考情報であり固定分岐に使用しない。

### Input Resolution

1. SSoT 再構成: draft-data（`work_type`、`artifact_actions`、`auto_gate`）
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-1 で入力解決完了

### Procedure

入力要件doc の `draft-data` から `work_type`、`artifact_actions`、`auto_gate` を取得する（`work_type` は参考情報、パイプライン分岐の固定条件には使用しない）。Issue 入力時は Root Case の durable state を再構成する。

#### 工程分岐（`work_type` 固定分岐ではなく入力状態による動的判定）

- **要件doc入力（通常経路）**: stage 1（case-open）→ stage 2（case-ready）→ クリーンアップ検証ゲート（stage 2 対象群収束後・stage 3 開始前）→ stage 3（case-run）→ stage 4（case-close）。`artifact_actions` の有無は case-ready が適用する Definition action と auto_gate の判定に渡し、work_type 固定分岐は行わない
- **再合意済み Definition 変更**: 既存 Root Case に対する req-define 再合意済み変更がある場合は stage 1 の例外経路（case-revise → stage 2 case-ready）→ クリーンアップ検証ゲート（stage 2 対象群収束後・stage 3 開始前）→ stage 3（case-run）→ stage 4（case-close）
- **Issue番号/URL入力**: Root Case の状態が open なら case-ready から、ready/running/review なら case-run から継続し、再合意済み Definition 変更がある場合は case-revise から開始する。closed は再実行せず完了状態を報告
- **artifact_actions の引き渡し**: `artifact: req`、`artifact: decision`、`artifact: design` entry は case-ready の Definition action 入力として渡す。entry の有無による下位保存 command の固定分岐は行わない
- **通常経路**: stage 1（case-open）→ stage 2（case-ready）→ クリーンアップ検証ゲート（stage 2 対象群収束後・stage 3 開始前）→ stage 3（case-run）→ stage 4（case-close）

#### auto_gate preflight

`draft-data` の `auto_gate.auto_ready` が false または未解決 item（unresolved_questions/ unresolved_conflicts/ out_of_repo_operations/ stop_reasons）が残る場合は停止。

### Result

- 工程順序確定（通常経路、例外経路、Issue 再開経路のいずれか）

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

1. SSoT 再構成: 各工程の durable state（REQ/Decision/Design ファイル、Issue/PR、Epic Issue 本文）
2. identifier 保持: Issue番号、PR番号、OU ID、draft パス、RU パス
3. 最小 scalar: L1 工程別タイムスタンプ、stage 3 並列数（最大5件、起動間隔10秒。epic-wave-model Design「並列起動の間隔」）
4. runtime artifact: なし（委譲工程内部の過程は親コンテキストに累積しない、command 不変条件）

### Preconditions

- STEP-2 で工程順序確定

### Procedure

実行モデル原則、工程別契約（case-open / case-ready / case-revise の委譲、case-run インライン実行、case-close の委譲）、QG-1〜QG-4 の継承、タイムスタンプ計測（L1）、インライン実行時のコンテキスト管理、結果状態の4次元集約、case-ready 完了後のクリーンアップ検証ゲート、Wave 反復制御、OU 処理順序、委譲起動判定（delegation-unavailable 停止条件）、Subagent 委譲プロトコル（category 選定ガイドライン、MUST NOT DO 必須化）、orchestration stage モデル、子 task bg task 破棄検知時の回復（3状態分類、ライフサイクル分離）の各詳細は `agentdev-workflow-orchestration`、`agentdev-case-run-execution-adapter`、`agentdev-git-worktree`、各対応 skill を参照。
case-run インライン実行時も case-run.md を authoritative source として読み込む。

case-auto は各工程の結果に基づいて次工程へ進むか停止条件（STEP-4）を判定する。
case-open / case-ready / case-revise の委譲には contract が許す identifier と durable state のみを渡す（OU 本文の切り出しは行わない）。
OU の統合・分割・REQ 操作分類・Issue 階層判定を再評価しない（各工程の判定結果に従う）。

#### orchestration stage モデル

| stage | 工程 | 実行方式 | 並列性 |
|---|---|---|---|
| stage 1 | case-open（再合意済み Definition 変更の例外経路時は case-revise） | 委譲起動 | stage 内最大並列（直列化要因のみ局所直列化） |
| stage 2 | case-ready | 委譲起動 | stage 内最大並列（直列化要因のみ局所直列化） |
| stage 3 | case-run | インライン実行（子 task 委譲は bg task 最大5件） | 並列（3つの「5件」文脈の (2) に該当） |
| stage 4 | case-close | 委譲起動 | stage 内最大並列（直列化要因のみ局所直列化） |

各 orchestration stage は stage 内最大並列・stage 間全対象収束（fan-in）で進行し、対象ごとの縦切り pipeline としない。
当該 stage に属する全対象が正常完了し、または当該実行において後続 stage へ進めないことが既存契約上確定した結果（blocked / failed / delegation-unavailable 等の後続不能確定）に収束するまで次 stage を開始せず（未実行・実行中・状態不明・再試行要否未確定対象の残存は収束済みとしない）、後続不能対象を後続 stage の対象から除外しその存在だけを理由として独立した他対象の進行を停止しない（case-auto 実行契約）。
main への push、capture、commit、同一 Epic Issue 本文への更新等の競合する共有書き込みは、当該競合部分のみを必要な最小単位で局所的に直列化し、当該競合と無関係な対象の並列実行を妨げず、stage 全体を一括して扱う直列集約ポイントを設けない（case-auto 実行契約。共有資源カテゴリと直列化単位の運用表は case-auto Design「複数 execution_unit 並列 orchestration」節参照）。
クリーンアップ検証ゲート（ドラフト残存、RU 残存の検証）を stage 2 の対象群収束後・stage 3 開始前に実行し、評価対象を stage 2 を正常完了した対象に限定する（case-auto 実行契約）。
scheduling 制約（最大同時起動数・起動間隔・順次フォールバック）による batch 分割を orchestration stage の分割として扱わない（epic-wave-model Design「ドラフト間並列実行モデル」）。
Epic execution_unit の Wave 間および最終 Wave の case-close(#epic) は Wave 反復を進行・完結させる stage 3 内部の状態遷移処理であり stage 4 の開始とみなさず、stage の分類は orchestration 上の位置づけにより行い command 名単独では分類しない（epic-wave-model Design「ドラフト間並列実行モデル」）。

#### stage 1 収束条件と横断依存検査（全対象確立後・case-auto 側で横断評価）

stage 1（case-open）の収束条件には、全対象確立後の横断依存検査の実施を含める（case-auto Design「現在の動作」節、workflow-contracts Design「Case 投入時の横断依存検査契約」）。
並列 case-open によって兄弟対象をタイミング依存で欠落させないため、case-auto は stage 1 を収束させる前に次を実行する:

1. stage 1 の委譲先（case-open / case-revise）が全対象の Root Case Issue を確立したことを確認する（起動時対象集合と確立済み Issue 集合の一致）
2. 全対象確立後・stage 1 収束前に、case-auto 側で横断依存検査を実行し、確立済み全対象を population として横断評価する（draft の artifact_actions と未クローズ Case 群の機械的比較）
3. 横断依存検査が警告を返した場合（同一パス重複等）は、case-ready（stage 2）進行前に警告を提示し、case-ready 側の受入ゲートへ引き継ぐ

横断依存検査の単独起動（case-open STEP-5）と case-auto 側の横断評価は二重実行とせず、case-auto 側評価は全対象確立を前提とした population 補完の位置づけである。

順次フォールバック可能（command 不変条件）。
並列起動時は委譲起動ごとに10秒の起動間隔を置き、同一Tool一括ブロックでの複数起動発行は行わない（epic-wave-model Design「並列起動の間隔」）。起動間隔は stage 3（case-run 子 task 委譲）に限らず stage 1（case-open / case-revise 委譲）・stage 2（case-ready 委譲）・stage 4（case-close 委譲）の並列委譲起動にも同一に適用する。
bg task 破棄検知時の3状態回復は `agentdev-workflow-orchestration` 参照。

#### Wave 反復制御（case-auto 直接制御、stage 3 内部処理）

Epic execution_unit の Wave 反復は orchestration stage 3 の内部状態遷移処理であり、stage 4 の開始とみなさない（前述 orchestration stage モデル）。

- Epic Issue 本文読み取りのみ（書き込みは case-close 単一書き手、`POL-epic-tracking-single-writer`）
- 子Issue インライン case-run 並列実行 最大5件
- 委譲 → case-close(#epic)
- 次 Wave 判定
- blocked/ failed の扱い

#### 工程間の状態引き継ぎ

各工程の起動結果（Issue番号、PR番号）を次工程の入力として渡す。加えて以下を最終工程まで保持すること:

1. RU ファイルパス（case-ready の cleanup gate で検証する対象）
2. capture 対象情報（case-close 委譲の learning/intake capture で使用）

工程間の引き継ぎでは、構造化文脈（10意味）を次工程へ構造化して渡す。
形式と制約は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎに従う（全文履歴や巨大な計画本文の複製を含めない、正規情報源の非代替、後工程の初期文脈利用と再確認の維持）。
構造化文脈の構成は保存結果のフィルタリング・再評価ではなく、完了結果（Issue/PR番号、pass/warn/fail）に意味の構造化を付与するものであるため、従来の引き継ぎ契約（完了結果のみを渡す、再評価しない）を変更しない。

#### 複数REQ対応

case-ready の確定結果から複数 REQ doc または scale:large を検出した場合、case-auto は確定済みの Issue 構造に従う（command 不変条件）。
case-open / case-ready から後工程への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリング・再評価なしでそのまま渡す（command 不変条件）。
Epic Issue 化の判定には関与しない（command 不変条件）。
case-open の判定結果に従う。

#### OU処理順序

- 必須依存で結合した execution_unit 群は順次（stage 内の局所直列化。OU の必須依存は case-auto 実行契約の直列化要因であり、OU 逐次処理は orchestration stage モデルを置き換えない）
- 必須依存のない execution_unit 群は並列（stage 開始時点で実行可能な全対象が起動時対象集合）
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

- 各工程の durable state（Issue/PR、REQ/Decision/Design ファイル、Epic Issue 本文）から進捗を再構成する。現在 stage は stage cursor を新たな正規状態として保存せず、起動時対象集合と各対象の正規状態から最も早い未収束 stage として再構成し、完了済み対象を再実行せず単一対象を後続 stage へ先行させない（epic-wave-model Design「ドラフト間並列実行モデル」。case-open 成功後は draft を読まない、command 不変条件）

## resume point

- `case_auto_started_at`、入力モード、工程順序
- 各工程の起動結果（Issue/PR番号）、RU パス、capture 対象情報
- L1 工程別タイムスタンプ、orchestration stage 別結果、対象別・stage 別の開始/完了観測証跡（対象識別子付きタイムスタンプまたは等価の bg task ID・Issue status 遷移記録）
- 起動時対象集合の安定識別子（ローカル一時実行状態。draft / RU 削除後も対象集合を同一集合として識別し、削除だけを理由に対象を消失させない）
- bg task 状態、結果状態4次元

## 関連 STEP

- 前: なし（workflow 開始）
- 次: STEP-4（stop-and-decision-resolution、停止条件検出時）、STEP-8（conflict-resolution-and-reporting、完了時）

## 関連 Capability Skill

- `agentdev-workflow-orchestration`: orchestration 詳細プロトコル、bg task 破棄検知・状態別回復、Subagent 委譲プロトコル、capture 境界
- `agentdev-case-run-execution-adapter`: case-run 委譲契約（インライン実行時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル（読取のみ）
- Custom Tool `agentdev_gh`: GitHub Issue/PR/comment/merge/close I/O
- `agentdev-project-extensions`: project extension 読込

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（GitHub Issue/PR/comment/merge/close は自走対象）
- 不変条件（委譲工程は各コマンド委譲契約に従い起動、case-run はインライン実行、委譲起動不能時は `delegation-unavailable` として報告）
- 不変条件（工程固有の詳細手順と case-auto 定義が矛盾する場合、工程固有処理は既存コマンド定義を優先）
- 不変条件（case-auto は Issue 階層決定ロジックを持たない、複数 REQ doc または scale:large の場合は case-open のルールに委譲）
- 不変条件（case-open / case-ready から後工程への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価しない）
- 不変条件（Epic Wave 実行時、Wave 反復制御、現在 Wave の ready 子Issue 選択、子Issue 並列委譲 最大5件 を直接担当、case-run(#epic) への委譲は行わない、各子Issue ごとにインライン case-run、Wave 境界のクローズは case-close(#epic) に委譲）
- ガードレール（case-auto は独自の操作単位ステータス追跡を持たない、Epic Issue のステータス追跡テーブルを使用、Epic Issue 本文の書き込みは case-close 単一書き手、case-auto は読み取るのみ）
- 不変条件（case-auto は操作単位キューの管理・制御のみを担い、OU 本文の抽出・変換・REQ 操作解釈を行わない）
- 不変条件（case-auto は orchestration pre-reader として case-open 前のみ req_draft を読み込み、case-ready 成功後は invalid post-case reader として req_draft を読まない、case-ready 成功後の停止・再開・完了処理は Issue と Epic だけで成立、クリーンアップ検証ゲートは stage 2（case-ready）の対象群収束後・stage 3 開始前に実行し評価対象を stage 2 を正常完了した対象に限定、独自の OU 状態管理を持たない）
- 不変条件（OU 間依存は queue dependency として扱い、依存関係があるだけでは Epic Issue 化しない）
- 不変条件（case-auto は Epic Issue 化の判定に関与しない、case-open の判定結果に従う）
- 不変条件（各工程の起動は工程別契約に従い、inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領）
- 不変条件（委譲工程の完了結果のみを親コンテキストに保持し、委譲工程内部の調査過程・中間ログ・読解メモを親コンテキストに累積しない。case-run インライン実行時のコンテキスト管理は harness 実行機構に属する、責務分界は harness 分離モデル Design 参照）
- 不変条件（case-auto の所有対象の限定。harness 実行機構との責務分界は harness 分離モデル Design 参照）
- 不変条件（subagent 委譲時の category 選定、事務的手続きには `unspecified-high` を推奨、`writing` category は執筆作業のみに限定）
- 不変条件（全ての subagent 委譲 prompt に MUST NOT DO セクションを必須、スコープ外作業を明示列挙）
- 不変条件（case-auto は orchestration stage 3 だけで case-run を並列起動、stage 1・2・4 で case-run を並列起動せず、並列実行を利用できない場合だけ順次フォールバック）
