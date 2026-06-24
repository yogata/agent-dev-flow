# AG-008 完全カタログ再生成は inspect-docs 別途実施が必要

## 観測内容

Issue #1118 の完了条件 AG-008 は「作業開始前に 7 ディレクトリで inspect-docs を再実行し、裏付けカタログ `compliance-catalog-*.md`（X 件）を再生成すること」を要求する。
本 PR #1122 は X-6 と X-2 テーブルセルという機械安全対象の部分是正に絞ったため、AG-008 の完全カタログ再生成は未対応である。
PR 本文では「本 PR では addressed パターンの裏付け（件数・ファイルパス・行番号）のみ提示。完全カタログ（7 ディレクトリ × X-1〜X-7）は `/agentdev/inspect-docs` の再実行で別途実施すべき」と明記されている。

## 影響

X-1〜X-7 全パターンの残存状況が未確定のため、AG-010（優先度順是正）の残作業計画への入力が揃わない。
`/agentdev/inspect-docs` は診断専用コマンド（REF-101）であり、本 PR の実装スコープ（機械是正）とは別コマンドである。

## 課題

7 ディレクトリで inspect-docs を再実行し、裏付けカタログを再生成する。

## 既存要件との関連

- Issue #1118（partial）、PR #1122（merged, squash bb13183）
- 完了条件: AG-008（完全カタログ再生成）、AG-010（優先度順是正の残作業計画）
- コマンド: `/agentdev/inspect-docs`（REF-101、診断専用）

## 対応方針の方向性

- `/agentdev/inspect-docs` を 7 ディレクトリ（docs/requirements, docs/adr, docs/specs, docs/guides, AGENTS.md, src/opencode/commands, src/opencode/skills）で再実行する
- 生成された `compliance-catalog-*.md` を `.agentdev/inspect/inbox/` に配置し、各 finding のファイルパス・行番号・件数の裏付けを取る
- X-1〜X-7 全パターンの残存状況を確定し、AG-010（優先度順是正）の残作業計画の入力とする
