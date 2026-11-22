---
title: case-auto Design
status: accepted
created: 2026-06-21
updated: "2026-11-18"
---
<!-- ADF-COVERS(implementation): REQ-015-012 -->
<!-- ADF-COVERS(design): REQ-015-012 -->
<!-- ADF-COVERS(implementation): REQ-100-004 -->
<!-- ADF-COVERS(implementation): REQ-034-001, REQ-034-002, REQ-034-003, REQ-034-004, REQ-034-005, REQ-034-006, REQ-034-007, REQ-034-010, REQ-034-011, REQ-034-012, REQ-034-013, REQ-034-014, REQ-034-015, REQ-034-016, REQ-034-017, REQ-034-018, REQ-034-019, REQ-034-020, REQ-034-021, REQ-034-022, REQ-034-023, REQ-034-024, REQ-034-025, REQ-034-026, REQ-034-027, REQ-034-028, REQ-034-029, REQ-034-030, REQ-034-031, REQ-034-032, REQ-034-033, REQ-034-034, REQ-034-035, REQ-034-036, REQ-034-037, REQ-034-038, REQ-034-039, REQ-034-040, REQ-034-041, REQ-034-042, REQ-034-043, REQ-034-044, REQ-034-045, REQ-035-016, REQ-035-017 -->
<!-- ADF-COVERS(design): REQ-034-002, REQ-034-003, REQ-034-004, REQ-034-005, REQ-034-006, REQ-034-007, REQ-034-010, REQ-034-011, REQ-034-013, REQ-034-014, REQ-034-015, REQ-034-016, REQ-034-017, REQ-034-018, REQ-034-020, REQ-034-021, REQ-034-023, REQ-034-024, REQ-034-026, REQ-034-029, REQ-034-030, REQ-034-031, REQ-034-032, REQ-034-033, REQ-034-034, REQ-034-035, REQ-034-036, REQ-034-037, REQ-034-038 -->
<!-- ADF-COVERS(design): REQ-034-012, REQ-034-022, REQ-034-025, REQ-034-027, REQ-034-028, REQ-034-040, REQ-034-041, REQ-034-042, REQ-034-043, REQ-034-044, REQ-034-045, REQ-034-046, REQ-034-047, REQ-034-048, REQ-035-016, REQ-035-017 -->
<!-- ADF-COVERS(design): REQ-108-018, REQ-108-019, REQ-108-020, REQ-108-021, REQ-108-023（重要変更の通知と結果説明節。AG-001・004〜006 に対応） -->
<!-- ADF-COVERS(design): REQ-031-029, REQ-031-030 -->
<!-- ADF-COVERS(implementation): REQ-003-031 -->
<!-- ADF-COVERS(verification): REQ-034-037, REQ-034-038 -->
<!-- ADF-COVERS(implementation): REQ-003-017, REQ-003-018, REQ-006-108, REQ-034-002, REQ-034-003, REQ-034-007, REQ-034-010, REQ-034-011, REQ-034-012, REQ-034-013, REQ-034-014, REQ-034-015, REQ-034-016, REQ-034-018, REQ-034-019, REQ-034-020, REQ-034-021, REQ-034-022, REQ-034-023, REQ-034-024, REQ-034-025, REQ-034-026, REQ-034-027, REQ-034-028, REQ-034-029, REQ-034-030, REQ-034-031, REQ-034-032, REQ-034-034, REQ-034-035, REQ-034-036 -->
<!-- ADF-COVERS(design): REQ-101-017, REQ-032-038 -->
<!-- ADF-COVERS(design): REQ-108-002, REQ-108-008, REQ-108-012 -->
<!-- ADF-COVERS(implementation): REQ-104-009, REQ-104-010, REQ-104-011, REQ-104-012（採用規約の解決の実行経路接続節） -->
<!-- ADF-COVERS(design): REQ-125-002, REQ-125-003 -->

# case-auto Design

本 Design は骨格（公開契約と制御フロー）と references/ 詳細仕様の2層構成である。orchestration の詳細手順・停止分類・回復手順・停止伝播の詳細は references/case-auto/ 配下へ分離している。通常経路で全 reference を無条件読込せず、必要な条件に応じて遅延読み込みする。

## 目的

要件doc から case-open → case-ready → case-run → case-close を順次自走実行する最大自走モード。req-define で再合意済みの Definition 変更がある場合は case-revise → case-ready → case-run → case-close を自走する。
要求入口 2 つ（req-define、backlog-auto）から合流する標準実行コマンドである。標準導線は req-define 完了直後の単一要件doc 処理であり、引数なし時の drafts 全件処理は従来どおりの対象解決として維持する。

## 承認・HITL 境界

- case-auto は標準実行コマンドである（起動自体が唯一の事前判断）。
- 自走中に新規の承認点を追加しない。blocked / failed、停止条件検出時は自走を停止し、ユーザー判断を待つ（bounded parent decision resolution による decision_context の限定的親判断を除く）。
- ユーザー判断を待つ対象は、人間に留保された判断（REQ-096-005）の新規確定と、既存の安全境界が要求する操作承認である。判断の難易度、確信度、評価器間の不一致、結果状態、唯一解でないことだけを理由としてユーザー停止しない（REQ-096-004）。

### HITL question のスキップ可能キュー（RU-0162）

orchestration 中の警告・確認・選択肢提示に由来する HITL question は、工程の進行をブロックしない。下位 workflow は回答を要しない question をスキップ可能キューへ投入し、既定の安全側の挙動（警告の記録と継続、または当該対象のみの停止）で進行し、キューの内容を stage 境界または完了報告で一括提示する。人間に留保された判断（REQ-096-005）の新規確定と、既存の安全境界が要求する操作承認を要する停止は本キューの対象外とし、従来どおりブロッキングする（REQ-015-012、REQ-061-003 の停止契約は変更しない）。

## 入力

- Issue番号（数値）または Issue URL（Root Case を指定する。Root Case の正規状態、Epic 実行構成、既存成果物（設計PR、設計修正PR、実装PR等）、実行の生存状況から通常経路と例外経路を解決して自走する。再合意済み Definition 変更（canonical Definition に実変更あり）の場合は例外経路として case-revise → case-ready を駆動する。REQ-034-039）
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照（暗黙判断廃止、構造化 `draft-data` 形式: REQ-008, DEC-003））

## 出力

- Root Case + 実装済みブランチ + PR + マージ済み + クローズ済み（Definition 保存は case-ready / case-revise の内部責務）
- 工程に応じた各工程の出力（工程分岐は Workflow Skill を参照）

## 副作用

- 各工程（case-open / case-ready / case-revise / case-run / case-close）の副作用を集約
- 委譲起動: case-open、case-ready、case-close を各 Workflow Skill（agentdev-workflow-case-open / case-ready / case-close）の load 指定により実行担当サブエージェントへ委譲する（case-run はインライン実行）。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-002-002）
- git 操作: 各工程の委譲範囲内で実行。case-auto 自体は git 操作を行わない
- 自走対象: repo にファイルとして残る変更のみ。DB migration実行、deploy/apply、課金、権限変更は対象外

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-auto`）が正規情報源である。
複数対象を処理する場合、各 orchestration stage は stage 内最大並列・stage 間全対象収束（fan-in）で進行する（REQ-034-025。対象ごとの縦切り pipeline として実行しない）。

- 入力解決
  - 実行開始時刻の記録（REQ-034-023）（JST、人間が読みやすい形式で case_auto_started_at 変数に保持）
  - Issue番号/URL入力モード（^\d+$ または GitHub Issue URL の場合、Root Case の durable state に基づく継続工程へ分岐）
  - 要件doc入力モード（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定時は当該draft / セッション指定キーワード時はセッション内要件doc参照、暗黙判断は行わない）
- work_type 読取（draft-data から取得する参考情報。パイプライン分岐には使用しない）
- 工程分岐（work_type 固定分岐ではなく入力状態と artifact_actions による動的判定）
  - 要件doc入力: stage 1 case-open（例外経路時は case-revise）→ stage 2 case-ready → クリーンアップ検証ゲート（stage 2 対象群収束後・stage 3 開始前）→ stage 3 case-run（インライン）→ stage 4 case-close。stage 1 の収束条件には全対象確立後の横断依存検査の実施を含める（並列 case-open によって兄弟対象をタイミング依存で欠落させない。実現手順は Workflow Skill references）（REQ-034-025、RU 方向4の Design 受け皿）
  - 再合意済み Definition 変更: stage 1（case-revise → stage 2 case-ready）→ クリーンアップ検証ゲート → stage 3 case-run（インライン）→ stage 4 case-close
  - Issue番号/URL入力: Root Case の正規状態、Epic 実行構成、既存成果物から現在 stage を最も早い未収束 stage として再構成する（REQ-034-025、REQ-006-114）。再合意済み変更がある場合は case-revise から開始する
  - artifact_actions は case-ready の Definition action 入力へ渡し、work_type 固定分岐には使用しない
  - auto_gate preflight（auto_gate.auto_ready が false または未解決項目が残る場合は停止）
- 各工程の実行
  - 委譲工程（case-open / case-ready / case-revise / case-close）: 各コマンド委譲契約に従い実行担当サブエージェントとして起動。委譲起動不能時に delegation-unavailable 報告（REQ-002-003/004）
  - case-run（インライン実行）: case-auto が case-run の Workflow Skill（`agentdev-workflow-case-run`）を正規情報源として読み込み、準備/クリーンアップフェーズを自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲（委譲起点の折りたたみ/002）。adapter skill（agentdev-case-run-execution-adapter）を case-auto が読み込む
  - 結果状態の4次元集約（REQ-034-031）: 各工程の output_contract から (1) 工程結果 pass/warn/fail、(2) artifact_action 適用結果 applied/skipped/failed/no-op、(3) 定義適用工程完了状態、(4) OU ライフサイクル完了状態を収集し混同なく保持する。集約規則の詳細は後述「結果状態の4次元集約（REQ-034-031）」セクション
- Wave 反復制御（Epic Issue 指定時）
  - case-auto が Epic Issue 番号を記録。Epic Issue 本文の実行構成から Wave 構成、各子Issue 状態を読み取る（読み取りのみ。Epic Issue 本文の書き込みは case-close 相当の統合処理の責務）
  - case-auto が現在 Wave の未着手（pending）子Issue を認識し、Epic・Wave・Standard Issue を横断する共有 active Issue task 枠（REQ-034-027。上限・空き枠補充・起動間隔 10 秒は後述「runtime 制御契約」節と runtime-execution-model「runtime 制御ループ」節参照）で各子Issue へインライン case-run を実行。各子Issue の実行担当サブエージェントへ case-auto から直接委譲
  - case-run は単一 Issue 実行に専念し（REQ-031-015）、Wave 内子Issue の並列起動・fan-out/fan-in の制御は case-auto の orchestration が単一所有する（DEC-041）。case-run に独立実行枠は存在しない
  - completed-pr の子Issue がある場合、case-close(#epic) 相当の統合処理を Wave 反復を進行させる stage 3 内部処理として実施（統合処理は active Issue task の実行枠を消費しないが共有書き込みの直列化点として扱う。REQ-034-042）
  - 子 Issue の開始条件は必要な意味的依存条件の充足のみとする（依存充足ゲート・スロット型キュー。DEC-051）。Wave 収束（全子 Issue の実行結果確定）を後続の子 Issue 開始の前提としない。Wave 構成は意味的依存 DAG から導出される実行構成の記録単位として維持する（REQ-035-016）
  - 実装本体・手順の詳細は Workflow Skill（`agentdev-workflow-case-auto`）が単一所有し本 Design は複製しない。Wave 実行制御の単一所有は case-auto orchestration stage 3（「runtime 制御契約」節・DEC-041）が担う
- 工程間の状態引き継ぎ（Issue番号、PR番号、RU ファイルパス、capture 対象情報を最終工程まで保持）
- 複数REQ対応（case-ready の確定結果から複数 REQ doc または scale:large 検出時、確定済みの Issue 構造に従う）
- 停止条件の検出（停止時タイミング情報の追記。11項目の停止条件いずれかを検出時、実行停止。人間に留保された判断（REQ-096-005）の新規確定では Root Case へ req-define 再合意を要旨とする報告をコメントへ記録する）
- 完了報告（タイミング情報追記。インライン実行の適用を記録。結果状態の4次元報告（REQ-034-031）を含める）

### 委譲起動不能時の扱い（REQ-031-029、REQ-034-028/044）

詳細は references/delegation-fallback.md を参照（遅延読み込み）。
### 環境制約時の親オーケストレータ直接書込みフォールバック（REQ-003-031）

詳細は references/delegation-fallback.md を参照（遅延読み込み）。
## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/common/commands/agentdev/case-auto.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（orchestration stage モデル、Wave 反復制御、停止理由の検出・分類適用・報告手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-auto`）が所有し、本 Design はこれらを複製しない。停止理由分類の値域・定義・対応（実行結果状態、利用者判断の要否、再開入口）は本 Design「停止理由分類」節が単一正本として所有する。各工程の output_contract（工程別契約表）も Workflow Skill が所有する。
- case-run（インライン実行）の workflow 実装本体は case-run の Workflow Skill（`agentdev-workflow-case-run`）が所有する（case-run は常に単一 Issue 実行。Wave 実行制御は case-auto stage 3 が所有するため epic-wave 実行契約は本 Design 側へ集約される）。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 Design

- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（step_execution 委譲（v2:ADR-0127））
- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（Epic Wave 反復制御〔Wave 状態は子Issue 状態からの導出投影〕）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 責務（委譲））

## 対象外

- DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更、repo 外実データ操作、通知送信
- migrationファイル、IaCファイルの作成、修正以外の migration実行、IaC apply
- remote branch 削除で当該 case-auto / case-run が作成した branch 以外の対象
- 各工程のインライン実行は通常時対象外（委譲起動必須、v2:ADR-0127, REQ-030-006/073/084）。委譲起動不能時の `delegation-unavailable` 報告は例外として許可（REQ-002-003/004）
- 既存 case-open / case-ready / case-revise / case-run / case-close の責務変更（case-auto は起動方式と工程間制御のみを所有）
- source path の実行時パス読み替え
- Issue 階層決定ロジックの独自保持（case-open に委譲）
- case-open / case-ready から後工程への状態引き継ぎ時のフィルタリング、再評価（保存結果をそのまま渡す）
- 子Issue 選択ロジック、子Issue 単位の並列起動の外部委譲（Wave 実行制御は case-auto stage 3 の orchestration が単一所有し、case-run は単一 Issue 実行に専念する。case-close(#epic) 相当の統合処理は Wave 反復を進行させる stage 3 内部処理として case-auto が扱う）
- Epic Issue 本文の書き込み（case-close の単一書き手責務、v2:ADR-0125、case-auto は読み取るのみ、`POL-epic-tracking-single-writer`）
- 操作単位本文の抽出、変換、REQ 操作解釈（REQ-034-010）
- case-ready 完了後の draft SSoT 扱い（case-ready 完了後は Issue と Epic が SSoT）
- OU 間依存のみでの Epic Issue 化（REQ-034-011）
- Epic Issue 化判定への関与（REQ-034-011）
- case-auto 固有の capture 振る舞い（構成コマンドの capture 責務境界に従う）

## 検証観点

- 工程別委譲契約遵守: inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領
- 親コンテキスト非累積: 各委譲の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持
- クリーンアップ検証ゲート（Standard / Epic Issue flow 双方）: stage 2 の対象群収束後・stage 3 開始前に評価する。stage 2 を正常完了した対象についてドラフトファイル、RU ファイルの残存がないこと。さらに設計側 worktree（`.worktrees/{N}-definition`）とローカル設計系ブランチ（`definition/issue-{N}`）の残存が 0 件であることを検証し、残存検出時は fail-closed で停止して残存対象と削除再実行の対応を報告する。stage 2 が blocked / failed / 中断等で正常完了していない対象について、既存 lifecycle 契約に従って保持された draft / RU は cleanup 違反としない（REQ-034-020、REQ-034-025）。設計側残存の検証契約は REQ-034-046 に従う
- 出力制約: 成果物本文 verbatim、調査過程等は圧縮
- タイミング情報: 開始時刻、終了時刻、所要時間を人間が読みやすい形式で報告（REQ-034-023/083）
- 結果状態の4次元集約（REQ-034-031）: 後述「結果状態の4次元集約（REQ-034-031）」セクションの4状態次元と集約規則に従い、warn を pass へ変換しない

## 結果状態の4次元集約（REQ-034-031）

詳細は references/result-aggregation.md を参照（遅延読み込み）。
## 複数 execution_unit 並列 orchestration（REQ-006、現行の責務体制は DEC-036（DEC-038/039 が補完））

詳細は references/parallel-orchestration.md を参照（遅延読み込み）。
## 子 task 中断回復パス（v2:ADR-0138, REQ-002）

詳細は references/task-recovery.md を参照（遅延読み込み）。
## 工程別タイムスタンプ計測と対象別・stage 別観測証跡（L1: case-auto）（REQ-003-028、REQ-034-045）

詳細は references/observability-and-commit-scope.md を参照（遅延読み込み）。
## Phase 0 commit スコープ設計運用

詳細は references/observability-and-commit-scope.md を参照（遅延読み込み）。
## 工程・投入境界のハンドオフ

複数 Issue の工程境界または投入バッチ境界では、起動時対象の安定識別子、Root Case、関連 Issue/PR 番号、適用可能な `.agentdev/` 状態ファイルと git 側の参照、再開入口を引き渡す。新規セッションは当該正規状態から最早の未収束段階を再構成し、完了済み対象を再実行せず、稼働中のタスクを二重起動しない。case-ready 後の再開は削除された draft/RU に依存しない。実行中や未確認を収束と扱わず、ハンドオフを完了報告に置換しない。

工程の子結果には [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) を使う。待機は現行の起動間隔、最初の起動、共有枠およびスロット型補充を維持し、既存処理との同一ターンまたは実行側スケジューリングに組み合わせる。固定バッチの全件完了待ち、同時一括起動、同期逐次フォールバックに切り替えない。

## 停止状態

停止状態の詳細（停止理由分類、伝播契約）は「adversarial-review 由来の停止伝播（case-auto の停止伝播受領）」「bounded parent decision resolution」節、および Workflow Skill（`agentdev-workflow-case-auto`）の停止条件分類が正規所有する。
主要な停止状態は次のとおり。

- 委譲工程の result が blocked / failed の場合（当該工程で自走停止、ユーザー判断待ち）。
- 委譲起動不能時（delegation-unavailable 報告、当該工程を停止）。
- auto_gate preflight の未解決項目の残存時（`auto_gate.auto_ready` が false または未解決項目が残る場合は停止）。
- 停止条件（11項目の停止条件いずれか）検出時（実行停止、停止時タイミング情報を追記）。人間に留保された判断（REQ-096-005）の新規確定では、req-define での再合意が必要である旨を要旨として報告する（再開入口は Root Case 指定であり、工程別の resume_command を Root Case に記録しない）。
- user-decision-required（上位合意矛盾、新規ユーザー判断事項）検出時（自走を停止しユーザーへ判断を求める）。

## 旧契約実行の抑止と進行・終了制御への判定接続（REQ-101-017、REQ-032-038、RU-20261004-08）

詳細は references/finite-execution.md を参照（遅延読み込み）。
## 有限実行の実行境界と責務分割への接続（REQ-108）

詳細は references/finite-execution.md を参照（遅延読み込み）。
## 採用規約の解決の実行経路接続（REQ-104）

詳細は references/finite-execution.md を参照（遅延読み込み）。
## reference 選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 委譲起動不能時の扱いと環境制約時のフォールバック の詳細が必要な場合 | references/delegation-fallback.md |
| 結果状態の4次元集約 の詳細が必要な場合 | references/result-aggregation.md |
| 複数 execution_unit 並列 orchestration の詳細が必要な場合 | references/parallel-orchestration.md |
| 子 task 中断回復パス の詳細が必要な場合 | references/task-recovery.md |
| 工程別タイムスタンプ計測と Phase 0 commit スコープ設計運用 の詳細が必要な場合 | references/observability-and-commit-scope.md |
| 旧契約実行の抑止・有限実行の実行境界・採用規約の解決の実行経路接続 の詳細が必要な場合 | references/finite-execution.md |
| adversarial-review 由来の停止伝播 の詳細が必要な場合 | references/stop-propagation.md |
| bounded parent decision resolution の詳細が必要な場合 | references/parent-decision.md |

## See Also

- [case-open.md](case-open.md), [case-ready.md](case-ready.md), [case-revise.md](case-revise.md), [case-run.md](case-run.md), [case-close.md](case-close.md)（構成工程）
- `agentdev-workflow-case-auto` skill（workflow 実装本体（orchestration stage モデル、Wave 反復制御、停止理由分類））
- `agentdev-quality-gates` skill（QG-1〜QG-4（各工程で適用））
- `agentdev-case-run-execution-adapter` skill（case-run 外部実行委譲）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- `agentdev-workflow-orchestration` skill（Capture 境界）
- REQ-006（case-auto 最大自走モード）
- v2:REQ-0137（並列実行安全 git 操作規律）
- REQ-008（構造化 req_draft 契約）
- REQ-006（RU群バッチ処理と複数 execution_unit 並列実行）
- REQ-003（コンフリクト解消モデルと実行時間観測）
- REQ-002（配布物の harness 実行制御分離）
- v2:ADR-0112（サブエージェント委譲）
- v2:ADR-0127（case-auto 工程委譲）
- v2:ADR-0128（case-run の実行モデル: 実行担当サブエージェント委譲）
- v2:ADR-0129（複数 execution_unit 並列実行モデル）
- v2:ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
- v2:ADR-0137（case-auto における case-run インライン実行（多重委譲回避））
- v2:ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約）

## adversarial-review 由来の停止伝播（case-auto の停止伝播受領）

詳細は references/stop-propagation.md を参照（遅延読み込み）。
## bounded parent decision resolution（REQ-034-032〜034、DEC-008）

詳細は references/parent-decision.md を参照（遅延読み込み）。
## v3 epic-wave-model Design からの吸収

v3 epic-wave-model Design が所有していた orchestration stage モデル、ドラフト間並列実行モデル（REQ-034-025〜029）、execution_unit 並列 orchestration、case-auto 停止条件と停止理由分類のうち case-auto 実行側の運用契約は本 Design の規定へ吸収された。旧 Design は削除済みであり、対応関係の記録は Git 履歴で担保する（REQ-103-020）。

- orchestration stage: case-auto 内部工程を stage として構成し、ドラフト間並列実行は stage 3 で共有 active Issue task 枠（REQ-034-027、起動間隔 10 秒。Epic・Wave・Standard を横断する単一所有枠、DEC-041）とする
- ドラフト間並列実行モデル: 複数 draft（OU 群）を依存グラフから解析し、並列実行可能性に基づいて同時起動する。直列化の単位は runtime-execution-model「直列化単位表」に従う
- 停止理由分類: 停止条件の発生時に停止理由を分類して報告する。user-decision-required は result enum の状態ではなく停止理由分類として維持する（lifecycle-state-machine 異常・例外状態と回復経路）

## 重要変更の通知と結果説明

子ワークフロー・委譲実行からの重要変更の通知を、結果集約と実行報告で失わずに利用者へ提示する。同一の意味を持つ重要変更が複数の成果物・工程・委譲先に波及する場合は、利用者が理解する変更単位へ通知を集約し、ファイルごと・工程ごと・委譲先ごとの実質的な重複通知を繰り返さない。新たな重要な影響の判明は、重複通知と区別して追加説明する。

case-auto 自身は全変更の意味判断を行わず（判断の局所所有は維持）、各子ワークフロー・委譲先が判断した重要性と想定影響の評価を前提に、通知の伝達と集約だけを担う。通知と承認は区別し、通知のみを理由とする一律停止を設けない。
