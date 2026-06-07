# プロジェクトドキュメントと SPEC

REQ / ADR / SPEC / DOC-MAP の関係と、それぞれの役割を説明する。

## 文書体系の全体像

```
REQ（要件定義: what should be）
  ↓
ADR（アーキテクチャ決定: why）
  ↓
SPEC（現在仕様: what is）
  ↓
DOC-MAP（文書探索入口: 索引）
```

各文書は独立した基準性を持ち、下位の文書が上位を代替することはない。

## REQ（要件定義）

**格納先**: `docs/requirements/REQ-{NNNN}.md`

要件定義の永続基準。システムが満たすべき要件を記述する。

- 現行の active REQ は REQ-0101 から REQ-0114 までの 14 件
- 旧 REQ（REQ-0001〜REQ-0050 [全てretired]）は `docs/requirements/retired/` に移動済み。履歴参照に限定する
- 旧 REQ と新 REQ の対応関係は `docs/requirements/mapping-table.md` に記録

### Active REQ 一覧

| REQ | タイトル |
|-----|---------|
| REQ-0101 | 文書・REQ管理基準 |
| REQ-0102 | 要件定義・保存 |
| REQ-0103 | Artifact 責任分界 |
| REQ-0104 | Workflow / Command Protocol |
| REQ-0105 | Intake / Learning / Backlog |
| REQ-0106 | Case 実行・完了 |
| REQ-0107 | Reporting / Writing Quality |
| REQ-0108 | Integrity / Validation / Tests |
| REQ-0109 | REQ 再構成運用 |
| REQ-0110 | Git worktree 削除リトライ |
| REQ-0111 | Command authoring 後方互換性維持原則 |
| REQ-0112 | ADRライフサイクル・文書責務・runtime独立性・状態モデル統合是正 |
| REQ-0113 | Skill References SPEC分離基準 |
| REQ-0114 | /agentdev/case-auto 最大自走モード |

## ADR（アーキテクチャ決定記録）

**格納先**:
- 現行 baseline: `docs/adr/ADR-01XX.md`（current ADR collection）
- 履歴: `docs/adr/retired/ADR-00XX.md`（retired ADR collection）

取り返しのつかない技術判断とその背景を記録する。

- 現行 baseline は ADR-0101 以降の番号帯を使用する（REQ-0112-047）
- ADR-0001〜0099 は再編前の履歴番号帯であり、`docs/adr/retired/` に配置されている（REQ-0112-048）
- accepted ADR の決定内容を意味変更してはならない（REQ-0112-045）。変更が必要な場合は新規 ADR を作成する
- ADR 体系の全面改定時は例外として、ユーザー承認済み範囲で最小限を超える編集を許可する（REQ-0112-044）
- REQ → ADR、ADR → ADR、Issue → ADR の参照を許可
- ADR → Issue の逆参照は不可
- 一覧は `docs/adr/README.md` にインデックスがある（Current Baseline View / Retired Historical View）

## SPEC（現在仕様）

**格納先**: `docs/specs/*.md`

実装者が参照する現在のシステム仕様。「今どう動いているか」を記述する。repo-internal 設計文書であり、runtime 配布物の依存先ではない（ADR-0017, ADR-0018）。

| SPEC | 内容 |
|------|------|
| system.md | コマンドシステムの構成 |
| patterns.md | 実装パターンと文書フォーマット |
| design-principles.md | 設計原則 |
| quality-specs.md | 品質基準・検証ルール |
| document-model.md | 文書種別の責務マトリックス |
| artifact-contracts.md | アーティファクト間契約 |
| artifact-responsibilities.md | アーティファクト責務定義 |
| integrity-contracts.md | 整合性検査分類フレームワーク |
| integrity-rule-catalog.md | 整合性ルールカタログ |
| integrity-audit-report.md | 整合性監査レポート |
| workflow-contracts.md | ワークフロー契約の雛形 |
| runtime-package-boundary.md | Runtime package 境界 |
| rule-ownership.md | ルール所有権 |
| req-impact-map.md | REQ 影響マップ |

## DOC-MAP（文書探索入口）

**格納先**: `docs/DOC-MAP.md`

文書探索・参照経路の入口。索引であり、基準ではない。全文書の配置と役割を一覧できる。

## このガイドの位置づけ

本ファイルを含む `docs/guides/` は人間向け navigation 層である。規範的権限を持たず、規範的表現を含まない（ADR-0017）。REQ/ADR/SPEC と矛盾する記述がある場合は基準文書を優先する。

## 参照関係のルール

文書間で矛盾があった場合、以下の順位で解決する。

1. REQ（最優先）
2. ADR
3. SPEC
4. DOC-MAP / guides（基準を代替しない）

guides（本ファイルを含む）は参照用読み物であり、いかなる基準文書も代替しない。
