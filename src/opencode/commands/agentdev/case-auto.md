---
description: req-save→spec-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
---

# 最大自走モード

要件docから req-save → spec-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## workflow 実装の権威情報源

本コマンドの workflow 実装本体（Step 1〜8 の詳細、Wave 反復制御、bounded parent decision resolution、コンフリクト解消モデル Level 2/3、adversarial-review 停止伝播 経路H、結果状態の4次元集約、L1 タイムスタンプ計測、orchestration stage モデル、子 task bg task 破棄検知時の回復）は `agentdev-workflow-case-auto` Workflow Skill を権威情報源とする（責務3層分化、workflow-skill-model SPEC 準拠）。本コマンド定義は公開 interface / dispatch のみを所有し、workflow 実装本体を複製しない。case-auto は下位 workflow（req-save / spec-save / case-open / case-run / case-close）の契約確定後に上位 orchestrator として振る舞う。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-auto.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（数値）または Issue URL: 既存Issue から case-run → case-close を自走する場合
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照。暗黙判断廃止、構造化 `draft-data` 形式）

## 出力

- REQ/Decision artifact_actions がある場合: REQ/Decisionファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は Step 3 参照）

## 手順（Step 概要）

各 Step の実装詳細、判定基準、状態遷移、入力モード分岐、停止条件、停止理由分類、完了報告フォーマットは `agentdev-workflow-case-auto` を参照。本コマンド定義は Step 名と公開契約のみを列挙する。

### Step 1: 入力解決

実行開始時刻（JST）を `case_auto_started_at` に記録し、入力モード（Issue番号/URL 入力モード または 要件doc入力モード）を分岐する。要件doc入力モードのサブ分岐（引数なしデフォルト、明示パス指定、セッション指定キーワード、特定不可）と複数draft読み込み時の順序制御の詳細は `agentdev-workflow-case-auto` 参照。

### Step 2: work_type 読取

入力要件docの `draft-data` から work_type を取得する（参考情報、パイプライン分岐の判定には使用しない）。

### Step 3: 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定）

Issue番号/URL 入力時は case-run → case-close へ分岐（req-save、spec-save、case-open、work_type読取スキップ）。要件doc入力時は `artifact_actions` 存在による動的判定で req-save / spec-save / case-open / case-run / case-close へ分岐する。`auto_gate preflight`（`auto_gate.auto_ready` が false または未解決 item 残る場合の停止）の詳細は `agentdev-workflow-case-auto` 参照。

### Step 4: 各工程の実行

各工程を委譲起動（req-save / spec-save / case-open / case-close）またはインライン実行（case-run、AG-001/002）する。実行モデル原則、工程別契約、QG-1〜QG-4 の継承、L1 タイムスタンプ計測、インライン実行時のコンテキスト管理、結果状態の4次元集約、Wave 反復制御（Step 4-1）、OU 処理順序、クリーンアップ検証ゲート、委譲起動判定、Subagent 委譲プロトコル、orchestration stage モデル、子 task bg task 破棄検知時の回復の各詳細は `agentdev-workflow-case-auto` を参照。case-run インライン実行時も case-run.md を authoritative source として読み込む。各工程の結果に基づいて次工程へ進むか停止条件（Step 7）を判定する。req-save/case-open の委譲に draft path と OU ID のみを渡す（OU 本文の切り出しは行わない）。OU の統合・分割・REQ 操作分類・Issue 階層判定を再評価しない（各工程の判定結果に従う）。

### Step 5: 工程間の状態引き継ぎ

各工程の起動結果（Issue番号、PR番号）を次工程の入力として渡す。RU ファイルパス（case-open 委譲の RU 削除で使用）、capture 対象情報（case-close 委譲の learning/intake capture で使用）を最終工程まで保持する。

### Step 6: 複数REQ対応

req-save 委譲の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールを使用（G13）。req-save から case-open への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリング・再評価なしでそのまま渡す（G14）。Epic Issue 化の判定には関与しない（G21）。case-open の判定結果に従う。

### Step 7: 停止条件の検出

11項目の停止条件のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する。停止時タイミング情報の追記（`case_auto_started_at`、停止時刻、経過時間、工程別タイムスタンプ内訳）を含める。停止条件の全量、停止時タイミング情報フォーマットの詳細は `agentdev-workflow-case-auto` 参照。

### Step 7-1: 停止理由分類

Step 7 の停止条件を8分類軸で報告する（HITL 境界の変更ではなく、再開コマンド選択とユーザー通知の精度向上が目的）。各分類の定義、対応停止条件、再開コマンド候補の詳細は `agentdev-workflow-case-auto` 参照。

### Step 8: 完了報告

最終工程（case-close 委譲）の完了報告をそのまま出力する。Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り、case-auto は書き込まない、G16）。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する。完了報告の全項目（停止理由分類、タイムスタンプ内訳、インライン実行記録、orchestration stage 別結果、結果状態の4次元報告）の詳細は `agentdev-workflow-case-auto` 参照。**OU処理ループ**: Standard flow の case-close 完了後に未処理 OU が残存する場合は次 OU の処理を Step 2 から開始（全 OU 処理完了時のみ全体完了報告）。

## adversarial-review 由来の停止伝播（経路H）

Step 4（各工程の実行）で下位 command から adversarial-review 由来の user-decision-required + decision_context を受領した場合、case-auto は当該 execution_unit の自走を停止し、ユーザー判断を待機する。受領形式、自走停止、ユーザー提示、resume point、再開、case-auto が行わないこと（review 直接起動、finding 解釈、採否、再評価の禁止）の実装詳細は `agentdev-workflow-case-auto` の `references/stop-and-decision-resolution.md`（STEP-5）を参照。停止伝播契約の SSoT は case-auto command SPEC「adversarial-review 由来の停止伝播（経路H）」節、workflow-contracts SPEC、delegation-contracts SPEC が正である。user-decision-required は Step 7-1 の HITL 境界停止条件分類とは独立する停止理由分類である。停止報告（Step 8）には user-decision-required を停止理由分類として含める。

## bounded parent decision resolution

case-auto は下位 command から受領した decision_context を限定的に自律解決する。default-on + skip policy と case-auto の自走性を両立し、ユーザー停止を本質的な場面へ集約する。自律解決、作業仮定で継続、上位合意矛盾、新規ユーザー判断事項、resume 機構、中央集約 review engine 非化の実装詳細は `agentdev-workflow-case-auto` の `references/stop-and-decision-resolution.md`（STEP-6）を参照。解決範囲、作業仮定の明示要件、停止理由分類の詳細は case-auto command SPEC「bounded parent decision resolution」節、delegation-contracts SPEC「case-auto による decision_context の限定的親判断解決」節、workflow-contracts SPEC「bounded parent decision resolution と停止・resume 伝播」節が正である。case-auto は raw finding を解釈、採否、候補反映しない（AG-006）。

## コンフリクト解消モデル（3レベルエスカレーション）

PR マージコンフリクト発生時（case-close Step 4-2 からのエスカレーション受領時）は、3レベルのエスカレーションで解消を図る。Level 1（case-close、`git rebase` による機械的解消）は case-close Step 4-2 の責務。Level 2（case-auto、コンフリクト文脈付きインライン case-run 再実行 AG-005、最大2回）、Level 3（case-auto、マージ順序変更、blocked 単位の隔離）の実装詳細は `agentdev-workflow-case-auto` の `references/conflict-resolution-and-reporting.md`（STEP-7）を参照。機械的競合（rebase で自動解決可能）は停止条件に含まず、Level 1 で case-close が解消する。停止条件の段階化（Level 2 再委譲上限回数試行後停止、発生元非依存でアクセス可能文脈を総動員）の詳細も同節参照。

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



