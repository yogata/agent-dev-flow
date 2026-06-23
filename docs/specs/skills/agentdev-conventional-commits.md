---
title: agentdev-conventional-commits SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-conventional-commits SPEC

## 目的

Conventional Commits v1.0.0 仕様に従ってコミットメッセージを生成する。

## 適用対象

- コミット作成、メッセージ記述、履歴整形
- req-save、spec-save、case-open、case-close、case-auto、intake-*、learning-promote、backlog-review、inspect-* の各コマンドでの commit 時

## 提供する判断、操作

- コミットメッセージ構造（`type(scope): subject`）
- type 一覧: feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert
- プロジェクト固有ルール（日本語記述、スコープ例: api/auth/ui/database/config/test）
- フッター参照形式（`Refs: #N`、`Closes: #N`）
- SemVer 対応表
- よくある誤り（大文字 type、ピリオド、英日混在）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- プロジェクト固有ルールとして日本語記述を採用
- SemVer 準拠（feat: MINOR、fix/docs/style/refactor/perf/test/build/ci/chore/revert: PATCH）
- フッター形式: `Refs: #N`（参照）、`Closes: #N`（クローズ）

## 対象外

- コミットメッセージ以外の git 操作（`agentdev-git-worktree` 担当）
- ブランチ命名規約
- changelog 生成

## 検証観点

- Conventional Commits v1.0.0 への適合
- 日本語表現の正確性（大文字 type、ピリオド、英日混在の回避）
- フッター形式の遵守

## See Also

- [agentdev-git-worktree.md](agentdev-git-worktree.md)
- [commands/req-save.md](../commands/req-save.md)
- [commands/spec-save.md](../commands/spec-save.md)
