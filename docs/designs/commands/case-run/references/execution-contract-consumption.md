---
title: execution contract 消費境界
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# execution contract 消費境界

## execution contract 消費境界

case-run は REQ-017 に定義される実行契約（対象範囲、実現方針、完了条件）を消費境界として扱う。

### 契約消費原則

- case-run は Issue に確定済みの対象範囲、実現方針、完了条件（検証方法・合格条件を含む）を実行契約として扱う
- 完了条件の不足、曖昧さ、矛盾、実現不能を検出した場合は自律補完せず blocked とする
- 完了条件の検証方法を新規設計せず、記録済み項目を実行する
- 必須品質検証の適用要否を再判断せず、完了条件へ統合済みの検証を実行する

### runtime-only 判断の維持

次は case-run の安全検査として維持し、実行契約確定へ移管しない。
- worktree 状態確認（REQ-031-002）
- QG-3 前置 staleness check（REQ-031-009）
- 実 diff 検査
- 実装結果、test 実行結果

### blocked 遷移と Issue 更新の取扱い

次の場合、case-run は blocked とし、blocker 詳細を Issue コメントへ SSoT として記録する（Issue 本文更新は case-ready / case-revise の責務、再開は Root Case 指定による正規再開経路に従う）。
- 完了条件の不足、曖昧さ、矛盾、実現不能の検出
- scope-affecting impact candidate の発見（既存 scope 内を超える変更が必要）
- 関連 Decision への適合確認で新たな拘束 Decision の必要性が判明した場合
- 完了条件の検証に必要な品質検査の追加変更が必要な場合
- Issue metadata、構造、実態の矛盾検出時
- 本質的な指摘事項の一般化した修正範囲が Issue の対象範囲、完了条件、受け入れ条件、REQ、Decision、Design、必須品質条件の変更を必要とする場合（REQ-031-019）

### 完了条件チェックボックスの非更新

case-run および実行担当サブエージェントは検証結果と証拠を報告し、完了条件チェックボックスを更新しない。達成済み項目の確定（`[ ]` → `[x]`）は case-close だけが条件と証拠を照合して行う（REQ-032-001）。

### 結果状態遷移と検証証拠

結果状態は result 契約の既存4状態（completed-pr / blocked / failed / delegation-unavailable）を維持したまま、本質的な指摘事項の扱いを次のように適用する。

- 本質的な指摘事項が未解消の場合、Findings 等への記録だけを理由として completed-pr にしない。Issue の対象範囲内で修正可能な場合は修正および欠陥類型単位の検証が成功した後にのみ completed-pr を許可する（REQ-031-022）。
- Issue / REQ / Decision / Design / 完了条件の品質検査の変更が必要な場合は blocked とする（REQ-031-019）。
- 利用可能な情報を十分に調査しても安全な修正範囲を正当化できる根本原因または欠陥類型を確立できない場合は、局所的な推測修正によって completed-pr へ進まず failed とする（REQ-031-023）。
- 本質的な指摘事項を欠陥類型単位で修正して completed-pr とする場合、対象となった本質的な指摘事項、特定した根本原因または欠陥類型、採用した修正範囲、実施した欠陥類型単位の検証、検証結果の5点を、既存の PR 本文または品質ゲート完了報告から確認できるようにする。新しい正規成果物種別を追加しない（REQ-007-005）。

修正単位の整理、検証対象選定、同一根本原因の再分類を含む欠陥類型単位の修正・検証契約の詳細は `agentdev-case-run-execution-adapter` Design「欠陥類型を修正単位とする契約」節を正とする。
