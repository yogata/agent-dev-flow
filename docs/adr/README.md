# アーキテクチャ決定記録（ADR）

アーキテクチャ決定記録（ADR）のインデックス。
現行 ADR は `ADR-001〜` の3桁IDを使用し、過去版の ADR は tag `v2.11.0` で参照する。

## 現行 ADR

基本原則、管理方式、リリース条件は ADR-001 を基準とする。
個別 REQ/SPEC は憲章の原則へ照らして位置づく。

<!-- AUTOGEN:BEGIN:id=adr-baseline-count -->
現行の承認済み ADR は5件である。
<!-- AUTOGEN:END -->

> 備考: ADR-007 は proposed であり、accepted になるまでは現行判断の根拠として引用しない。

<!-- AUTOGEN:BEGIN:id=adr-baseline-table -->
| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| ADR-001 | AgentDevFlow 憲章 | accepted | 2026-07-24 |
| ADR-002 | OpenCode ソース・プロジェクション分離 | accepted | 2026-07-25 |
| ADR-003 | req_draft ソフトコントラクト原則 | accepted | 2026-07-25 |
| ADR-004 | 差し替え可能な I/O 境界 | accepted | 2026-07-25 |
| ADR-006 | inspect 3-command 構成への正規化 | accepted | 2026-07-27 |
| ADR-007 | Artifact Graph 標準化と配布スキル昇格 | proposed | 2026-08-08 |
<!-- AUTOGEN:END -->

- [利用者向け要約（charter.md）](../guides/charter.md)

> この README は分類ビューであり、ADR本文のSSoTではない。
> 基準は各 ADR ファイルである（REQ-001）。

## ステータス別ビュー

### 承認済み（accepted）

<!-- AUTOGEN:BEGIN:id=adr-status-accepted -->
- [ADR-001](ADR-001.md)（AgentDevFlow 憲章）
- [ADR-002](ADR-002.md)（OpenCode ソース・プロジェクション分離）
- [ADR-003](ADR-003.md)（req_draft ソフトコントラクト原則）
- [ADR-004](ADR-004.md)（差し替え可能な I/O 境界）
- [ADR-006](ADR-006.md)（inspect 3-command 構成への正規化）
<!-- AUTOGEN:END -->

### 提案中（proposed）

<!-- AUTOGEN:BEGIN:id=adr-status-proposed -->
- [ADR-007](ADR-007.md)（Artifact Graph 標準化と配布スキル昇格）
<!-- AUTOGEN:END -->

### 置き換え済み（superseded）

<!-- AUTOGEN:BEGIN:id=adr-status-superseded -->
- [ADR-005](ADR-005.md)（Project Extensions Architecture）
<!-- AUTOGEN:END -->

### 非推奨（deprecated）

<!-- AUTOGEN:BEGIN:id=adr-status-deprecated -->
<!-- AUTOGEN:END -->

## トピック別ビュー

### 憲章・基本原則

- [ADR-001](ADR-001.md)（AgentDevFlow 憲章、hard governance の限定、新規統制追加原則）

### 配布基盤・ソースモデル

- [ADR-002](ADR-002.md)（OpenCode ソース・プロジェクション分離）
- [ADR-004](ADR-004.md)（差し替え可能な I/O 境界）
- [ADR-005](ADR-005.md)（Project Extensions Architecture、superseded by ADR-006）
- [ADR-006](ADR-006.md)（inspect 3-command 構成への正規化、extension 検査の3層責務分離）
- [ADR-007](ADR-007.md)（Artifact Graph 標準化と配布スキル昇格、proposed）

### ワークフロー・委譲契約

- [ADR-003](ADR-003.md)（req_draft ソフトコントラクト原則）

Decision Map（現行 ADR と過去版 ADR の履歴上の関連）。

| ADR | 関係 | 対象 | 説明 |
|-----|------|------|------|
| ADR-002 | relates-to | v2:ADR-0105 | source/projection 分離に関する過去版の決定 |
| ADR-003 | relates-to | v2:ADR-0124 | req_draft ソフトコントラクトに関する過去版の決定 |
| ADR-004 | relates-to | v2:ADR-0130 | 差し替え可能な I/O 境界に関する過去版の決定 |
| ADR-005 | relates-to | v2:ADR-0135 | Project Extensions Architecture に関する過去版の決定 |
| ADR-006 | supersedes | ADR-005 | inspect-extensions 廃止と extension 検査の3層責務分離を確定し、ADR-005 を置換 |
| ADR-006 | relates-to | v2:ADR-0135 | Project Extensions Architecture に関する過去版の決定（inspect-extensions 廃止後の責務移管先） |
| ADR-007 | supersedes-spec | docs/specs/local/artifact-graph.md | 現行 SPEC「対象外」節を撤回し、標準配布スキルへ昇格。後継 SPEC は docs/specs/skills/agentdev-artifact-graph.md |
| ADR-007 | relates-to | ADR-002 | 配布物原本は src/opencode/ へ配置する原則に従う |

## 関連 REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| ADR-001 | [REQ-001](../requirements/REQ-001.md), [REQ-002](../requirements/REQ-002.md), [REQ-003](../requirements/REQ-003.md), [REQ-004](../requirements/REQ-004.md), [REQ-005](../requirements/REQ-005.md), [REQ-006](../requirements/REQ-006.md), [REQ-007](../requirements/REQ-007.md), [REQ-008](../requirements/REQ-008.md), [REQ-009](../requirements/REQ-009.md), [REQ-010](../requirements/REQ-010.md), [REQ-011](../requirements/REQ-011.md) | AgentDevFlow 憲章の全体原則（hard governance 8点、新規統制追加7条件、リリース条件） |
| ADR-002 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | 配布成果物のソース・プロジェクション分離 |
| ADR-003 | [REQ-004](../requirements/REQ-004.md), [REQ-008](../requirements/REQ-008.md) | req_draft soft-contract 原則（LLM推論消費、厳格schemaなし） |
| ADR-004 | [REQ-011](../requirements/REQ-011.md), [REQ-009](../requirements/REQ-009.md) | 差し替え可能な I/O 境界（agentdev-gh-cli、Local backend） |
| ADR-005 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | Project Extensions Architecture（.agentdev/extensions/** によるプロジェクト固有追加）。ADR-006 により superseded |
| ADR-006 | [REQ-010](../requirements/REQ-010.md), [REQ-002](../requirements/REQ-002.md) | inspect 3-command 構成への正規化（inspect-extensions 廃止、extension 検査の3層責務分離） |
| ADR-007 | [REQ-012](../requirements/REQ-012.md), [REQ-013](../requirements/REQ-013.md), [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | Artifact Graph 標準化と配布スキル昇格（open extensibility、project/self-hosting augmentation、fail-open、決定論性） |

## 過去版の履歴基盤

次の ADR-01XX 群は tag `v2.11.0` 時点のアーキテクチャ基盤である。
現行文書から参照する場合は `v2:ADR-01XX` の表記で区別し、本文は tag を参照する。
現行 ADR との関係は上記 Decision Map に示す。

### tag v2.11.0 基盤ビュー

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
