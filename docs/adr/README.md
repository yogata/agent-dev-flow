# Architecture Decision Records

アーキテクチャ決定記録（ADR）のインデックス。

## ADR一覧

| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| ADR-0001 | Command/Skill/Template/Script責任分界の正式定義 | proposed | 2026-05-18 |
| ADR-0002 | Orchestration skill作成基準の導入 | proposed | 2026-05-18 |
| ADR-0003 | req-define入力の抽象化 | proposed | 2026-05-18 |
| ADR-0004 | 要件管理構造の area-based 移行方針 | superseded-by:[ADR-0007] | 2026-05-19 |
| ADR-0005 | AgentDevFlow plugin namespace 統一 | accepted | 2026-05-21 |
| ADR-0006 | Epic Issue 本文を実行順序 SSoT とする設計 | proposed | 2026-05-22 |
| ADR-0007 | REQ/ADR基準構造と分類ビュー運用の再定義 | superseded-by:[ADR-0008] | 2026-05-24 |
| ADR-0008 | DOC-MAP導入と requirements/views 廃止 | proposed | 2026-05-28 |
| ADR-0009 | REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入 | accepted | 2026-05-30 |
| ADR-0010 | HITL boundary — 全 agentdev command の Human-in-the-Loop 境界原則 | proposed | 2026-06-02 |
| ADR-0011 | Manager/orchestrator パターンの限定採用 — 標準構造とはしない | proposed | 2026-06-02 |
| ADR-0012 | Requirement Source pipeline の正式定義 — promoted→RU→req-define の一貫流 | proposed | 2026-06-02 |

> この README は分類ビューであり、ADR本文のSSoTではない。基準は各 `ADR-{NNNN}.md` ファイルである（REQ-0101）。

## Status View

### proposed

- [ADR-0001](ADR-0001.md) — Command/Skill/Template/Script責務分界の正式定義
- [ADR-0002](ADR-0002.md) — Orchestration skill作成基準の導入
- [ADR-0003](ADR-0003.md) — req-define入力の抽象化
- [ADR-0006](ADR-0006.md) — Epic Issue 本文を実行順序 SSoT とする設計
- [ADR-0008](ADR-0008.md) — DOC-MAP導入と requirements/views 廃止
- [ADR-0010](ADR-0010.md) — HITL boundary — 全 agentdev command の Human-in-the-Loop 境界原則
- [ADR-0011](ADR-0011.md) — Manager/orchestrator パターンの限定採用 — 標準構造とはしない
- [ADR-0012](ADR-0012.md) — Requirement Source pipeline の正式定義 — promoted→RU→req-define の一貫流

### accepted

- [ADR-0005](ADR-0005.md) — AgentDevFlow plugin namespace 統一
- [ADR-0009](ADR-0009.md) — REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入

### superseded

- [ADR-0004](ADR-0004.md) — 要件管理構造の area-based 移行方針 （superseded by [ADR-0007](ADR-0007.md)）
- [ADR-0007](ADR-0007.md) — REQ/ADR基準構造と分類ビュー運用の再定義 （superseded by [ADR-0008](ADR-0008.md)）

## Topic View

### 責務分界

- [ADR-0001](ADR-0001.md) — Command/Skill/Template/Script責任分界の正式定義
- [ADR-0002](ADR-0002.md) — Orchestration skill作成基準の導入

### 入力抽象化

- [ADR-0003](ADR-0003.md) — req-define入力の抽象化

### 要件管理構造

- [ADR-0004](ADR-0004.md) — 要件管理構造の area-based 移行方針
- [ADR-0007](ADR-0007.md) — REQ/ADR基準構造と分類ビュー運用の再定義
- [ADR-0008](ADR-0008.md) — DOC-MAP導入と requirements/views 廃止
- [ADR-0009](ADR-0009.md) — REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入

### Plugin構成

- [ADR-0005](ADR-0005.md) — AgentDevFlow plugin namespace 統一

### Epic管理

- [ADR-0006](ADR-0006.md) — Epic Issue 本文を実行順序 SSoT とする設計

### アーキテクチャ方針

- [ADR-0010](ADR-0010.md) — HITL boundary — 全 agentdev command の Human-in-the-Loop 境界原則
- [ADR-0011](ADR-0011.md) — Manager/orchestrator パターンの限定採用 — 標準構造とはしない
- [ADR-0012](ADR-0012.md) — Requirement Source pipeline の正式定義 — promoted→RU→req-define の一貫流

## Decision Map

| ADR | 関係 | 対象 | 説明 |
|-----|------|------|------|
| [ADR-0001](ADR-0001.md) | relates-to | [ADR-0002](ADR-0002.md) | Orchestration skill作成基準の導入 |
| [ADR-0001](ADR-0001.md) | relates-to | [ADR-0003](ADR-0003.md) | issue-req入力の抽象化 |
| [ADR-0002](ADR-0002.md) | relates-to | [ADR-0001](ADR-0001.md) | Command/Skill/Template/Script責任分界の正式定義 |
| [ADR-0003](ADR-0003.md) | relates-to | [ADR-0001](ADR-0001.md) | Command/Skill/Template/Script責任分界の正式定義 |
| [ADR-0004](ADR-0004.md) | relates-to | [ADR-0001](ADR-0001.md) | req-file-manager責務拡張に関連 |
| [ADR-0005](ADR-0005.md) | relates-to | [ADR-0004](ADR-0004.md) | 並行して進行する別移行 |
| [ADR-0006](ADR-0006.md) | relates-to | [ADR-0005](ADR-0005.md) | case-open/case-runのコマンド体系 |
| [ADR-0007](ADR-0007.md) | supersedes | [ADR-0004](ADR-0004.md) | area-based移行方針を撤回 |
| [ADR-0007](ADR-0007.md) | relates-to | [ADR-0001](ADR-0001.md) | req-file-manager/adr-file-manager責務に関連 |
| [ADR-0008](ADR-0008.md) | supersedes | [ADR-0007](ADR-0007.md) | views導入決定を撤回、DOC-MAP導入 |
| [ADR-0008](ADR-0008.md) | relates-to | [ADR-0004](ADR-0004.md) | area-based移行方針の最終撤回（ADR-0007経由） |
| [ADR-0009](ADR-0009.md) | relates-to | [ADR-0008](ADR-0008.md) | DOC-MAP再構成の基盤 |
| [ADR-0009](ADR-0009.md) | relates-to | [ADR-0007](ADR-0007.md) | REQ基準構造の前段（ADR-0007→0008→0009の系譜） |
| [ADR-0010](ADR-0010.md) | relates-to | [ADR-0001](ADR-0001.md) | 責務分界 → HITL境界の補完関係 |
| [ADR-0010](ADR-0010.md) | relates-to | [ADR-0002](ADR-0002.md) | HITL境界が orchestration skill 化の判断に影響 |
| [ADR-0010](ADR-0010.md) | relates-to | [ADR-0011](ADR-0011.md) | manager pattern と HITL境界の相互作用 |
| [ADR-0010](ADR-0010.md) | relates-to | [ADR-0012](ADR-0012.md) | pipeline 各段階の HITL境界 |
| [ADR-0011](ADR-0011.md) | relates-to | [ADR-0002](ADR-0002.md) | skill化基準と pattern採用基準の区別 |
| [ADR-0011](ADR-0011.md) | relates-to | [ADR-0010](ADR-0010.md) | HITL境界 |
| [ADR-0011](ADR-0011.md) | relates-to | [ADR-0006](ADR-0006.md) | Epic Orchestrator の SSoT 基盤 |
| [ADR-0012](ADR-0012.md) | relates-to | [ADR-0010](ADR-0010.md) | pipeline 内の HITL境界 |
| [ADR-0012](ADR-0012.md) | relates-to | [ADR-0011](ADR-0011.md) | pipeline 各段階の pattern 適用可否 |

## Related REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| [ADR-0001](ADR-0001.md) | [REQ-0016 (retired)](../requirements/retired/REQ-0016.md) | Command/Skill/Template/Script責任分界の要件定義 |
| [ADR-0002](ADR-0002.md) | [REQ-0016 (retired)](../requirements/retired/REQ-0016.md) | Orchestration skill化基準の要件定義（REQ-0016-004） |
| [ADR-0003](ADR-0003.md) | [REQ-0016 (retired)](../requirements/retired/REQ-0016.md), [REQ-0007 (retired)](../requirements/retired/REQ-0007.md) | REQ-0016: learning要件ソース化、REQ-0007: ナレッジパイプライン高度化（ADR-0003本文に明示参照） |
| [ADR-0004](ADR-0004.md) | [REQ-0004 (retired)](../requirements/retired/REQ-0004.md) | 要件・ADRドキュメントシステム（ADR-0004本文に明示参照） |
| [ADR-0005](ADR-0005.md) | [REQ-0017 (retired)](../requirements/retired/REQ-0017.md) | AgentDevFlow plugin namespace統一（ADR-0005本文に明示参照） |
| [ADR-0006](ADR-0006.md) | [REQ-0020 (retired)](../requirements/retired/REQ-0020.md) | Epic Issue実行順序SSoT（ADR-0006本文に明示参照） |
| [ADR-0007](ADR-0007.md) | [REQ-0004 (retired)](../requirements/retired/REQ-0004.md) | 要件・ADRドキュメントシステム（ADR-0007本文に明示参照） |
| [ADR-0008](ADR-0008.md) | [REQ-0004 (retired)](../requirements/retired/REQ-0004.md), [REQ-0035 (retired)](../requirements/retired/REQ-0035.md) | REQ-0004: views関連要件のsupersede、REQ-0035: DOC-MAP導入とviews廃止 |
| [ADR-0009](ADR-0009.md) | [REQ-0041 (retired)](../requirements/retired/REQ-0041.md) | REQ体系再基準化 — 旧REQ分類・新基準REQ群・分類ゲート（ADR-0009本文に明示参照） |
| [ADR-0010](ADR-0010.md) | [REQ-0104](../requirements/REQ-0104.md) | Workflow/Command Protocol（HITL境界の観点で補完） |
| [ADR-0011](ADR-0011.md) | — | 対応REQなし（architecture principle として新規定義） |
| [ADR-0012](ADR-0012.md) | [REQ-0105](../requirements/REQ-0105.md) | Intake/Learning/Backlog（pipeline の動作仕様を architecture principle で裏付け） |
