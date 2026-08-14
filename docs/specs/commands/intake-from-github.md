---
title: intake-from-github SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-15
---

# intake-from-github SPEC

## 目的

クローズ済み GitHub Issue/PR から未回収の変更候補を抽出し、intake item として保存する。
保存専用コマンド。

## 承認・HITL 境界

- 承認点を持たない（抽出と保存のみ。採用可否の判断は `/agentdev/intake-promote` が担う）。

## 入力

- ユーザーの自然言語による期間指定（「直近1週間」「今月」等）
- または特定の Issue/PR 番号指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md`（intake item）
- 抽出サマリーレポート

## 副作用

- git commit/push: `.agentdev/intake/` 配下のみ（commit message: `chore: capture intake items from github`）
- 実行前同期: `git pull --ff-only`
- GitHub API 読み取り: gh CLI のみ使用（G09、GitHub API 直接呼出禁止）
- GitHub Issue 作成: 行わない（G01）
- Issue/PR コメント投稿、マーカー付与: 行わない（G04）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-intake-from-github`）が正規情報源である（capture-only 型、REQ-027-003 により STEP model 対象外）。

- 期間解釈（`agentdev-intake-pipeline`）
- データ取得（`agentdev-intake-pipeline`）（クローズ済み Issue/PR のみ対象（G10））
- 構造的検出（`agentdev-intake-pipeline`）
- LLM 全文解析（`agentdev-intake-pipeline`）
- intake item 生成（`agentdev-intake-pipeline`）
- 実行前同期（`git pull --ff-only`）
- 保存（`.agentdev/intake/inbox/`（同名時連番））
- commit/push（`.agentdev/intake/` 配下変更のみ）
- サマリーレポート提示
- 完了報告

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/intake-from-github.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（抽出アルゴリズムの実行手順、工程構成、reference 構成）は Workflow Skill（`agentdev-workflow-intake-from-github`）が所有し、本 SPEC はこれらを複製しない。本 workflow は capture-only 型であり、STEP model の対象外である（REQ-027-003）。resume point、export、import を持たず、工程は逐次実行、中断時は先頭から再実行する。
- Workflow Skill の単独起動防止（soft guard）は Workflow Skill description の DO NOT USE FOR トリガーにより実効する（command 定義本文に soft guard 宣言節を持たない構成である）。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 境界）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（backlog draft プロトコル）

## 対象外

- GitHub Issue 作成（G01）
- 採用可否判断（G02）
- review、整形、分類判断（G03）
- Issue/PR コメント投稿、マーカー付与（G04）
- frontmatter、状態値、重複排除キーの必須化（G06）
- workflow 管理成果物の扱い（G05）
- 特定セクションの必須扱い（G07）
- GitHub API 直接呼出（G09、gh CLI のみ使用）
- オープン状態の Issue/PR の対象化（G10、クローズ済みのみ）
- `.agentdev/intake/inbox/` 以外への保存（G12）

## 検証観点

- 出力制約（G13）: 成果物本文 verbatim、判定結果、調査過程は圧縮
- 抽出ロジック精度: `agentdev-intake-pipeline` 参照

## 停止状態

- 実行前同期（`git pull --ff-only`）失敗時、GitHub データ取得失敗時（エラーを報告して停止する。自動解消しない）。
- 保存先の書き込み失敗時（commit/push を実行せず、エラーを報告して停止する）。

## See Also

- [intake-capture.md](intake-capture.md)（手動 capture）
- [intake-promote.md](intake-promote.md)（後続コマンド（採用判断））
- `agentdev-workflow-intake-from-github` skill（workflow 実装本体）
- `agentdev-intake-pipeline` skill（抽出アルゴリズム）
- REQ-010（Intake command群）

