# Document Model Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックスを定義し、各文書種別が何を記述し、何を記述しないかを明確にする（REQ-0101）。

## Responsibility Matrix

| 文書種別 | 記述するもの | 記述しないもの |
|---|---|---|
| REQ | 現行要件（WHAT: 何を満たすべきか） | 実装詳細、HOW、現在の動作記述 |
| ADR | 取り返しのつかない技術判断とその理由（WHY） | 運用手順、状態遷移、形式定義 |
| SPEC | 現在のアーキテクチャ基準（HOW it works now）※repo-internal 設計文書。runtime 配布物の依存先ではない（ADR-0017, ADR-0018） | 新規要件、将来計画、判断根拠（ADR の管轄） |
| DOC-MAP | 文書探索・参照経路の入口 | 基準内容の代替、要件定義 |
| Guides | 人間向けナビゲーション層。規範的権限を持たない（ADR-0017） | MUST/SHALL 規範表現、REQ/ADR/SPEC 内容の重複 |

### workflow status 禁止

REQ ファイル・SPEC ファイル内に workflow status（例: "要件定義", "実装", "テスト" 等の6マイクロフェーズ）を記述してはならない（REQ-0108-123、REQ-0101-037）。workflow status は Issue ラベル・GitHub Project で管理し、REQ/SPEC 文書内には含めない。

## Document Lifecycle

```
REQ（要件定義）
  ↓ 判断が必要な場合
ADR（技術判断記録）
  ↓ 判断に基づく実装
SPEC（現在仕様記述）
  ↓ 探索支援
DOC-MAP（索引）/ Guides（案内）
```

- REQ は領域別の総体として管理する。変更の都度 REQ を作成せず、既存 REQ への APPEND / UPDATE で対応する。
- ADR は `proposed` → `accepted` / `superseded` / `deprecated` の状態遷移を持つ。
- SPEC は実装とともに変化する「生きた文書」である。REQ や ADR の判断内容を代替しない。
- DOC-MAP は非正規索引であり、REQ/ADR/SPEC の内容を代替しない。
- Guides はナビゲーション層であり、規範文書ではない。

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0017）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0018）。

## Workspace and State Boundaries

| ディレクトリ | 役割 | 性質 |
|---|---|---|
| `.agentdev/` | AgentDevFlow の canonical domain state（intake / learning / backlog / integrity） | 永続的 domain state。配布物ではない |
| `.sisyphus/` | runtime 作業領域 | 一時的ワークスペース。domain state ではない |
| `.sisyphus/drafts/` | command workflow での作業用一時領域 | active command の明示的な working draft handoff でのみ使用 |

## Source-of-Truth Priority

文書間に矛盾がある場合の優先順位（REQ-0101-011）:

1. active REQ
2. ADR（accepted）
3. SPEC
4. DOC-MAP / guides

## Configuration Rules

| 規則 | 内容 |
|---|---|
| REQ ID | 4桁ゼロ埋めの安定ID。active/retired を問わず再利用しない |
| ADR ID | 4桁ゼロ埋め。状態は frontmatter で管理 |
| SPEC 配置 | `docs/specs/*.md` 直下 |
| Guides 配置 | `docs/guides/*.md` 直下 |
| Retired REQ | `docs/requirements/retired/` に配置。現行要件判断に使用しない |
