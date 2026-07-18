---
title: `agentdev-backlog-integration` SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-18
---

# `agentdev-backlog-integration` SPEC

## 目的

backlog-review における採用済み成果物の統合、分割判定、矛盾検出、RU 生成、depends_on 依存解決の知識ベース。

## 適用対象

- 採用済み成果物（`.agentdev/intake/promoted/`、`.agentdev/learning/promoted/`、`.agentdev/inspect/promoted/`）の統合、分割判定
- 矛盾検出
- RU 生成ルール
- depends_on 依存解決

## 提供する判断、操作

- N:1 統合判定 / 1:N 分割判定
- 矛盾検出（矛盾する artifact を RU 化せずユーザーに確認、矛盾しない artifact は通常通り RU 化、partial success）
- RU 生成（frontmatter、構成、採番）
- depends_on 依存解決基準（RU-ID のみ許容、採用済み成果物パス指定不可）

## 参照する references

- `references/integration-judgment.md`

## 現在の動作

- `promoted/` 配下の artifact を読み込み、分析、統合、矛盾検出を経て RU を生成
- 採用済み成果物の単純コピー（パススルー）は禁止（REQ-0105）
- 矛盾検出時の自動解決は行わない（ユーザー確認）
- depends_on に RU-ID のみ許容

## 対象外

- intake 抽出、promote（`agentdev-intake-pipeline` 担当）
- REQ 構造診断（`agentdev-req-structure-diagnostics` 担当）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- 統合/分割ロジックの正確性（N:1 / 1:N）
- 矛盾検出の網羅性
- RU スキーマの適合性（frontmatter、構成、採番）
- depends_on に RU-ID のみが指定されているか

## See Also

- [agentdev-intake-pipeline.md](agentdev-intake-pipeline.md)
- [agentdev-learning-pipeline.md](agentdev-learning-pipeline.md)
- [commands/backlog-review.md](../commands/backlog-review.md)
- [../workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)
- REQ-0105（RU lifecycle）
- REQ-0129（Backlog-review）

