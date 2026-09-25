---
title: case-auto Design
status: accepted
created: 2026-06-21
updated: "2026-09-24"
---
<!-- ADF-COVERS(implementation): REQ-015-012 -->
<!-- ADF-COVERS(implementation): REQ-034-001, REQ-034-002, REQ-034-003, REQ-034-004, REQ-034-005, REQ-034-006, REQ-034-007, REQ-034-008, REQ-034-009, REQ-034-010, REQ-034-011, REQ-034-012, REQ-034-013, REQ-034-014, REQ-034-015, REQ-034-016, REQ-034-017, REQ-034-018, REQ-034-019, REQ-034-020, REQ-034-021, REQ-034-022, REQ-034-023, REQ-034-024, REQ-034-025, REQ-034-026, REQ-034-027, REQ-034-028, REQ-034-029, REQ-034-030, REQ-034-031, REQ-034-032, REQ-034-033, REQ-034-034, REQ-034-035, REQ-034-036, REQ-034-037, REQ-034-038, REQ-034-039, REQ-034-040, REQ-034-041, REQ-034-042, REQ-034-043, REQ-034-044, REQ-034-045, REQ-035-016, REQ-035-017 -->
<!-- ADF-COVERS(design): REQ-034-012, REQ-034-022, REQ-034-025, REQ-034-027, REQ-034-028, REQ-034-040, REQ-034-041, REQ-034-042, REQ-034-043, REQ-034-044, REQ-034-045, REQ-035-016, REQ-035-017 -->
<!-- ADF-COVERS(verification): REQ-034-037, REQ-034-038 -->
<!-- ADF-COVERS(implementation): REQ-003-017, REQ-003-018, REQ-006-108, REQ-034-002, REQ-034-003, REQ-034-007, REQ-034-008, REQ-034-009, REQ-034-010, REQ-034-011, REQ-034-012, REQ-034-013, REQ-034-014, REQ-034-015, REQ-034-016, REQ-034-018, REQ-034-019, REQ-034-020, REQ-034-021, REQ-034-022, REQ-034-023, REQ-034-024, REQ-034-025, REQ-034-026, REQ-034-027, REQ-034-028, REQ-034-029, REQ-034-030, REQ-034-031, REQ-034-032, REQ-034-034, REQ-034-035, REQ-034-036 -->

# case-auto Design

## 目的

要件doc から case-open → case-ready → case-run → case-close を順次自走実行する最大自走モード。req-define で再合意済みの Definition 変更がある場合は case-revise → case-ready → case-run → case-close を自走する。
要求入口 2 つ（req-define、backlog-auto）から合流する標準実行コマンドである。標準導線は req-define 完了直後の単一要件doc 処理であり、引数なし時の drafts 全件処理は従来どおりの対象解決として維持する。

## 承認・HITL 境界

- case-auto は標準実行コマンドである（起動自体が唯一の事前判断）。
- 自走中に新規の承認点を追加しない。blocked / failed、停止条件検出時は自走を停止し、ユーザー判断を待つ（bounded parent decision resolution による decision_context の限定的親判断を除く）。

## 入力

- Issue番号（数値）または Issue URL（Root Case の状態と resume_command から通常経路と例外経路を解決して自走する。resume_command が case-revise を指す場合は再合意済み Definition 変更の例外経路として case-revise → case-ready を駆動する。REQ-034-039）
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
  - Issue番号/URL入力: Root Case が open なら case-ready から、ready/running/review なら case-run（インライン）→ case-close。再合意済み変更がある場合は case-revise から開始。再開時は起動時対象集合と各対象の正規状態から現在 stage を最も早い未収束 stage として再構成する（REQ-034-025）
  - artifact_actions は case-ready の Definition action 入力へ渡し、work_type 固定分岐には使用しない
  - auto_gate preflight（auto_gate.auto_ready が false または未解決 item 残る場合は停止）
- 各工程の実行
  - 委譲工程（case-open / case-ready / case-revise / case-close）: 各コマンド委譲契約に従い実行担当サブエージェントとして起動。委譲起動不能時に delegation-unavailable 報告（REQ-002-003/004）
  - case-run（インライン実行）: case-auto が case-run の Workflow Skill（`agentdev-workflow-case-run`）を正規情報源として読み込み、準備/クリーンアップフェーズを自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲（委譲起点の折りたたみ/002）。adapter skill（agentdev-case-run-execution-adapter）を case-auto が読み込む
  - 結果状態の4次元集約（REQ-034-031）: 各工程の output_contract から (1) 工程結果 pass/warn/fail、(2) artifact_action 適用結果 applied/skipped/failed/no-op、(3) 定義適用工程完了状態、(4) OU ライフサイクル完了状態を収集し混同なく保持する。集約規則の詳細は後述「結果状態の4次元集約（REQ-034-031）」セクション
- Wave 反復制御（Epic Issue 指定時）
  - case-auto が Epic Issue 番号を記録。Epic Issue 本文から Wave 構成、各子Issue ステータスを読み取る（読み取りのみ、Epic Issue 本文の書き込みは case-close の責務）
  - case-auto が現在 Wave の ready 子Issue を認識し、Epic・Wave・Standard Issue を横断する共有 active Issue task 枠（REQ-034-027。上限・空き枠補充・起動間隔 10 秒は後述「runtime 制御契約」節と v4-runtime-execution-model「runtime 制御ループ」節参照）で各子Issue へインライン case-run を実行。各子Issue の実行担当サブエージェントへ case-auto から直接委譲
  - case-run は単一 Issue 実行に専念し（REQ-031-015）、Wave 内子Issue の並列起動・fan-out/fan-in の制御は case-auto の orchestration が単一所有する（DEC-041）。case-run(#epic) 由来の独立実行枠は存在しない
  - 現 Wave の全子Issue の完了（completed-pr / blocked / failed / delegation-unavailable）を待機し、現 Wave の収束（REQ-035-016）を確認する
  - completed-pr の子Issue がある場合、case-close(#epic) 相当の統合処理を Wave 反復を進行させる stage 3 内部処理として実施（統合処理は active Issue task の実行枠を消費しないが共有書き込みの直列化点として扱う。REQ-034-042）
  - 次 Wave の開始は現 Wave の収束（REQ-035-016）と後続 Wave の意味的依存条件の充足（必要な統合・マージの完了を含む。REQ-035-017）の両方を確認してから行う（REQ-034-012）
- 工程間の状態引き継ぎ（Issue番号、PR番号、RU ファイルパス、capture 対象情報を最終工程まで保持）
- 複数REQ対応（case-ready の確定結果から複数 REQ doc または scale:large 検出時、確定済みの Issue 構造に従う）
- 停止条件の検出（停止時タイミング情報の追記。11項目の停止条件いずれかを検出時、実行停止。新しい意味判断時は Root Case に `resume_command: req-define` を記録）
- 完了報告（タイミング情報追記。インライン実行の適用を記録。結果状態の4次元報告（REQ-034-031）を含める）

### 委譲起動不能時の扱い（REQ-031-029、REQ-034-028/044）

委譲工程（case-open / case-ready / case-revise / case-close）の委譲が起動できなかった場合、case-auto は当該工程を delegation-unavailable として報告する。

case-run インライン実行時の実行担当サブエージェントへの委譲失敗は、case-run result 契約（completed-pr / blocked / failed / delegation-unavailable）に従い処理する。
delegation-unavailable の場合は当該子Issue を pending に戻す（REQ-031-029）。

並列起動不能（REQ-034-028、REQ-034-044、DEC-042）: 当該 stage の起動可能対象集合に対して背景起動が1件も成立しない場合は、直列化で完了を装わず停止理由「並列起動不能」（原因の断定を含まない）と再開可能性を報告して停止する。弁別基準と優先規則は次のとおりとする:

- 個別対象の起動失敗は delegation-unavailable として集約し、並列起動不能と二重分類しない
- 並列起動不能（orchestration レベル）は当該 stage の起動可能対象集合に対する背景起動の成立数が 0 の場合に限り報告し、個別対象の起動失敗の報告に優先する
- 一部の対象の起動が成立している場合は部分継続原則（REQ-034-014、REQ-034-025）に従い、起動失敗対象を delegation-unavailable で確定させ、稼働中の対象と起動可能な残対象の継続を妨げない

genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）は停止条件として扱う。

context 管理:
- case-run インライン実行時のコンテキスト管理は harness の責務（REQ-002-002）
- REQ-034-007（親コンテキスト非累積）は case-run インライン実行時の例外として取り扱う

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/case-auto.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（orchestration stage モデル、Wave 反復制御、停止理由分類、reference 構成）は Workflow Skill（`agentdev-workflow-case-auto`）が所有し、本 Design はこれらを複製しない。各工程の output_contract（工程別契約表）も Workflow Skill が所有する。
- case-run（インライン実行）の workflow 実装本体は case-run の Workflow Skill（`agentdev-workflow-case-run`）が所有する（case-run は常に単一 Issue 実行。Wave 実行制御は case-auto stage 3 が所有するため epic-wave 実行契約は本 Design 側へ集約される）。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 Design

- [workflows/v4-lifecycle-state-machine.md](../workflows/v4-lifecycle-state-machine.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/v4-delegation-contracts.md](../workflows/v4-delegation-contracts.md)（step_execution 委譲（v2:ADR-0127））
- [workflows/v4-lifecycle-state-machine.md](../workflows/v4-lifecycle-state-machine.md)（Epic Wave 反復制御〔Wave 状態は子Issue 状態からの導出投影〕）
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
- クリーンアップ検証ゲート（Standard / Epic Issue flow 双方）: stage 2 の対象群収束後・stage 3 開始前に評価する。stage 2 を正常完了した対象についてドラフトファイル、RU ファイルの残存がないこと。stage 2 が blocked / failed / 中断等で正常完了していない対象について、既存 lifecycle 契約に従って保持された draft / RU は cleanup 違反としない（REQ-034-020、REQ-034-025）
- 出力制約: 成果物本文 verbatim、調査過程等は圧縮
- タイミング情報: 開始時刻、終了時刻、所要時間を人間が読みやすい形式で報告（REQ-034-023/083）
- 結果状態の4次元集約（REQ-034-031）: 後述「結果状態の4次元集約（REQ-034-031）」セクションの4状態次元と集約規則に従い、warn を pass へ変換しない

## 結果状態の4次元集約（REQ-034-031）

case-auto は各工程の結果を次の4状態次元で保持し、集約報告で次元を混同しない。
各工程の output_contract（Workflow Skill（`agentdev-workflow-case-auto`）の工程別契約表）が情報源となる。

| 次元 | 取得元 | 値 |
|---|---|---|
| (1) 工程結果 | 全工程（case-open / case-ready / case-revise / case-run / case-close）の pass/warn/fail | pass / warn / fail |
| (2) artifact_action 適用結果 | case-ready / case-revise の action id ごとの適用結果 | applied / skipped / failed / no-op |
| (3) 定義適用工程の完了状態 | (1)(2) の組み合わせから導出 | 定義適用完了 / 警告付き工程完了 / 定義適用未完了 |
| (4) OU ライフサイクル完了状態 | case-open（Issue 作成）、case-run（PR 作成）、case-close（PR マージ、Issue クローズ）の各成否 | 各ライフサイクル事象ごとに 完了 / 未完了 |

集約規則:

- (3) の導出: 全必須 action が applied または正当な no-op で工程結果 (1) が pass → 定義適用完了。同条件で (1) が warn → 警告付き工程完了（warn を pass へ変換しない）。必須 action に skipped または failed が1件以上ある → 定義適用未完了（この場合は定義適用完了/警告付き工程完了と報告しない）。正当な no-op とは、case-ready / case-revise の contract が対象外と判定した action 不実施を指す。正当な理由なく必須 action を飛ばした場合は skipped として扱う
- (4) の独立性: OU ライフサイクル完了状態は (3) と独立して扱う。(3) が定義適用完了/警告付き工程完了であっても case-open（Issue 作成）が未実行なら OU ライフサイクルは未完了と報告する
- Phase 0 と OU 完了の分離: Phase 0 成功（(3) の定義適用完了/警告付き工程完了）と OU 完了（(4) の全ライフサイクル事象完了）を別々に報告する。一方を他方へすり替えて報告しない
- warn 変換禁止: (1) が warn の工程を pass として集約しない。完了報告には warn を warn のまま残す

完了報告（停止時フォーマットを含む）には上記4状態次元を工程別・action id 別・ライフサイクル事象別に列挙する。
実行定義は Workflow Skill（`agentdev-workflow-case-auto`）の「結果状態の4次元集約（REQ-034-031）」および「結果状態の4次元報告（REQ-034-031）」を正とする。

## 複数 execution_unit 並列 orchestration（REQ-006, v2:ADR-0129）

case-auto は case-open が生成した execution_unit 群（standard | epic の混在）を orchestration 対象とする（REQ-034-018）。
従来の「単一 Epic の Wave 反復制御」を「複数 execution_unit 群反復制御」へ一般化する。
case-auto は case-open の判定結果に従い case-run(#epic) / case-run(standard) を起動する（薄いオーケストレーター原則、Issue 階層決定・子 Issue 選択・Epic 化判定の委譲を維持）。
Issue 階層決定、子 Issue 選択、Epic 化判定の判断ロジックは持たない。

### 処理単位の一級概念化（DEC-015（superseded by DEC-036/038/039））

case-auto は処理単位を一級概念として扱う（REQ-034-035）。
処理単位は少なくとも次の意味を持つ。

- 安定した識別子
- 入力
- 出力
- 依存関係
- 所有対象
- 現在状態
- 完了条件
- 検証結果
- 必要な場合の worktree との対応

処理単位の具体的な格納形式、スキーマは本 Design の対象外とし、Design 側（orchestration 層の詳細仕様）で確定する。
Git 上の変更を伴う並列処理では処理単位を worktree で隔離する（REQ-035-011）。

依存関係上独立した処理単位は並列実行可能と判定する。
実行可能な処理単位、並列可能性、合流条件、一部失敗時の全体状態遷移は ADF 側の判断として所有し、実際に起動するエージェント数、起動 API、実行基盤固有の並列化手段は正規契約へ固定しない（REQ-034-036）。
並列処理の一部が失敗・中断した場合、完了済み処理を未完了へ戻さず、全体の次状態を規則に従って判定し、必須処理単位が揃っていない状態で後続処理へ進まない（REQ-035-011）。

### 並列実行の判定

並列可否は連結成分（必須依存のみをエッジとする）で判定する（REQ-034-013）:

- 必須依存がない複数 execution_unit 間（Epic 間、Standard 間、混在）は並列実行
- 同一 Epic 内の Wave 間は直列（REQ-034-012）
- 技術的依存レベル（L0-L3）は並列判定軸から外す。ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは後続 PR の rebase で解決する（REQ-034-013, REQ-031-003）

グローバル並列上限は設定しない（REQ-034-013）。
実行並列上限は 1 回の orchestration の stage 3 全体で共有される active Issue task 数の上限（REQ-034-027、数値 5）として case-auto が単一所有する（DEC-041）。
Epic、Wave、Standard Issue、case-run 呼出しごとの独立した実行枠は設けない。N 個の execution_unit が並列実行された場合も、stage 3 全体で共有される active Issue task 数のみが制御対象となる。論理上限と harness の同時起動制限（bg task API 上限等）は切り離し、harness 制限は adapter・実装制約（キューイング・バンドリング等）として扱い、論理上限の値の根拠としない（DEC-041）。

### runtime 制御契約

stage 3 の runtime 制御ループは case-auto が所有し、次の契約に従う（REQ-034-040〜045、REQ-035-016、REQ-035-017、DEC-041、DEC-042。詳細は v4-runtime-execution-model「runtime 制御ループ」節）:

- 共有 active 枠: 1 active task は 1 Issue への実装実行委譲であり、Epic・Wave・Standard Issue を横断して active Issue task 数が上限（現行 5）を超えない
- 空き枠補充: 各 Epic の現在 Wave と Standard Issue から開始条件を満たす Issue を候補として認識し、active 数が上限未満で実行上の安全条件を満たす候補がある限り補充する（横断補充は best-effort でなく必須）。最初に起動した全 task の完了を待つ固定 batch 方式を取らず、起動間隔（10 秒）と局所的な競合回避の運用は維持する（REQ-034-040）
- 状態管理: Issue 実行の状態を pending、ready、active、実行結果確定で区別して管理する（REQ-034-041）
- 再開: 再開時は既存の active task を計上し、同一 Issue の二重起動と上限超過を防ぐ。状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない（REQ-034-041）
- 統合処理: 統合処理（マージ・クローズ相当）は active Issue task の実行枠を消費しないが、共有書き込みの直列化点として扱う（REQ-034-042）
- Wave 収束と依存充足: Wave 収束（全子 Issue の実行結果確定、未処理・実行中・状態不明なし）と後続 Wave の依存充足（意味的依存条件の成立、必要な統合・マージの完了を含む）を区別し、次 Wave の開始は両方の成立を条件とする（REQ-034-012、REQ-035-016、REQ-035-017）。blocked、failed、delegation-unavailable は収束には該当し得るが依存充足とはみなさない
- 重複の実行時検出: stage 3 の委譲前に同一 Wave 内の子 Issue 間で変更対象ファイル集合の重複を検出し、一時直列化・変更対象の調整・merge 順序・衝突解消担当の判断に用いる。変更対象集合が取得不能な子 Issue を含む場合は比較を省略せず検出不能として報告する（REQ-034-043、REQ-035-012）
- Wave 表現: Wave 表現は子 Issue 数の上限を持たない（Epic サイズ上限のみ適用）。runtime 上の batch や一時直列化を Wave 分割として永続化しない（DEC-041）
- 並列維持（REQ-034-028、REQ-034-044、DEC-042）: 並列実行は必須であり、実行環境由来の障害（background task の消失、親 run の中断、provider failure 等）を理由とする同期逐次実行（順次フォールバック）への切替を行わない。並列起動が当該 stage の起動可能対象集合に対して1件も成立しない場合は、直列化で完了を装わず停止理由「並列起動不能」（原因の断定を含まない）と再開可能性を報告して停止する。再開時は REQ-034-025 の再開契約および REQ-034-041（再開時の active task 計上、同一 Issue の二重起動防止）に従うことを条件に、durable state（Issue、PR、RU、draft、bg task 状態、worktree の git 状態）を照合して未完了かつ再試行可能な対象のみを特定し、起動間隔契約（最初の委譲は直ちに開始、以降の委譲起動ごとに間隔を置く、同一ツール呼び出し一括ブロックでの複数起動を行わない、前 task の完了待ちを起動の条件にしない）に従う staggered background fan-out で並列再委譲し、並列性の回復を resume の反復で追求する（反復に回数上限を設けない）。REQ-034-029 の状態別回復（親ループによる代行回復を含む）および REQ-034-030 のコンフリクト解消再委譲は本条の対象外とし各既存契約に従う

### blocked 部分停止、ready 継続判定フロー

各 execution_unit の状態（closed/blocked/failed/running/ready）を読み取り、以下の判定フローで orchestration する（REQ-034-035, REQ-034-015）:

| execution_unit 状態 | case-auto アクション |
|---|---|
| ready | 起動（共有 active Issue task 枠でインライン case-run を起動。case-run は常に単一 Issue 実行） |
| running | 完了待機 |
| completed | case-close 相当処理へ進行 |
| blocked | 当該 execution_unit のみ停止。他の ready 対象は継続 |
| failed | 当該 execution_unit のみ case-close 対象外。他の completed-pr は case-close 対象 |

**終了条件**: 全 execution_unit が closed/blocked/failed になったら終了する。
一部 blocked が残存する場合は partial blocked として報告する（REQ-034-015）。

### execution_unit 群反復制御への一般化

従来の「単一 Epic の Wave 反復制御」は execution_unit 群反復制御の特殊ケース（execution_unit = 1 件の Epic）となる。
execution_unit 群の実行は orchestration stage を stage 内最大並列・stage 間全対象収束で制御し、execution_unit 単位の縦切り pipeline（各 unit が case-run → case-close を先行完結する実行）として制御しない（REQ-034-025）。

- execution_unit が standard issue の場合: stage 3 で case-run(standard) を実行し、stage 3 の対象群収束後に stage 4 で case-close を実行
- execution_unit が epic issue の場合: stage 3 で Wave 反復制御を完遂する（子 Issue へのインライン case-run 実行と case-close(#epic) 相当の統合処理の反復。制御は case-auto stage 3 が単一所有し、case-run は単一 Issue 実行として呼び出される。DEC-041、REQ-031-015）。Wave 間および最終 Wave の case-close(#epic) 相当の統合処理は Wave 反復を進行・完遂させる stage 3 内部処理であり、stage 4 の開始とはみなさない。stage 4 では追加の case-close を行わない

OU 逐次処理（REQ-034-011）は、必須依存で結合した execution_unit 群に適用される。
必須依存のない execution_unit 群は順序を問わず並列実行できる（REQ-034-011 例外条項）。

共有書き込みの局所直列化（REQ-034-026）の対象範囲と単位は、共有資源カテゴリごとに次のとおりである。

- main への merge / push はリポジトリ単位で直列化する
- 同一 Epic Issue 本文への更新は Epic 単位で直列化する（per-Epic 単一書き手。無関係な Epic 間は並列可）
- 採番・AUTOGEN 索引更新はグローバルに直列化する
- 対象固有ファイルは対象単位で並列実行可

lock、queue、scheduler 方式は本 Design の範囲外とする（REQ-034-036）。

### 結果集約

各 execution_unit の結果（completed-pr / blocked / failed / delegation-unavailable）を case-auto が集約し最終判定に反映する（REQ-034-031）。
親コンテキスト非累積原則に従い、実装詳細は保持せず Issue / PR 状態から再読込する。

### 停止理由分類（REQ-034-015/108 拡張）

case-auto は停止時に停止理由を以下の分類で報告する。
分類は再開コマンド選択とユーザー通知の精度向上が目的であり、HITL 境界の変更ではない。

| 分類 | 定義 |
|---|---|
| req-define 合意要件からの逸脱 | case-open または後続工程が合意済み要件、対象外、受け入れ条件を変更した場合、合意されていない機能要件または制約を追加した場合、合意済み OU を欠落・統合・分割して要件の意味を変更した場合 |
| command 契約・実装不整合 | execution_unit へ分割可能であるにもかかわらず case-open が単一 Epic 子 Issue 上限により停止した場合、case-open または後続工程の実装が契約へ整合していない場合、構成生成事前検証（REQ-032-015）が実装されていない場合 |
| 要件未合意のスコープ拡大 | 合意されていないスコープが実行中に追加された場合 |
| repo 外実体変更 | DB マイグレーション実行、デプロイ/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更が必要な場合 |
| CI/test/lint 失敗 | コンフリクト解消モデル（v2:ADR-0132）の Level 2 まで試行しても自己修復不能な場合 |
| 未コミット変更の帰属不明 | 変更の由来が不明で安全に続行できない場合 |
| 上位合意矛盾 | case-auto が受領した decision_context が現行正規成果物（REQ/Decision/Design/Issue）間の矛盾に起因する場合。当該矛盾そのものが finding の対象であり、case-auto が一方を勝手に採用できない（REQ-034-034、DEC-008 決定3） |
| 新規ユーザー判断事項 | case-auto が受領した decision_context が新しいユーザー価値判断、対象範囲変更、外部契約変更を必要とし、現行正規成果物から一意に回答できない場合（REQ-034-034、DEC-008 決定4） |
| 並列起動不能（実行環境由来） | 当該 stage の起動可能対象集合に対して背景起動が1件も成立しない場合。原因の断定を含まない。delegation-unavailable との弁別基準は「委譲起動不能時の扱い」節を参照（REQ-034-028、REQ-034-044、DEC-042）。停止報告には起動試行履歴（試行回数、起動成立数、最終成功起動時刻）を含める（REQ-034-045） |

execution_unit 分割可能性があるにもかかわらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する。
これは case-open の契約・実装不整合であり、要件doc側の問題ではない。

「上位合意矛盾」「新規ユーザー判断事項」は bounded parent decision resolution（REQ-034-032〜034、DEC-008）で case-auto が decision_context を自律解決できない場合の停止理由分類である。
case-auto は現行正規成果物から一意に回答可能な decision_context を自律解決するが、解決できないものは本2分類のいずれかへ分類してユーザーへ返す。
詳細は後述「bounded parent decision resolution（REQ-034-032〜034、DEC-008）」節を参照。

詳細な停止条件の全量は REQ-034-015（本拡張で11項目）を参照。

### infra-transient（ツール基盤故障）停止分類

infra-transient はツール基盤（harness・Custom Tool 実行環境）の故障に起因する停止種別であり、
Case 失敗（blocked / failed）と区別して報告する。判定条件は次の4条件の同時成立とする:

1. 単一ツールの恒常失敗（再試行でも成功しない、決定的な失敗）
2. プロセス生存（長寿命実行プロセス自体は生存し、HTTP API 等は応答する）
3. 再試行無効（同一プロセス内での再試行が成功しない）
4. 他経路正常（git・DB・ローカル FS 等の他の実行経路は正常に動作する）

infra-transient と分類した場合、停止報告に回復経路を記載する: supervisor 等による harness 再起動で
回復可能であること、および durable state（Issue、PR、RU、draft、git 状態）からの冪等再開が成立する
こと。停止理由の分類は case-ready / case-run / case-close の停止報告を case-auto が集約する既存構造に
のせ、各 workflow の停止報告形式に infra-transient の分類と回復経路の記載欄を反映する。
harness 側の修正（fresh process 分離・自動再初期化）は本リポジトリの対象外とする。

### コンフリクト解消モデル（3レベルエスカレーション）（REQ-003, v2:ADR-0132）

PR マージコンフリクト発生時は、以下3レベルのエスカレーションで解消を図る。
各レベルを試行しても解消できない場合のみ次のレベルへ進む。
機械的競合（rebase で自動解決可能）は停止条件に含まず、Level 1 で case-close が解消する。

| Level | 実行主体 | 解消手法 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消。自動解決時は再マージ（REQ-003-001） | case-auto へエスカレーション（REQ-003-002） |
| Level 2 | case-auto | 両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて case-run へ再委譲。最大2回（元の並列実行を含む計3回の case-run 実行）（REQ-003-003/004） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離（REQ-034-035 拡張） | 停止 |

**停止条件の段階化**: case-auto はコンフリクト解消に対して常に全力で解消を図る。
発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらずアクセス可能な文脈を総動員する（REQ-003-005）。
停止条件は Level 2 の再委譲を上限回数（2回）試行しても解消しない場合とする（REQ-003-006）。
Level 1 で解消できる機械的競合は case-auto の停止条件から除外する。

Level 1 の rebase 実行、エスカレーション判定は case-close の責務（`docs/designs/commands/case-close.md` コンフリクト解消 rebase パス参照）。
case-auto は Level 2/3 のオーケストレーション級判断を担う。

**Level 2 解消レシピ（AUTOGEN ブロックの競合）**: AUTOGEN ブロック（README 索引、件数キャプション、メトリクス表等）の競合は、手動での競合解決を行わず「新 base 上での再生成」で解消する。先にマージ済み PR を取り込んだ新 base（main）上で `generate_indexes.ts` を再実行し、再生成結果で当該 AUTOGEN ブロックを解消する。この経路を Level 2 の正道とし、AUTOGEN ブロックに対する手動マージを試行しない。

## 子 task 中断回復パス（v2:ADR-0138, REQ-002）

case-auto が Phase 2（case-run インライン実行）で起動した子 task の bg task が破棄された場合、case-auto 親ループが当該子 task の状態を回復する。
本節は v2:ADR-0138 で合意された bg task 状態管理、破棄検知時の状態別回復の Design 実装であり、v2:ADR-0137 の委譲起点折りたたみモデル、v2:ADR-0132 のコンフリクト解消モデルと協調する。

### 中断検知と状態分類

case-auto が子 task の bg task 破棄を検知した場合、当該子 task の worktree で `git status` を実行し、以下の3状態のいずれかに分類する。

| 状態 | 判定条件 |
|---|---|
| (a) commit 済み、PR 未作成 | commit 履歴があるが PR が未作成 |
| (b) 未コミット変更あり | worktree に未コミット変更が残留 |
| (c) クリーン | commit 履歴も未コミット変更もない |

状態 (c) クリーンの場合は回復対象がないため回復処理をスキップし、当該子 task を pending へ戻す（REQ-002-004 準拠）。
状態 (a) (b) はそれぞれ後述の回復手順へ進む。

### 状態 (a) の回復（commit 済み、PR 未作成）

case-auto 親ループが当該 worktree で回復処理を代行する。

1. `git rebase origin/main` で最新の main へ追従する（必要時）。rebase で解消できないコンフリクトは v2:ADR-0132 のコンフリクト解消モデル Level 2/3 へ委譲する
2. `git push` でリモートへ反映する
3. PR 作成を代行する。PR の base branch、タイトル、本文は子 task の Issue に紐づく情報（Issue 番号、Issue タイトル、受け入れ条件、work_type）から生成する
4. 作成した PR 番号を子 task の result に `completed-pr` として記録する
5. 通常の case-close フローへ合流させる

回復時の PR 作成代行は case-auto 親ループの責務である（v2:ADR-0137 の委譲起点折りたたみモデルを維持し、子 task 側で再度委譲を起こさない）。

### 状態 (b) の回復（未コミット変更あり）

未コミット変更の帰属は安全上の懸念となるため、変更内容の作業意図整合確認ステップを必須とする。

1. worktree の変更内容（`git diff`、`git status`）を確認する
2. 変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認する
3. 整合確認ができた場合のみ、commit、push、PR 作成を代行する（PR 生成情報の Issue 紐づけは状態 (a) と同じ）
4. 整合確認できない場合（別 Issue 由来の変更混入、意図不明の変更等）は当該子 task を `blocked` とし、停止理由を「未コミット変更の帰属不明」（REQ-006-108）として報告する

安全のため、未確認の変更を強制 commit しない。
強制 commit は帰属不明の変更を本流へ持ち込む原因となる。

### v2:ADR-0137/0138/0132 との整合関係

- **v2:ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約）**: 本回復パスは v2:ADR-0138 で合意された bg task 状態管理、破棄検知時の状態別回復の Design 実装である。Phase 2 の実行制御、固定並列数、bg task 状態管理を AgentDevFlow 側で規定する方針に従う
- **v2:ADR-0132（コンフリクト解消モデル）**: 状態 (a) の rebase で解消できないコンフリクトは v2:ADR-0132 の 3レベルエスカレーションモデル（Level 2/3）へ委譲する。bg task 破棄時の状態別回復とコンフリクト解消モデルは協調関係にある（v2:ADR-0138 relates-to v2:ADR-0132）
- **v2:ADR-0137（case-run インライン実行、多重委譲回避）**: 回復時の PR 作成代行は case-auto 親ループの責務とし、委譲起点の折りたたみモデルを維持する。子 task 側で再び委譲を起こして多重委譲を誘発しない

### 回復後の再委譲形態（REQ-034-044）

状態 (a)/(b) の親ループによる回復代行（REQ-034-029）は維持する。回復代行によらず子 task へ再委譲する場合（実行未試行判定時等）、再委譲の形態は同期実行によらず staggered background fan-out とし、並列性の回復を resume の反復で追求する（REQ-034-044、REQ-031-030、DEC-042）。background 再委譲の起動失敗が継続する場合は、Design が所有する再試行計上契約に基づき delegation-unavailable として再開可能な停止報告へ確定する。

## 工程別タイムスタンプ計測と対象別・stage 別観測証跡（L1: case-auto）（REQ-003-028、REQ-034-045）

case-auto は各工程（case-open / case-ready / case-revise / case-run / case-close）の委譲起動前後にタイムスタンプを記録し、工程別の壁時計時間を完了報告に含める。
現行の開始、終了時刻記録（REQ-034-023/083）を工程別内訳へ拡張する。

- 計測単位: 委譲起動前後の壁時計時刻（JST、REQ-034-023 の時刻形式に準拠）
- 対象別・stage 別観測証跡（REQ-034-045）: 完了報告に対象別・stage 別の起動時刻、完了時刻、識別情報（adf_delegation_id 等の既存発行型委譲識別子、bg task ID、Issue status 遷移記録を含む等価な観測証跡）を含め、並列実行の overlap と stage 間の全対象収束（fan-in）を実測で検証できるようにする（overlap 検証の判定対象は当該 stage 開始時に実行可能な対象が2以上である場合）。時刻は親（case-auto）の観測時刻を一次とし子側報告時刻は補助として区別する。REQ-034-028 に従い同期逐次実行へ切替えずに停止した場合は、当該実行の起動試行履歴（試行回数、起動成立数、最終成功起動時刻）を停止報告に含める。観測証跡の記録形式と永続化の詳細は本 Design が所有し、本契約は採用後に起動した対象に適用し既存起動へ遡及適用しない
- 記録先: case-auto 完了報告への工程別内訳追記。永続化は必要になった段階で別途検討
- 対象外: 委譲先内部メトリクス（L3）は harness 依存が強すぎるため対象外（REQ-003-010）。case-run 内の L2 計測は case-run result に含まれる（REQ-003-009、REQ-031-017）

## Phase 0 commit スコープ設計運用

Phase 0（枝PR作成フェーズ）の commit スコープ設計運用を明示する。
Phase 0 は case-ready / case-revise で確定した Definition をコミットし、枝PR を作成するフェーズである。
本節は Phase 0 の commit 構成と、後続する case-run（実装フェーズ）の委譲内 commit に適用するスコープ設計運用を規定する。
case-run Design（`docs/designs/commands/case-run.md`）の同名節と整合する内容を維持する（OU-013a / OU-013b）。

### 孫 Issue 間 Design スコープ交差時の扱い

Phase 0 で複数孫 Issue（Epic Wave 内の子Issue、または並列 execution_unit 内の個別 Issue）の実装が同一 Design ファイルに触れる場合の扱いを以下で規定する。

**Design 本文修正の非許容**: 孫 Issue の test strategy が `on_failure: fix-and-reverify` を指示する場合でも、Phase 0 の case-run 委譲内で Design 本文（`docs/designs/**`）を修正しない。
Phase 0 の Design 成果物は既に case-ready / case-revise 工程で確定済みであり、case-run 委譲内で再修正すると定義層の一貫性が損なわれる。
Design 修正が必要と判明した場合は `record-in-findings` で PR 本文の `## Design確定候補` セクションへ記録し、case-close の docs 検証における Design 確定チェックへ引き継ぐ（`agentdev-case-run-execution-adapter` SKILL の Design確定候補配置契約に従う）。

**target_area の重複判定と並列制御**:

- 同一 Design ファイルの異なる target_area を複数孫 Issue が編集する場合: git diff が競合しないため並列マージを許容する。並列判定軸は REQ-034-013 の連結成分ベースに従い、ファイル衝突（L2）は並列許容、PR マージコンフリクトは後続 PR の rebase で解決する
- 同一 Design ファイルの同一 target_area を複数孫 Issue が編集する場合: case-open 構成生成時に必須依存（depends_on）として連結させ、直列化する。Wave 構成で同一 Wave へ割り当てない

### ドメイン state 更新と成果物変更の同一コミット混在

Phase 0 の枝PR に含まれるコミット構成運用を規定する。
原則として **2分割運用** を採用し、ドメイン state 更新と成果物変更を同一コミットへ混在させない。

**対象ディレクトリ**:

- 成果物変更: `docs/`、`src/opencode/`、`src/opencode-local/` 等、配布対象の永続状態
- ドメイン state 更新: `.agentdev/` 配下（intake、learning、drafts、cases 等のケース固有の一時状態）

**2分割運用の理由**:

- 永続性の違い: 成果物は配布対象の永続状態、ドメイン state はケース固有の一時状態。同一コミットに混在すると revert、cherry-pick の単位が曖昧になる
- レビュー単位の分離: 成果物変更は Design 品質査読の対象、ドメイン state はキャプチャ境界（intake/learning）の対象。査読観点が異なるため分離する
- capture 境界の遵守: `.agentdev/intake/`、`.agentdev/learning/` の直接編集は case-run 委譲内では禁止（委譲内の対象外制約、`agentdev-case-run-execution-adapter` SKILL）。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` へ記録し、case-close が intake/learning pipeline へ引き継ぐ。よって case-run 委譲内でドメイン state をコミットへ含めることは原則として発生しない

**例外**: `.agentdev/drafts/` と RU の削除（case-ready 完了後のクリーンアップ）は、成果物変更とは独立したクリーンアップコミットとして扱う。
本運用が禁止する同一コミット混在には該当しない。
当該クリーンアップ検証は case-ready 後の case-auto gate の責務であり、case-run 委譲内では発生しない。

**commit 分割手順**: 実行担当サブエージェントは成果物変更を先にコミットする。
ドメイン state に触れる必要がある場合は別コミットへ分離するが、前述の通り case-run 委譲内では原則として `.agentdev/` 配下を編集せず、PR 本文経由で case-close へ引き継ぐ。

## 停止状態

停止状態の詳細（停止理由分類、伝播契約）は「adversarial-review 由来の停止伝播（case-auto の停止伝播受領）」「bounded parent decision resolution」節、および Workflow Skill（`agentdev-workflow-case-auto`）の停止条件分類が正規所有する。
主要な停止状態は次のとおり。

- 委譲工程の result が blocked / failed の場合（当該工程で自走停止、ユーザー判断待ち）。
- 委譲起動不能時（delegation-unavailable 報告、当該工程を停止）。
- auto_gate preflight の未解決 item 残存時（`auto_gate.auto_ready` が false または未解決 item が残る場合は停止）。
- 停止条件（11項目の停止条件いずれか）検出時（実行停止、停止時タイミング情報を追記）。新しい意味判断では Root Case に `resume_command: req-define` を記録する。
- user-decision-required（上位合意矛盾、新規ユーザー判断事項）検出時（自走を停止しユーザーへ判断を求める）。

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

本節は case-auto が下位 command（case-run インライン実行、工程委譲）から adversarial-review 由来の停止信号を受領した際の停止伝播挙動を所有する（REQ-015-012）。
共通契約（REQ-014）の正規定義は重複せず、各正規所有者を参照する（REQ-014-011）。

- user-decision-required の位置づけ: [skills/agentdev-adversarial-review.md](../skills/agentdev-adversarial-review.md)（REQ-014-012。停止信号の状態遷移一般化は v4-lifecycle-state-machine）
- parent_decision_required / decision_context 適用: [v4-delegation-contracts.md](../workflows/v4-delegation-contracts.md)「review 経路での parent_decision_required / decision_context 適用」節
- 再 review 条件、再 review 停止条件: adversarial-review Design（REQ-014-007）

### user-decision-required の位置づけ（REQ-014-012）

user-decision-required は case-run result enum（completed-pr / blocked / failed / delegation-unavailable）の第5状態ではなく、既存結果に付随する停止理由分類である（REQ-014-012、v4-lifecycle-state-machine Design が正）。
case-auto は user-decision-required を新規 result 状態として扱わず、result 4状態のいずれかに付随する分類として受領する。

| 起源 | 受領形式 |
|---|---|
| case-run 起源 | result enum `blocked` に付随する停止理由として user-decision-required 分類を受領する |
| 工程委譲起源（req-define、case-open、case-close 等） | 既存 status（pass/warn/fail/partial）+ `parent_decision_required` を通じて受領する |

本節の停止理由分類は「停止理由分類（REQ-034-015/108 拡張）」節の分類軸とは独立する。
同節は case-auto 自身の HITL 境界停止条件（11項目）の分類であり、user-decision-required は下位 command の adversarial-review 由来の停止信号の分類である。
両者を混同しない。

### 停止伝播契約（REQ-015-012）

case-auto は下位 command から user-decision-required + decision_context を受領した場合、以下の挙動をとる。

1. **自走停止**: 対象 execution_unit（Issue）の処理を停止し、ユーザー判断を待機する。他の ready 対象の execution_unit がある場合は継続する（部分停止、REQ-034-035/016 準拠）
2. **ユーザー提示**: decision_context（対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断）をユーザーへ提示する（decision_context 構成は v4-delegation-contracts Design が正）
3. **resume point の記録**: 停止時の resume point を記録する。resume point は v4-lifecycle-state-machine Design に従い、case-run 起源の場合は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源の場合は当該工程の委譲起点とする
4. **resume point から再開**: ユーザー判断の解決後、resume point から処理を再開する。
adversarial-review の再発動要否は adversarial-review Design「再 review 条件」「再 review 停止条件」の各節に従い（REQ-014-007）、case-auto は独自に判断しない。
adversarial-review 自体を恒久的な統制ゲートとしない（REQ-014-009）

### case-auto が行わないこと（REQ-015-012）

case-auto は停止伝播において以下を行わない。
これらは下位 command（case-run の場合は adapter 委譲内、工程委譲の場合は当該工程）の責務であり、case-auto は伝播と再開のみを担う。

- **review 直接起動**: adversarial-review を直接起動しない（review 挿入境界は各 command Design が所有、REQ-015-001）
- **finding 解釈**: adversarial-review の finding を意味解釈しない（finding の意味解釈は review 呼出元である下位 command の責務）
- **採否**: finding の採用・不採用を決定しない（accepted finding の反映は review 呼出元の責務、REQ-014-006）
- **再評価**: review 対象の再評価を行わない（再 review 条件の判定は adversarial-review Design、REQ-014-007）

case-auto は停止伝播受領において純粋な伝播経路として機能し、adversarial-review の意味的処理には関与しない。

## bounded parent decision resolution（REQ-034-032〜034、DEC-008）

本節は case-auto が下位 command から受領した decision_context をどの範囲まで自律解決し、どこでユーザーへ返すかの境界を規定する。
default-on + skip policy（REQ-014-013、REQ-015-002）により各 caller command で adversarial-review が原則実行される前提と、case-auto が中央集約 review engine とはならない前提（REQ-015-012）を両立するための限定的親判断解決である。

### 解決範囲

case-auto は下位 command から受領した decision_context について、現行正規成果物（REQ、Decision、Design、Issue その他合意済み情報）から一意に回答可能な場合はユーザー停止せず回答して下位 command を resume させる（REQ-034-032、DEC-008 決定1）。

| 解決可否 | 条件 | case-auto の挙動 |
|---|---|---|
| 自律解決可能 | 現行正規成果物から一意に回答可能 | 回答を下位 command へ返し resume させる（REQ-034-032） |
| 作業仮定で継続可能 | 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細であり、既存契約で許容された範囲 | 作業仮定と根拠を明示した上で自走継続し、下位 command を resume させる（REQ-034-033、DEC-008 決定2） |
| ユーザー停止（上位合意矛盾） | decision_context が現行正規成果物間の矛盾に起因し、当該矛盾そのものが finding の対象 | 一方を勝手に採用せず停止し、停止理由分類「上位合意矛盾」でユーザーへ返す（REQ-034-034、DEC-008 決定3） |
| ユーザー停止（新規ユーザー判断事項） | 新しいユーザー価値判断、対象範囲変更、外部契約変更が必要 | 既存停止経路で停止し、停止理由分類「新規ユーザー判断事項」でユーザーへ返す（REQ-034-034、DEC-008 決定4） |

### 作業仮定の明示要件（REQ-034-033）

可逆的内部詳細を作業仮定で継続する場合、case-auto は作業仮定と根拠を明示する。
明示内容は下位 command への回答に含め、ユーザーが事後確認できる形とする。
外部仕様、互換性、データ保持、セキュリティ、対象範囲、受け入れ条件の変更は作業仮定の対象外であり、これらを変更する場合はユーザー停止（新規ユーザー判断事項）へ分類する。

### resume 機構（DEC-008 決定5）

case-auto は回答、根拠、または作業仮定を下位 command へ返し、既存 resume point（REQ-006-114）から処理を継続する。
新規の永続結果型を導入しない。
resume point の仕様は v4-lifecycle-state-machine Design、v4-delegation-contracts Design「review 経路での parent_decision_required / decision_context 適用」節に従う。
adversarial-review の再実行要否は adversarial-review 側の再 review 契約（REQ-014-007/008）に従い、case-auto は独自の再 review 条件を持たない。

### case-auto が行わないこと（REQ-015-012 維持、DEC-008 決定6）

bounded parent decision resolution においても、case-auto は中央集約 review engine とはならず、raw finding を解釈、採否、候補反映しない（REQ-015-012 維持、DEC-008 決定6）。
case-auto が解決対象とするのは下位 command が構造化した decision_context のみであり、下位 command が raw finding を case-auto へそのまま渡すことはない（REQ-034-032、AG-006）。
各 caller command は自身が所有する候補について finding の意味解釈、採否、候補への反映を維持する（REQ-014-006、REQ-015 caller integration）。

### 停止理由分類との関係

本節の「上位合意矛盾」「新規ユーザー判断事項」は前述「停止理由分類（REQ-034-015/108 拡張）」節の分類軸へ統合される。
case-auto が decision_context を自律解決できずユーザー停止へ分類する場合、本2分類のいずれかを停止理由として報告する。
HITL 境界の変更ではなく、既存停止経路（REQ-034-022）の分類精度向上である。

## v3 epic-wave-model Design からの吸収

v3 epic-wave-model Design が所有していた orchestration stage モデル、ドラフト間並列実行モデル（REQ-034-025〜029）、execution_unit 並列 orchestration、case-auto 停止条件と停止理由分類のうち case-auto 実行側の運用契約は本 Design の規定へ吸収された。旧 Design は第5段で supersede とされ（物理削除は docs-chore OU-003）、対応関係の正本は v3-v4-crosswalk references/crosswalk-inventory.md が追跡する。

- orchestration stage: case-auto 内部工程を stage として構成し、ドラフト間並列実行は stage 3 で共有 active Issue task 枠（REQ-034-027、起動間隔 10 秒。Epic・Wave・Standard を横断する単一所有枠、DEC-041）とする
- ドラフト間並列実行モデル: 複数 draft（OU 群）を依存グラフから解析し、並列実行可能性に基づいて同時起動する。直列化の単位は v4-runtime-execution-model「直列化単位表」に従う
- 停止理由分類: 停止条件の発生時に停止理由を分類して報告する。user-decision-required は result enum の状態ではなく停止理由分類として維持する（v4-lifecycle-state-machine 異常・例外状態と回復経路）
