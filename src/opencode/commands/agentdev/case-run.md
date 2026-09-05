---
description: 単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。worktree前提、委譲、結果処理を責務とする。3フェーズ構成でべき等性、再開ポイントを提供
---

# 実装パイプライン

Case に対して実装実行を実行担当サブエージェント経由で委譲し、その result を処理する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない。
常に git worktree を使用する。

**スコープ**: case-run は単一 Issue または単一 Wave を処理する。
Epic 全体（複数 Wave）の処理、Wave 境界（PR マージ）は case-close の責務であり、case-run は扱わない。
1 Wave の実行（PR 作成まで）で return する。
複数 Issue の一括実行、Wave 順序制御にまたがるオーケストレーションは case-auto の責務である（workflow-contracts Design SC-{NNN}、extension 経由で解決）。

## 入力

- Issue番号またはURL（要件doc埋め込み済み。単一 Issue 実行モード）
- Epic Issue番号またはURL（Epic Wave 実行モード、`case-run #epic`）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-run` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。
配布物変更を含む PR 作成時の配布依存境界 最終 gate の適用条件と停止契約も同スキルが所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 本コマンドは orchestration に専念し、実装実行は実行担当サブエージェント経由で委譲する（work plan 生成・実装・乖離検出・specs 更新・PR 作成は委譲先の責務。adapter protocol は `agentdev-case-run-execution-adapter` 参照）
- worktree の作成元と PR の base は main を参照する。同期基準・鮮度確認・Epic 後続 Wave の作業起点も main を参照する
- 処理単位は単一 Issue または単一 Wave（Epic 指定時: 現在 ready な Wave の子Issue を並列実行、最大5件）とする。Epic 全体（複数 Wave）の一括実行と Wave 境界（PR マージ）は case-close の責務であり、Epic Wave 実行モードでは1 Wave のみ実行して PR 作成で return する
- Issue番号の省略は同一セッション内で作成済みの場合に限り、番号解決はユーザー入力またはセッション内会話から行う。work_type 判定基準は `agentdev-workflow-lifecycle` を参照する
- result の4状態（completed-pr/blocked/failed/delegation-unavailable）は `agentdev-case-run-execution-adapter` の result 契約に従う。成功成果は PR 作成である。SSoT は状態別に PR 本文（成功）と Issue コメント（blocked/ failed）とし、一時会話コンテキスト・中間ファイルを SSoT としない
- 外部実行ハーネスの plan artifact 等の中間成果物は AgentDevFlow の永続成果物から除外し、最終結果は PR URL で受領する（内部構造に依存した処理・検証は行わない。委譲契約は I/O 境界 Design 参照）
- Issue 本文の Execution Contract セクションに投影された実現面の変更方針（realization_actions 由来）は既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、その範囲内の内部実装方針（関数配置、命名、データ構造、実装順序、具体的 diff）だけを決定する。実現責務の変更が必要と判断した場合は既存の blocked 境界に従う（req_draft を再読込せず Issue 本文だけで変更責務、変更意図、検証方針を取得する。REQ-017-016、REQ-017-017）
- 実装作業開始前に QG 前置 staleness check（ファイルパス現行存在確認、検査結果件数再計測）を実行する。差異検出時は検出結果を委譲プロンプトで実行担当サブエージェントに引き渡し、PR 本文の `## Findings / Capture候補` に `### stale-reference` 小見出しで記録する（実行担当サブエージェント責務）
- 本筋外の発見は PR 本文に記録して修正は後続処理に委ねる（スコープ拡大は行わない）。intake 候補・learning 候補は区別して記録する（capture 境界（capture-boundaries）は `agentdev-workflow-orchestration` 参照、case-run の capture 責務は記録のみ）
- Design確定候補（実装で発見された Design レベル詳細）は PR 本文の `## Design確定候補` セクションに記録し、`## Findings / Capture候補` とは区別する（確定・反映判断は case-close の責務）

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- 実装で判明した制約により REQ を黙って変更しない。乖離として報告し、ユーザー承認後に反映する
- 全ファイル操作は worktree 内で実行する（メインリポジトリでのファイル操作は禁止）（`POL-worktree-isolation`）
- `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md` への直接変更は行わない（capture 情報は PR 本文経由のみ case-close に引き継ぐ）
- 完了条件チェックボックスの評価・更新は case-close QG-4 の責務であり、case-run と実行担当サブエージェントは完了条件チェックボックスを更新しない（`POL-completion-checkbox-single-writer`）
- 実行担当サブエージェント委譲の前に worktree+ブランチが作成済みであることを前置の precondition gate で検証する。未作成時・メインリポジトリにいる場合は実行担当サブエージェントを起動しない。委譲では worktree root（相対パス、`.worktrees/{N}-{type}/`）を引き渡し、メインリポジトリパスは引き渡さない
- Issue 本文の書き換えは case-update が所有する（case-run が単独で Issue 本文を書き換えない。staleness 差異は case-update へ連携する）
