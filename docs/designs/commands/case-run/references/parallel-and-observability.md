---
title: case-auto 並列委譲モデル・L2 タイムスタンプ計測・Phase 0 commit スコープ設計運用
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# case-auto 並列委譲モデル・L2 タイムスタンプ計測・Phase 0 commit スコープ設計運用

## case-auto 並列委譲モデル（REQ-034-027、REQ-031-015）

case-run は与えられた単一 Issue を実行担当サブエージェントへ委譲1件で実行し（並列委譲なし）、同一 Wave 内子Issue の並列委譲制御は case-auto の orchestration stage 3 が単一所有する（REQ-031-015、REQ-034-027、DEC-041）。
本節の旧記述（case-run による最大 5 件並列委譲）は廃止され、並列起動の共有 active Issue task 枠の制御は case-auto Design「複数 execution_unit 並列 orchestration」節が所有する。
case-run は入力として与えられた単一 Issue を実行し、case-run 経由で case-auto の管理外の実行枠を生成できない（REQ-031-015）。

## L2 タイムスタンプ計測

case-run は実行担当サブエージェント委譲の起動直前、直後にタイムスタンプを記録し、実行担当サブエージェント実行時間および worktree 設定/クリーンアップ時間を result に含める（REQ-003-009、REQ-031-017）。

計測対象は以下のフェーズ前後とする。
各フェーズは Workflow Skill（`agentdev-workflow-case-run`）の L2 タイムスタンプ計測ポイントと対応する（内部手順番号によらず、下記フェーズ前後で計測する）。

- worktree 設定（設定開始、完了）
- 委譲（起動直前、直後）
- worktree クリーンアップ（開始、完了）

検証（test strategy 項目の test-fix ループ、QG-3）は委譲範囲内で実行担当サブエージェントが実行する責務分担（REQ-031-008/030）であり、case-run 本体から独立した L2 計測ポイントではない。
検証時間は委譲の起動直前、直後のタイムスタンプに含まれる。

記録された L2 タイムスタンプは case-auto の工程別壁時計時間報告（REQ-003-008）の入力として消費される。
L3（委譲先内部メトリクス）は対象外とする（REQ-003-010）。

## Phase 0 commit スコープ設計運用

Phase 0（枝PR作成フェーズ）の case-run 委譲内で実行担当サブエージェントが作成する commit に適用するスコープ設計運用を規定する。
Phase 0 全体の commit 構成（定義層で確定した REQ/Decision/Design のコミット、枝PR 作成）は case-auto Design（`docs/designs/commands/case-auto.md`）の同名節を正とし、本節は case-run 委譲内の commit スコープに焦点を当てる。
case-auto Design と整合する内容を維持する（OU-013b / OU-013a）。

### 孫 Issue 間 Design スコープ交差時の扱い

Phase 0 で複数孫 Issue（Epic Wave 内の子Issue、または並列 execution_unit 内の個別 Issue）の実装が同一 Design ファイルに触れる場合の扱いを以下で規定する。

**Design 本文修正の非許容**: 実行担当サブエージェントは test strategy が `on_failure: fix-and-reverify` を指示する場合でも、case-run 委譲内で Design 本文（`docs/designs/**`）を修正しない。
Phase 0 の Design 成果物は Definition 保存（case-ready / case-revise の Capability Skill 委譲）工程で確定済みであり、case-run 委譲内で再修正すると定義層の一貫性が損なわれる。
Design 修正が必要と判明した場合は `record-in-findings` で PR 本文の `## Design確定候補` セクションへ記録し、case-close の docs 検証における Design 確定チェックへ引き継ぐ（`agentdev-case-run-execution-adapter` SKILL の Design確定候補配置契約に従う）。

**target_area の重複判定と並列制御**:

- 同一 Design ファイルの異なる target_area を複数孫 Issue が編集する場合: git diff が競合しないため並列マージを許容する。並列判定軸は REQ-034-013 の連結成分ベースに従い、ファイル衝突（L2）は並列許容、PR マージコンフリクトは後続 PR の rebase で解決する
- 同一 Design ファイルの同一 target_area を複数孫 Issue が編集する場合: case-open 構成生成時に必須依存（depends_on）として連結させ、直列化する。Wave 構成で同一 Wave へ割り当てない

case-run は case-open が生成した Wave 構成と depends_on を前提として受け取り、委譲内で並列制御を新たに判定しない。

### ドメイン state 更新と成果物変更の同一コミット混在

case-run 委譲内で作成する commit の構成運用を規定する。
原則として **2分割運用** を採用し、実行担当サブエージェントはドメイン state 更新と成果物変更を同一コミットへ混在させない。

**対象ディレクトリ**:

- 成果物変更: `docs/`、`src/opencode/`、`src/common/tools/agentdev-gh/local/` 等、配布対象の永続状態
- ドメイン state 更新: `.agentdev/` 配下（intake、learning、drafts、cases 等のケース固有の一時状態）

**2分割運用の理由**:

- 永続性の違い: 成果物は配布対象の永続状態、ドメイン state はケース固有の一時状態。同一コミットに混在すると revert、cherry-pick の単位が曖昧になる
- レビュー単位の分離: 成果物変更は Design 品質査読の対象、ドメイン state はキャプチャ境界（intake/learning）の対象。査読観点が異なるため分離する
- capture 境界の遵守: `.agentdev/backlog/intake/`、`.agentdev/backlog/learning/` の直接編集は case-run 委譲内では禁止（委譲内の capture 対象外制約、`agentdev-case-run-execution-adapter` SKILL）。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` へ記録し、case-close が intake/learning pipeline へ引き継ぐ。よって case-run 委譲内でドメイン state をコミットへ含めることは原則として発生しない

**例外**: `.agentdev/drafts/` の削除（Definition 保存（case-ready / case-revise の内部責務）完了後のクリーンアップ）は、成果物変更とは独立したクリーンアップコミットとして扱う。
本運用が禁止する同一コミット混在には該当しない。
当該クリーンアップは Definition 保存（case-ready / case-revise の内部責務）工程の責務であり、Phase 0 の case-run 委譲内では発生しない。

**commit 分割手順**: 実行担当サブエージェントは成果物変更を先にコミットする。
ドメイン state に触れる必要がある場合は別コミットへ分離するが、前述の通り case-run 委譲内では原則として `.agentdev/` 配下を編集せず、PR 本文経由で case-close へ引き継ぐ。
