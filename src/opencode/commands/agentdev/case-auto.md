---
description: req-save→design-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
---

# 最大自走モード

要件docから req-save → design-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。
標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## workflow 実装の権威情報源

本コマンドの workflow 実装本体（Step 1〜8 の詳細、Wave 反復制御、bounded parent decision resolution、コンフリクト解消モデル Level 2/3、adversarial-review 停止伝播 経路H、結果状態の4次元集約、L1 タイムスタンプ計測、orchestration stage モデル、子 task bg task 破棄検知時の回復）は `agentdev-workflow-case-auto` Workflow Skill を権威情報源とする（責務3層分化、workflow-skill-model Design 準拠）。
本コマンド定義は公開 interface / dispatch のみを所有し、workflow 実装本体を複製しない。
case-auto は下位 workflow（req-save / design-save / case-open / case-run / case-close）の契約確定後の上位 orchestrator として振る舞う。

**下位 workflow の権威情報源（REQ-{NNNN}-{NNN}/{NNN}）**: 各工程は対応する Workflow Skill を権威情報源として読み込む。
委譲工程（req-save / design-save / case-open / case-close）の委譲先 subagent は `agentdev-workflow-req-save`、`agentdev-workflow-design-save`、`agentdev-workflow-case-open`、`agentdev-workflow-case-close` を権威情報源として読み込み、工程固有手続きの再実装を回避する。
case-run インライン実行の読込主体は case-auto 自身であり、`agentdev-workflow-case-run` を権威情報源として読み込む（起動手段は harness 分離モデル Design 参照）。
case-auto は下位 workflow 詳細処理を複製しない。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-case-auto`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-case-auto.yaml`、kind: workflow-extension）を読み込む。
extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。
詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（数値）または Issue URL: 既存Issue から case-run → case-close を自走する場合
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照。暗黙判断廃止、構造化 `draft-data` 形式）

## 出力

- REQ/Decision artifact_actions がある場合: REQ/Decisionファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は STEP-3 参照）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-auto` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}、REQ-{NNNN}-{NNN}）。
同スキルが8 STEP の control plane として制御構造を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 入力解決・開始時刻記録 | 要件doc または Issue番号/URL 指定 | 入力モード確定・`case_auto_started_at` 記録 | 入力が構造化 `draft-data` 形式で解決されていること |
| STEP-2 work_type 読取 | 入力解決済み | work_type・工程順序の確定（artifact_actions ベース、auto_gate preflight） | `agentdev-workflow-lifecycle` 基準に従っていること |
| STEP-3 工程分岐 | work_type 読取済み | 工程別契約の確定（req-save+design-save / case-open / case-run / case-close） | 各工程の起動が工程別契約（inputs / output_contract）に従っていること |
| STEP-4 orchestration 実行 | 工程順序確定 | 各工程の実行結果・stage モデル適用・Wave 反復・bg task 状態管理 | orchestration stage 2 の固定並列数（最大5件）と stage 1/3 の直列集約に従っていること |
| STEP-5 工程間の状態引き継ぎ | 工程結果受領 | 次工程への入力引き渡し（完了結果のみ）+ 構造化文脈の引き継ぎ | 保存結果のフィルタリング・再評価を行わずそのまま渡していること。構造化文脈（10意味）が次工程へ構造化して渡されていること |
| STEP-6 複数REQ対応 | 複数 REQ doc または未処理 OU 残存 | 次 REQ/OU の処理ループ継続 | 全 OU 処理完了時にのみ全体完了報告であること |
| STEP-7 停止条件の検出・停止理由分類 | 各工程の結果受領 | 停止判定（11項目）・停止理由分類（7軸＋上位合意矛盾/新規ユーザー判断） | 停止時報告に再開点と再開可能な次コマンドが明示されていること |
| STEP-8 完了報告 | 全工程完了 or 停止 | L1 タイムスタンプ・4次元集約・結果状態の分離報告 | 結果状態（完了/進行/未実行）が分離して報告されていること |

**adversarial-review 由来の停止伝播（経路H）**: 下位 command から adversarial-review 由来の user-decision-required + decision_context を受領した場合、当該 execution_unit の自走を停止し、ユーザー判断を待機する。
user-decision-required は STEP-7 の HITL 境界停止条件分類とは独立する停止理由分類である。

**bounded parent decision resolution**: case-auto は下位 command から受領した decision_context を限定的に自律解決する。
case-auto は raw finding を解釈、採否、候補反映しない（AG-{NNN}）。

**コンフリクト解消モデル（3レベルエスカレーション）**: Level 1（case-close、`git rebase` による機械的解消）、Level 2（case-auto、コンフリクト文脈付きインライン case-run 再実行 AG-{NNN}、最大2回）、Level 3（case-auto、マージ順序変更、blocked 単位の隔離）。
機械的競合（rebase で自動解決可能）は停止条件に含まず、Level 1 で case-close が解消する。

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-auto` が所有する。
同 Workflow Skill は `/agentdev/case-auto` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 自走対象は GitHub Issue/PR/comment/merge/close 操作と repo 内にファイルとして残る変更（docs/、REQ/Decision/Design、command reference、guide を含む）に限定する
- 委譲工程（req-save/ design-save/ case-open/ case-close）は各コマンドの委譲契約に従って委譲起動し、各工程は対応する Workflow Skill を権威情報源として実行する（手順の case-auto 定義内再実装は回避）。case-run はインライン実行する（標準動作、AG-{NNN}、`agentdev-workflow-case-run` を権威情報源として読み込む）。委譲起動不能時は `delegation-unavailable` として報告し、委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は停止条件として扱い `delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従って処理する。工程固有の詳細手順と case-auto 定義が矛盾する場合は工程固有処理（既存コマンド定義）を優先し、自走境界・入力解決・工程間制御は case-auto 定義を優先する（委譲起動・インライン実行は起動方式の変更であり、既存コマンドの責務・ガードレール・成果物を変更しない）
- 既存コマンド定義内のパス参照は記述された通りに解釈し、source path を実行時パスに読み替えて使用しない。委譲先コマンドの実行時 Read/ Glob へ source path 固定参照を含めない
- Issue 階層の決定と Epic Issue 化の判定は case-open が担い、case-auto は case-open の判定結果に従う（OU 間依存は queue dependency として扱い、依存関係のみで Epic Issue 化しない）。req-save 委譲から case-open 委譲への状態引き継ぎでは複数 REQ doc の保存結果をそのまま渡す。case-auto は OU 本文の抽出・変換・REQ 操作解釈を行わずキュー管理のみを担う
- Epic Wave 実行時は Wave 反復制御・現在 Wave の ready 子Issue 選択・子Issue 並列委譲（最大5件）を case-auto が直接担当し、子Issue ごとにインライン case-run を実行する（case-run(#epic) への委譲は行わない）。Wave 境界のクローズは case-close(#epic) に委譲する。ステータス追跡は Epic Issue のステータス追跡テーブルを使用し、独自の操作単位ステータス追跡を持たない
- case-open 完了前は orchestration pre-reader として req_draft を読み込み、case-open 成功後は Issue と Epic（ステータス追跡テーブル含む）だけで停止・再開・完了処理を成立させる。クリーンアップ検証ゲート（ドラフト削除検証）は case-open 完了後に実行する
- 各工程の起動は工程別契約（STEP-3 の契約表）に従い、inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する。委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、調査過程・中間ログ・読解メモは親コンテキストに累積しない
- case-auto の所有対象は入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、case-run インライン実行時の準備/クリーンアップフェーズのオーケストレーション手順、orchestration stage 分離、stage 2 の固定並列数、bg task の状態管理・破棄検知・状態別回復、stage 1/3 の直列集約に限定する（harness 実行機構との責務分界は harness 分離モデル Design 参照）
- subagent 委譲 prompt は MUST DO / MUST NOT DO の明示構造を持ち、スコープ外作業（当該 command 責務外のファイル作成、REQ/ Design/ src の直接修正、文書監査、capture 境界を超える `.agentdev/` 直接変更等）を列挙する。category 選定は委譲先 command の責務と category 名の意味的距離で評価し、事務的手続き（Issue 作成、VERIFY、状態遷移等）には `unspecified-high` を、`writing` category は執筆作業（docs 記述、REQ/ ADR/ Design 本文執筆等）に限定する。subagent 委譲 prompt と工程間の引き継ぎは、構造化文脈（10意味）を構造化して含む（委譲時の直列化形式は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形、工程間の形式は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎが所有）
- case-run の並列起動は orchestration stage 2 のみで行い、stage 1 と 3 では並列起動を行わない（並列実行を利用できない場合のみ順次フォールバック）。capture は構成コマンド（case-run/ case-close）の capture 責務境界に従って継承し、case-auto 固有の capture 振る舞いを持たない（capture 境界は `agentdev-workflow-orchestration` 参照）。成果物本文は verbatim で返し、判定結果・調査過程・中間ログ・読解メモは要約・圧縮して返す
- 実証Caseを draft-data の実証情報または Issue 等の永続情報の実証Case識別情報から認識し、復元した評価ブランチを統合先として全工程へ一貫して伝播する（同時に複数実証を処理する場合はそれぞれ異なる評価ブランチを利用）。実証であることだけを理由に req-save / design-save を省略しない。Epic 実証の各 Wave の case-run → case-close は同じ評価ブランチ上で反復する。評価ブランチへの squash merge を正常なCase完了として扱い、採用でも評価ブランチを main へ merge せず、同一実行内で正式化・本実装へ自動継続しない（実証全体の最終 case-close を当該実行の正常終了点とする）。blocked / failed / 中断時に再開可能なら評価ブランチを保持し、実証の明示的な終了・放棄時のみ必要な記録後に破棄する。評価契約を自律変更しない（ユーザーが評価契約変更を明示した場合は変更履歴と既存結果への影響を保持し、必要な再評価または再実行を継続する）。最終出力に評価結果、実証Issue、主要PRまたは証拠、main 未反映であること、次の req-define <実証Issue> を含め、正式化案内は実証全体の完了時のみ示す（blocked / failed 等で実証が未完のまま終了する場合は評価結果を未確定として再開手段を示す）

## ガードレール

硬い境界（課金・認証・破壊的操作・state 破壊等の否定規則）に限定する:

- G02: 自走対象外は DB migration 実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報に関わる変更、repo外の実データ操作、通知送信とする（migrationファイル、IaCファイルの作成・修正は対象、実行・apply は対象外）
- G05: remote branch 削除は当該 case-auto/ case-run が作成した branch に限定する
- G16: Epic Issue 本文の書き込みは case-close の単一書き手責務であり、case-auto は読み取りのみを行う
- G33: 子 task bg task 破棄検知時の回復で、未コミット変更の帰属が確認できない場合に強制 commit は行わない。整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」（STEP-7 停止条件 (10)）として報告する（AG-{NNN}）
