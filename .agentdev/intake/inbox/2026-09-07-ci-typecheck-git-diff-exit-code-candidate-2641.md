---
id: intake-20260907-ci-typecheck-git-diff-exit-code-candidate-2641
title: CI typecheck job での git diff --exit-code 検証の導入検討（tsconfig メタデータ書き戻しの機械検出）
created: 2026-09-07
status: inbox
---

## 概要
- PR: #2650（Issue #2641・Epic #2633 Wave 1・OU-008 commit 前 tsconfig 自動書き換え検出チェック）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

typecheck 実行後の作業ツリー汚染（tsconfig メタデータ書き戻し等）を CI で機械検出する案。Issue #2641 の提案に従い、配布物側手順（`agentdev-case-run-execution-adapter` SKILL.md のコミット前検証チェック）では検討候補として記録した。実施する場合は本プロジェクト（agent-dev-flow）側 CI ワークフローへの追加が対象になる。

## 変更候補

- 本リポジトリの CI typecheck job に `git diff --exit-code` 検証を追加するか検討する（typecheck 実行後に tsconfig*.json の意図しない差分を機械検出）
- 導入時は incremental / project references 構成での正規のメタデータ書き戻しと誤検出の区分（意図した変更は事前 commit 済みである前提の運用）を確認する
- 配布物側手順（case-run コミット前検証ステップ）と本プロジェクト側 CI の役割分担を明記する（OU-008 の「別個維持」区分を踏襲）

## 関連
- Issue #2641（クローズ済み。OU-008）
- PR #2650（merge commit cfbe7864）
- `agentdev-case-run-execution-adapter/SKILL.md` 責務3（tsconfig 自動書き換え検出チェック反映先）
- Issue #2641 対応記録コメント（case-close・2026-09-07・Epic #2633）
