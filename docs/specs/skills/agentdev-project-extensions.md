---
title: agentdev-project-extensions SPEC
status: accepted
created: 2026-07-04
updated: 2026-07-18
---

# agentdev-project-extensions SPEC

## 目的

実行時に自分に対応する project extension（`.agentdev/extensions/**`）を読み込み、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を解決する標準 skill である。配布 command/skill 本文をプロジェクト非依存に保ち、プロジェクト固有情報を実行時に与える仕組みの中核を担う。

## 適用対象

### USE FOR

- command/skill が自分に対応する extension を読み込む際の探索、読み取り契約
- extension 不在時、破損時の標準的な扱い
- context/rules/checks/acceptance_gates/must_not の5セクション読み取り
- extension が追加・拡張であり上書きでないことの扱い
- rules/checks から project-local skill 委譲対象の抽出

### DO NOT USE FOR

- extension schema の定義（基盤 SPEC `foundations/project-extensions.md` の責務）
- extension 構造の診断、検査（`/agentdev/inspect-extensions` command の責務）
- 配布 command/skill 本文の変更
- project-local skill の実装（各適用プロジェクトの責務）

## 提供する判断・操作

| 判断・操作 | 内容 |
|---|---|
| extension 探索 | command は `.agentdev/extensions/commands/<command>.yaml`、skill は `.agentdev/extensions/skills/<skill>.yaml` を対応 extension として特定する |
| 不在時の扱い | 対応 extension が存在しない場合は空 extension として扱い、標準動作で続行する |
| 破損時の扱い | 対応 extension が破損している場合はエラーを表示し、当該 extension を無視して標準動作で続行する |
| 5セクション読み取り | context, rules, checks, acceptance_gates, must_not を読み取る |
| 追加・拡張の扱い | extension の内容は配布 command/skill 本文の動作に追加され、既存動作を置き換えない |
| 委譲対象抽出 | rules/checks の `skill:` フィールドから project-local skill 委譲対象を抽出する |

## 参照する references

- なし（本 skill の動作契約は SKILL.md 本文に集約）

## 現在の動作

- extension は標準 command/skill の上書きではなく、追加・拡張のみ（G01）
- 自分に対応する extension（1件）のみを読み、他 command/skill の extension は読まない（G02）
- 破損 extension で処理全体を停止しない（G03）
- 委譲先 project-local skill の中身には関与しない（G04）
- rules/checks の初期契約では `action`, `required`, `fail_on` を採用しない。呼び出された skill は extension entry の `id`, `when`, `skill` および周辺文脈をもとに判断する
- 配布 command/skill 本文にプロジェクト固有文書の具体参照を持たせない（G05）。プロジェクト固有参照は extension 経由でのみ与える

## 対象外

- extension schema、配置、命名の定義（基盤 SPEC `foundations/project-extensions.md`）
- extension 構造の診断（`/agentdev/inspect-extensions`）
- project-local skill の実装（各適用プロジェクトの責務）
- extension 自体の作成、編集（プロジェクト側の責務）

## 検証観点

- SKILL.md が存在し、6つの責務（extension 探索、不在時空 extension 扱い、破損時エラー表示と無視、5セクション読み取り、上書きでないことの扱い、委譲対象抽出）が全て定義されていること
- 配布物参照境界（SKILL.md 本文にプロジェクト固有文書の具体ID、具体パス、固定URLを持たない）が遵守されていること

## See Also

- [foundations/project-extensions.md](../foundations/project-extensions.md)（project-extensions 機構の基盤 SPEC）
- [commands/inspect-extensions.md](../commands/inspect-extensions.md)（保守診断 command SPEC）
- REQ-0160（Project Extensions 機構と配布物参照境界）
- ADR-0135（Project Extensions Architecture）

