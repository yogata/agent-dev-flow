# worktree 環境で docs/specs/ 配下パス再編成に伴う broken-file-link/specs-existence NG 4件

## 観察

PR #1297（Issue #1291「REQ-0144 docs-check安定NG解決」）の検証過程で、worktree 環境（.worktrees/1291-chore）で docs-check を実行した際、docs/specs/ 配下のパス再編成（subdirectory 化）に伴う broken-file-link/specs-existence NG 4件が検出された。メインリポジトリでは発生しない worktree 固有の問題であり、F-1/F-2（本 Issue 対象）とは無関係。

## 修正されなかった理由

本 Issue（#1291）は F-1（req-range陳腐化）・F-2（command-capture-duty keyword 不在）の解消が対象。worktree 固有の NG 4件は pre-existing issue であり、本 Issue の完了条件（F-1/F-2 解消）の対象外。

## 課題

- worktree 環境で docs/specs/ 配下のパス再編成（subdirectory 化）が正しく伝播しない原因究明
- worktree で docs-check 実行時の false positive ノイズ低減（AGENTS.md のジャンクション制約と関連）
- メインリポジトリと worktree での docs-check 結果差異の是正

## 根拠

PR #1297 本文（Findings / Capture候補）より引用:

> worktree 環境で docs/specs/ 配下のパス再編成（subdirectory 化）に伴う broken-file-link/specs-existence NG 4件が検出される。メインリポジトリでは発生しない worktree 固有の問題。本 Issue の対象外だが、worktree での checks 実行時のノイズとして記録する。

## 観測元

- PR #1297
- Issue #1291
- Epic #1288（OU-005, Wave 1）
