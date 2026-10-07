# worktree 環境の textlint-guard vendor 未生成を case-close 最終検査または CI で前置確認する

## 内容

worktree では `.gitignore` 対象の node_modules・vendor が未伝播のため、`src/opencode/plugins/agentdev-textlint-guard` の依存実体（vendor/）が未生成であり、worktree 内で plugin tests（bun test repo root 全体実行時の 73 件等）が環境要因 fail する。Case 3533（Wave 2-1）の PR 本文 Findings で case-run が環境整備（plugin README「依存と配布」節の手順）の case-close 側最終検査または CI での確認を推奨していた。

- 本 Case の case-close では、textlint final gate を main root の plugin 実体から `--root worktree` 指定で実行し vendor 依存を回避して両側実測を成立させた（hard 40 件の main との集合完全一致を確認）
- bun test 分割③ を main root で実行した結果、.opencode/plugins 経由で textlint-guard plugin tests が vendor ありの正規環境で pass することを確認（654 tests / 1 fail〔既知欠陥のみ〕）

## 影響

worktree 内で plugin tests を実行する実行計画は常に環境要因 fail を含み、fail 由来分類の手間と見落としリスクが継続する。

## 提案

worktree で plugin tests を実行する前の前置として、vendor 存在確認と未生成時の main root 実行への切替（または package 単位 bun install + build:engine）を case-run/case-close の実行手順に明記する。CI で plugin tests を実行する構成も候補。

## 根拠

Epic #3530 Wave 2-1（Issue 3533）PR 本文「Findings / Capture候補」節の申告と case-close 実行での両側 textlint gate・分割③ main root 実行の実測。

https://github.com/yogata/agent-dev-flow/pull/3542
