---
title: case-run SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-24
---

# case-run SPEC

## 目的

単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。
worktree前提、委譲、結果処理を責務とする。
3フェーズ構成でべき等性、再開ポイントを提供する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない（REQ-011、v2:ADR-0128）。

## 委譲契約

case-run から実行担当サブエージェントへの委譲契約を以下に正規化する。

- **委譲先**: case-run は実行担当サブエージェントへ実装作業を委譲する。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-002-002）。
- **adapter skill**: AgentDevFlow 側の case-run 実行 adapter skill（`agentdev-case-run-execution-adapter`）を指定する。adapter skill は委譲契約、result 契約、worktree 隔離等の case-run 固有知識を提供する。adapter skill 経由で委譲を起動する。
- **委譲 prompt**: 実行 command を prompt 内に含めて委譲する。実行担当サブエージェントは prompt 内で指定された command を起動する。command の具体名は AGENTS.md および references/<harness>.md 参照。
- **実行主体分類**: 委譲 prompt 内で実行される command は skill ではなく command である。`load_skills` には command 名を指定せず、adapter skill 名を指定する。
- **test strategy 項目の test-fix ループ（REQ-006-029/030）**: Issue 本文のテスト戦略セクションに test strategy 項目（3要素構造: verification / pass_criteria / on_failure）が含まれる場合、委譲契約は各項目の検証、不合格時の処置（実装修正して再検証、または Findings 記録）、全項目処理までの反復を実行担当サブエージェントに要求する。詳細な責務は adapter skill（`agentdev-case-run-execution-adapter`）が定義する。

## 入力

- Issue番号またはURL（要件doc埋め込み済み）（単一 Issue 実行モード）
- Epic Issue番号またはURL（Epic Wave 実行モード（`case-run #epic`））
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## 副作用

- worktree 作成: `.worktrees/{N}-{type}/`（`agentdev-git-worktree`）
- git fetch: Epic Wave 実行時、PR merge 後再開時に worktree 作成前に `git fetch origin` を実行し origin/main 鮮度確認（REQ-006-023）
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

- Step 6: 実行担当サブエージェント起動（adapter protocol: `agentdev-case-run-execution-adapter`）（v2:ADR-0128, REQ-006-016/017）。委譲契約の詳細は前述「委譲契約」セクション参照。起動手段は AGENTS.md および references/<harness>.md 参照（REQ-002-002）
 - 委譲プロンプト: 実行 command を prompt 内で指定（command の具体名は AGENTS.md 参照）
 - 実行担当サブエージェント責務: 委譲 prompt 内で指定された command による目標分解、observable evidence 要求、品質ゲート（code review + QA review + gate review）、test strategy 項目の test-fix ループ（各項目ごとの検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復、REQ-006-030）
 - 委譲起動失敗、異常終了時の扱い: 即 `failed` とせず**実装完了、検証未完了**として扱う（REQ-006-025）。委譲起動不能の場合は `delegation-unavailable` として報告する（REQ-002-003/004）
 - case-run が直接行わない（実行担当サブエージェント責務）: work plan生成、実装実行、TDD、乖離検出（QG-3）、specs更新、関連ドキュメント整合性確認、ローカル検証、PR本文作成、PR作成、デプロイ検証
 - PR URL 受領: 実行担当サブエージェントが直接 PR 作成し PR URL を委譲 result として返却
 - Findings / Capture 候補: 実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録
 - SPEC確定候補: 実行担当サブエージェントが PR 本文の `## SPEC確定候補` セクションに記録（v2:ADR-0123 Decision #4, REQ-001-015）
- Step 7: 実行担当サブエージェント result 処理（`agentdev-case-run-execution-adapter` result 契約の4状態のいずれかを処理）
 - completed-pr: 実装完了、PR作成済み。PR番号を受け取りクリーンアップフェーズへ
 - blocked: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み
 - failed: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み
 - delegation-unavailable: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す（REQ-002-004）

### Epic Wave 実行モード

v2:ADR-0128 Decision #3 に基づく。
1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。
同一コマンド再実行で次 Wave に進む（べき等）。

1. Epic Issue 本文読込（子Issue一覧、Wave 構成、ステータス追跡テーブル（永続状態を SSoT とする、REQ-006））
2. 現在 ready な Wave の子Issue 特定（`ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させて選択）。前提Issue が blocked/failed の場合は `pending` のまま選択対象外
3. `git fetch origin` 実行（REQ-006-023）
4. 子Issue の worktree 作成（Step 5、Step 5-2 を各子Issue について実行
）
5. 各子Issue を実行担当サブエージェントに並列委譲する（adapter protocol: `agentdev-case-run-execution-adapter`）。
 委譲の起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-002-002）。
 最大5件同時起動
6. 全委譲完了待機
7. 結果収集（各子Issue の result（completed-pr / blocked / failed / delegation-unavailable）を収集）
8. return（収集結果を報告して return）。Wave 境界（PR マージ）は case-close の責務

### クリーンアップフェーズ（Step 8）

- Step 8: worktree クリーンアップ確認 + 完了報告
  - 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
  - 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness の責務であり、case-run は関与しない（REQ-002-002）

## QG-3 前置 staleness check 手順（新規セクション）

case-run は実装作業開始前に QG-3 本体とは独立した前置検査として staleness check を実行する（REQ-006-031〜034）。本検査は QG-3 deviation 分類（spec-bug 等）運用を変更せず、deviation 発生前の予防層として位置づける。

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

## docs/** 変更時の targeted docs guard（REQ-006-035）

case-run は PR 対象ファイルに docs/** 変更を含む場合、Step 6（実行担当サブエージェント起動）の委譲前に targeted docs guard を実行する（REQ-006-035）。本検査は QG-3 本体・QG-3 前置 staleness check とは独立した前置 docs 整合性検査であり、3つの検査は順序依存を持たず、それぞれの実施要否に影響しない（REQ-006-033 準拠）。

### 実行条件

- PR 対象ファイルに docs/** 変更を含む場合に実行する。docs/** 変更を含まない PR（コードのみ、SCRIPT のみ等）ではスキップする（REQ-006-007 の QG-3 限定原則を維持、docs全体grep ではなく変更ファイル限定の targeted 検査）

### 実行コマンド

```
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
  --workflow case-run --base-ref origin/main --json
```

変更ファイルは worktree 内の git diff から取得する（`--base-ref origin/main` または `--files <changed-paths>`）。case-run プロファイル固有の追加ルールとして full_docs_check_recommended 判定は持たない（case-close の責務）。

### 検出結果の記録と連携

- 検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` セクションに `### docs-integrity` 小見出しで記録する
- case-update へ連携し、Issue 本文の更新を委譲する（case-run 単独では Issue 本文を書き換えない、REQ-006-034 準拠）

## verification-only PR（実装差分なし、検証のみ）（v2:REQ-0158-002）

case-run は実行担当サブエージェント委譲の結果、実装差分0件・検証のみで完了する PR（**verification-only PR**）を生成する場合がある。本節は verification-only PR の判定条件、PR 本文の根拠欄記入規則、GitHub の空 PR 取り扱い、case-close への引継ぎ注意事项を定める。要件の SSoT は v2:REQ-0158-002。

PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。pr_desc.md への verify-only 根拠欄追加は workflow-templates SPEC の変更として位置付ける。

### 定義

verification-only PR は以下を全て満たす PR とする（v2:REQ-0158-002）。

- PR の変更ファイル数が0件（`gh pr view --json files` で `files: []`）
- Issue の受け入れ基準が検証のみで充足された（既存実装・既存文書が要件を満たしており、追加実装を要しなかった）
- 検証結果が PR 本文の verify-only 根拠欄に evidence として記録されている

実行担当サブエージェントは verification-only で完了した場合も `completed-pr` を返し、PR URL を委譲 result に含める（`blocked` / `failed` にはしない）。

### verify-only 根拠欄の記入規則

case-run は verify-only PR 作成時に pr_desc.md の verify-only 根拠欄へ、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。「実装内容」欄は空欄にせず、「実装差分なし」と理由を記録する。

### GitHub の空 PR 許容

GitHub は空 PR（変更ファイル0件）の squash merge を許可し、空 commit を生成する（commit 2b34f8b0 で実証）。case-run は空 PR の作成・マージを GitHub の挙動に依存して実行する。squash merge で生成された空 commit は履歴に残り、`gh pr merge --squash` の通常フローに従う。

### case-close 引継ぎ注意事项

verification-only PR は case-close Step 3-1 targeted docs guard で files_checked が空になるため、次の注意事项を case-close へ引き継ぐ。

- PR 本文の verify-only 根拠欄に「実装差分を含まない理由」「根拠成果物または commit」「検証対象」「検証結果」が記録されていること（[case-close.md](case-close.md)「verification-only PR の files_checked 空確認（v2:REQ-0158-002）」参照）
- case-close は files_checked 空を検出した場合、v2:REQ-0158-002 に基づき verification-only 判定ステップを経て PASS 処理する（false-clean 3層防御との相互作用は case-close SPEC 参照）
- case-run 側は PR 作成までを責務とし、verification-only 判定自体は case-close が行う（単一書き手: case-close、REQ-011 完了条件チェックボックス専任責務）

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（manager-orchestrator））
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（controlled_case_execution 委譲）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（intake / learning capture（PR 本文記録のみ））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave 実行モデル、子Issue 状態 enum）
- [quality-gates.md](../quality/quality-gates.md)（QG-3（実行担当サブエージェント責務））

### case-run が使用する検査ツール

case-run が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- check_changed_docs.ts（--workflow case-run）: PR 対象ファイルに docs/** 変更を含む場合、Step 6 委譲前に実行（[docs/** 変更時の targeted docs guard（REQ-006-035）](#docs-変更時の-targeted-docs-guardREQ-006-035) 参照）
- check_extensions.ts（IR-056）: `src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行
- test_strategy: Issue 完了条件検証（REQ-006-029/030）

case-run は check_integrity.ts（全体監査）を使用しない（case-run は worktree で実行、PR 単位の targeted 検査が責務。全体監査は /repo/docs-check の責務）。

※上記は全て肯定表現である（REQ-010-002, REQ-010-003 準拠）。

## execution contract 消費境界（新規セクション）

case-run は REQ-017 に定義される execution contract を消費境界として扱う。

### 契約消費原則

- case-run は Issue に確定済みの完了条件、test strategy、必須品質統制を実行契約として扱う
- 完了条件の不足、曖昧さ、矛盾、実現不能を検出した場合は自律補完せず blocked とする
- test strategy を新規設計せず、記録済み項目を実行する
- 必須品質統制の適用要否を再判断せず、記録済み test strategy を実行する
- work_type/scale/Issue structure を再分類して実行契約を変更しない

### runtime-only 判断の維持

次は case-run の安全検査として維持し、execution contract 確定へ移管しない。
- worktree 状態確認（REQ-006-023）
- QG-3 前置 staleness check（REQ-006-030）
- 実 diff 検査
- 実装結果、test 実行結果

### blocked 遷移と case-update 連携

次の場合、case-run は blocked とし、Issue 更新は case-update へ委譲する。
- 完了条件の不足、曖昧さ、矛盾、実現不能の検出
- scope-affecting impact candidate の発見（既存 scope 内を超える変更が必要）
- 関連 ADR への適合確認で新たな拘束 ADR の必要性が判明した場合
- 必須品質統制の追加変更が必要な場合
- Issue metadata、構造、実態の矛盾検出時

### 新旧 Issue 互換運用

case-run は Issue 本文の execution contract 必須セクション存在有無により新旧 Issue
を識別する（presence-based 判定）。
- 必須セクション存在: 新契約 Issue として扱い、上記契約消費原則を適用
- 必須セクション不存在: legacy Issue として扱い、新契約項目欠落のみを理由に
  一律 blocked にしない（AG-010、REQ-017-013）

### work_type/scale 確認の縮約

現状の準備フェーズ work_type 確認ステップは、再分類ではなく metadata 整合確認へ
縮約して維持する（AG-008、REQ-017-011）。

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
- 外部実行ハーネス中間成果物の内部構造依存処理、検証（G26、REQ-003-007）
- 外部実行手段中間成果物の永続成果物扱い（G29、REQ-003-007）
- worktree 未作成時、メインリポジトリでの 実行担当サブエージェント起動（G30、Step 5-2 precondition gate）
- 実行担当サブエージェントへメインリポジトリパスを渡すこと（G31、worktree root 相対パス指定）
- Epic Wave 実行モードで1 Wave を超える処理、Wave 境界（PR マージ）の実施（G32、case-close へ委譲）
- スコープ拡大（G14）、intake 候選の `.agentdev/intake/inbox/` 直接変更（G15）、learning 候選と intake 候選の混在（G16, G17）、`.agentdev/learning/inbox.md` 直接変更（G21）、SPEC確定候選と Findings の混在（G27）

## 検証観点

- Step 5-2 precondition gate: worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`）。検証失敗時は 実行担当サブエージェント起動禁止
- 実行担当サブエージェント result 4状態（completed-pr / blocked / failed / delegation-unavailable）の取り扱い正確性（G23）
- PR URL 受領の確実性（REQ-006-021 廃止に伴い PR URL フォールバック検索不使用）
- Epic Wave 実行時の1 Wave のみ処理、べき等性（同コマンド再実行で次 Wave に進む）
- 出力制約: PR 本文、commit message は verbatim で返す（成果物本文）

## case-auto 並列委譲モデル（REQ-006-087〜093）

case-run は同一 Wave 内子Issue 処理を最大5件まで並列委譲する（REQ-006-026、REQ-006-087）。
本機能は Epic Wave モデル（v2:ADR-0128）で既に実装済み。
case-auto 並列委譲モデル拡張により、Standard flow 起因の独立 OU 自動 Epic 化（REQ-006-088）でも本機能が適用される。
case-run 側の新規機能追加は不要で、入力としての Epic Issue が増えるのみ。

## L2 タイムスタンプ計測

case-run は実行担当サブエージェント委譲の起動直前、直後にタイムスタンプを記録し、実行担当サブエージェント実行時間および worktree 設定/クリーンアップ時間を result に含める（REQ-003-009、REQ-006-028）。

計測対象は以下のフェーズ前後とする。
各フェーズは command 定義（src/opencode/commands/agentdev/case-run.md）の L2 タイムスタンプ計測ポイントと対応する（Step 番号によらず、下記フェーズ前後で計測する）。

- worktree 設定（設定開始、完了）
- 委譲（起動直前、直後）
- worktree クリーンアップ（開始、完了）

検証（test strategy 項目の test-fix ループ、QG-3）は委譲範囲内で実行担当サブエージェントが実行する責務分担（REQ-006-029/030）であり、case-run 本体から独立した L2 計測ポイントではない。
検証時間は委譲の起動直前、直後のタイムスタンプに含まれる。

記録された L2 タイムスタンプは case-auto の工程別壁時計時間報告（REQ-003-008）の入力として消費される。
L3（委譲先内部メトリクス）は対象外とする（REQ-003-010）。

## Phase 0 commit スコープ設計運用

Phase 0（枝PR作成フェーズ）の commit スコープ設計運用を明示する。case-auto SPEC（`docs/specs/commands/case-auto.md`）の Phase 0 commit スコープ設計運用と整合する内容を維持する。

### 孫 Issue 間 SPEC スコープ交差時の扱い

- 孫 Issue 間で SPEC スコープが交差する場合、`on_failure` で SPEC 修正を許容するかどうかを case-auto SPEC と整合させる

### ドメイン state 更新と成果物変更の同一コミット混在

- ドメイン state 更新（`.agentdev/` 配下）と成果物変更（`docs/` 配下等）の同一コミット混在の扱いを case-auto SPEC と整合させる

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
- REQ-006（case-run / 実装パイプライン）
- REQ-003（外部エージェント統合契約）
- REQ-011（case-auto 最大自走モード）
- v2:ADR-0128（case-run 外部実行委譲）

## adversarial-review 挿入境界（経路G: adapter 委譲内）

本節は case-run における adversarial-review caller integration（REQ-015 経路G）の挿入境界を正典として所有する（REQ-014-011）。共通 caller integration 契約の正規所有者は adversarial-review SPEC であり（REQ-014-003）、本節は経路G 固有の挿入位置、発動条件、実装方針限定、blocked 遷移のみを所有する。adversarial-review 自身の振る舞い契約、再 review 条件、停止条件は adversarial-review SPEC を正とし、本節で再定義しない。実装方針形成、review 呼出、結果反映の内部手続きの正規所有者は `agentdev-case-run-execution-adapter` SPEC「adversarial-review 統合（実装方針→review→結果反映）」節とし、本節は参照する。

### 挿入境界と Step 構造（REQ-015-001）

経路G は他経路（A〜F）と異なり、review 挿入境界を case-run 本体の現行 Step 構造へ直接挿入しない。代わりに、Step 6（実行担当サブエージェント起動）における adapter 委譲の内部に review 挿入境界を設ける。発動条件判定と review 呼出の分離（REQ-015-001）は adapter 委譲内で達成され、case-run 本体は review 発動の有無を判定しない。本節は Step 6 委譲境界を経路G の正典として一意に特定し、`.opencode/commands/agentdev/case-run.md` の Step 6 が実行時投影先となる。

| 段階 | 対応 Step | 役割 |
|---|---|---|
| 委譲 | case-run Step 6（実行担当サブエージェント起動） | adapter skill 経由で委譲を起動し、委譲 prompt 内で実行 command を指定する。実装方針の生成、review、結果反映は委譲内へ委ねる |
| 発動条件判定 | adapter 委譲内（実装方針形成完了後、最初の実装変更前） | ユーザー明示指定の有無を実行担当サブエージェントが判定する |
| review 呼出 | adapter 委譲内（発動条件該当時、最初の実装変更前） | 実行担当サブエージェントが adversarial-review を起動し、実装方針を審議対象へ渡す |
| 結果反映 | adapter 委譲内（review 完了後、最初の実装変更前） | accepted finding を実装方針へ反映する。反映後、意味内容変更時は必要な既存検証を再実行する |
| result 返却 | case-run Step 7（実行担当サブエージェント result 処理） | result 契約（completed-pr / blocked / failed / delegation-unavailable）で case-run 本体へ返却 |

### case-run 本体は実装方針を生成・審査しない（REQ-015-010）

case-run 本体（Step 1〜8 の orchestration）は実装方針の生成、審査、review を行わない（REQ-015-010）。実装方針の形成、adversarial-review 呼出、結果反映は Step 6 委譲内で agentdev-case-run-execution-adapter の委譲契約に従い、最初の実装変更前に実施する。case-run 本体が実装方針を生成、保持、審査するステップを新設しない。委譲 result（4状態）のみで adapter 委譲内の結果を受領する。

### 実装方針限定（REQ-015-010）

adapter 委譲内で形成する実装方針は、既確定 Issue 本文、REQ、ADR、SPEC を実現する内部選択（関数配置、命名、データ構造の選択、実装の並び順等）に限定する（REQ-015-010）。実装方針は既確定文書へ矛盾しない内部選択の範囲内で review 審議対象となる。実装方針が既確定 Issue/REQ/ADR/SPEC の変更、追加、撤回を必要とする場合、実行担当サブエージェントは実装を開始せず blocked へ遷移する。

### blocked 遷移（REQ-015-010、REQ-015-011）

adapter 委譲内で次のいずれかに該当する場合、実行担当サブエージェントは result を `blocked` として case-run へ返却する（REQ-015-010、REQ-015-011）。

- 実装方針が既確定 Issue/REQ/ADR/SPEC の変更、追加、撤回を必要とする（REQ-015-010）
- 要件、仕様に問題（欠落、矛盾、曖昧さ、実現不可能な条件等）を検出した（REQ-015-011）
- adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残り、実装の最初の変更（不可逆処理）へ進めない（REQ-014-009）

blocked 詳細本文は Issue コメントに SSoT として記録され、case-run Step 7 で処理される。実行担当サブエージェントは要件、仕様問題を検出した場合、勝手に仕様変更、REQ 黙示変更、ADR 再解釈を行わず、必ず blocked 経路へ入る（REQ-015-011、G02）。

### 発動条件（REQ-015-002）

adversarial-review は任意助言手段であり、ユーザーが明示的に指定した場合にのみ発動する（REQ-014-001、REQ-015-002）。発動条件判定は adapter 委譲内で実行担当サブエージェントが行う。明示指定がない場合、adapter 委譲は review 呼出を経由せず、実装方針形成から実装、検証、PR 作成の従来フローへ進む。case-run 本体は発動条件の有無を判定、伝達しない。

### 従来フロー維持（REQ-015-003）

発動条件非該当時（ユーザー明示指定なし）、呼出失敗時（REQ-014-010）のいずれの場合も、case-run の従来フロー（Step 1〜8）を維持する（REQ-015-003）。review 挿入境界は case-run 本体の既存 Step を追加、削除、並べ替えせず、Step 6 委譲内での発動条件判定と review 呼出 Step の分離のみを追加する。委譲 result が `completed-pr` の場合、従来どおり Step 7 で PR 番号を受領し Step 8 クリーンアップフェーズへ進む。

### 戻り先と反映責務

accepted finding の実装方針への反映は adapter 委譲内の実行担当サブエージェント責務である（REQ-014-006）。adversarial-review は finding を提示し、合意候補を形成するが、実装方針、実装ファイル、PR 本文への反映を自身では行わない。反映後に実装方針の意味内容が変更された場合、adapter 委譲内で必要な既存検証（REQ/ADR/SPEC 整合性再確認、targeted docs guard、QG-3 等）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ adapter 委譲内で再 review を発動できる（REQ-014-007）。unresolved な本質的争点またはユーザー判断事項が残る場合、実装の最初の変更（不可逆処理）へ進まず blocked へ遷移する（REQ-014-009、前述「blocked 遷移」節）。

### 正規所有者マトリックス参照

本節と adversarial-review SPEC「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts SPEC「adversarial-review との委譲契約接続」節、`agentdev-case-run-execution-adapter` SPEC「adversarial-review 統合（実装方針→review→結果反映）」節との間で意味の重複、矛盾を生じない。case-run command 固有の挿入境界（委譲内実施、Step 6 投影、実装方針限定、blocked 遷移）のみを本節が所有し、実装方針形成、review 呼出、結果反映の内部手続きの詳細は `agentdev-case-run-execution-adapter` SPEC を正とする。

