---
title: intake-from-github SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# intake-from-github SPEC

## 目的

クローズ済み GitHub Issue/PR から未回収の変更候補を抽出し、intake item として保存する。
保存専用コマンド。

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

- Step 1: 期間解釈（`agentdev-intake-pipeline`）
- Step 2: データ取得（`agentdev-intake-pipeline`）（クローズ済み Issue/PR のみ対象（G10））
- Step 3: 構造的検出（`agentdev-intake-pipeline`）
- Step 4: LLM 全文解析（`agentdev-intake-pipeline`）
- Step 5: intake item 生成（`agentdev-intake-pipeline`）
- Step 5-1: 実行前同期（`git pull --ff-only`）
- Step 6: 保存（`.agentdev/intake/inbox/`（同名時連番））
- Step 6-1: commit/push（`.agentdev/intake/` 配下変更のみ）
- Step 7: サマリーレポート提示
- Step 8: 完了報告

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

## See Also

- [intake-capture.md](intake-capture.md)（手動 capture）
- [intake-promote.md](intake-promote.md)（後続コマンド（採用判断））
- `agentdev-intake-pipeline` skill（抽出アルゴリズム）
- REQ-0127（Intake command群）
