---
title: case-auto SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# case-auto SPEC

## 目的

要件doc から req-save → spec-save → case-open → case-run → case-close を順次自走実行する最大自走モード。ユーザーが明示的に指定した場合のみ使用する追加入口であり、標準ワークフローを置き換えない。

## 入力

- Issue番号（数値）または Issue URL — 既存Issue から case-run → case-close を自走する場合
- 要件doc — 明示パス指定 / `.agentdev/drafts/req-draft-*.md` 単一自動検出 / セッション内要件doc（3段階優先順位・構造化 `draft-data` 形式: REQ-0138, ADR-0124）

## 出力

- REQ/ADR artifact_actions がある場合: REQ/ADRファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は Step 3 参照）

## 副作用

- 各工程（req-save / spec-save / case-open / case-run / case-close）の副作用を集約
- task() 起動: 各工程を task() で順次起動（ADR-0127）
- git 操作: 各工程の task() 内で実行。case-auto 自体は git 操作を行わない
- 自走対象: repo にファイルとして残る変更のみ。DB migration実行・deploy/apply・課金・権限変更は対象外

## 現在の動作

- Step 1: 入力解決
  - 実行開始時刻の記録（REQ-0114-082）— JST（Etc/GMT-9）・人間が読みやすい形式（例: `2026-06-21 15:30:00 JST`）で `case_auto_started_at` 変数に保持
  - Issue番号/URL入力モード — `^\d+$` または GitHub Issue URL の場合、case-run移行モードへ分岐
  - 要件doc入力モード — 明示パス→draft検出（複数件含む全件処理）→セッション内要件docの順で入力特定
- Step 2: work_type 読取 — `draft-data` から work_type 取得（参考情報・パイプライン分岐には使用しない・REQ-0138-010）
- Step 3: 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定・REQ-0138-009）
  - Issue番号/URL入力: case-run → case-close（req-save・spec-save・case-open・work_type読取スキップ）
  - artifact_actions ベース分岐: `artifact: req` or `artifact: adr` → req-save / `artifact: spec` → spec-save（req-save の後）/ 常に → case-open / その後 → case-run → case-close
  - spec-save 実行判定（ADR-0123 Decision #3, REQ-0136-014）— req-save 完了後に `artifact: spec` entry 確認
  - auto_gate preflight — `auto_gate.auto_ready` が false または未解決 item 残る場合は停止
- Step 4: 各工程の実行 — 各工程（req-save / spec-save / case-open / case-run / case-close）を各コマンド委譲契約に従い task() で起動（ADR-0127, REQ-0114-006/084/085）
  - 工程別委譲契約（ADR-0112 §5・ADR-0127）: 各工程の起動方式・inputs・output_contract は工程別委譲契約表参照
  - 品質ゲート（QG-1〜QG-4）の継承 — case-auto は QG を独自実装せず、構成コマンドが各自適用
  - case-run の実行担当サブエージェント委譲モデル — case-auto は変更せず
  - Standard flow（単一 Issue）: case-open task() 完了後、クリーンアップ検証ゲート実行 → case-run → case-close
  - Epic Issue flow（マルチREQ or 単一REQ Epic flow）: case-open task() 完了後、クリーンアップ検証ゲート → Step 4-1 Wave 反復制御
  - Step 4-1 Wave 反復制御（case-run #epic → case-close #epic の反復・ADR-0128 Decision #5, REQ-0114-084）— task()→case-run(#epic) → task()→case-close(#epic) → 次 Wave 判定 → 全 Wave 完了で Epic 完了報告 / 残 Wave ありで Step 1 へ戻る（べき等）
  - blocked / failed の扱い: case-close 対象外。一部 completed(pr) の場合は completed(pr) のみ case-close(#epic) で処理。全 blocked/failed で Wave 反復停止・部分完了報告
  - OU 逐次処理: 1 OU（Epic 全 Wave 完了）を close まで完了後に次 OU へ進む（REQ-0114-053）
  - クリーンアップ検証ゲート（REQ-0114-060〜063, REQ-0137-007）— ドラフトファイル・RU ファイルの残存がないことを検証。Standard / Epic Issue flow 双方で実施
- Step 5: 工程間の状態引き継ぎ — Issue番号・PR番号・RU ファイルパス・capture 対象情報を最終工程まで保持
- Step 6: 複数REQ対応 — req-save task() の出力から複数 REQ doc または scale:large 検出時、case-open の Issue 構造ルールを使用。case-auto 自体に Issue 階層決定ロジックを持たない
- Step 7: 停止条件の検出 — 停止時タイミング情報の追記（開始時刻・停止時刻・経過時間・REQ-0114-083）。10項目の停止条件いずれかを検出時、実行停止・停止理由・現在地点・再開可能な次コマンドを報告
- Step 8: 完了報告 — 最終工程（case-close task()）の完了報告をそのまま出力。タイミング情報追記（開始時刻・終了時刻・所要時間・REQ-0114-083）
- Step 8-1: Standard flow 逐次OU処理ループ — case-close task() 完了後、未処理 OU が残存する場合は次 OU の処理を自動開始（REQ-0114-065〜067）

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md) — Pattern Taxonomy（manager-orchestrator）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md) — step_execution 委譲（ADR-0127）
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md) — Epic Wave 反復制御
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md) — Capture 責務（委譲）

## 対象外

- DB migration実行・deploy/apply・クラウドリソース操作・外部SaaS設定変更・課金・権限・認証情報変更・repo 外実データ操作・通知送信（G02）
- migrationファイル・IaCファイルの作成・修正以外の migration実行・IaC apply（G03）
- remote branch 削除で当該 case-auto / case-run が作成した branch 以外の対象（G05）
- 各工程のインライン実行（G07・task() 起動必須・ADR-0127, REQ-0114-006/073/084）
- 既存 req-save / spec-save / case-open / case-run / case-close の責務変更（G09・task() 委譲は起動方式変更のみ）
- source path の実行時パス読み替え（G11）
- Issue 階層決定ロジックの独自保持（G13・case-open に委譲）
- req-save task() から case-open task() への状態引き継ぎ時のフィルタリング・再評価（G14・保存結果をそのまま渡す）
- 子Issue 選択ロジック・子Issue 単位の task() 並列起動（G15・case-run(#epic) / case-close(#epic) に委譲）
- Epic Issue 本文の書き込み（G16・case-close の単一書き手責務・ADR-0125・case-auto は読み取るのみ）
- 操作単位本文の抽出・変換・REQ 操作解釈（G18・REQ-0114-051）
- case-open 完了後の draft SSoT 扱い（G19・case-open 完了後は子Issue が SSoT）
- OU 間依存のみでの Epic Issue 化（G20・REQ-0114-055）
- Epic Issue 化判定への関与（G21・REQ-0114-057）
- case-auto 固有の capture 振る舞い（G17, G13・構成コマンドの capture 責務境界に従う）

## 検証観点

- 工程別委譲契約遵守（G27）: inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領
- 親コンテキスト非累積（G28）: 各 task() の完了結果（Issue/PR番号・pass/warn/fail）のみを親コンテキストに保持
- クリーンアップ検証ゲート（Standard / Epic Issue flow 双方）: ドラフトファイル・RU ファイルの残存がないこと
- 出力制約: 成果物本文 verbatim・調査過程等は圧縮（G10）
- タイミング情報: 開始時刻・終了時刻・所要時間を人間が読みやすい形式で報告（REQ-0114-082/083）

## See Also

- [req-save.md](req-save.md), [spec-save.md](spec-save.md), [case-open.md](case-open.md), [case-run.md](case-run.md), [case-close.md](case-close.md) — 構成工程
- `agentdev-quality-gates` skill — QG-1〜QG-4（各工程で適用）
- `agentdev-case-run-execution-adapter` skill — case-run 外部実行委譲
- `agentdev-git-worktree` skill — 並列実行安全 git 操作
- `agentdev-workflow-orchestration` skill — Capture 境界
- REQ-0114 — case-auto 最大自走モード
- REQ-0137 — 並列実行安全 git 操作規律
- REQ-0138 — 構造化 req_draft 契約
- ADR-0112 — サブエージェント委譲
- ADR-0127 — case-auto 工程委譲
- ADR-0128 — case-run / case-close Epic Wave モデル
