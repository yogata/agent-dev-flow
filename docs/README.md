# Documentation Hub

## Requirements

現行要件の第一参照先は REQ-0101 から REQ-0126 までの 19 件（active REQ、REQ-0111, REQ-0115, REQ-0116, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は retired）である。retired REQ（REQ-0001〜REQ-0050, REQ-0111, REQ-0115, REQ-0116, REQ-0118, REQ-0120, REQ-0121, REQ-0122）は削除せず [requirements/retired/](requirements/retired/) に移動し、履歴参照に限定する。REQ-0103 と REQ-0108 は ADR-0105 に基づく source/projection 分離要件を含む。

| REQ | タイトル |
|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol |
| [REQ-0105](requirements/REQ-0105.md) | Intake / Learning / Backlog |
| [REQ-0106](requirements/REQ-0106.md) | Case実行・完了 |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality |
| [REQ-0108](requirements/REQ-0108.md) | docs-check / Validation / Tests |
| [REQ-0109](requirements/REQ-0109.md) | inspect-docs / REQ再構成運用 |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree 削除リトライ |
| [REQ-0112](requirements/REQ-0112.md) | ADRライフサイクル標準化・文書体系正規化・runtime独立性 |
| [REQ-0113](requirements/REQ-0113.md) | Skill References SPEC分離基準 |
| [REQ-0114](requirements/REQ-0114.md) | /agentdev/case-auto 最大自走モード |
| [REQ-0117](requirements/REQ-0117.md) | Git worktree junction 削除フォールバック手順 |
| [REQ-0119](requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界の再基準化 |
| [REQ-0123](requirements/REQ-0123.md) | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管 |
| [REQ-0124](requirements/REQ-0124.md) | docs-review/skill-review/diagnostics-* → inspect-* 完全直接移行 |
| [REQ-0125](requirements/REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 |
| [REQ-0126](requirements/REQ-0126.md) | inspect-promote / 検出finding分類・昇格 |

- [Requirements Index](requirements/README.md)
- [Migration Table](requirements/mapping-table.md)
- [Retired Requirements](requirements/retired/)

## Specifications

- [System Specification](specs/system.md)
- [Document Format Patterns](specs/patterns.md)
- [Design Principles](specs/design-principles.md)
- [Quality Specifications](specs/quality-specs.md)
- [Document Model](specs/document-model.md)
- [Artifact Contracts](specs/artifact-contracts.md)
- [Artifact Responsibility Table](specs/artifact-responsibilities.md)
- [Integrity Contracts](specs/integrity-contracts.md)
- [Integrity Rule Catalog](specs/integrity-rule-catalog.md)
- [Workflow Contracts](specs/workflow-contracts.md)
- [Runtime Package Boundary](specs/runtime-package-boundary.md)
- [Rule Ownership Matrix](specs/rule-ownership.md)
- [REQ Impact Map](specs/req-impact-map.md)

## ADR

- [ADR Index](adr/README.md)

## Guides

- [ガイド入口](guides/README.md)
- [クイックスタート](guides/quickstart.md)
- [コマンド選択](guides/command-selection.md)
- [要件定義 → Case実行フロー](guides/req-case-flow.md)
- [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md)
- [診断・メンテナンス](guides/diagnostics-and-maintenance.md)
- [成果物・状態モデル](guides/artifacts-and-state.md)
- [プロジェクトドキュメントと SPEC](guides/project-docs-and-specs.md)
- [Consumer Project 導入](guides/consumer-project-setup.md)
- [トラブルシューティング](guides/troubleshooting.md)
- [用語集](guides/glossary.md)

## DOC-MAP

- [DOC-MAP](DOC-MAP.md)
