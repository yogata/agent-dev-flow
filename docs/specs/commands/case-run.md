---
title: case-run SPEC
status: draft
created: 2026-06-21
updated: 2026-07-12
---

# case-run SPEC

## 目的

単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。
worktree前提、委譲、結果処理を責務とする。
3フェーズ構成でべき等性、再開ポイントを提供する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない（ADR-0114、ADR-0128）。

## 委譲契約

case-run から実行担当サブエージェントへの委譲契約を以下に正規化する。

- **委譲先**: case-run は実行担当サブエージェントへ実装作業を委譲する。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-0162-002）。
- **adapter skill**: AgentDevFlow 側の case-run 実行 adapter skill（`agentdev-case-run-execution-adapter`）を指定する。adapter skill は委譲契約、result 契約、worktree 隔離等の case-run 固有知識を提供する。adapter skill 経由で委譲を起動する。
- **委譲 prompt**: 実行 command を prompt 内に含めて委譲する。実行担当サブエージェントは prompt 内で指定された command を起動する。command の具体名は AGENTS.md および references/<harness>.md 参照。
- **実行主体分類**: 委譲 prompt 内で実行される command は skill ではなく command である。`load_skills` には command 名を指定せず、adapter skill 名を指定する。
- **test strategy 項目の test-fix ループ（REQ-0130-029/030）**: Issue 本文のテスト戦略セクションに test strategy 項目（3要素構造: verification / pass_criteria / on_failure）が含まれる場合、委譲契約は各項目の検証、不合格時の処置（実装修正して再検証、または Findings 記録）、全項目処理までの反復を実行担当サブエージェントに要求する。詳細な責務は adapter skill（`agentdev-case-run-execution-adapter`）が定義する。

## 入力

- Issue番号またはURL（要件doc埋め込み済み）（単一 Issue 実行モード）
- Epic Issue番号またはURL（Epic Wave 実行モード（`case-run #epic`））
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## 副作用

- worktree 作成: `.worktrees/{N}-{type}/`（`agentdev-git-worktree`）
- git fetch: Epic Wave 実行時、PR merge 後再開時に worktree 作成前に `git fetch origin` を実行し origin/main 鮮度確認（REQ-0130-023）
- GitHub API: PR 作成は実行担当サブエージェントが実施。case-run 本体は Issue コメント読取のみ
- intake / learning capture: PR 本文記録のみ（直接 inbox 変更禁止）

## 現在の動作

### Step 1: フェーズ判定（再開ポイント検出、実行モード分岐）

`agentdev-workflow-orchestration` に従い再開フェーズを判定。実行モード分岐:
- 単一 Issue 実行モード: 非 Epic Issue 番号の場合。当該1 Issue を実行担当サブエージェントに委譲
- Epic Wave 実行モード（`case-run #epic`）: Epic Issue 番号の場合。現在 ready な Wave の子Issue を特定し各子Issue を並列委譲（最大5件）

前工程からの引き継ぎ停止判定: `agentdev_handoff: true` 含まれる場合は実装開始せず停止

### 準備フェーズ（Steps 2-5）

べき等性: worktreeとブランチが既に存在する場合、Step 5をスキップして委譲フェーズへ移行

- Step 2: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` チェックボックス品質基準で検証
- Step 3: 関連ADR特定、実装がADR決定事項に矛盾しないことを確認
- Step 4: work_type 判定（`agentdev-workflow-lifecycle`）
- Step 5: Worktree作成、ブランチ準備（`agentdev-git-worktree`）（`origin/main` ベース明示指定、べき等チェック）
 - Step 5-1: 親Epicステータス更新（`agentdev-epic-tracker`）
  - Step 5-2: worktree precondition gate（worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`））。未作成時、メインリポジトリにいる場合は実行担当サブエージェント起動禁止

### 実行担当サブエージェント委譲フェーズ（Steps 6-7）

- Step 6: 実行担当サブエージェント起動（adapter protocol: `agentdev-case-run-execution-adapter`）（ADR-0128, REQ-0130-016/017）。委譲契約の詳細は前述「委譲契約」セクション参照。起動手段は AGENTS.md および references/<harness>.md 参照（REQ-0162-002）
 - 委譲プロンプト: 実行 command を prompt 内で指定（command の具体名は AGENTS.md 参照）
 - 実行担当サブエージェント責務: 委譲 prompt 内で指定された command による目標分解、observable evidence 要求、品質ゲート（code review + QA review + gate review）、test strategy 項目の test-fix ループ（各項目ごとの検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復、REQ-0130-030）
 - 委譲起動失敗、異常終了時の扱い: 即 `failed` とせず**実装完了、検証未完了**として扱う（REQ-0130-025）。委譲起動不能の場合は `delegation-unavailable` として報告する（REQ-0162-003/004）
 - case-run が直接行わない（実行担当サブエージェント責務）: work plan生成、実装実行、TDD、乖離検出（QG-3）、specs更新、関連ドキュメント整合性確認、ローカル検証、PR本文作成、PR作成、デプロイ検証
 - PR URL 受領: 実行担当サブエージェントが直接 PR 作成し PR URL を委譲 result として返却
 - Findings / Capture 候補: 実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録
 - SPEC確定候補: 実行担当サブエージェントが PR 本文の `## SPEC確定候補` セクションに記録（ADR-0123 Decision #4, REQ-0136-015）
- Step 7: 実行担当サブエージェント result 処理（`agentdev-case-run-execution-adapter` result 契約の4状態のいずれかを処理）
 - completed-pr: 実装完了、PR作成済み。PR番号を受け取りクリーンアップフェーズへ
 - blocked: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み
 - failed: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み
 - delegation-unavailable: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す（REQ-0162-004）

### Epic Wave 実行モード

ADR-0128 Decision #3 に基づく。
1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。
同一コマンド再実行で次 Wave に進む（べき等）。

1. Epic Issue 本文読込（子Issue一覧、Wave 構成、ステータス追跡テーブル（永続状態を SSoT とする、ADR-0109））
2. 現在 ready な Wave の子Issue 特定（`ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させて選択）。前提Issue が blocked/failed の場合は `pending` のまま選択対象外
3. `git fetch origin` 実行（REQ-0130-023）
4. 子Issue の worktree 作成（Step 5、Step 5-2 を各子Issue について実行
）
5. 各子Issue を実行担当サブエージェントに並列委譲する（adapter protocol: `agentdev-case-run-execution-adapter`）。
 委譲の起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-0162-002）。
 最大5件同時起動
6. 全委譲完了待機
7. 結果収集（各子Issue の result（completed-pr / blocked / failed / delegation-unavailable）を収集）
8. return（収集結果を報告して return）。Wave 境界（PR マージ）は case-close の責務

### クリーンアップフェーズ（Step 8）

- Step 8: worktree クリーンアップ確認 + 完了報告
  - 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
  - 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness の責務であり、case-run は関与しない（REQ-0162-002）

## QG-3 前置 staleness check 手順（新規セクション）

case-run は実装作業開始前に QG-3 本体とは独立した前置検査として staleness check を実行する（REQ-0130-031〜034）。本検査は QG-3 deviation 分類（spec-bug 等）運用を変更せず、deviation 発生前の予防層として位置づける。

### 検証項目

- **ファイルパス現行存在確認**: Issue 本文が参照するファイルパス（command 定義、SPEC、template 等）が現行リポジトリに存在するか確認する。Issue 作成時点から移動、改名、削除されたパスを検出対象とする
- **検査結果件数再計測**: Issue 本文の事前状態セクションが列挙する検査結果件数（NG 件数、IR 違反件数等）を再計測し、Issue 本文記載値と比較する。件数は変動しやすい実測値スナップショットであるため、差異の有無のみを判定材料とする

### 差異検出時のアクション

差異を検出した場合、case-run は以下を実施する:

1. PR 本文の `## Findings / Capture候補` セクションに `### stale-reference` 小見出しで差異内容（対象パス、Issue 本文記載値、現行値）を記録する
2. case-update へ連携し、Issue 本文の参照パス・件数の更新を委譲する
3. case-run 単独では Issue 本文を書き換えない（Issue 本文更新は case-update の責務）

### QG-3 本体との関係

staleness check は QG-3 本体（PR 作成直前の実装充足・乖離ゲート）とは独立した前置検査である。QG-3 が実装結果に対するゲートであるのに対し、staleness check は実装開始前の入力妥当性検査である。両者は順序依存を持たず、staleness check で差異を検出しても QG-3 本体の実施要否には影響しない。

## docs/** 変更時の targeted docs guard（REQ-0130-035）

case-run は PR 対象ファイルに docs/** 変更を含む場合、Step 6（実行担当サブエージェント起動）の委譲前に targeted docs guard を実行する（REQ-0130-035）。本検査は QG-3 本体・QG-3 前置 staleness check とは独立した前置 docs 整合性検査であり、3つの検査は順序依存を持たず、それぞれの実施要否に影響しない（REQ-0130-033 準拠）。

### 実行条件

- PR 対象ファイルに docs/** 変更を含む場合に実行する。docs/** 変更を含まない PR（コードのみ、SCRIPT のみ等）ではスキップする（REQ-0130-007 の QG-3 限定原則を維持、docs全体grep ではなく変更ファイル限定の targeted 検査）

### 実行コマンド

```
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
  --workflow case-run --base-ref origin/main --json
```

変更ファイルは worktree 内の git diff から取得する（`--base-ref origin/main` または `--files <changed-paths>`）。case-run プロファイル固有の追加ルールとして full_docs_check_recommended 判定は持たない（case-close の責務）。

### 検出結果の記録と連携

- 検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` セクションに `### docs-integrity` 小見出しで記録する
- case-update へ連携し、Issue 本文の更新を委譲する（case-run 単独では Issue 本文を書き換えない、REQ-0130-034 準拠）

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（controlled_case_execution 委譲）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（intake / learning capture（PR 本文記録のみ））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave 実行モデル、子Issue 状態 enum）
- [quality-gates.md](../quality/quality-gates.md)（QG-3（実行担当サブエージェント責務））

### case-run が使用する検査ツール

case-run が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- check_changed_docs.ts（--workflow case-run）: PR 対象ファイルに docs/** 変更を含む場合、Step 6 委譲前に実行（AG-002。[docs/** 変更時の targeted docs guard（REQ-0130-035）](#docs-変更時の-targeted-docs-guardreq-0130-035) 参照）
- check_extensions.ts（IR-056）: `src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行
- test_strategy: Issue 完了条件検証（REQ-0130-029/030）

case-run は check_integrity.ts（全体監査）を使用しない（case-run は worktree で実行、PR 単位の targeted 検査が責務。全体監査は /repo/docs-check の責務）。

※上記は全て肯定表現である（REQ-0144-002, REQ-0144-003 準拠）。

## 対象外

- 壁打ち（G01、構造的実行フェーズ、実装は 実行担当サブエージェント経由）
- 実装で判明した制約の REQ 黙示変更（G02、実行担当サブエージェントが乖離として報告しユーザー承認後に反映）
- worktree 外でのファイル操作（G04）
- Issue番号省略時の `gh issue list` 等の open issue 一覧取得（G05、G06）
- Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）（G11、case-close 責務）
- case-run 本体による work plan生成、実装、乖離検出、specs更新、PR作成（G22、実行担当サブエージェント責務）
- 実行担当サブエージェント result 以外の状態扱い（G23、`agentdev-case-run-execution-adapter` result 契約に従う）
- 完了条件チェックボックスの評価、更新（G24、case-close QG-4 責務）
- blocked / failed SSoT の一時会話コンテキスト、中間ファイル使用（G25、Issue コメント、PR 本文が SSoT）
- 外部実行ハーネス中間成果物の内部構造依存処理、検証（G26、REQ-0139-007）
- 外部実行手段中間成果物の永続成果物扱い（G29、REQ-0139-007）
- worktree 未作成時、メインリポジトリでの 実行担当サブエージェント起動（G30、Step 5-2 precondition gate）
- 実行担当サブエージェントへメインリポジトリパスを渡すこと（G31、worktree root 相対パス指定）
- Epic Wave 実行モードで1 Wave を超える処理、Wave 境界（PR マージ）の実施（G32、case-close へ委譲）
- スコープ拡大（G14）、intake 候選の `.agentdev/intake/inbox/` 直接変更（G15）、learning 候選と intake 候選の混在（G16, G17）、`.agentdev/learning/inbox.md` 直接変更（G21）、SPEC確定候選と Findings の混在（G27）

## 検証観点

- Step 5-2 precondition gate: worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`）。検証失敗時は 実行担当サブエージェント起動禁止
- 実行担当サブエージェント result 4状態（completed-pr / blocked / failed / delegation-unavailable）の取り扱い正確性（G23）
- PR URL 受領の確実性（REQ-0130-021 廃止に伴い PR URL フォールバック検索不使用）
- Epic Wave 実行時の1 Wave のみ処理、べき等性（同コマンド再実行で次 Wave に進む）
- 出力制約: PR 本文、commit message は verbatim で返す（成果物本文）

## case-auto 並列委譲モデル（REQ-0114-087〜093）

case-run は同一 Wave 内子Issue 処理を最大5件まで並列委譲する（REQ-0130-026、REQ-0114-087）。
本機能は Epic Wave モデル（ADR-0128）で既に実装済み。
case-auto 並列委譲モデル拡張により、Standard flow 起因の独立 OU 自動 Epic 化（REQ-0114-088）でも本機能が適用される。
case-run 側の新規機能追加は不要で、入力としての Epic Issue が増えるのみ。

## L2 タイムスタンプ計測

case-run は実行担当サブエージェント委譲の起動直前、直後にタイムスタンプを記録し、実行担当サブエージェント実行時間および worktree 設定/クリーンアップ時間を result に含める（REQ-0151-009、REQ-0130-028）。

計測対象は以下のフェーズ前後とする。
各フェーズは command 定義（src/opencode/commands/agentdev/case-run.md）の L2 タイムスタンプ計測 Step（Step 5、Step 6、Step 8）と対応する。

- worktree 設定（設定開始、完了）
- 委譲（起動直前、直後）
- worktree クリーンアップ（開始、完了）

検証（test strategy 項目の test-fix ループ、QG-3）は委譲範囲内で実行担当サブエージェントが実行する責務分担（REQ-0130-029/030）であり、case-run 本体から独立した L2 計測ポイントではない。
検証時間は委譲の起動直前、直後のタイムスタンプに含まれる。

記録された L2 タイムスタンプは case-auto の工程別壁時計時間報告（REQ-0151-008）の入力として消費される。
L3（委譲先内部メトリクス）は対象外とする（REQ-0151-010）。

## See Also

- [case-open.md](case-open.md)（前段コマンド（Issue 作成））
- [case-close.md](case-close.md)（後続コマンド（PR マージ、Issue クローズ））
- [case-auto.md](case-auto.md)（自走モード）
- `agentdev-workflow-orchestration` skill（フェーズ判定、エラー処理）
- `agentdev-case-run-execution-adapter` skill（委譲統合、result 契約）
- `agentdev-git-worktree` skill（worktree 作成、precondition gate）
- `agentdev-workflow-lifecycle` skill（work_type 判定）
- `agentdev-req-analysis` skill（チェックボックス品質基準）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- REQ-0130（case-run / 実装パイプライン）
- REQ-0139（外部エージェント統合契約）
- ADR-0114（case-auto 最大自走モード）
- ADR-0128（case-run 外部実行委譲）
