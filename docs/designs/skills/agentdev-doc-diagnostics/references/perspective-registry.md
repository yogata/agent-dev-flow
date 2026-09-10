---
title: inspect-docs 診断観点レジストリ
status: draft
created: 2026-09-10
updated: 2026-09-10
---

# inspect-docs 診断観点レジストリ

`agentdev-doc-diagnostics` Design「観点レジストリ」節が schema と配置先の正とする、inspect-docs の診断観点の正規レジストリ実体である（REQ-036-024）。
本ファイルは観点エントリの正規の所有場所であり、レジストリの追加、変更は同節の schema に従う。
本ファイルは親 Design の `references/` 配下の詳細であり、`docs/designs/README.md` の Design 一覧表へは独立行として登録しない。

## 観点エントリ

各観点エントリは、観点ID（一意）、診断カテゴリ、適用文書種別、正規所有者 skill、詳細参照の項目を持つ。

| 観点ID | 診断カテゴリ | 適用文書種別 | 正規所有者 skill | 詳細参照 |
|---|---|---|---|---|
| design-status-drift | DRIFT | Design | `agentdev-doc-diagnostics` | `agentdev-doc-diagnostics` Design「Design 状態乖離 DRIFT 診断観点」節（判定基準の原本）、[diagnostic-categories.md](../../../../../src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md)「Design 状態乖離 DRIFT」節 |
| decision-status-drift | DRIFT | Decision | `agentdev-doc-diagnostics` | `agentdev-doc-diagnostics` Design「Decision 状態乖離 DRIFT 診断観点」節（判定基準の原本）、[diagnostic-categories.md](../../../../../src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md)「Decision 状態乖離 DRIFT」節 |

## 運用

- 移管対応表（integrity-rule-catalog.md の inspect-docs 移管記録）で名指しされた観点は本レジストリへ登録する
- 観点ID は本レジストリ内で一意とし、kebab-case で採番する
- エントリの追加、変更は `agentdev-doc-diagnostics` Design「観点レジストリ」節の schema に従い、本 Design が schema の正規所有者である
