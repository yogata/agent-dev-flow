# アーキテクチャ決定記録（ADR）

アーキテクチャ決定記録（ADR）のインデックス。
v3 は `ADR-001〜` の新枠を採用し、v2.11.0 時点の `ADR-01XX` 番号帯は tag 参照とする（U9）。

## 現行 ADR（v3）

v3 の基本原則、管理方式、cutover 条件は ADR-001 を基準とする。
個別 REQ/SPEC は charter 原則へ照らして位置づく。

<!-- AUTOGEN:BEGIN:id=adr-baseline-table -->
| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| [ADR-001](ADR-001-v3-charter.md) | v3 charter（AgentDevFlow v3 憲章） | accepted | 2026-07-24 |
| [ADR-002](ADR-002.md) | OpenCode ソース・プロジェクション分離（v3） | accepted | 2026-07-25 |
| [ADR-003](ADR-003.md) | req_draft ソフトコントラクト原則（v3） | accepted | 2026-07-25 |
| [ADR-004](ADR-004.md) | 差し替え可能な I/O 境界（v3） | accepted | 2026-07-25 |
| [ADR-005](ADR-005.md) | Project Extensions Architecture（v3） | accepted | 2026-07-25 |
<!-- AUTOGEN:END -->

- [利用者向け要約（v3-charter.md）](../guides/v3-charter.md)
- v3 移行の進行状況は [`.agentdev/v3-migration/decisions.md`](../../.agentdev/v3-migration/decisions.md) を参照

> この README は分類ビューであり、ADR本文のSSoTではない。
> 基準は各 ADR ファイルである（REQ-001）。

## ステータス別ビュー

### 承認済み（accepted）

<!-- AUTOGEN:BEGIN:id=adr-status-accepted -->
- [ADR-001](ADR-001-v3-charter.md)（v3 charter（AgentDevFlow v3 憲章））
- [ADR-002](ADR-002.md)（OpenCode ソース・プロジェクション分離（v3））
- [ADR-003](ADR-003.md)（req_draft ソフトコントラクト原則（v3））
- [ADR-004](ADR-004.md)（差し替え可能な I/O 境界（v3））
- [ADR-005](ADR-005.md)（Project Extensions Architecture（v3））
<!-- AUTOGEN:END -->

### 提案中（proposed）

<!-- AUTOGEN:BEGIN:id=adr-status-proposed -->
<!-- AUTOGEN:END -->

### 置き換え済み（superseded）

<!-- AUTOGEN:BEGIN:id=adr-status-superseded -->
<!-- AUTOGEN:END -->

### 非推奨（deprecated）

<!-- AUTOGEN:BEGIN:id=adr-status-deprecated -->
<!-- AUTOGEN:END -->

## トピック別ビュー

### 憲章・基本原則

- [ADR-001](ADR-001-v3-charter.md)（v3 charter、hard governance の限定、新規統制追加原則）

### 配布基盤・ソースモデル

- [ADR-002](ADR-002.md)（OpenCode ソース・プロジェクション分離）
- [ADR-004](ADR-004.md)（差し替え可能な I/O 境界）
- [ADR-005](ADR-005.md)（Project Extensions Architecture）

### ワークフロー・委譲契約

- [ADR-003](ADR-003.md)（req_draft ソフトコントラクト原則）

Decision Map（ADR 間の supersedes / relates-to / superseded-by 関係）。

| ADR | 関係 | 対象 | 説明 |
|-----|------|------|------|
| ADR-002 | supersedes | v2:ADR-0105 | source/projection 分離を v3 charter 原則へ再定義 |
| ADR-003 | supersedes | v2:ADR-0124 | req_draft soft-contract 原則を v3 charter 原則へ再定義 |
| ADR-004 | supersedes | v2:ADR-0130 | 差し替え可能な I/O 境界を v3 charter 原則へ再定義 |
| ADR-005 | supersedes | v2:ADR-0135 | Project Extensions Architecture を v3 charter 原則へ再定義 |

## 関連 REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| ADR-001 | [REQ-001](../requirements/REQ-001.md), [REQ-002](../requirements/REQ-002.md), [REQ-003](../requirements/REQ-003.md), [REQ-004](../requirements/REQ-004.md), [REQ-005](../requirements/REQ-005.md), [REQ-006](../requirements/REQ-006.md), [REQ-007](../requirements/REQ-007.md), [REQ-008](../requirements/REQ-008.md), [REQ-009](../requirements/REQ-009.md), [REQ-010](../requirements/REQ-010.md), [REQ-011](../requirements/REQ-011.md) | v3 charter 全体原則（hard governance 8点、新規統制追加7条件、cutover 条件） |
| ADR-002 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | 配布成果物のソース・プロジェクション分離 |
| ADR-003 | [REQ-004](../requirements/REQ-004.md), [REQ-008](../requirements/REQ-008.md) | req_draft soft-contract 原則（LLM推論消費、厳格schemaなし） |
| ADR-004 | [REQ-011](../requirements/REQ-011.md), [REQ-009](../requirements/REQ-009.md) | 差し替え可能な I/O 境界（agentdev-gh-cli、Local backend） |
| ADR-005 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | Project Extensions Architecture（.agentdev/extensions/** によるプロジェクト固有追加） |

## v2 履歴基盤（tag v2.11.0 参照のみ）

次の ADR-01XX 群は v2.11.0 時点のアーキテクチャ基盤である。
v3 文脈で参照する場合は `v2:ADR-01XX` の表記で区別する（U9）。
v3.0.0 cutover 後は v2 保守を停止するため、tag 参照のみとする。
後継関係は上記 Decision Map の通り、主要な v2 ADR は v3 ADR-002〜005 へ再定義された。

### v2 現行基盤ビュー（tag v2.11.0 時点）

<!-- AUTOGEN:BEGIN:id=adr-baseline-count -->
承認済みステータス（accepted）の ADR-01XX 31件が、v2.11.0 時点のアーキテクチャ判断の基盤である。
<!-- AUTOGEN:END -->

| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| v2:ADR-0101 | AgentDevFlow プラグイン名前空間の統一 | accepted | 2026-06-08 |
| v2:ADR-0102 | 実行時 / 編集時 関心分離 | accepted | 2026-06-08 |
| v2:ADR-0103 | 文書種別責務境界 | accepted | 2026-06-08 |
| v2:ADR-0104 | 実行時独立性 | accepted | 2026-06-08 |
| v2:ADR-0105 | OpenCode ソース・プロジェクション分離 | accepted | 2026-06-08 |
| v2:ADR-0106 | リポジトリローカルツールのための /repo/* 名前空間 | accepted | 2026-06-08 |
| v2:ADR-0107 | コマンド・スキル・テンプレート・スクリプト責任分界の正式定義 | accepted | 2026-06-08 |
| v2:ADR-0108 | オーケストレーションスキル作成基準の導入 | accepted | 2026-06-08 |
| v2:ADR-0109 | Epic Issue 本文を実行順序 SSoT とする設計 | accepted | 2026-06-08 |
| v2:ADR-0110 | DOC-MAP 採用判断 | accepted | 2026-06-08 |
| v2:ADR-0112 | サブエージェント委譲の一般化と委譲時最小契約 | accepted | 2026-06-10 |
| v2:ADR-0114 | case-run 実行責務の外部実行バックエンド委譲 | accepted | 2026-06-16 |
| v2:ADR-0123 | SPEC ライフサイクルと spec-save の導入 | accepted | 2026-06-18 |
| v2:ADR-0124 | req_draft ソフトコントラクト原則: LLM推論消費・厳格スキーマなし | accepted | 2026-06-19 |
| v2:ADR-0125 | case-auto Wave 内並列子Issue実行モデル | accepted | 2026-06-20 |
| v2:ADR-0127 | case-auto 構成工程の委譲によるスケーラビリティ確立 | accepted | 2026-06-21 |
| v2:ADR-0128 | case-run の実行モデル: 実行担当サブエージェント委譲 | accepted | 2026-06-21 |
| v2:ADR-0129 | 複数 execution_unit 並列実行モデル | accepted | 2026-06-23 |
| v2:ADR-0130 | `agentdev-gh-cli` を差し替え可能な I/O 境界として確立 | accepted | 2026-06-23 |
| v2:ADR-0131 | ローカル版導入方式を link mode へ統一し生成方式を廃止 | accepted | 2026-06-23 |
| v2:ADR-0132 | コンフリクト解消モデル（3レベルエスカレーションと責務割当） | accepted | 2026-06-24 |
| v2:ADR-0134 | 配布物依存スキルの src 昇格方針 | accepted | 2026-07-03 |
| v2:ADR-0135 | Project Extensions Architecture | accepted | 2026-07-04 |
| v2:ADR-0136 | 配布物の harness 実行制御分離 | accepted | 2026-07-12 |
| v2:ADR-0137 | case-auto における case-run インライン実行（多重委譲回避） | accepted | 2026-07-16 |
| v2:ADR-0138 | case-auto オーケストレーション制御の AgentDevFlow 側集約 | accepted | 2026-07-19 |
| v2:ADR-0139 | REQ/SPEC 意味分類と正規所有モデル | accepted | 2026-07-22 |

v2 の superseded / deprecated ADR（v2:ADR-0111、v2:ADR-0113、v2:ADR-0126）および v2.11.0 以前に物理削除された v2:ADR-0001〜0023 の詳細は tag v2.11.0 を参照のこと。

<!-- AUTOGEN:BEGIN:id=adr-retired-table -->
| ADR番号 | タイトル | retired時ステータス |
|---------|---------|-------------------|
<!-- AUTOGEN:END -->
