---
title: inspect-skills SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-15
---

# inspect-skills SPEC

## 目的

Command→Skill 参照妥当性と Skill 構造を、検査対象を直接修正せずに診断するコマンド。
検出事項を `.agentdev/inspect/inbox/` へ出力する。

## 承認・HITL 境界

- 承認点を持たない（診断と検出事項出力のみ。採用、分類の判断は `/agentdev/inspect-promote` が担う）。

## 入力

- Command 定義ファイル群（`src/opencode/commands/`、`.opencode/commands/`）
- Skill 定義ファイル群（`src/opencode/skills/`、`.opencode/skills/`）
- 必要に応じて関連する template / reference / script ファイル群

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`

## 副作用

- ファイル作成: `.agentdev/inspect/inbox/inspect-skills-finding-*.md` のみ（G01 例外）
- git commit/push: `.agentdev/inspect/` 配下のみ
- 実行前同期: `git pull --ff-only`
- 検査対象ファイルの変更: 禁止（G01）
- GitHub Issue/PR 作成、更新: 禁止（G02）
- worktree/ブランチ操作: 禁止（G04）
- RU/intake/learning/backlog 成果物保存: 禁止（G03）
- 自動修正: 禁止（G05、推奨 route 提示に留める）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-inspect-skills`）が正規情報源である（read-only-diagnostic 型、REQ-027-003 により STEP model 対象外）。

- 診断対象の読込（Command、Skill 群）
- 各診断観点の評価（`agentdev-inspect-skills`）:
 - Command 参照の妥当性診断
 - Skill 粒度の評価
 - Skill 構造のレビュー
 - USE FOR / DO NOT USE FOR 照合
 - Skill 分割候補検出
 - Command 固有手順の Skill 流入検出
- 分類（finding / classification / route）
- route 提示
- 検出事項出力（`.agentdev/inspect/inbox/inspect-skills-finding-*.md`）
- 実行前同期（`git pull --ff-only`）
- `.agentdev/inspect/` 変更の commit と push
- 完了報告

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/inspect-skills.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（工程構成、各診断観点の詳細手順、reference 構成）は Workflow Skill（`agentdev-workflow-inspect-skills`）が所有し、本 SPEC はこれらを複製しない。本 workflow は read-only-diagnostic 型であり、STEP model の対象外である（REQ-027-003）。resume point、export、import を持たず、工程一覧のラベルは順序ラベルである。中断時は先頭から再実行する。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## Artifact Graph 利用

inspect-skills は self-hosting augmentation が利用可能な場合、Artifact Graph を用いて command と skill 関係, command と extension と skill 関係, 予期しない delegation, orphan skill candidate の候補を探索できる。

Graph は候補提供者であり、委譲先 skill 実在の決定的検査は ADR-006 が定める通り docs-check, IR-056 が所有する。
inspect-skills は REQ-036-012〜016 が定める意味診断を担当し、Graph 構造候補を未検証 evidence として意味診断の入力に利用する。

consumer 環境に対応 node type または relation type が存在しない場合は異常とせず従来の診断経路を継続する。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル）

## 対象外

- 正規文書変更、REQ/Decision/SPEC 変更、Command/Skill/Template/Script 変更（G01）
- Issue 作成、PR 作成、RU 保存（G02, G03）
- branch、worktree 操作（G04）
- 自動修正（G05、推奨 route 提示に留める）

## 検証観点

- ファイル変更禁止（G01、`.agentdev/inspect/inbox/inspect-skills-finding-*.md` 生成は例外）
- GitHub Issue/PR 作成、更新禁止（G02）
- commit/push スコープ: `.agentdev/inspect/` 配下のみ（G04）
- 自動修正禁止（G05）

## 停止状態

- 実行前同期（`git pull --ff-only`）失敗時（エラーを報告して停止する。自動解消しない）。
- `.agentdev/inspect/` 変更の push 失敗時（停止して報告する）。
- 検査対象ファイルの読込失敗は停止条件としない（該当対象をスキップし警告を出力する）。

## See Also

- [inspect-docs.md](inspect-docs.md)（docs 全体の意味整合レビュー）
- [inspect-promote.md](inspect-promote.md)（検出事項分類、昇格）
- `agentdev-workflow-inspect-skills` skill（workflow 実装本体（工程構成、冪等性、終了条件））
- `agentdev-inspect-skills` skill（詳細手順、finding 形式、推奨 route）
- REQ-010（inspect-skills / Command/Skill 参照妥当性検出）

