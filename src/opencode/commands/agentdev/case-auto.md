---
description: case-open→case-ready→case-run→case-closeを順次自走実行する（明示指定時のみ。再合意済みDefinition変更時はcase-revise→case-readyから）
---

# 最大自走モード

要件docから case-open → case-ready → case-run → case-close を順次実行し、repo 内の変更に限りマージまで自走する。
req-define で再合意済みの Definition 変更がある場合は case-revise → case-ready → case-run → case-close の例外経路を自走する。
標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## 入力

- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照。暗黙判断廃止、構造化 `draft-data` 形式）
- Issue番号（数値）または Issue URL: 既存 Root Case から継続工程（case-ready / case-run / case-close）を解決して自走する場合

## 出力

- Root Case（GitHub Issue）+ 実装済みブランチ + PR + マージ済み + クローズ済み（REQ/Decision/Design の保存は case-ready / case-revise の内部責務として実行）
- 工程に応じた各工程の出力（工程分岐は workflow 実装本体が所有）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-auto` スキルへ委譲する。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造、下位 workflow（case-open / case-ready / case-revise / case-run / case-close）の権威情報源と読込主体の割当ても同スキルの制御平面（control plane）が所有する。
case-auto は下位 workflow の契約確定後の上位 orchestrator として振る舞い、下位 workflow 詳細処理を複製しない。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 自走対象は GitHub Issue/PR/comment/merge/close 操作と repo 内にファイルとして残る変更（docs/、REQ/Decision/Design、command reference、guide を含む）に限定する
- 委譲工程（case-open/ case-ready/ case-revise/ case-close）は各コマンドの委譲契約に従って委譲起動し、各工程は対応する Workflow Skill を権威情報源として実行する（手順の case-auto 定義内再実装は回避）。case-run はインライン実行する（標準動作、`agentdev-workflow-case-run` を権威情報源として読み込む）。委譲起動不能時は `delegation-unavailable` として報告し、委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は停止条件として扱い `delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従って処理する。工程固有の詳細手順と case-auto 定義が矛盾する場合は工程固有処理（既存コマンド定義）を優先し、自走境界・入力解決・工程間制御は case-auto 定義を優先する（委譲起動・インライン実行は起動方式の変更であり、既存コマンドの責務・ガードレール・成果物を変更しない）
- 通常経路（case-open → case-ready → case-run → case-close）を自動継続し、req-define で再合意済みの Definition 変更がある場合は例外経路（case-revise → case-ready → case-run → case-close）を自動継続する。新しい意味判断が必要となった場合は blocked とし Root Case の resume_command: req-define で停止する（req-define の壁打ちは自動化しない）
- orchestration stage モデル（stage 1 case-open（例外経路時は case-revise）→ stage 2 case-ready → クリーンアップ検証ゲート → stage 3 case-run（インライン）→ stage 4 case-close）に従い、各 orchestration stage は stage 内最大並列（直列化要因のみ局所直列化）・stage 間全対象収束（fan-in）で進行し、対象ごとの縦切り pipeline としない。当該 stage に属する全対象が正常完了し、または当該実行において後続 stage へ進めないことが既存契約上確定した結果（blocked / failed / delegation-unavailable 等の後続不能確定）に収束するまで次 stage を開始せず（未実行・実行中・状態不明・再試行要否未確定対象の残存は収束済みとしない）、後続不能対象を後続 stage の対象から除外しその存在だけを理由として独立した他対象の進行を停止しない。stage 1 の収束条件には全対象確立後の横断依存検査の実施を含める（並列 case-open によって兄弟対象をタイミング依存で欠落させない）。scheduling 制約（最大同時起動数・起動間隔・順次フォールバック）による batch 分割を orchestration stage の分割として扱わず、Epic execution_unit の Wave 間および最終 Wave の case-close(#epic) を Wave 反復を進行・完結させる stage 3 内部処理として扱い stage 4 の開始とみなさない（epic-wave-model Design「ドラフト間並列実行モデル」）。case-run internal lifecycle（state machine、self-healing loop 等）を複製せず case-run 側の正規所有に委譲する
- クリーンアップ検証ゲート（ドラフト残存、RU 残存の検証）を stage 2（case-ready）の対象群収束後・stage 3 開始前に実行し、stage 2 を正常完了した対象について残存を検出した場合は停止する。stage 2 が blocked / failed / 中断等で正常完了していない対象について、既存 lifecycle 契約に従って保持された draft / RU を cleanup 違反として扱わない（case-auto 実行契約）
- case-open 前だけ req_draft を orchestration pre-reader として読み込み、case-ready 成功後は invalid post-case reader として req_draft を読まない。case-ready 成功後の停止、再開、完了処理は Issue と Epic（ステータス追跡テーブル含む）だけで成立させる
- case-auto は case-ready が確定した Epic、Wave、Issue 構造に従って進行する（Issue 階層の決定と Epic Issue 化の判定は case-open / case-ready が担い、case-auto はその確定結果に従う。OU 間依存はキュー依存として扱い、依存関係のみで Epic Issue 化しない）。case-auto は OU 本文の抽出・変換・REQ 操作解釈を行わずキュー管理のみを担う
- Epic Wave 実行時は Wave 反復制御・現在 Wave の ready 子Issue 選択・子Issue 並列委譲（最大5件）を case-auto が直接担当し、子Issue ごとにインライン case-run を実行する（case-run(#epic) への委譲は行わない）。Wave 境界のクローズは case-close(#epic) に委譲する。ステータス追跡は Epic Issue のステータス追跡テーブルを使用し、独自の操作単位ステータス追跡を持たない
- 各工程の起動は工程別契約に従い、inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する。委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、調査過程・中間ログ・読解メモは親コンテキストに累積しない
- 完了報告は4状態（各工程の実行結果 pass/warn/fail、artifact_action の適用結果 applied/skipped/failed/no-op、定義適用工程の完了状態（case-ready の Definition 保存・確定の成否）、OU ライフサイクルの完了状態（Issue 作成 / PR 作成 / PR マージ / Issue クローズ））を区別して集計・報告する。warn を pass へ変換して集約せず、Phase 0 成功（Definition 確定）と OU 完了を別々に報告する
- case-auto の所有対象は入力解決、auto_gate確認、工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、case-run インライン実行時の準備/クリーンアップフェーズのオーケストレーション手順、orchestration stage（stage 1 case-open・stage 2 case-ready・stage 4 case-close は stage 内最大並列実行、stage 3 case-run 並列実行、stage 間は対象群収束で進行）、stage 3 の固定並列数、bg task の状態管理・破棄検知・状態別回復、共有書き込みの局所直列化（main push / capture / commit、同一 Epic Issue 本文更新）、起動時対象集合の維持（ローカル一時実行状態）に限定する（harness 実行機構との責務分界は harness 分離モデル Design 参照）
- subagent 委譲 prompt は MUST DO / MUST NOT DO の明示構造を持ち、スコープ外作業（当該 command 責務外のファイル作成、REQ/ Design/ src の直接修正、文書監査、capture 境界を超える `.agentdev/` 直接変更等）を列挙する。category 選定は委譲先 command の責務と category 名の意味的距離で評価し、事務的手続き（Issue 作成、VERIFY、状態遷移等）には `unspecified-high` を、`writing` category は執筆作業（docs 記述、REQ/ Decision/ Design 本文執筆等）に限定する。subagent 委譲 prompt と工程間の引き継ぎは、構造化文脈（10意味）を構造化して含む（委譲時の直列化形式は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形、工程間の形式は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎが所有）
- case-run の並列起動は orchestration stage 3 のみで行い、stage 1・2・4 では case-run を並列起動しない（並列実行を利用できない場合のみ順次フォールバック）。capture は構成コマンド（case-run/ case-close）の capture 責務境界に従って継承し、case-auto 固有の capture 振る舞いを持たない（capture 境界は `agentdev-workflow-orchestration` 参照）。成果物本文は verbatim で返し、判定結果・調査過程・中間ログ・読解メモは要約・圧縮して返す
- 各工程の起動時に前置ガードとして git log で当該工程成果物の既存 commit を確認する。成果物が既に commit 済みの場合は配置検証のみで pass 判定する配置検証モードへ切替え、同一成果物の二重 commit と内容衝突を予防する。未 commit の場合は通常経路で当該工程を実行する
- 既存コマンド定義内のパス参照は記述された通りに解釈し、source path を実行時パスに読み替えて使用しない。委譲先コマンドの実行時 Read/ Glob へ source path 固定参照を含めない

## ガードレール

否定規則は課金・認証・破壊的操作・state 破壊等の硬い境界に限定する:

- 自走対象外は DB migration 実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報に関わる変更、repo外の実データ操作、通知送信とする（migrationファイル、IaCファイルの作成・修正は対象、実行・apply は対象外）
- remote branch 削除は当該 case-auto/ case-run が作成した branch に限定する
- Epic Issue 本文の書き込みは case-close の単一書き手責務であり、case-auto は読み取りのみを行う（`POL-epic-tracking-single-writer`）
- 子 task bg task 破棄検知時の回復で、未コミット変更の帰属が確認できない場合に強制 commit は行わない。整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」（停止条件の1つ）として報告する
