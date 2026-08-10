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
- artifact_actions に応じた各工程の出力（工程分岐は `agentdev-workflow-case-auto` スキル参照）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-auto` スキルへ委譲する（DEC-010、REQ-002-001）。同スキルが8 STEP の control plane として制御構造を所有する。

- **STEP-1** 入力解決・開始時刻記録 — `case_auto_started_at` 記録、Issue番号/URL 入力モード vs 要件doc 入力モード（4パターン）分岐
- **STEP-2** work_type 読取・工程分岐 — `artifact_actions` ベース動的判定（req-save/spec-save/case-open/case-run/case-close の部分集合）、auto_gate preflight
- **STEP-3** orchestration 実行 — orchestration stage モデル（stage 1 case-open / stage 2 case-run bg task 最大5件 / stage 3 case-close）、Wave 反復制御（AG-003、子Issue 並列インライン case-run 最大5件、委譲→case-close(#epic)）、インライン case-run 実行（AG-001/002）、bg task 破棄検知時の3状態回復（AG-001〜AG-004）、工程間状態引き継ぎ、複数REQ対応（G13/G14/G21）、OU処理順序、クリーンアップ検証ゲート、委譲起動判定（AG-004 delegation-unavailable 停止条件）、Subagent 委譲プロトコル（category 選定、MUST NOT DO 必須化）
- **STEP-4** 停止条件検出・停止理由分類 — 11項目停止条件、9軸停止理由分類（req-define 逸脱 / command 契約不整合 / スコープ拡大 / repo 外実体変更 / CI 失敗 / branch 削除 / 帰属不明 / 上位合意矛盾 / 新規ユーザー判断）、停止時タイミング情報の追記
- **STEP-5** adversarial-review 経路H 停止伝播 — user-decision-required + decision_context 受領（case-run 起源は result blocked、工程委譲起源は parent_decision_required）、当該 execution_unit の自走停止・ユーザー提示・resume point・再開（adversarial-review 再発動要否は同 SPEC に従う）
- **STEP-6** bounded parent decision resolution — decision_context の限定的自律解決（自律解決 / 作業仮定 / 上位合意矛盾停止 / 新規ユーザー判断停止）、中央集約 review engine とはならない（AG-006 raw finding を解釈しない）
- **STEP-7** コンフリクト解消 Level 2/3 — Level 1 は case-close 責務、Level 2 インライン case-run 再実行（最大2回、計3回 AG-005）、Level 3 マージ順序変更・blocked 隔離、解消不能時は STEP-4 停止（条件 (8)）
- **STEP-8** 完了報告 — L1 タイムスタンプ内訳、結果状態4次元集約（warn 変換禁止、Phase 0 成功と OU 完了は別々）、orchestration stage 別結果・フォールバック理由・破棄回復記録、OU処理ループ（次 OU は STEP-2 へ）、経路H user-decision-required を停止理由分類として含める

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-case-auto` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-002-017）。

**共通ルール**（全 STEP 適用、詳細は workflow skill 参照）: 自走境界（repo 内変更のみ、DB migration 実行・deploy/apply・クラウド・外部SaaS・課金・権限・認証・repo 外実データ・通知送信は対象外）、親コンテキスト非累積（委譲工程の完了結果のみ保持）、3つの「5件」文脈の区別（(1) case-run Wave 内子Issue 並列、(2) case-auto Phase 2 同時起動数、(3) execution_unit 全体並列は上限なし）、OU処理ループ（未処理 OU 残存時は STEP-2 べ戻る）

## ガードレール

### 自走境界
- G01: 自走対象はrepoにファイルとして残る変更に限定する
- G02: 以下は自走対象外とする: DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報に関わる変更、repo外の実データ操作、通知送信
- G03: migrationファイル、IaCファイルの作成、修正は対象とし、migration実行、IaC applyは対象外とする
- G04: GitHub Issue/ PR/ comment/ merge/ close は自走対象とする
- G05: remote branch削除は当該case-auto/ case-runが作成したbranchに限定する
- G06: docs/ REQ/ ADR/ SPEC/ command reference/ guide の更新を自走対象に含める

### 委譲・参照制約
- G07: case-auto は委譲工程（req-save/ spec-save/ case-open/ case-close）を各コマンドの委譲契約に従って委譲起動する。各工程は対応するコマンド定義を authoritative source として実行する（手順の case-auto 定義内再実装は回避）。case-run はインライン実行する（標準動作、AG-001）。**委譲起動不能時**（AG-004）: orchestration 実行 STEP「委譲起動判定」に従い `delegation-unavailable` として報告する。委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は停止条件検出 STEP の停止条件として扱い、`delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従い処理し、本 `delegation-unavailable` 停止条件には該当しない
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
- G27: 各工程の起動は工程別契約（orchestration 実行 STEP の契約表）に従うこと。inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する
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
- G33: 子 task bg task 破棄検知時の回復で、未コミット変更の帰属が確認できない場合に強制 commit を行わない。整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」（停止条件検出 STEP の条件 (10)）として報告する（AG-003）



