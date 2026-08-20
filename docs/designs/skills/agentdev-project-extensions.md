---
title: agentdev-project-extensions Design
status: accepted
created: 2026-07-04
updated: 2026-07-27
---

# agentdev-project-extensions Design

## 目的

実行時に自分に対応する project extension（`.agentdev/extensions/**`）を読み込み、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を解決する標準 skill である。
配布 command/skill 本文をプロジェクト非依存に保ち、プロジェクト固有情報を実行時に与える仕組みの中核を担う。

## 適用対象

### USE FOR

- command/skill が自分に対応する extension を読み込む際の探索、読み取り契約
- extension 不在時、破損時、旧 kind・未知 kind 検出時の標準的な扱い
- context/rules/checks/acceptance_gates/must_not の5セクション読み取り
- extension が追加・拡張であり上書きでないことの扱い
- rules/checks から project-local skill 委譲対象の抽出

### DO NOT USE FOR

- extension schema の定義（基盤 Design `foundations/project-extensions.md` の責務）
- extension 構造の診断、検査（`/repo/docs-check`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote` の3層責務、DEC-006）
- 配布 command/skill 本文の変更
- project-local skill の実装（各適用プロジェクトの責務）

## 提供する判断・操作

| 判断・操作 | 内容 |
|---|---|
| extension 探索 | Workflow Skill は `.agentdev/extensions/skills/<workflow-skill-name>.yaml`（workflow-extension）と必要に応じて `.agentdev/extensions/skills/<workflow-skill-name>/internal.yaml`（internal-workflow-extension）、Capability Skill は `.agentdev/extensions/skills/<capability-skill-name>.yaml`（capability-skill-extension）を対応 extension として特定する |
| 不在時の扱い | 対応 extension が存在しない場合は空 extension として扱い、標準動作で続行する |
| 破損時の扱い | 対応 extension が破損している場合（YAML 構文エラー、必須 field 欠落等）はエラーを表示し、当該 extension を無視して標準動作で続行する（fail-open） |
| 旧 kind 検出時の扱い | `kind: command-extension` / `kind: skill-extension` を検出した場合は migration-required として停止する（silent ignore しない） |
| 未知 kind 検出時の扱い | 構文上有効だが `kind` が公式3値以外の場合は schema violation として停止する（fail-open しない） |
| 5セクション読み取り | context, rules, checks, acceptance_gates, must_not を読み取る |
| 追加・拡張の扱い | extension の内容は配布 command/skill 本文の動作に追加され、既存動作を置き換えない |
| 委譲対象抽出 | rules/checks の `skill:` フィールドから project-local skill 委譲対象を抽出する |

## 参照する references

- なし（本 skill の動作契約は SKILL.md 本文に集約）

## 現在の動作

- extension は標準 command/skill の上書きではなく、追加・拡張のみ（G01）
- 自分に対応する extension（1件）のみを読み、他 command/skill の extension は読まない（G02）
- 破損 extension（malformed）で処理全体を停止しない。旧 kind は migration-required、未知 kind は schema violation として停止する（G03）
- 委譲先 project-local skill の中身には関与しない（G04）
- rules/checks の初期契約では `action`, `required`, `fail_on` を採用しない。呼び出された skill は extension entry の `id`, `when`, `skill` および周辺文脈をもとに判断する
- 配布 command/skill 本文にプロジェクト固有文書の具体参照を持たせない（G05）。プロジェクト固有参照は extension 経由でのみ与える

## 対象外

- extension schema、配置、命名の定義（基盤 Design `foundations/project-extensions.md`）
- extension 構造の診断（`/repo/docs-check`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote` の3層、DEC-006）
- project-local skill の実装（各適用プロジェクトの責務）
- extension 自体の作成、編集（プロジェクト側の責務）

## 検証観点

- SKILL.md が存在し、7つの責務（extension 探索、不在時空 extension 扱い、破損時エラー表示と無視、旧 kind・未知 kind 検出時の停止、5セクション読み取り、上書きでないことの扱い、委譲対象抽出）が全て定義されていること
- 配布物参照境界（SKILL.md 本文にプロジェクト固有文書の具体ID、具体パス、固定URLを持たない）が遵守されていること

## See Also

- [foundations/project-extensions.md](../foundations/project-extensions.md)（project-extensions 機構の基盤 Design）
- [foundations/system.md](../foundations/system.md)（システム仕様、公開 command 一覧）
- REQ-002（Project Extensions 機構と配布物参照境界）
- DEC-006（inspect 3-command 構成への正規化）

