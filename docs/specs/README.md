# Specifications Index

SPEC ファイルは現行アーキテクチャの正規文書である（REQ-0101）。システムが現在「どうなっているか」を記述し、満たすべき成果を定義する REQ ファイルとは対比される。

> **リポジトリ内部設計文書**: SPEC ファイルは agent-dev-flow リポジトリのリポジトリ内部設計文書である。実行時配布対象ではなく、実行時コマンドは本ファイル群に依存しない（ADR-0103, ADR-0104）。

## SPEC ファイル一覧

| SPEC | タイトル | 責務 |
|------|---------|------|
| [system.md](system.md) | システム仕様 | コマンドシステムの構成定義・運用モデル |
| [patterns.md](patterns.md) | 文書フォーマット規約 | frontmatter規約、REQ/SPEC/guidesの記述形式、テンプレート命名規則、リポジトリ参照リンク規約 |
| [design-principles.md](design-principles.md) | 設計原則 | アーキテクチャ設計原則 |
| [quality-specs.md](quality-specs.md) | 品質仕様 | 品質基準・検証ルール |
| [quality-gates.md](quality-gates.md) | 品質ゲート | QG-1〜QG-4 定義・機械化境界・実装マッピング |
| [document-model.md](document-model.md) | 文書モデル | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス |
| [writing-style.md](writing-style.md) | 文書執筆スタイルガイドライン | 文書品質ゲート正本仕様・REQ-0140 参照先・文書種別責務・要件行の書き方・要件性・粒度・移送判断・AI-slop検出基準 |
| [artifact-contracts.md](artifact-contracts.md) | アーティファクト契約 | Command/Skill/Template/Script の入出力・依存方向 |
| [artifact-responsibilities.md](artifact-responsibilities.md) | 成果物責任表 | 各成果物種別の正規所有者（canonical owner）と責務（REQ-0103-057） |
| [integrity-contracts.md](integrity-contracts.md) | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
| [integrity-rule-catalog.md](integrity-rule-catalog.md) | 整合性ルールカタログ | 整合性検査の全ルール定義（REQ-0108-150, 151） |
| [workflow-contracts.md](workflow-contracts.md) | ワークフロー契約 | コマンドパイプラインの入出力・前提条件・Local backend 差分 |
| [runtime-package-boundary.md](runtime-package-boundary.md) | 実行時パッケージ境界 | リポジトリ種別別 `.opencode/` 定義・命名規約・導入方式・同期範囲 |
| [local-case-file.md](local-case-file.md) | ローカル Case ファイル | ローカル版 OpenCode の Case ファイルスキーマ・状態遷移・採番・見出し（REQ-0141） |
| [local-generation.md](local-generation.md) | ローカル版 OpenCode 生成 | ローカル版生成フロー・`generated_by` 識別子・ジャンクション検出安全ゲート・ガードレール（REQ-0141, ADR-0126） |
| [local-transform.md](local-transform.md) | ローカル版 OpenCode 変換プロンプト | 変換用プロンプト・レビュー用プロンプト・変換仕様の要件（REQ-0141） |
| [rule-ownership.md](rule-ownership.md) | ルール所有権マトリックス | ルールドメインと責任 REQ/SPEC の対応（REQ-0103-058） |
| [req-impact-map.md](req-impact-map.md) | REQ 影響マップ | 各現行 REQ が影響する整合性ルールとアーティファクト（REQ-0108-152） |
| [req-health-metrics.md](req-health-metrics.md) | REQ 健全性メトリクス | REQ 肥大化・関心ズレ検出の定量閾値（要件行数・関心分類数・アーティファクト種別数）（REQ-0136-040） |

## 文書間関係（REQ-0101）

```
REQ (requirements/REQ-*.md)    -- 要件定義（満たすべき成果）
  |
  v
ADR (adr/ADR-*.md)            -- アーキテクチャ決定記録（判断根拠）
  |
  v
SPEC (specs/*.md)              -- 現行アーキテクチャ基準（現在どうなっているか）
  |
  v
DOC-MAP (DOC-MAP.md)           -- 文書探索入口（参照用・分類索引）
```

- **REQ** ファイルは要件を定義する。システムが満たすべき成果の信頼できる情報源である。
- **ADR** ファイルはアーキテクチャ決定とその判断根拠を記録する。
- **SPEC** ファイルは実装された現行アーキテクチャを記述する。「現在どう動作しているか」の正となる。
- **DOC-MAP** は非正規のナビゲーション索引である。REQ・ADR・SPEC のいずれも代替しない。
