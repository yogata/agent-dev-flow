# Specifications Index

SPEC files are canonical documents for the current architecture (REQ-0101).
They describe what the system *is* now, as opposed to REQ files that define required outcomes.

> **Repo-internal 設計文書**: SPEC files are repo-internal design documents for the agent-dev-flow repository. They are not runtime distribution targets and runtime commands do not depend on them (ADR-0103, ADR-0104).

## SPEC Files

| SPEC | タイトル | 責務 |
|------|---------|------|
| [system.md](system.md) | システム仕様 | コマンドシステムの構成定義・運用モデル |
| [patterns.md](patterns.md) | 文書フォーマット規約 | frontmatter規約、REQ/SPEC/guidesの記述形式、テンプレート命名規則、リポジトリ参照リンク規約 |
| [design-principles.md](design-principles.md) | 設計原則 | アーキテクチャ設計原則 |
| [quality-specs.md](quality-specs.md) | 品質仕様 | 品質基準・検証ルール |
| [quality-gates.md](quality-gates.md) | 品質ゲート | QG-1〜QG-4 定義・機械化境界・実装マッピング |
| [document-model.md](document-model.md) | 文書モデル | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス |
| [writing-style.md](writing-style.md) | 文書執筆スタイルガイドライン | 日本語執筆の判断指針・REQ-0101-061 詳細参照先 |
| [artifact-contracts.md](artifact-contracts.md) | アーティファクト契約 | Command/Skill/Template/Script の入出力・依存方向 |
| [artifact-responsibilities.md](artifact-responsibilities.md) | 成果物責任表 | 各 artifact 種別の canonical owner と責務（REQ-0103-057） |
| [integrity-contracts.md](integrity-contracts.md) | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
| [integrity-rule-catalog.md](integrity-rule-catalog.md) | Integrity Rule Catalog | integrity 検査の全 rule 定義（REQ-0108-150, 151） |
| [workflow-contracts.md](workflow-contracts.md) | ワークフロー契約 | コマンドパイプラインの入出力・前提条件 |
| [runtime-package-boundary.md](runtime-package-boundary.md) | Runtime Package 境界 | Repo type 別 `.opencode/` 定義・命名規約・導入方式・sync 範囲 |
| [rule-ownership.md](rule-ownership.md) | Rule 所有権マトリックス | rule domain と責任 REQ/SPEC の対応（REQ-0103-058） |
| [req-impact-map.md](req-impact-map.md) | REQ 影響マップ | 各 active REQ が影響する integrity rule と artifact（REQ-0108-152） |
| [req-health-metrics.md](req-health-metrics.md) | REQ 健全性メトリクス | REQ 肥大化・関心ズレ検出の定量閾値（要件行数・関心分類数・artifact種別数）（REQ-0136-040） |

## Document Relationships (REQ-0101)

```
REQ (requirements/REQ-*.md)    -- 要件定義（required outcomes）
  |
  v
ADR (adr/ADR-*.md)            -- アーキテクチャ決定記録（why）
  |
  v
SPEC (specs/*.md)              -- 現在アーキテクチャ基準（what is）
  |
  v
DOC-MAP (DOC-MAP.md)           -- 文書探索入口（参照用・分類索引）
```

- **REQ** files define requirements. They are the source of truth for required system outcomes.
- **ADR** files record architectural decisions and their rationale.
- **SPEC** files describe the current architecture as implemented. They are canonical for "how it works now."
- **DOC-MAP** is a non-canonical navigation index. It does not replace any REQ, ADR, or SPEC.
