---
title: case-auto SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-19
---

# case-auto SPEC

## 目的

要件doc から req-save → spec-save → case-open → case-run → case-close を順次自走実行する最大自走モード。
ユーザーが明示的に指定した場合のみ使用する追加入口であり、標準ワークフローを置き換えない。

## 承認・HITL 境界

- ユーザーが case-auto の実行を明示的に指定した場合のみ使用する追加入口である（起動自体が唯一の事前判断）。
- 自走中に新規の承認点を追加しない。blocked / failed、停止条件検出時は自走を停止し、ユーザー判断を待つ（bounded parent decision resolution による decision_context の限定的親判断を除く）。

## 入力

- Issue番号（数値）または Issue URL（既存Issue から case-run → case-close を自走する場合）
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照（暗黙判断廃止、構造化 `draft-data` 形式: REQ-008, DEC-003））

## 出力

- REQ/Decision artifact_actions がある場合: REQ/Decisionファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は「現在の動作」参照）

## 副作用

- 各工程（req-save / spec-save / case-open / case-run / case-close）の副作用を集約
- 委譲起動: 各工程を実行担当サブエージェントへ順次起動（v2:ADR-0127）。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-002-002）
- git 操作: 各工程の委譲範囲内で実行。case-auto 自体は git 操作を行わない
- 自走対象: repo にファイルとして残る変更のみ。DB migration実行、deploy/apply、課金、権限変更は対象外

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-auto`）が正規情報源である。

- 入力解決
  - 実行開始時刻の記録（REQ-006-082）（JST、人間が読みやすい形式で case_auto_started_at 変数に保持）
  - Issue番号/URL入力モード（^\d+$ または GitHub Issue URL の場合、case-run移行モードへ分岐）
  - 要件doc入力モード（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定時は当該draft / セッション指定キーワード時はセッション内要件doc参照、暗黙判断は行わない）
- work_type 読取（draft-data から work_type 取得（参考情報、パイプライン分岐には使用しない、REQ-008-010））
- 工程分岐（work_type 固定分岐ではなく artifact_actions 存在による動的判定、REQ-008-009）
  - Issue番号/URL入力: case-run（インライン）→ case-close（req-save、spec-save、case-open、work_type読取スキップ）
  - artifact_actions ベース分岐: artifact: req or artifact: decision → req-save / artifact: spec → spec-save（req-save の後）/ 常に → case-open / その後 → case-run（インライン）→ case-close
  - spec-save 実行判定（v2:ADR-0123 Decision #3, REQ-001-014）（req-save 完了後に artifact: spec entry 確認）
  - auto_gate preflight（auto_gate.auto_ready が false または未解決 item 残る場合は停止）
- 各工程の実行
  - 委譲工程（req-save / spec-save / case-open / case-close）: 実行担当サブエージェントとして起動（v2:ADR-0127, REQ-006-006/084/085）。req-save / spec-save 統合委譲で順次実行、case-open / case-close は各コマンド委譲契約に従い起動。委譲起動不能時に delegation-unavailable 報告（REQ-002-003/004）
  - case-run（インライン実行）: case-auto が case-run の Workflow Skill（`agentdev-workflow-case-run`）を正規情報源として読み込み、準備/クリーンアップフェーズを自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲（委譲起点の折りたたみ/002）。adapter skill（agentdev-case-run-execution-adapter）を case-auto が読み込む
  - 結果状態の4次元集約（REQ-006-110）: 各工程の output_contract から (1) 工程結果 pass/warn/fail、(2) artifact_action 適用結果 applied/skipped/failed/no-op、(3) 定義適用工程完了状態、(4) OU ライフサイクル完了状態を収集し混同なく保持する。集約規則の詳細は後述「結果状態の4次元集約（REQ-006-110）」セクション
- Wave 反復制御（Epic Issue 指定時）
  - case-auto が Epic Issue 番号を記録。Epic Issue 本文から Wave 構成、各子Issue ステータスを読み取る（読み取りのみ、Epic Issue 本文の書き込みは case-close の責務）
  - case-auto が現在 Wave の ready 子Issue を選択し、各子Issue ごとにインライン case-run を実行（最大5件並列、REQ-006-026 踏襲）。各子Issue の実行担当サブエージェントへ case-auto から直接委譲
  - Wave 内全子Issue の完了（completed-pr / blocked / failed / delegation-unavailable）を待機
  - completed-pr の子Issue がある場合、case-close(#epic) へ委譲
  - 残 Wave がある場合、次 Wave を実行（べき等）
- 工程間の状態引き継ぎ（Issue番号、PR番号、RU ファイルパス、capture 対象情報を最終工程まで保持）
- 複数REQ対応（req-save 委譲の出力から複数 REQ doc または scale:large 検出時、case-open の Issue 構造ルールを使用）
- 停止条件の検出（停止時タイミング情報の追記。10項目の停止条件いずれかを検出時、実行停止）
- 完了報告（タイミング情報追記。インライン実行の適用を記録。結果状態の4次元報告（REQ-006-110）を含める）

### 委譲起動不能時の扱い（REQ-002-003/004）

委譲工程（req-save / spec-save / case-open / case-close）の委譲が起動できなかった場合、case-auto は当該工程を delegation-unavailable として報告する。

case-run インライン実行時の実行担当サブエージェントへの委譲失敗は、case-run result 契約（completed-pr / blocked / failed / delegation-unavailable）に従い処理する。
delegation-unavailable の場合は当該子Issue を pending に戻す（REQ-002-004）。

genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）は停止条件として扱う。

context 管理:
- case-run インライン実行時のコンテキスト管理は harness の責務（REQ-002-002）
- REQ-006-073（親コンテキスト非累積）は case-run インライン実行時の例外として取り扱う

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/case-auto.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（orchestration stage モデル、Wave 反復制御、停止理由分類、reference 構成）は Workflow Skill（`agentdev-workflow-case-auto`）が所有し、本 SPEC はこれらを複製しない。各工程の output_contract（工程別契約表）も Workflow Skill が所有する。
- case-run（インライン実行）の workflow 実装本体は case-run の Workflow Skill（`agentdev-workflow-case-run`）が所有する（single workflow、epic-wave workflow の分離を含む）。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（step_execution 委譲（v2:ADR-0127））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave 反復制御）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 責務（委譲））

## 対象外

- DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更、repo 外実データ操作、通知送信（G02）
- migrationファイル、IaCファイルの作成、修正以外の migration実行、IaC apply（G03）
- remote branch 削除で当該 case-auto / case-run が作成した branch 以外の対象（G05）
- 各工程のインライン実行は通常時対象外（G07、委譲起動必須、v2:ADR-0127, REQ-006-006/073/084）。委譲起動不能時の `delegation-unavailable` 報告は例外として許可（REQ-002-003/004）
- 既存 req-save / spec-save / case-open / case-run / case-close の責務変更（G09、委譲は起動方式変更のみ）
- source path の実行時パス読み替え（G11）
- Issue 階層決定ロジックの独自保持（G13、case-open に委譲）
- req-save 委譲から case-open 委譲への状態引き継ぎ時のフィルタリング、再評価（G14、保存結果をそのまま渡す）
- 子Issue 選択ロジック、子Issue 単位の並列起動（G15、case-run(#epic) / case-close(#epic) に委譲）
- Epic Issue 本文の書き込み（G16、case-close の単一書き手責務、v2:ADR-0125、case-auto は読み取るのみ）
- 操作単位本文の抽出、変換、REQ 操作解釈（G18、REQ-006-051）
- case-open 完了後の draft SSoT 扱い（G19、case-open 完了後は子Issue が SSoT）
- OU 間依存のみでの Epic Issue 化（G20、REQ-006-055）
- Epic Issue 化判定への関与（G21、REQ-006-057）
- case-auto 固有の capture 振る舞い（G17、構成コマンドの capture 責務境界に従う）

## 検証観点

- 工程別委譲契約遵守（G27）: inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領
- 親コンテキスト非累積（G28）: 各委譲の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持
- クリーンアップ検証ゲート（Standard / Epic Issue flow 双方）: ドラフトファイル、RU ファイルの残存がないこと
- 出力制約: 成果物本文 verbatim、調査過程等は圧縮（G10）
- タイミング情報: 開始時刻、終了時刻、所要時間を人間が読みやすい形式で報告（REQ-006-082/083）
- 結果状態の4次元集約（REQ-006-110）: 後述「結果状態の4次元集約（REQ-006-110）」セクションの4状態次元と集約規則に従い、warn を pass へ変換しない

## 結果状態の4次元集約（REQ-006-110）

case-auto は各工程の結果を次の4状態次元で保持し、集約報告で次元を混同しない。
各工程の output_contract（Workflow Skill（`agentdev-workflow-case-auto`）の工程別契約表）が情報源となる。

| 次元 | 取得元 | 値 |
|---|---|---|
| (1) 工程結果 | 全工程（req-save+spec-save / case-open / case-run / case-close）の pass/warn/fail | pass / warn / fail |
| (2) artifact_action 適用結果 | req-save+spec-save 統合委譲の action id ごとの適用結果 | applied / skipped / failed / no-op |
| (3) 定義適用工程の完了状態 | (1)(2) の組み合わせから導出 | 定義適用完了 / 警告付き工程完了 / 定義適用未完了 |
| (4) OU ライフサイクル完了状態 | case-open（Issue 作成）、case-run（PR 作成）、case-close（PR マージ、Issue クローズ）の各成否 | 各ライフサイクル事象ごとに 完了 / 未完了 |

集約規則:

- (3) の導出: 全必須 action が applied または正当な no-op で工程結果 (1) が pass → 定義適用完了。同条件で (1) が warn → 警告付き工程完了（warn を pass へ変換しない）。必須 action に skipped または failed が1件以上ある → 定義適用未完了（この場合は定義適用完了/警告付き工程完了と報告しない）。正当な no-op とは、対象外 artifact（例: spec-save における `artifact: spec` entry 不存在、後方互換の `artifact_actions` フィールド不存在）による action 不実施を指す。正当な理由なく必須 action を飛ばした場合は skipped として扱う
- (4) の独立性: OU ライフサイクル完了状態は (3) と独立して扱う。(3) が定義適用完了/警告付き工程完了であっても case-open（Issue 作成）が未実行なら OU ライフサイクルは未完了と報告する
- Phase 0 と OU 完了の分離: Phase 0 成功（(3) の定義適用完了/警告付き工程完了）と OU 完了（(4) の全ライフサイクル事象完了）を別々に報告する。一方を他方へすり替えて報告しない
- warn 変換禁止: (1) が warn の工程を pass として集約しない。完了報告には warn を warn のまま残す

完了報告（停止時フォーマットを含む）には上記4状態次元を工程別・action id 別・ライフサイクル事象別に列挙する。
実行定義は Workflow Skill（`agentdev-workflow-case-auto`）の「結果状態の4次元集約（REQ-006-110）」および「結果状態の4次元報告（REQ-006-110）」を正とする。

## 複数 execution_unit 並列 orchestration（REQ-006, v2:ADR-0129）

case-auto は case-open が生成した execution_unit 群（standard | epic の混在）を orchestration 対象とする（REQ-006-012）。
従来の「単一 Epic の Wave 反復制御」を「複数 execution_unit 群反復制御」へ一般化する。
case-auto は case-open の判定結果に従い case-run(#epic) / case-run(standard) を起動する（薄いオーケストレーター原則、G13/G15/G21 維持）。
Issue 階層決定、子 Issue 選択、Epic 化判定の判断ロジックは持たない。

### 処理単位の一級概念化（DEC-015）

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

処理単位の具体的な格納形式、スキーマは本 SPEC の対象外とし、SPEC 側（orchestration 層の詳細仕様）で確定する。
Git 上の変更を伴う並列処理では処理単位を worktree で隔離する（REQ-035-011）。

依存関係上独立した処理単位は並列実行可能と判定する。
実行可能な処理単位、並列可能性、合流条件、一部失敗時の全体状態遷移は ADF 側の判断として所有し、実際に起動するエージェント数、起動 API、実行基盤固有の並列化手段は正規契約へ固定しない（REQ-034-036）。
並列処理の一部が失敗・中断した場合、完了済み処理を未完了へ戻さず、全体の次状態を規則に従って判定し、必須処理単位が揃っていない状態で後続処理へ進まない（REQ-035-011）。

### 並列実行の判定

並列可否は連結成分（必須依存のみをエッジとする）で判定する（REQ-006-014）:

- 必須依存がない複数 execution_unit 間（Epic 間、Standard 間、混在）は並列実行
- 同一 Epic 内の Wave 間は直列（REQ-006-013）
- 技術的依存レベル（L0-L3）は並列判定軸から外す。ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは後続 PR の rebase で解決する（REQ-006-014, REQ-006-024）

グローバル並列上限は設定しない（REQ-006-018）。
case-run 単位の5件上限（REQ-006-026 踏襲）のみを制御対象とする。
N 個の execution_unit が並列実行された場合、N×5 件の委譲同時起動リスクを許容する（運用監視対象、v2:ADR-0129）。

### blocked 部分停止、ready 継続判定フロー

各 execution_unit の状態（closed/blocked/failed/running/ready）を読み取り、以下の判定フローで orchestration する（REQ-006-015, REQ-006-016）:

| execution_unit 状態 | case-auto アクション |
|---|---|
| ready | 起動（case-run(standard) または case-run(#epic)） |
| running | 完了待機 |
| completed | case-close 相当処理へ進行 |
| blocked | 当該 execution_unit のみ停止。他の ready 対象は継続 |
| failed | 当該 execution_unit のみ case-close 対象外。他の completed-pr は case-close 対象 |

**終了条件**: 全 execution_unit が closed/blocked/failed になったら終了する。
一部 blocked が残存する場合は partial blocked として報告する（REQ-006-016）。

### execution_unit 群反復制御への一般化

従来の「単一 Epic の Wave 反復制御」は execution_unit 群反復制御の特殊ケース（execution_unit = 1 件の Epic）となる。

- execution_unit が standard issue の場合: case-run(standard) → case-close を1回実行
- execution_unit が epic issue の場合: Wave 反復制御（case-run(#epic) → case-close(#epic) の反復）を完遂（v2:ADR-0128 Decision #5, REQ-006-084）

OU 逐次処理（REQ-006-053）は、必須依存で結合した execution_unit 群に適用される。
必須依存のない execution_unit 群は順序を問わず並列実行できる（REQ-006-053 例外条項）。

### 結果集約

各 execution_unit の結果（completed-pr / blocked / failed / delegation-unavailable）を case-auto が集約し最終判定に反映する（REQ-006-092）。
親コンテキスト非累積原則に従い、実装詳細は保持せず Issue / PR 状態から再読込する。

### 停止理由分類（REQ-006-016/108 拡張）

case-auto は停止時に停止理由を以下の分類で報告する。
分類は再開コマンド選択とユーザー通知の精度向上が目的であり、HITL 境界の変更ではない。

| 分類 | 定義 |
|---|---|
| req-define 合意要件からの逸脱 | case-open または後続工程が合意済み要件、対象外、受け入れ条件を変更した場合、合意されていない機能要件または制約を追加した場合、合意済み OU を欠落・統合・分割して要件の意味を変更した場合 |
| command 契約・実装不整合 | execution_unit へ分割可能であるにもかかわらず case-open が単一 Epic 子 Issue 上限により停止した場合、case-open または後続工程の実装が契約へ整合していない場合、構成生成事前検証（REQ-006-027）が実装されていない場合 |
| 要件未合意のスコープ拡大 | 合意されていないスコープが実行中に追加された場合 |
| repo 外実体変更 | DB マイグレーション実行、デプロイ/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更が必要な場合 |
| CI/test/lint 失敗 | コンフリクト解消モデル（v2:ADR-0132）の Level 2 まで試行しても自己修復不能な場合 |
| 未コミット変更の帰属不明 | 変更の由来が不明で安全に続行できない場合 |
| 上位合意矛盾 | case-auto が受領した decision_context が現行正規成果物（REQ/Decision/SPEC/Issue）間の矛盾に起因する場合。当該矛盾そのものが finding の対象であり、case-auto が一方を勝手に採用できない（REQ-006-114、DEC-008 決定3） |
| 新規ユーザー判断事項 | case-auto が受領した decision_context が新しいユーザー価値判断、対象範囲変更、外部契約変更を必要とし、現行正規成果物から一意に回答できない場合（REQ-006-114、DEC-008 決定4） |

execution_unit 分割可能性があるにもかかわらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する。
これは case-open の契約・実装不整合であり、要件doc側の問題ではない。

「上位合意矛盾」「新規ユーザー判断事項」は bounded parent decision resolution（REQ-006-112〜114、DEC-008）で case-auto が decision_context を自律解決できない場合の停止理由分類である。
case-auto は現行正規成果物から一意に回答可能な decision_context を自律解決するが、解決できないものは本2分類のいずれかへ分類してユーザーへ返す。
詳細は後述「bounded parent decision resolution（REQ-006-112〜114、DEC-008）」節を参照。

詳細な停止条件の全量は REQ-006-016（本拡張で11項目）を参照。

### コンフリクト解消モデル（3レベルエスカレーション）（REQ-003, v2:ADR-0132）

PR マージコンフリクト発生時は、以下3レベルのエスカレーションで解消を図る。
各レベルを試行しても解消できない場合のみ次のレベルへ進む。
機械的競合（rebase で自動解決可能）は停止条件に含まず、Level 1 で case-close が解消する。

| Level | 実行主体 | 解消手法 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消。自動解決時は再マージ（REQ-003-001） | case-auto へエスカレーション（REQ-003-002） |
| Level 2 | case-auto | 両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて case-run へ再委譲。最大2回（元の並列実行を含む計3回の case-run 実行）（REQ-003-003/004） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離（REQ-006-015 拡張） | 停止 |

**停止条件の段階化**: case-auto はコンフリクト解消に対して常に全力で解消を図る。
発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらずアクセス可能な文脈を総動員する（REQ-003-005）。
停止条件は Level 2 の再委譲を上限回数（2回）試行しても解消しない場合とする（REQ-003-006）。
Level 1 で解消できる機械的競合は case-auto の停止条件から除外する。

Level 1 の rebase 実行、エスカレーション判定は case-close の責務（`docs/specs/commands/case-close.md` コンフリクト解消 rebase パス参照）。
case-auto は Level 2/3 のオーケストレーション級判断を担う。

**Level 2 解消レシピ（AUTOGEN ブロックの競合）**: AUTOGEN ブロック（README 索引、件数キャプション、メトリクス表等）の競合は、手動での競合解決を行わず「新 base 上での再生成」で解消する。先にマージ済み PR を取り込んだ新 base（main）上で `generate_indexes.ts` を再実行し、再生成結果で当該 AUTOGEN ブロックを解消する。この経路を Level 2 の正道とし、AUTOGEN ブロックに対する手動マージを試行しない。

## 子 task 中断回復パス（v2:ADR-0138, REQ-002）

case-auto が Phase 2（case-run インライン実行）で起動した子 task の bg task が破棄された場合、case-auto 親ループが当該子 task の状態を回復する。
本節は v2:ADR-0138 で合意された bg task 状態管理、破棄検知時の状態別回復の SPEC 実装であり、v2:ADR-0137 の委譲起点折りたたみモデル、v2:ADR-0132 のコンフリクト解消モデルと協調する。

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

- **v2:ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約）**: 本回復パスは v2:ADR-0138 で合意された bg task 状態管理、破棄検知時の状態別回復の SPEC 実装である。Phase 2 の実行制御、固定並列数、bg task 状態管理を AgentDevFlow 側で規定する方針に従う
- **v2:ADR-0132（コンフリクト解消モデル）**: 状態 (a) の rebase で解消できないコンフリクトは v2:ADR-0132 の 3レベルエスカレーションモデル（Level 2/3）へ委譲する。bg task 破棄時の状態別回復とコンフリクト解消モデルは協調関係にある（v2:ADR-0138 relates-to v2:ADR-0132）
- **v2:ADR-0137（case-run インライン実行、多重委譲回避）**: 回復時の PR 作成代行は case-auto 親ループの責務とし、委譲起点の折りたたみモデルを維持する。子 task 側で再び委譲を起こして多重委譲を誘発しない

## 工程別タイムスタンプ計測（L1: case-auto）（REQ-003-008）

case-auto は各工程（req-save / spec-save / case-open / case-run / case-close）の委譲起動前後にタイムスタンプを記録し、工程別の壁時計時間を完了報告に含める。
現行の開始、終了時刻記録（REQ-006-082/083）を工程別内訳へ拡張する（REQ-006-094）。

- 計測単位: 委譲起動前後の壁時計時刻（JST、REQ-006-082 の時刻形式に準拠）
- 記録先: case-auto 完了報告への工程別内訳追記。永続化は必要になった段階で別途検討
- 対象外: 委譲先内部メトリクス（L3）は harness 依存が強すぎるため対象外（REQ-003-010）。case-run 内の L2 計測は case-run result に含まれる（REQ-003-009、REQ-006-028）

## Phase 0 commit スコープ設計運用

Phase 0（枝PR作成フェーズ）の commit スコープ設計運用を明示する。
Phase 0 は定義層（req-save / spec-save）で確定した REQ/Decision/SPEC をコミットし、枝PR を作成するフェーズである。
本節は Phase 0 の commit 構成と、後続する case-run（実装フェーズ）の委譲内 commit に適用するスコープ設計運用を規定する。
case-run SPEC（`docs/specs/commands/case-run.md`）の同名節と整合する内容を維持する（OU-013a / OU-013b）。

### 孫 Issue 間 SPEC スコープ交差時の扱い

Phase 0 で複数孫 Issue（Epic Wave 内の子Issue、または並列 execution_unit 内の個別 Issue）の実装が同一 SPEC ファイルに触れる場合の扱いを以下で規定する。

**SPEC 本文修正の非許容**: 孫 Issue の test strategy が `on_failure: fix-and-reverify` を指示する場合でも、Phase 0 の case-run 委譲内で SPEC 本文（`docs/specs/**`）を修正しない。
Phase 0 の SPEC 成果物は既に spec-save 工程で確定済みであり、case-run 委譲内で再修正すると定義層の一貫性が損なわれる。
SPEC 修正が必要と判明した場合は `record-in-findings` で PR 本文の `## SPEC確定候補` セクションへ記録し、case-close の docs 検証における SPEC 確定チェックへ引き継ぐ（`agentdev-case-run-execution-adapter` SKILL の SPEC確定候補配置契約に従う）。

**target_area の重複判定と並列制御**:

- 同一 SPEC ファイルの異なる target_area を複数孫 Issue が編集する場合: git diff が競合しないため並列マージを許容する。並列判定軸は REQ-006-014 の連結成分ベースに従い、ファイル衝突（L2）は並列許容、PR マージコンフリクトは後続 PR の rebase で解決する
- 同一 SPEC ファイルの同一 target_area を複数孫 Issue が編集する場合: case-open 構成生成時に必須依存（depends_on）として連結させ、直列化する。Wave 構成で同一 Wave へ割り当てない

### ドメイン state 更新と成果物変更の同一コミット混在

Phase 0 の枝PR に含まれるコミット構成運用を規定する。
原則として **2分割運用** を採用し、ドメイン state 更新と成果物変更を同一コミットへ混在させない。

**対象ディレクトリ**:

- 成果物変更: `docs/`、`src/opencode/`、`src/opencode-local/` 等、配布対象の永続状態
- ドメイン state 更新: `.agentdev/` 配下（intake、learning、drafts、cases 等のケース固有の一時状態）

**2分割運用の理由**:

- 永続性の違い: 成果物は配布対象の永続状態、ドメイン state はケース固有の一時状態。同一コミットに混在すると revert、cherry-pick の単位が曖昧になる
- レビュー単位の分離: 成果物変更は SPEC 品質査読の対象、ドメイン state はキャプチャ境界（intake/learning）の対象。査読観点が異なるため分離する
- capture 境界の遵守: `.agentdev/intake/`、`.agentdev/learning/` の直接編集は case-run 委譲内では禁止（G15/G16/G17、`agentdev-case-run-execution-adapter` SKILL）。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` へ記録し、case-close が intake/learning pipeline へ引き継ぐ。よって case-run 委譲内でドメイン state をコミットへ含めることは原則として発生しない

**例外**: `.agentdev/drafts/` の削除（req-save / spec-save 完了後のクリーンアップ）は、成果物変更とは独立したクリーンアップコミットとして扱う。
本運用が禁止する同一コミット混在には該当しない。
当該クリーンアップは req-save / spec-save 工程の責務であり、Phase 0 の case-run 委譲内では発生しない。

**commit 分割手順**: 実行担当サブエージェントは成果物変更を先にコミットする。
ドメイン state に触れる必要がある場合は別コミットへ分離するが、前述の通り case-run 委譲内では原則として `.agentdev/` 配下を編集せず、PR 本文経由で case-close へ引き継ぐ。

## 実証Case自走（新規セクション）

本節は case-auto における実証Case自走の実行詳細を所有する（REQ-034-037〜043 の実行詳細）。実証Caseの判定と実証の意味論は REQ-043 が所有し、case-auto は独自の実証判定・評価判定を所有しない。

- **実証Case認識**: Issue 永続情報または draft-data の実証情報（REQ-043-030）から実証Caseを復元する。通常Caseと実証Caseを区別し、通常Caseの既存挙動を維持する（REQ-034-037）
- **評価ブランチの全工程への伝播**: 実証Caseを Issue 等の永続情報から復元した評価ブランチで実行し、全工程へ一貫して伝播する。同時に複数実証を処理する場合、それぞれ異なる評価ブランチを利用する（REQ-034-038）
- **req-save / spec-save の省略禁止**: 実証であることだけを理由に req-save / spec-save を省略せず、評価ブランチ上で実行する（REQ-034-039）
- **Epic 実証の Wave 反復**: Epic 実証の各 Wave の case-run → case-close を同じ評価ブランチ上で反復する（REQ-034-040）
- **評価ブランチへの squash merge を正常完了とする扱い**: 評価ブランチへの squash merge を正常なCase完了として扱う。採用でも評価ブランチを main へ merge せず、同一実行内で正式化・本実装へ自動継続せず、実証全体の最終 case-close を当該実行の正常終了点とする（REQ-034-041）
- **blocked / failed / 中断時の評価ブランチ保持**: blocked / failed / ユーザー中断時に再開可能なら評価ブランチを保持し、実証が明示的に終了・放棄された場合のみ必要な記録後に破棄する（REQ-043-022 の適用）
- **評価契約の自律変更禁止とユーザー指示変更時の継続**: 評価契約を自律変更しない。ユーザーが評価契約変更を明示した場合は、変更履歴と既存結果への影響を保持し、必要な再評価または再実行を継続する（REQ-034-042）
- **blocked / failed で実証が未完のまま終了する場合の再開手段提示と正式化案内抑制（REQ-034-043）**: 評価結果を未確定として再開手段を示す。Epic 中間Waveを実証全体完了と誤認せず正式化案内を出さない
- **最終出力の構成要素**: 評価結果、実証Issue、主要PRまたは証拠、main 未反映であること、次の req-define <実証Issue> を示す。実証全体の完了時のみ正式化案内を示す（REQ-034-043）

## 停止状態

停止状態の詳細（停止理由分類、伝播契約）は「adversarial-review 由来の停止伝播（経路H）」「bounded parent decision resolution」節、および Workflow Skill（`agentdev-workflow-case-auto`）の停止条件分類が正規所有する。
主要な停止状態は次のとおり。

- 委譲工程の result が blocked / failed の場合（当該工程で自走停止、ユーザー判断待ち）。
- 委譲起動不能時（delegation-unavailable 報告、当該工程を停止）。
- auto_gate preflight の未解決 item 残存時（`auto_gate.auto_ready` が false または未解決 item が残る場合は停止）。
- 停止条件（10項目の停止条件いずれか）検出時（実行停止、停止時タイミング情報を追記）。
- user-decision-required（上位合意矛盾、新規ユーザー判断事項）検出時（自走を停止しユーザーへ判断を求める）。

## See Also

- [req-save.md](req-save.md), [spec-save.md](spec-save.md), [case-open.md](case-open.md), [case-run.md](case-run.md), [case-close.md](case-close.md)（構成工程）
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
- v2:ADR-0128（case-run / case-close Epic Wave モデル）
- v2:ADR-0129（複数 execution_unit 並列実行モデル）
- v2:ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
- v2:ADR-0137（case-auto における case-run インライン実行（多重委譲回避））
- v2:ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約）

## adversarial-review 由来の停止伝播（経路H）

本節は case-auto が下位 command（case-run インライン実行、工程委譲）から adversarial-review 由来の停止信号を受領した際の停止伝播挙動を所有する（REQ-015-012）。
共通契約（REQ-014）の正規定義は重複せず、各正規所有者を参照する（REQ-014-011）。

- user-decision-required の位置づけ: [workflow-contracts.md](../workflows/workflow-contracts.md)「adversarial-review 由来の停止信号」節（REQ-014-012）
- parent_decision_required / decision_context 適用: [delegation-contracts.md](../workflows/delegation-contracts.md)「review 経路での parent_decision_required / decision_context 適用」節
- 再 review 条件、再 review 停止条件: adversarial-review SPEC（REQ-014-007）

### user-decision-required の位置づけ（REQ-014-012）

user-decision-required は case-run result enum（completed-pr / blocked / failed / delegation-unavailable）の第5状態ではなく、既存結果に付随する停止理由分類である（REQ-014-012、workflow-contracts SPEC が正）。
case-auto は user-decision-required を新規 result 状態として扱わず、result 4状態のいずれかに付随する分類として受領する。

| 起源 | 受領形式 |
|---|---|
| case-run 起源 | result enum `blocked` に付随する停止理由として user-decision-required 分類を受領する |
| 工程委譲起源（req-define、case-open、case-close 等） | 既存 status（pass/warn/fail/partial）+ `parent_decision_required` を通じて受領する |

本節の停止理由分類は「停止理由分類（REQ-006-016/108 拡張）」節の分類軸とは独立する。
同節は case-auto 自身の HITL 境界停止条件（11項目）の分類であり、user-decision-required は下位 command の adversarial-review 由来の停止信号の分類である。
両者を混同しない。

### 停止伝播契約（REQ-015-012）

case-auto は下位 command から user-decision-required + decision_context を受領した場合、以下の挙動をとる。

1. **自走停止**: 対象 execution_unit（Issue）の処理を停止し、ユーザー判断を待機する。他の ready 対象の execution_unit がある場合は継続する（部分停止、REQ-006-015/016 準拠）
2. **ユーザー提示**: decision_context（対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断）をユーザーへ提示する（decision_context 構成は delegation-contracts SPEC が正）
3. **resume point の記録**: 停止時の resume point を記録する。resume point は workflow-contracts SPEC「case-auto への伝播と resume point」節に従い、case-run 起源の場合は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源の場合は当該工程の委譲起点とする
4. **resume point から再開**: ユーザー判断の解決後、resume point から処理を再開する。
adversarial-review の再発動要否は adversarial-review SPEC「再 review 条件」「再 review 停止条件」の各節に従い（REQ-014-007）、case-auto は独自に判断しない。
adversarial-review 自体を恒久的な統制ゲートとしない（REQ-014-009）

### case-auto が行わないこと（REQ-015-012）

case-auto は停止伝播において以下を行わない。
これらは下位 command（case-run の場合は adapter 委譲内、工程委譲の場合は当該工程）の責務であり、case-auto は伝播と再開のみを担う。

- **review 直接起動**: adversarial-review を直接起動しない（review 挿入境界は各 command SPEC が所有、REQ-015-001）
- **finding 解釈**: adversarial-review の finding を意味解釈しない（finding の意味解釈は review 呼出元である下位 command の責務）
- **採否**: finding の採用・不採用を決定しない（accepted finding の反映は review 呼出元の責務、REQ-014-006）
- **再評価**: review 対象の再評価を行わない（再 review 条件の判定は adversarial-review SPEC、REQ-014-007）

case-auto は経路H において純粋な伝播経路として機能し、adversarial-review の意味的処理には関与しない。

## bounded parent decision resolution（REQ-006-112〜114、DEC-008）

本節は case-auto が下位 command から受領した decision_context をどの範囲まで自律解決し、どこでユーザーへ返すかの境界を規定する。
default-on + skip policy（REQ-014-013、REQ-015-002）により各 caller command で adversarial-review が原則実行される前提と、case-auto が中央集約 review engine とはならない前提（REQ-015-012）を両立するための限定的親判断解決である。

### 解決範囲

case-auto は下位 command から受領した decision_context について、現行正規成果物（REQ、Decision、SPEC、Issue その他合意済み情報）から一意に回答可能な場合はユーザー停止せず回答して下位 command を resume させる（REQ-006-112、DEC-008 決定1）。

| 解決可否 | 条件 | case-auto の挙動 |
|---|---|---|
| 自律解決可能 | 現行正規成果物から一意に回答可能 | 回答を下位 command へ返し resume させる（REQ-006-112） |
| 作業仮定で継続可能 | 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細であり、既存契約で許容された範囲 | 作業仮定と根拠を明示した上で自走継続し、下位 command を resume させる（REQ-006-113、DEC-008 決定2） |
| ユーザー停止（上位合意矛盾） | decision_context が現行正規成果物間の矛盾に起因し、当該矛盾そのものが finding の対象 | 一方を勝手に採用せず停止し、停止理由分類「上位合意矛盾」でユーザーへ返す（REQ-006-114、DEC-008 決定3） |
| ユーザー停止（新規ユーザー判断事項） | 新しいユーザー価値判断、対象範囲変更、外部契約変更が必要 | 既存停止経路で停止し、停止理由分類「新規ユーザー判断事項」でユーザーへ返す（REQ-006-114、DEC-008 決定4） |

### 作業仮定の明示要件（REQ-006-113）

可逆的内部詳細を作業仮定で継続する場合、case-auto は作業仮定と根拠を明示する。
明示内容は下位 command への回答に含め、ユーザーが事後確認できる形とする。
外部仕様、互換性、データ保持、セキュリティ、対象範囲、受け入れ条件の変更は作業仮定の対象外であり、これらを変更する場合はユーザー停止（新規ユーザー判断事項）へ分類する。

### resume 機構（DEC-008 決定5）

case-auto は回答、根拠、または作業仮定を下位 command へ返し、既存 resume point（REQ-006-085）から処理を継続する。
新規の永続結果型を導入しない。
resume point の仕様は workflow-contracts SPEC「case-auto への伝播と resume point」節、delegation-contracts SPEC「review 経路での parent_decision_required / decision_context 適用」節に従う。
adversarial-review の再実行要否は adversarial-review 側の再 review 契約（REQ-014-007/008）に従い、case-auto は独自の再 review 条件を持たない。

### case-auto が行わないこと（REQ-015-012 維持、DEC-008 決定6）

bounded parent decision resolution においても、case-auto は中央集約 review engine とはならず、raw finding を解釈、採否、候補反映しない（REQ-015-012 維持、DEC-008 決定6）。
case-auto が解決対象とするのは下位 command が構造化した decision_context のみであり、下位 command が raw finding を case-auto へそのまま渡すことはない（REQ-006-112、AG-006）。
各 caller command は自身が所有する候補について finding の意味解釈、採否、候補への反映を維持する（REQ-014-006、REQ-015 caller integration）。

### 停止理由分類との関係

本節の「上位合意矛盾」「新規ユーザー判断事項」は前述「停止理由分類（REQ-006-016/108 拡張）」節の分類軸へ統合される。
case-auto が decision_context を自律解決できずユーザー停止へ分類する場合、本2分類のいずれかを停止理由として報告する。
HITL 境界の変更ではなく、既存停止経路（REQ-006-086）の分類精度向上である。

