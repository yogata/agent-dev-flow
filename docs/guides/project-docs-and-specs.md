# プロジェクトドキュメントと SPEC

REQ / ADR / SPEC / DOC-MAP の関係と、それぞれの役割を説明する。

## 文書体系の全体像

```
REQ（要件定義：満たすべき状態）
  ↓
ADR（アーキテクチャ決定：判断根拠）
  ↓
SPEC（現在仕様：現在の姿）
  ↓
DOC-MAP（文書探索入口：索引）
```

各文書は独立した基準性を持ち、下位の文書が上位を代替することはない。

## REQ（要件定義）

**格納先**: `docs/requirements/REQ-{NNNN}.md`

要件定義の永続基準。
システムが満たすべき要件を記述する。

- 現行 REQ は REQ-0101 から REQ-0147 までの 39 件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止、履歴参照のみ）
- 旧 REQ（REQ-0001〜REQ-0050 [全て廃止]）は `docs/requirements/retired/` に移動済み。履歴参照に限定する
- 旧 REQ と新 REQ の対応関係は `docs/requirements/mapping-table.md` に記録

> 現行 REQ の一覧、範囲は `docs/requirements/README.md` を正とする。本ガイドでは REQ 一覧を複製しない。

## ADR（アーキテクチャ決定記録）

**格納先**:
- 現行基準: `docs/adr/ADR-01XX.md`（現行の番号帯）
- 履歴: `docs/adr/retired/ADR-00XX.md`（廃止済みの番号帯）

将来の設計、運用、文書システムを制約する決定とその背景を記録する（REQ-0101-008）。

- 現行基準は ADR-0101 以降の番号帯を使用する（REQ-0112-047）
- ADR-0001〜0099 は再編前の履歴番号帯であり、`docs/adr/retired/` に配置されている（REQ-0112-048）
- 承認済み ADR の決定内容は安定して維持する（REQ-0112-045）。変更が必要な場合は新規 ADR を作成する
- ADR 体系の全面改定時は例外として、ユーザー承認済み範囲で最小限を超える編集を許可する（REQ-0112-044）
- REQ → ADR、ADR → ADR、Issue → ADR の参照を許可
- REQ → Issue の一方向参照である（Issue から REQ への逆参照は行わない）
- 一覧は `docs/adr/README.md` に索引がある（現行基準ビュー / 廃止済み履歴ビュー）

## SPEC（現在仕様）

**格納先**: `docs/specs/*.md`

実装者が参照する現在のシステム仕様。
「今どう動いているか」を記述する。
リポジトリ内部の設計文書であり、実行時配布物の依存先ではない（ADR-0103, ADR-0104）。

| SPEC | 内容 |
|------|------|
| system.md | コマンドシステムの構成 |
| patterns.md | 実装パターンと文書フォーマット |
| design-principles.md | 設計原則 |
| quality-specs.md | 品質基準、検証ルール |
| quality-gates.md | 品質ゲート（QG-1〜QG-4） |
| document-model.md | 文書種別の責務マトリックス |
| artifact-contracts.md | アーティファクト間契約 |
| artifact-responsibilities.md | アーティファクト責務定義 |
| integrity-contracts.md | 整合性検査分類フレームワーク |
| integrity-rule-catalog.md | 整合性ルールカタログ |
| workflow-contracts.md | ワークフロー契約の雛形 |
| runtime-package-boundary.md | 実行時パッケージ境界 |
| rule-ownership.md | ルール所有権 |
| req-impact-map.md | REQ 影響マップ |

## DOC-MAP（文書探索入口）

**格納先**: `docs/DOC-MAP.md`

文書探索、参照経路の入口。
索引であり、基準ではない。
全文書の配置と役割を一覧できる。

## このガイドの位置づけ

本ファイルを含む `docs/guides/` は人間向けの案内層である（REQ-0101-014, 027、ADR-0103）。
REQ/ADR/SPEC と矛盾する記述がある場合は基準文書を優先する。

## 参照関係のルール

文書間で矛盾があった場合、以下の順位で解決する。

1. REQ（最優先）
2. ADR
3. SPEC
4. DOC-MAP / guides（基準への導線を提供する）

guides（本ファイルを含む）は参照用読み物であり、基準文書への導線を提供する。
