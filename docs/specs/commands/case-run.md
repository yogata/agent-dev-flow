---
title: case-run SPEC
status: draft
created: 2026-06-21
updated: 2026-06-25
---

# case-run SPEC

## 目的

単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェント（Sisyphus-Junior）へ委譲し、result を処理する。
worktree前提、task() 委譲、結果処理を責務とする。
3フェーズ構成でべき等性、再開ポイントを提供する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない（ADR-0114、ADR-0128）。

## task() 委譲契約

case-run から実行担当サブエージェントへの委譲契約を以下に正規化する。

- **委譲先**: case-run は task() により実行担当サブエージェント（Sisyphus-Junior）へ実装作業を委譲する。
- **load_skills**: AgentDevFlow 側の case-run 実行 adapter skill（`agentdev-case-run-execution-adapter`）を指定する。adapter skill は委譲契約、result 契約、worktree 隔離等の case-run 固有知識を提供する。
- **委譲 prompt**: 実行 command（`/ulw-loop` 等）を prompt 内に含めて委譲する。実行担当サブエージェントは prompt 内で指定された command を起動する。
- **実行主体分類**: `/ulw-loop` は skill ではなく、委譲 prompt 内で実行される command である。`load_skills` には command 名を指定せず、adapter skill 名を指定する。
- **test strategy 項目の test-fix ループ（REQ-0130-029/030）**: Issue 本文のテスト戦略セクションに test strategy 項目（3要素構造: verification / pass_criteria / on_failure）が含まれる場合、委譲契約は各項目の検証、不合格時の処置（実装修正して再検証、または Findings 記録）、全項目処理までの反復を実行担当サブエージェントに要求する。詳細な責務は adapter skill（`agentdev-case-run-execution-adapter`）が定義する。

旧仕様の `load_skills=["ulw-loop"]` は誤りであり、上記委譲契約に置換する。

## 入力

- Issue番号またはURL（要件doc埋め込み済み）（単一 Issue 実行モード）
- Epic Issue番号またはURL（Epic Wave 実行モード（`case-run #epic`））
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（Sisyphus-Junior が作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed: blocker 詳細は Issue コメントに SSoT として記録される（Sisyphus-Junior 責務）

## 副作用

- worktree 作成: `.worktrees/{N}-{type}/`（`agentdev-git-worktree`）
- git fetch: Epic Wave 実行時、PR merge 後再開時に worktree 作成前に `git fetch origin` を実行し origin/main 鮮度確認（REQ-0130-023）
- GitHub API: PR 作成は Sisyphus-Junior が実施。case-run 本体は Issue コメント読取のみ
- intake / learning capture: PR 本文記録のみ（直接 inbox 変更禁止）

## 現在の動作

### Step 0: フェーズ判定（再開ポイント検出、実行モード分岐）

`agentdev-workflow-orchestration` に従い再開フェーズを判定。実行モード分岐:
- 単一 Issue 実行モード: 非 Epic Issue 番号の場合。当該1 Issue を Sisyphus-Junior に委譲（委譲 prompt 内で `/ulw-loop` command を指定）
- Epic Wave 実行モード（`case-run #epic`）: Epic Issue 番号の場合。現在 ready な Wave の子Issue を特定し各子Issue を task() で並列委譲（最大5件）

前工程からの引き継ぎ停止判定: `agentdev_handoff: true` 含まれる場合は実装開始せず停止

### 準備フェーズ（Steps 1-4）

べき等性: worktreeとブランチが既に存在する場合、Step 4をスキップして委譲フェーズへ移行

- Step 1: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` チェックボックス品質基準で検証
- Step 2: 関連ADR特定、実装がADR決定事項に矛盾しないことを確認
- Step 3: work_type 判定（`agentdev-workflow-lifecycle`）
- Step 4: Worktree作成、ブランチ準備（`agentdev-git-worktree`）（`origin/main` ベース明示指定、べき等チェック）
  - Step 4-1: 親Epicステータス更新（`agentdev-epic-tracker`）
  - Step 4-2: worktree precondition gate（worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`））。未作成時、メインリポジトリにいる場合は Sisyphus-Junior 起動禁止

### 実行担当サブエージェント委譲フェーズ（Steps 5-6）

- Step 5: 実行担当サブエージェント起動（task() 委譲）（`task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])`（ADR-0128, REQ-0130-016/017））。task() 委譲契約の詳細は前述「task() 委譲契約」セクション参照
  - 委譲プロンプト: `/ulw-loop Implement Issue #N: <Issue本文>`（実行 command を prompt 内で指定）
  - Sisyphus-Junior 責務: 委譲 prompt 内で指定された command（`/ulw-loop`）による目標分解、observable evidence 要求、品質ゲート（code review + QA review + gate review）、test strategy 項目の test-fix ループ（各項目ごとの検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復、REQ-0130-030）
  - task() 起動失敗、異常終了時の扱い: 即 `failed` とせず**実装完了、検証未完了**として扱う（REQ-0130-025）
  - case-run が直接行わない（Sisyphus-Junior 責務）: work plan生成、実装実行、TDD、乖離検出（QG-3）、specs更新、関連ドキュメント整合性確認、ローカル検証、PR本文作成、PR作成、デプロイ検証
  - PR URL 受領: Sisyphus-Junior が直接 PR 作成し PR URL を task() result として返却
  - Findings / Capture 候補: Sisyphus-Junior が PR 本文の `## Findings / Capture候補` に記録
  - SPEC確定候補: Sisyphus-Junior が PR 本文の `## SPEC確定候補` セクションに記録（ADR-0123 Decision #4, REQ-0136-015）
- Step 6: 実行担当サブエージェント result 処理（Sisyphus-Junior が返す3状態（`agentdev-case-run-execution-adapter` result 契約）のいずれかを処理）
  - completed(pr): 実装完了、PR作成済み。PR番号を受け取りクリーンアップフェーズへ
  - blocked: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み
  - failed: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み

### Epic Wave 実行モード

ADR-0128 Decision #3 に基づく。
1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。
同一コマンド再実行で次 Wave に進む（べき等）。

1. Epic Issue 本文読込（子Issue一覧、Wave 構成、ステータス追跡テーブル（永続状態を SSoT とする、ADR-0109））
2. 現在 ready な Wave の子Issue 特定（`ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させて選択）。前提Issue が blocked/failed の場合は `pending` のまま選択対象外
3. `git fetch origin` 実行（REQ-0130-023）
4. 子Issue の worktree 作成（Step 4、Step 4-2 を各子Issue について実行
）
5. 各子Issue を task() で並列委譲（`task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])`）。
委譲 prompt 内で `/ulw-loop` command を指定する。
最大5件同時起動
6. 全 task() 完了待機
7. 結果収集（各子Issue の result（completed(pr) / blocked / failed）を収集）
8. return（収集結果を報告して return）。Wave 境界（PR マージ）は case-close の責務

### クリーンアップフェーズ（Step 7）

- Step 7: worktree クリーンアップ確認 + 完了報告
  - 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
  - 未コミット変更なし: 完了報告へ。`.sisyphus/` の削除は行わない（case-close で実施）

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（controlled_case_execution 委譲）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（intake / learning capture（PR 本文記録のみ））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave 実行モデル、子Issue 状態 enum）
- [quality-gates.md](../quality-gates.md)（QG-3（Sisyphus-Junior 責務））

## 対象外

- 壁打ち（G01、構造的実行フェーズ、実装は Sisyphus-Junior 経由）
- 実装で判明した制約の REQ 黙示変更（G02、Sisyphus-Junior が乖離として報告しユーザー承認後に反映）
- worktree 外でのファイル操作（G04）
- Issue番号省略時の `gh issue list` 等の open issue 一覧取得（G05、G06）
- Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）（G11、case-close 責務）
- case-run 本体による work plan生成、実装、乖離検出、specs更新、PR作成（G22、Sisyphus-Junior 責務）
- Sisyphus-Junior result 以外の状態扱い（G23、`agentdev-case-run-execution-adapter` result 契約に従う）
- 完了条件チェックボックスの評価、更新（G24、case-close QG-4 責務）
- blocked / failed SSoT の一時会話コンテキスト、中間ファイル使用（G25、Issue コメント、PR 本文が SSoT）
- 外部実行ハーネス中間成果物の内部構造依存処理、検証（G26、REQ-0139-007）
- 外部実行手段中間成果物の永続成果物扱い（G29、REQ-0139-007）
- worktree 未作成時、メインリポジトリでの Sisyphus-Junior 起動（G30、Step 4-2 precondition gate）
- Sisyphus-Junior へメインリポジトリパスを渡すこと（G31、worktree root 相対パス指定）
- Epic Wave 実行モードで1 Wave を超える処理、Wave 境界（PR マージ）の実施（G32、case-close へ委譲）
- スコープ拡大（G14）、intake 候選の `.agentdev/intake/inbox/` 直接変更（G15）、learning 候選と intake 候選の混在（G16, G17）、`.agentdev/learning/inbox.md` 直接変更（G21）、SPEC確定候選と Findings の混在（G27）

## 検証観点

- Step 4-2 precondition gate: worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`）。検証失敗時は Sisyphus-Junior 起動禁止
- Sisyphus-Junior result 3状態（completed(pr) / blocked / failed）の取り扱い正確性（G23）
- PR URL 受領の確実性（REQ-0130-021 廃止に伴い PR URL フォールバック検索不使用）
- Epic Wave 実行時の1 Wave のみ処理、べき等性（同コマンド再実行で次 Wave に進む）
- 出力制約: PR 本文、commit message は verbatim で返す（成果物本文）

## case-auto 並列委譲モデル（REQ-0114-087〜093）

case-run は同一 Wave 内子Issue 処理を最大5件まで並列委譲する（REQ-0130-026、REQ-0114-087）。
本機能は Epic Wave モデル（ADR-0128）で既に実装済み。
case-auto 並列委譲モデル拡張により、Standard flow 起因の独立 OU 自動 Epic 化（REQ-0114-088）でも本機能が適用される。
case-run 側の新規機能追加は不要で、入力としての Epic Issue が増えるのみ。

## L2 タイムスタンプ計測

case-run は Sisyphus-Junior task() の起動直前・直後にタイムスタンプを記録し、Sisyphus-Junior 実行時間および worktree 設定/クリーンアップ時間を result に含める（REQ-0151-009、REQ-0130-028）。

計測対象は以下のフェーズ前後とする。

- worktree 設定（設定開始・完了）
- task() 委譲（起動直前・直後）
- 検証フェーズ（開始・完了）
- worktree クリーンアップ（開始・完了）

記録された L2 タイムスタンプは case-auto の工程別壁時計時間報告（REQ-0151-008）の入力として消費される。L3（ulw-loop 内部メトリクス）は対象外とする（REQ-0151-010）。

## See Also

- [case-open.md](case-open.md)（前段コマンド（Issue 作成））
- [case-close.md](case-close.md)（後続コマンド（PR マージ、Issue クローズ））
- [case-auto.md](case-auto.md)（自走モード）
- `agentdev-workflow-orchestration` skill（フェーズ判定、エラー処理）
- `agentdev-case-run-execution-adapter` skill（oh-my-openagent 統合、task() 起動、result 契約）
- `agentdev-git-worktree` skill（worktree 作成、precondition gate）
- `agentdev-workflow-lifecycle` skill（work_type 判定）
- `agentdev-req-analysis` skill（チェックボックス品質基準）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- REQ-0130（case-run / 実装パイプライン）
- REQ-0139（外部エージェント統合契約）
- ADR-0114（case-auto 最大自走モード）
- ADR-0128（case-run 外部実行委譲）
