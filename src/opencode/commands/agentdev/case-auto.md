---
description: req-save→design-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
---

# 最大自走モード

要件docから req-save → design-save → case-open → case-run → case-close を順次実行し、repo 内の変更に限りマージまで自走する。
標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## 入力

- Issue番号（数値）または Issue URL: 既存 Issue から case-run → case-close を自走する場合
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照。暗黙判断廃止、構造化 `draft-data` 形式）

## 出力

- REQ/Decision artifact_actions がある場合: REQ/Decision ファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は workflow 実装本体が所有）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-auto` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造、下位 workflow（req-save / design-save / case-open / case-run / case-close）の権威情報源と読込主体の割当ても同スキルの制御平面（control plane）が所有する。
case-auto は下位 workflow の契約確定後の上位 orchestrator として振る舞い、下位 workflow 詳細処理を複製しない。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 自走対象は GitHub Issue/PR/comment/merge/close 操作と repo 内にファイルとして残る変更（docs/、REQ/Decision/Design、command reference、guide を含む）に限定する
- 委譲工程（req-save/ design-save/ case-open/ case-close）は各コマンドの委譲契約に従って委譲起動し、各工程は対応する Workflow Skill を権威情報源として実行する（手順の case-auto 定義内再実装は回避）。case-run はインライン実行する（標準動作、AG-{NNN}、`agentdev-workflow-case-run` を権威情報源として読み込む）。委譲起動不能時は `delegation-unavailable` として報告し、委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は停止条件として扱い `delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従って処理する。工程固有の詳細手順と case-auto 定義が矛盾する場合は工程固有処理（既存コマンド定義）を優先し、自走境界・入力解決・工程間制御は case-auto 定義を優先する（委譲起動・インライン実行は起動方式の変更であり、既存コマンドの責務・ガードレール・成果物を変更しない）
- 既存コマンド定義内のパス参照は記述された通りに解釈し、source path を実行時パスに読み替えて使用しない。委譲先コマンドの実行時 Read/ Glob へ source path 固定参照を含めない
- Issue 階層の決定と Epic Issue 化の判定は case-open が担い、case-auto は case-open の判定結果に従う（OU 間依存はキュー依存として扱い、依存関係のみで Epic Issue 化しない）。req-save 委譲から case-open 委譲への状態引き継ぎでは複数 REQ doc の保存結果をそのまま渡す。case-auto は OU 本文の抽出・変換・REQ 操作解釈を行わずキュー管理のみを担う
- Epic Wave 実行時は Wave 反復制御・現在 Wave の ready 子Issue 選択・子Issue 並列委譲（最大5件）を case-auto が直接担当し、子Issue ごとにインライン case-run を実行する（case-run(#epic) への委譲は行わない）。Wave 境界のクローズは case-close(#epic) に委譲する。ステータス追跡は Epic Issue のステータス追跡テーブルを使用し、独自の操作単位ステータス追跡を持たない
- case-open 完了前は orchestration pre-reader として req_draft を読み込み、case-open 成功後は Issue と Epic（ステータス追跡テーブル含む）だけで停止・再開・完了処理を成立させる。クリーンアップ検証ゲート（ドラフト削除検証）は case-open 完了後に実行する
- 各工程の起動は工程別契約に従い、inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する。委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、調査過程・中間ログ・読解メモは親コンテキストに累積しない
- case-auto の所有対象は入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、case-run インライン実行時の準備/クリーンアップフェーズのオーケストレーション手順、orchestration stage 分離、stage 2 の固定並列数、bg task の状態管理・破棄検知・状態別回復、stage 1/3 の直列集約に限定する（harness 実行機構との責務分界は harness 分離モデル Design 参照）
- subagent 委譲 prompt は MUST DO / MUST NOT DO の明示構造を持ち、スコープ外作業（当該 command 責務外のファイル作成、REQ/ Design/ src の直接修正、文書監査、capture 境界を超える `.agentdev/` 直接変更等）を列挙する。category 選定は委譲先 command の責務と category 名の意味的距離で評価し、事務的手続き（Issue 作成、VERIFY、状態遷移等）には `unspecified-high` を、`writing` category は執筆作業（docs 記述、REQ/ Decision/ Design 本文執筆等）に限定する。subagent 委譲 prompt と工程間の引き継ぎは、構造化文脈（10意味）を構造化して含む（委譲時の直列化形式は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形、工程間の形式は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎが所有）
- case-run の並列起動は orchestration stage 2 のみで行い、stage 1 と 3 では並列起動を行わない（並列実行を利用できない場合のみ順次フォールバック）。capture は構成コマンド（case-run/ case-close）の capture 責務境界に従って継承し、case-auto 固有の capture 振る舞いを持たない（capture 境界は `agentdev-workflow-orchestration` 参照）。成果物本文は verbatim で返し、判定結果・調査過程・中間ログ・読解メモは要約・圧縮して返す

## ガードレール

否定規則は課金・認証・破壊的操作・state 破壊等の硬い境界に限定する:

- 自走対象外は DB migration 実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報に関わる変更、repo外の実データ操作、通知送信とする（migrationファイル、IaCファイルの作成・修正は対象、実行・apply は対象外）
- remote branch 削除は当該 case-auto/ case-run が作成した branch に限定する
- Epic Issue 本文の書き込みは case-close の単一書き手責務であり、case-auto は読み取りのみを行う（`POL-epic-tracking-single-writer`）
- 子 task bg task 破棄検知時の回復で、未コミット変更の帰属が確認できない場合に強制 commit は行わない。整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」（停止条件の1つ）として報告する（AG-{NNN}）
