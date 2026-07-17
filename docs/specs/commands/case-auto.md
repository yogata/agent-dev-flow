---
title: case-auto SPEC
status: draft
created: 2026-06-21
updated: 2026-07-17
---

# case-auto SPEC

## 目的

要件doc から req-save → spec-save → case-open → case-run → case-close を順次自走実行する最大自走モード。
ユーザーが明示的に指定した場合のみ使用する追加入口であり、標準ワークフローを置き換えない。

## 入力

- Issue番号（数値）または Issue URL（既存Issue から case-run → case-close を自走する場合）
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照（暗黙判断廃止、構造化 `draft-data` 形式: REQ-0138, ADR-0124））

## 出力

- REQ/ADR artifact_actions がある場合: REQ/ADRファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は Step 3 参照）

## 副作用

- 各工程（req-save / spec-save / case-open / case-run / case-close）の副作用を集約
- 委譲起動: 各工程を実行担当サブエージェントへ順次起動（ADR-0127）。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-0162-002）
- git 操作: 各工程の委譲範囲内で実行。case-auto 自体は git 操作を行わない
- 自走対象: repo にファイルとして残る変更のみ。DB migration実行、deploy/apply、課金、権限変更は対象外

## 現在の動作

- Step 1: 入力解決
  - 実行開始時刻の記録（REQ-0114-082）（JST、人間が読みやすい形式で case_auto_started_at 変数に保持）
  - Issue番号/URL入力モード（^\d+$ または GitHub Issue URL の場合、case-run移行モードへ分岐）
  - 要件doc入力モード（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定時は当該draft / セッション指定キーワード時はセッション内要件doc参照、暗黙判断は行わない）
- Step 2: work_type 読取（draft-data から work_type 取得（参考情報、パイプライン分岐には使用しない、REQ-0138-010））
- Step 3: 工程分岐（work_type 固定分岐ではなく artifact_actions 存在による動的判定、REQ-0138-009）
  - Issue番号/URL入力: case-run（インライン）→ case-close（req-save、spec-save、case-open、work_type読取スキップ）
  - artifact_actions ベース分岐: artifact: req or artifact: adr → req-save / artifact: spec → spec-save（req-save の後）/ 常に → case-open / その後 → case-run（インライン）→ case-close
  - spec-save 実行判定（ADR-0123 Decision #3, REQ-0136-014）（req-save 完了後に artifact: spec entry 確認）
  - auto_gate preflight（auto_gate.auto_ready が false または未解決 item 残る場合は停止）
- Step 4: 各工程の実行
  - 委譲工程（req-save / spec-save / case-open / case-close）: 実行担当サブエージェントとして起動（ADR-0127, REQ-0114-006/084/085）。req-save / spec-save 統合委譲で順次実行、case-open / case-close は各コマンド委譲契約に従い起動。委譲起動不能時に delegation-unavailable 報告（REQ-0162-003/004）
  - case-run（インライン実行）: case-auto が case-run.md を authoritative source として読み込み、準備/クリーンアップフェーズを自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲（委譲起点の折りたたみ、AG-001/002）。adapter skill（agentdev-case-run-execution-adapter）を case-auto が読み込む
- Step 4-1: Wave 反復制御（Epic Issue 指定時）
  - case-auto が Epic Issue 番号を記録。Epic Issue 本文から Wave 構成、各子Issue ステータスを読み取る（読み取りのみ、Epic Issue 本文の書き込みは case-close の責務）
  - case-auto が現在 Wave の ready 子Issue を選択し、各子Issue ごとにインライン case-run を実行（最大5件並列、REQ-0130-026 踏襲）。各子Issue の実行担当サブエージェントへ case-auto から直接委譲
  - Wave 内全子Issue の完了（completed-pr / blocked / failed / delegation-unavailable）を待機
  - completed-pr の子Issue がある場合、case-close(#epic) へ委譲
  - 残 Wave がある場合、次 Wave を実行（べき等）
- Step 5: 工程間の状態引き継ぎ（Issue番号、PR番号、RU ファイルパス、capture 対象情報を最終工程まで保持）
- Step 6: 複数REQ対応（req-save 委譲の出力から複数 REQ doc または scale:large 検出時、case-open の Issue 構造ルールを使用）
- Step 7: 停止条件の検出（停止時タイミング情報の追記。10項目の停止条件いずれかを検出時、実行停止）
- Step 8: 完了報告（タイミング情報追記。インライン実行の適用を記録）

### 委譲起動不能時の扱い（REQ-0162-003/004）

委譲工程（req-save / spec-save / case-open / case-close）の委譲が起動できなかった場合、case-auto は当該工程を delegation-unavailable として報告する。

case-run インライン実行時の実行担当サブエージェントへの委譲失敗は、case-run result 契約（completed-pr / blocked / failed / delegation-unavailable）に従い処理する。delegation-unavailable の場合は当該子Issue を pending に戻す（REQ-0162-004）。

genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）は Step 7 停止条件として扱う。

context 管理:
- case-run インライン実行時のコンテキスト管理は harness の責務（REQ-0162-002）
- REQ-0114-073（親コンテキスト非累積）は case-run インライン実行時の例外として取り扱う

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（step_execution 委譲（ADR-0127））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave 反復制御）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 責務（委譲））

## 対象外

- DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更、repo 外実データ操作、通知送信（G02）
- migrationファイル、IaCファイルの作成、修正以外の migration実行、IaC apply（G03）
- remote branch 削除で当該 case-auto / case-run が作成した branch 以外の対象（G05）
- 各工程のインライン実行は通常時対象外（G07、委譲起動必須、ADR-0127, REQ-0114-006/073/084）。委譲起動不能時の `delegation-unavailable` 報告は例外として許可（REQ-0162-003/004）
- 既存 req-save / spec-save / case-open / case-run / case-close の責務変更（G09、委譲は起動方式変更のみ）
- source path の実行時パス読み替え（G11）
- Issue 階層決定ロジックの独自保持（G13、case-open に委譲）
- req-save 委譲から case-open 委譲への状態引き継ぎ時のフィルタリング、再評価（G14、保存結果をそのまま渡す）
- 子Issue 選択ロジック、子Issue 単位の並列起動（G15、case-run(#epic) / case-close(#epic) に委譲）
- Epic Issue 本文の書き込み（G16、case-close の単一書き手責務、ADR-0125、case-auto は読み取るのみ）
- 操作単位本文の抽出、変換、REQ 操作解釈（G18、REQ-0114-051）
- case-open 完了後の draft SSoT 扱い（G19、case-open 完了後は子Issue が SSoT）
- OU 間依存のみでの Epic Issue 化（G20、REQ-0114-055）
- Epic Issue 化判定への関与（G21、REQ-0114-057）
- case-auto 固有の capture 振る舞い（G17, G13、構成コマンドの capture 責務境界に従う）

## 検証観点

- 工程別委譲契約遵守（G27）: inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領
- 親コンテキスト非累積（G28）: 各委譲の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持
- クリーンアップ検証ゲート（Standard / Epic Issue flow 双方）: ドラフトファイル、RU ファイルの残存がないこと
- 出力制約: 成果物本文 verbatim、調査過程等は圧縮（G10）
- タイミング情報: 開始時刻、終了時刻、所要時間を人間が読みやすい形式で報告（REQ-0114-082/083）

## 複数 execution_unit 並列 orchestration（REQ-0148, ADR-0129）

case-auto は case-open が生成した execution_unit 群（standard | epic の混在）を orchestration 対象とする（REQ-0148-012）。
従来の「単一 Epic の Wave 反復制御」を「複数 execution_unit 群反復制御」へ一般化する。
case-auto は case-open の判定結果に従い case-run(#epic) / case-run(standard) を起動する（薄いオーケストレーター原則、G13/G15/G21 維持）。
Issue 階層決定、子 Issue 選択、Epic 化判定の判断ロジックは持たない。

### 並列実行の判定

並列可否は連結成分（必須依存のみをエッジとする）で判定する（REQ-0148-014）:

- 必須依存がない複数 execution_unit 間（Epic 間、Standard 間、混在）は並列実行
- 同一 Epic 内の Wave 間は直列（REQ-0148-013）
- 技術的依存レベル（L0-L3）は並列判定軸から外す。ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは後続 PR の rebase で解決する（REQ-0148-014, REQ-0148-024）

グローバル並列上限は設定しない（REQ-0148-018）。
case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とする。
N 個の execution_unit が並列実行された場合、N×5 件の委譲同時起動リスクを許容する（運用監視対象、ADR-0129）。

### blocked 部分停止、ready 継続判定フロー

各 execution_unit の状態（closed/blocked/failed/running/ready）を読み取り、以下の判定フローで orchestration する（REQ-0148-015, REQ-0148-016）:

| execution_unit 状態 | case-auto アクション |
|---|---|
| ready | 起動（case-run(standard) または case-run(#epic)） |
| running | 完了待機 |
| completed | case-close 相当処理へ進行 |
| blocked | 当該 execution_unit のみ停止。他の ready 対象は継続 |
| failed | 当該 execution_unit のみ case-close 対象外。他の completed-pr は case-close 対象 |

**終了条件**: 全 execution_unit が closed/blocked/failed になったら終了する。
一部 blocked が残存する場合は partial blocked として報告する（REQ-0148-016）。

### execution_unit 群反復制御への一般化

従来の「単一 Epic の Wave 反復制御」は execution_unit 群反復制御の特殊ケース（execution_unit = 1 件の Epic）となる。

- execution_unit が standard issue の場合: case-run(standard) → case-close を1回実行
- execution_unit が epic issue の場合: Wave 反復制御（case-run(#epic) → case-close(#epic) の反復）を完遂（ADR-0128 Decision #5, REQ-0114-084）

OU 逐次処理（REQ-0114-053）は、必須依存で結合した execution_unit 群に適用される。
必須依存のない execution_unit 群は順序を問わず並列実行できる（REQ-0114-053 例外条項）。

### 結果集約

各 execution_unit の結果（completed-pr / blocked / failed / delegation-unavailable）を case-auto が集約し最終判定に反映する（REQ-0114-092）。
親コンテキスト非累積原則に従い、実装詳細は保持せず Issue / PR 状態から再読込する。

### コンフリクト解消モデル（3レベルエスカレーション）（REQ-0151, ADR-0132）

PR マージコンフリクト発生時は、以下3レベルのエスカレーションで解消を図る。
各レベルを試行しても解消できない場合のみ次のレベルへ進む。
機械的競合（rebase で自動解決可能）は停止条件に含まず、Level 1 で case-close が解消する。

| Level | 実行主体 | 解消手法 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消。自動解決時は再マージ（REQ-0151-001） | case-auto へエスカレーション（REQ-0151-002） |
| Level 2 | case-auto | 両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて case-run へ再委譲。最大2回（元の並列実行を含む計3回の case-run 実行）（REQ-0151-003/004） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離（REQ-0148-015 拡張） | 停止 |

**停止条件の段階化**: case-auto はコンフリクト解消に対して常に全力で解消を図る。
発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらずアクセス可能な文脈を総動員する（REQ-0151-005）。
停止条件は Level 2 の再委譲を上限回数（2回）試行しても解消しない場合とする（REQ-0151-006）。
Level 1 で解消できる機械的競合は case-auto の停止条件から除外する。

Level 1 の rebase 実行、エスカレーション判定は case-close の責務（`docs/specs/commands/case-close.md` Step 4-2 参照）。
case-auto は Level 2/3 のオーケストレーション級判断を担う。

## 工程別タイムスタンプ計測（L1: case-auto）（REQ-0151-008）

case-auto は各工程（req-save / spec-save / case-open / case-run / case-close）の委譲起動前後にタイムスタンプを記録し、工程別の壁時計時間を完了報告に含める。
現行の開始、終了時刻記録（REQ-0114-082/083）を工程別内訳へ拡張する（REQ-0114-094）。

- 計測単位: 委譲起動前後の壁時計時刻（JST、REQ-0114-082 の時刻形式に準拠）
- 記録先: case-auto 完了報告への工程別内訳追記。永続化は必要になった段階で別途検討
- 対象外: 委譲先内部メトリクス（L3）は harness 依存が強すぎるため対象外（REQ-0151-010）。case-run 内の L2 計測は case-run result に含まれる（REQ-0151-009、REQ-0130-028）

## See Also

- [req-save.md](req-save.md), [spec-save.md](spec-save.md), [case-open.md](case-open.md), [case-run.md](case-run.md), [case-close.md](case-close.md)（構成工程）
- `agentdev-quality-gates` skill（QG-1〜QG-4（各工程で適用））
- `agentdev-case-run-execution-adapter` skill（case-run 外部実行委譲）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- `agentdev-workflow-orchestration` skill（Capture 境界）
- REQ-0114（case-auto 最大自走モード）
- REQ-0137（並列実行安全 git 操作規律）
- REQ-0138（構造化 req_draft 契約）
- REQ-0148（RU群バッチ処理と複数 execution_unit 並列実行）
- REQ-0151（コンフリクト解消モデルと実行時間観測）
- ADR-0112（サブエージェント委譲）
- ADR-0127（case-auto 工程委譲）
- ADR-0128（case-run / case-close Epic Wave モデル）
- ADR-0129（複数 execution_unit 並列実行モデル）
- ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
