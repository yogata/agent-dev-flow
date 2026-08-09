---
description: req-save→spec-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
---

# 最大自走モード

要件docから req-save → spec-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-auto.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（数値）または Issue URL: 既存Issue から case-run → case-close を自走する場合
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照。暗黙判断廃止、構造化 `draft-data` 形式）

## 出力

- REQ/Decision artifact_actions がある場合: REQ/Decisionファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は Step 3 参照）

## 手順

### Step 1: 入力解決

実行開始時刻を JST（Etc/GMT-9）で記録し `case_auto_started_at` に保持。Step 7（停止時報告）・Step 8（完了報告）での所要時間算出の基準として使用。

- **Issue番号/URL入力モード**: 引数が数値のみまたは GitHub Issue URL の場合、Issue番号として解決し case-run移行モードへ分岐（Step 3 の Issue番号/URL入力分岐へ）。要件doc入力より優先。要件docの入力解決・work_type読取はスキップ
- **要件doc入力モード**:
  - (1) 引数なし: `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）。1件以上なら全件（1件含む）処理、0件なら停止し req-define 実行またはパス指定を求める。複数draftは無確認で全件処理
  - (2) 明示パス指定: 当該draftのみ。不在時は停止しエラー報告
  - (3) セッション指定キーワード（例: `req-define セッション`、`req-define 上記の内容`）: セッション内要件docを参照。**暗黙判断は行わない**（AG-003）
  - (4) 特定不可: 停止
  - 複数draft読み込み時の順序制御は各draftの `operation_units` から `recommended_order` / `depends_on` に基づき決定

### Step 2: work_type 読取

入力要件docの `draft-data` から work_type を取得（参考情報、パイプライン分岐の判定には使用しない）。

### Step 3: 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定）

- **Issue番号/URL入力**: case-run → case-close（req-save、spec-save、case-open、work_type読取をスキップ）。Step 1 で解決した Issue番号/URL を case-run にそのまま渡す。draft-data の読取は行わない
- **artifact_actions ベース分岐**: `artifact: req` または `artifact: decision` entry → req-save を実行。`artifact: spec` entry → spec-save を実行（req-save の後、entry が空ならスキップ、`artifact_actions` フィールド不存在は後方互換で spec-save スキップ）。常に → case-open → case-run → case-close
- **auto_gate preflight**: `draft-data` の `auto_gate.auto_ready` が false または未解決 item（unresolved_questions/ unresolved_conflicts/ out_of_repo_operations/ stop_reasons）が残る場合は停止

### Step 4: 各工程の実行

実行モデル原則、工程別契約（req-save+spec-save 統合委譲 AG-005、case-open、case-run インライン実行 AG-001/002、case-close）、QG-1〜QG-4 の継承、タイムスタンプ計測（L1）、インライン実行時のコンテキスト管理、結果状態の4次元集約（工程結果 / artifact_action 適用結果 / 定義適用工程の完了状態 / OU ライフサイクル完了状態、warn 変換禁止）、case-open 完了後の分岐（Standard flow / Epic Issue flow、クリーンアップ検証ゲート）、Wave 反復制御（case-auto 直接制御 AG-003、Epic Issue 本文読み取りのみ、子Issue インライン case-run 並列実行 最大5件、委譲→case-close(#epic)、次 Wave 判定、blocked/failed の扱い）、OU 処理順序（必須依存で結合した execution_unit 群は順次、必須依存のない execution_unit 群は並列、3つの「5件」文脈の区別）、クリーンアップ検証ゲート（ドラフト/RU 削除検証）、委譲起動判定（AG-004、delegation-unavailable 停止条件）、Subagent 委譲プロトコル（category 選定ガイドライン、MUST NOT DO 必須化）、orchestration stage モデル（stage 1 case-open / stage 2 case-run bg task 最大5件 / stage 3 case-close）、子 task bg task 破棄検知時の回復（AG-001〜AG-004、3状態分類、ライフサイクル分離）の各詳細は `agentdev-workflow-orchestration`、`agentdev-case-run-execution-adapter`、`agentdev-git-worktree`、各対応 skill を参照。case-run インライン実行時も case-run.md を authoritative source として読み込む

case-auto は各工程の結果に基づいて次工程へ進むか停止条件（Step 7）を判定する。req-save/case-open の委譲に draft path と OU ID のみを渡す（OU 本文の切り出しは行わない）。OU の統合・分割・REQ 操作分類・Issue 階層判定を再評価しない（各工程の判定結果に従う）

### Step 5: 工程間の状態引き継ぎ

各工程の起動結果（Issue番号、PR番号）を次工程の入力として渡す。加えて以下を最終工程まで保持すること: (1) RU ファイルパス（case-open 委譲の RU 削除で使用） (2) capture 対象情報（case-close 委譲の learning/intake capture で使用）

### Step 6: 複数REQ対応

req-save 委譲の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールを使用（G13）。req-save から case-open への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリング・再評価なしでそのまま渡す（G14）。Epic Issue 化の判定には関与しない（G21）。case-open の判定結果に従う

### Step 7: 停止条件の検出

以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する（11項目）: (1) req-define合意要件からの逸脱、(2) 要件未合意のscope拡大、(3) repo外実体変更の必要性、(4) DB migration実行の必要性、(5) deploy/applyの必要性、(6) 認証・秘密・権限変更の必要性、(7) CI/test/lint失敗がself-healing不能、(8) コンフリクト解消モデル Level 1〜3 全てを試行しても解消不能なコンフリクト（Level 2 インライン case-run 再実行を上限回数 2回試行しても解消しない場合、機械的競合 Level 1 で自動解決可能は停止条件外、remote hash 不一致は停止条件）、(9) 作成元不明branch/user-owned branch/他作業branchの削除検出、(10) 未コミット変更の帰属不明、(11) command 契約・実装不整合（execution_unit へ分割可能にも関わらず case-open が単一 Epic 子 Issue 上限により停止した場合を含む）

**停止時タイミング情報の追記**: 停止報告に `case_auto_started_at`、停止時刻（JST、人間が読みやすい形式）、経過時間、Step 4 で記録した工程別タイムスタンプ内訳（停止時点までの工程分）を含める

### Step 7-1: 停止理由分類

Step 7 の停止条件を以下の分類軸で報告する（HITL 境界の変更ではなく、再開コマンド選択とユーザー通知の精度向上が目的）: req-define 合意要件からの逸脱 ((1))、command 契約・実装不整合 ((11))、要件未合意のスコープ拡大 ((2))、repo 外実体変更 ((3)(4)(5)(6))、CI/test/lint 失敗 ((7)(8))、branch 削除検出 ((9))、未コミット変更の帰属不明 ((10))、上位合意矛盾（bounded parent decision resolution で decision_context が現行正規成果物間の矛盾に起因する場合、REQ-006-114、DEC-008）、新規ユーザー判断事項（同 decision_context が新しいユーザー価値判断・対象範囲変更・外部契約変更を必要とする場合、REQ-006-114、DEC-008）。execution_unit 分割可能性があるにも関わらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する（case-open の契約・実装不整合であり要件doc 側の問題ではない）。各分類の定義、対応停止条件、再開コマンド候補の詳細は `agentdev-workflow-orchestration` を参照

### Step 8: 完了報告

最終工程（case-close 委譲）の完了報告をそのまま出力する。Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り、case-auto は書き込まない、G16）。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する

完了報告には以下を含める（停止時フォーマットを含む）: 停止理由分類（Step 7-1 経由、または経路H の user-decision-required（REQ-015-012、「adversarial-review 由来の停止伝播（経路H）」節参照））、開始時刻・終了時刻・所要時間（人間が読みやすい形式）、工程別タイムスタンプ内訳（L1、req-save+spec-save 統合委譲 / case-open / case-run / case-close、スキップした工程は除外可、case-run の L2 内訳は case-run result から読み取って含める）、インライン実行の記録（case-run をインライン実行した旨）、orchestration stage 別結果・フォールバック理由・破棄回復記録（stage 1 case-open / stage 2 case-run / stage 3 case-close、stage 2 を順次フォールバック時は理由、bg task 破棄を検知して回復した場合は状態区分と回復結果）、結果状態の4次元報告（(1) 工程結果 pass/warn/fail / (2) artifact_action 適用結果 applied/skipped/failed/no-op / (3) 定義適用工程の完了状態: 定義適用完了・警告付き工程完了・定義適用未完了 / (4) OU ライフサイクル完了状態: Issue 作成・PR 作成・PR マージ・Issue クローズ の各完了/未完了、warn を pass へ変換して集約しない、Phase 0 成功と OU 完了は別々に報告）。**OU処理ループ**: Standard flow の case-close 完了後に未処理 OU が残存する場合は次 OU の処理を Step 2 から開始（全 OU 処理完了時のみ全体完了報告）

## adversarial-review 由来の停止伝播（経路H）

Step 4（各工程の実行）で下位 command から adversarial-review 由来の user-decision-required + decision_context を受領した場合、case-auto は当該 execution_unit の自走を停止し、ユーザー判断を待機する（REQ-015-012）。停止伝播契約の詳細は `docs/specs/commands/case-auto.md`「adversarial-review 由来の停止伝播（経路H）」節を正とする。

- **受領**: case-run 起源は result `blocked` + user-decision-required 分類、工程委譲起源は既存 status + `parent_decision_required`（REQ-014-012、workflow-contracts SPEC「adversarial-review 由来の停止信号」節、delegation-contracts SPEC「review 経路での parent_decision_required / decision_context 適用」節）。user-decision-required は case-run result enum 第5状態ではなく停止理由分類である
- **自走停止**: 当該 execution_unit のみ停止。他 ready 対象は継続（部分停止、Step 4-1 Wave 反復制御、REQ-006-015/016）
- **ユーザー提示**: decision_context をユーザーへ提示し判断を待機
- **resume point**: case-run 起源は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源は当該工程の委譲起点（workflow-contracts SPEC「case-auto への伝播と resume point」節）
- **再開**: ユーザー判断解決後、resume point から再開。adversarial-review 再発動要否は adversarial-review SPEC「再 review 条件」「再 review 停止条件」に従い case-auto は独自判断しない（REQ-014-007）

case-auto は経路H において review 直接起動、finding 解釈、採否、再評価を行わない（REQ-015-012）。これらは下位 command の責務であり、case-auto は伝播と再開のみを担う。user-decision-required は Step 7-1 の HITL 境界停止条件分類（REQ-006-016/108）とは独立する停止理由分類である（REQ-014-012）。停止報告（Step 8）には user-decision-required を停止理由分類として含める

## bounded parent decision resolution（REQ-006-112〜114、DEC-008）

case-auto は下位 command から受領した decision_context を限定的に自律解決する。default-on + skip policy（REQ-014-013、REQ-015-002）と case-auto の自走性を両立し、ユーザー停止を本質的な場面へ集約する。解決範囲、作業仮定の明示要件、停止理由分類の詳細は `docs/specs/commands/case-auto.md`「bounded parent decision resolution（REQ-006-112〜114、DEC-008）」節、delegation-contracts SPEC「case-auto による decision_context の限定的親判断解決」節、workflow-contracts SPEC「bounded parent decision resolution と停止・resume 伝播」節が正である

- **自律解決（REQ-006-112）**: decision_context が現行正規成果物（REQ、Decision、SPEC、Issue その他合意済み情報）から一意に回答可能な場合、ユーザー停止せず回答して下位 command を resume させる
- **作業仮定で継続（REQ-006-113）**: 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細は、既存契約で許容された範囲に限り作業仮定と根拠を明示して自走継続できる
- **上位合意矛盾（REQ-006-114、DEC-008 決定3）**: decision_context が現行正規成果物間の矛盾に起因する場合、当該矛盾そのものが finding の対象であり一方を勝手に採用せず停止する（Step 7-1 停止理由分類「上位合意矛盾」）
- **新規ユーザー判断事項（REQ-006-114、DEC-008 決定4）**: 新しいユーザー価値判断、対象範囲変更、外部契約変更が必要な場合、既存停止経路でユーザーへ返す（Step 7-1 停止理由分類「新規ユーザー判断事項」）
- **resume（DEC-008 決定5）**: 回答、根拠、作業仮定を下位 command へ返し、既存 resume point（REQ-006-085）から処理を継続する。新規永続結果型は導入しない。adversarial-review 再実行要否は adversarial-review 側の再 review 契約（REQ-014-007/008）に従い case-auto は独自判断しない
- **中央集約 review engine とはならない（REQ-015-012 維持、DEC-008 決定6）**: case-auto は raw finding を解釈、採否、候補反映しない。下位 command が構造化した decision_context のみを解決対象とし、raw finding を case-auto へそのまま渡さない（REQ-006-112、AG-006）

## コンフリクト解消モデル（3レベルエスカレーション）

PR マージコンフリクト発生時（case-close Step 4-2 からのエスカレーション受領時）は、以下3レベルのエスカレーションで解消を図る。各レベルを試行しても解消できない場合のみ次のレベルへ進む。**機械的競合（rebase で自動解決可能）は停止条件に含まず**、Level 1 で case-close が解消する（Level 1 は case-close Step 4-2 の責務、本節では Level 2/3 の case-auto 責務を定義する）。Level 1（case-close、`git rebase` による機械的解消、自動解決時は再マージ、失敗時 case-auto へエスカレーション）、Level 2（case-auto、両PRのdiffを読み取りコンフリクト箇所を特定しコンフリクト文脈を付けてインライン case-run を再実行、最大2回＝元の並列実行を含む計3回の case-run 実行 AG-005、失敗時 Level 3 へ）、Level 3（case-auto、マージ順序変更、blocked 単位の隔離、失敗時停止）。Level 2 コンフリクト文脈付きインライン case-run 再実行（AG-005）、Level 3 オーケストレーション級判断、発生元非依存、停止条件の段階化の詳細は `agentdev-workflow-orchestration` を参照

## ガードレール

### 自走境界
- G01: 自走対象はrepoにファイルとして残る変更に限定する
- G02: 以下は自走対象外とする: DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報に関わる変更、repo外の実データ操作、通知送信
- G03: migrationファイル、IaCファイルの作成、修正は対象とし、migration実行、IaC applyは対象外とする
- G04: GitHub Issue/ PR/ comment/ merge/ close は自走対象とする
- G05: remote branch削除は当該case-auto/ case-runが作成したbranchに限定する
- G06: docs/ REQ/ ADR/ SPEC/ command reference/ guide の更新を自走対象に含める

### 委譲・参照制約
- G07: case-auto は委譲工程（req-save/ spec-save/ case-open/ case-close）を各コマンドの委譲契約に従って委譲起動する。各工程は対応するコマンド定義を authoritative source として実行する（手順の case-auto 定義内再実装は回避）。case-run はインライン実行する（標準動作、AG-001）。**委譲起動不能時**（AG-004）: Step 4「委譲起動判定」に従い `delegation-unavailable` として報告する。委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は Step 7 停止条件として扱い、`delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従い処理し、本 `delegation-unavailable` 停止条件には該当しない
- G08: 工程固有の詳細手順とcase-auto定義が矛盾する場合、工程固有処理は既存コマンド定義を優先し、自走境界、入力解決、工程間制御はcase-auto定義を優先する。各工程の実行は対応するコマンド定義に従う（case-run インライン実行時も case-run.md に従う）
- G09: 既存のreq-save/ spec-save/ case-open/ case-run/ case-closeの責務を変更しない。委譲起動、インライン実行は起動方式の変更であり、各コマンドの責務、ガードレール、成果物を変更しない
- G13: case-auto は Issue 階層決定ロジックを持ってはならない。複数 REQ doc または scale:large の場合は case-open の Issue 構造ルールに委譲する
- G14: case-auto は req-save 委譲から case-open 委譲への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価してはならない。保存結果をそのまま渡す
- G15: case-auto は Epic Wave 実行時、Wave 反復制御、現在 Wave の ready 子Issue 選択、子Issue 並列委譲（最大5件）を直接担当する（AG-003）。case-run(#epic) への委譲は行わない。各子Issue ごとにインライン case-run を実行する。Wave 境界のクローズは case-close(#epic) に委譲する
- G16: case-auto は独自の操作単位ステータス追跡を持ってはならない。Epic Issue のステータス追跡テーブルを使用する。**Epic Issue 本文の書き込みは case-close の単一書き手責務。case-auto は読み取るのみで書き込まない**
- G18: case-auto は操作単位キューの管理、制御のみを担い、OU 本文の抽出、変換、REQ 操作解釈を行わないこと
- G19: case-auto は orchestration pre-reader として case-open 完了前のみ req_draft を読み込み、case-open 成功後は invalid post-case reader として req_draft を読まないこと。case-open 成功後の停止、再開、完了処理は Issue と Epic（Epic Issue のステータス追跡テーブル含む）だけで成立させること。クリーンアップ検証ゲート（ドラフト削除検証）は case-open 完了後に実行すること。独自の OU 状態管理を持たないこと
- G20: OU 間依存は queue dependency として扱い、依存関係があるだけでは Epic Issue 化しないこと
- G21: case-auto は Epic Issue 化の判定に関与しないこと。case-open の判定結果に従うこと
- G27: 各工程の起動は工程別契約（Step 4 の契約表）に従うこと。inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する
- G28: case-auto は委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、委譲工程内部の調査過程、中間ログ、読解メモを親コンテキストに累積しないこと。case-run インライン実行時のコンテキスト管理は harness の機能で対応し、親コンテキスト非累積は case-run インライン実行時の例外として取り扱う
- G29: case-auto の所有対象は入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、case-run インライン実行時の準備/クリーンアップフェーズのオーケストレーション手順、orchestration stage 分離、orchestration stage 2 の固定並列数、bg task の状態管理、破棄検知、状態別回復、orchestration stage 1 と 3 の直列集約に限定する。bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析は harness の責務とする
- G30: subagent 委譲時の category 選定は委譲先 command の責務と category 名の意味的距離を評価して決定すること。事務的手続き（Issue 作成、VERIFY、状態遷移等）には `unspecified-high` を推奨し、`writing` category は執筆作業（docs 記述、REQ/ ADR/ SPEC 本文執筆等）のみに限定すること
- G31: 全ての subagent 委譲 prompt に MUST NOT DO セクションを必須とすること。スコープ外作業（当該 command 責務外のファイル作成、REQ/ SPEC/ src の直接修正、文書監査、capture 境界を超える `.agentdev/` 直接変更等）を明示的に列挙し、subagent がスコープ境界を推定せずに従えるようにすること
- G32: case-auto は orchestration stage 2 だけで case-run を並列起動する。orchestration stage 1 と 3 で case-run を並列起動せず、並列実行を利用できない場合だけ順次フォールバックへ切り替える

### 出力制約
- G10: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### Capture 整合制約
- G17: case-auto は構成コマンド（case-run/ case-close）の capture 責務境界に従い、各工程の責務を継承する（capture 境界 SPEC 準拠）。case-auto 固有の capture 振る舞いは持たない。capture 境界の詳細は `agentdev-workflow-orchestration` 参照

### 実行時パス制約
- G11: 既存コマンド定義を読み込む際、source path を実行時パスに読み替えてはならない。コマンド定義内のパス参照は記述された通りに解釈し、source path を実行時参照先として使用しない
- G12: 委譲先コマンドの実行時 Read/ Glob に source path 固定参照を含めない
- G33: 子 task bg task 破棄検知時の回復で、未コミット変更の帰属が確認できない場合に強制 commit を行わない。整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」（Step 7 停止条件 (10)）として報告する（AG-003）



