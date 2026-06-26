---
title: backlog-review SPEC
status: draft
created: 2026-06-21
updated: 2026-06-22
---

# backlog-review SPEC

## 目的

採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する。
ユーザー承認は RU 作成承認を兼ねる。

## HITL 境界、自動実行ルール（REQ-0147-003/004/005/009）

- **HITL は「判断の確定」に限定**（REQ-0147-003）: Step 5 の統合、分割判定承認が主要な HITL 対象。
- **矛盾なしの場合の単一承認**（REQ-0147-009）: Step 5 で矛盾が検出されない場合、Step 5 の統合、分割判定承認を RU 生成承認（Step 6/7）としても扱い、単一承認で処理する。追加の HITL は不要。
- **矛盾検出時の追加判断**（REQ-0147-009）: Step 6 で矛盾が検出された場合のみ、ユーザーに追加判断を求める（矛盾する artifact を RU 化せず確認、矛盾しない artifact は通常通り RU 化）。
- **承認後の自動実行**（REQ-0147-004）: 承認確定後の RU 生成、採用済み成果物削除、commit/push は自動実行する。
- **破壊的変更の明示承認維持**（REQ-0147-005）: 矛盾解消、要件仕様スコープ変更、大量成果物削除等の破壊的操作は明示承認を維持する。

## 入力

- `.agentdev/intake/promoted/*.md`
- `.agentdev/learning/promoted/*.md`
- `.agentdev/inspect/promoted/*.md`
- 引数指定時: 指定ファイルのみ対象

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除

## 副作用

- git commit/push: `.agentdev/` 配下（明示パスステージング、REQ-0137-002/005）
- 実行前同期: `git pull --ff-only`
- REQ ファイル保存: 行わない（G01）
- GitHub Issue 作成: 行わない（G02）

## 現在の動作

- Step 1: 実行前同期（`git pull --ff-only`）
- Step 2: 成果物検出（引数有無切り替え（引数あり: 指定ファイルのみ / 引数なし: `promoted/` 全件））
- Step 3: 成果物読込、分析 + 暫定分類付与（`agentdev-backlog-integration` 参照）。暫定分類は `docs/specs/foundations/document-model.md` の文書7分類モデルを参照して付与し、RU frontmatter `tentative_classification` に記録する（REQ-0155-004）。`tentative_classification` の許容値、7値以外入力時・フィールド欠落時の取り扱いは REQ-0155-008、後述「tentative_classification フィールド仕様」に定める。暫定分類は後続 `/agentdev/req-define` で最終確定される候補であり、本コマンドが確定しない
- Step 4: 統合分割判定 + depends_on 依存解決 + ユーザー承認（判断の確定、REQ-0147-003）（`agentdev-backlog-integration` 参照）
- Step 5: 矛盾検出（矛盾検出時のみ追加判断を求める（REQ-0147-009））。矛盾なしの場合、Step 4 の統合、分割判定承認を RU 生成承認として扱い、単一承認で処理する。自動解決しない（G05）
- Step 6: RU 生成（採用済み成果物の単純コピー（パススルー）は禁止（G03、REQ-0105））
- Step 7: 成果成果物削除（RU 生成失敗成果物は削除しない（G06））
- Step 8: Git 永続化
- Step 9: 完了報告

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 境界）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（RU lifecycle、採用済み成果物 lifecycle）

## 対象外

- REQ ファイル保存（G01、req-save 責務）
- GitHub Issue 作成（G02、case-open 責務）
- 採用済み成果物の単純コピー（パススルー）（G03、REQ-0105）
- `.agentdev/intake/inbox/`, `.agentdev/intake/archive/`, `.agentdev/learning/inbox.md`, `.agentdev/learning/archive/active.md` の更新（G04）
- 矛盾検出時の自動解決（G05）
- RU 生成失敗成果物の削除（G06）
- depends_on への採用済み成果物パス指定（G07、RU-ID のみ許容）

## 検証観点

- depends_on に RU-ID のみ許容（G07）
- 統合分割判定ロジック: `agentdev-backlog-integration` 参照

## tentative_classification フィールド仕様

RU frontmatter の `tentative_classification` フィールドの仕様（REQ-0155-008）。

### 許容値

REQ-0155-003 が定義する文書7分類のいずれか1値。

| 値 | 分類 |
|---|---|
| `REQ` | 要件定義 |
| `挙動SPEC` | 挙動SPEC |
| `カタログSPEC` | カタログSPEC |
| `guide` | ガイド |
| `learning維持` | learning 維持 |
| `作業記録` | 作業記録 |
| `対象外` | 要件化対象外 |

### 7値以外の入力時の挙動

backlog-review が `tentative_classification` に7値以外の値を付与しようとした場合、RU 生成を停止し、訂正を求めること。7値以外の値で RU を生成しないこと。

### フィールド欠落時の挙動

backlog-review は全 RU frontmatter に `tentative_classification` を付与すること。フィールド欠落の RU は生成しないこと。

## See Also

- [intake-promote.md](intake-promote.md), [learning-promote.md](learning-promote.md), [inspect-promote.md](inspect-promote.md)（前段コマンド）
- [req-define.md](req-define.md)（後続コマンド（RU を入力として要件定義））
- `agentdev-backlog-integration` skill（分析基準、統合分割判定、depends_on 依存解決、矛盾検出、RU 生成ルール）
- REQ-0105（RU lifecycle）
- REQ-0129（Backlog-review）
