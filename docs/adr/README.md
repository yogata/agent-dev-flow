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
| ADR-0009 | REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入 | proposed | 2026-05-30 |

> この README は分類ビューであり、ADR本文のSSoTではない。基準は各 `ADR-{NNNN}.md` ファイルである（REQ-0004-066）。

## Status View

### proposed

- [ADR-0001](ADR-0001.md) — Command/Skill/Template/Script責任分界の正式定義
- [ADR-0002](ADR-0002.md) — Orchestration skill作成基準の導入
- [ADR-0003](ADR-0003.md) — req-define入力の抽象化
- [ADR-0006](ADR-0006.md) — Epic Issue 本文を実行順序 SSoT とする設計
- [ADR-0008](ADR-0008.md) — DOC-MAP導入と requirements/views 廃止
- [ADR-0009](ADR-0009.md) — REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入

### accepted

- [ADR-0005](ADR-0005.md) — AgentDevFlow plugin namespace 統一

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

## Related REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| [ADR-0001](ADR-0001.md) | [REQ-0016](../requirements/REQ-0016.md) | Command/Skill/Template/Script責任分界の要件定義 |
| [ADR-0002](ADR-0002.md) | [REQ-0016](../requirements/REQ-0016.md) | Orchestration skill化基準の要件定義（REQ-0016-004） |
| [ADR-0003](ADR-0003.md) | [REQ-0016](../requirements/REQ-0016.md), [REQ-0007](../requirements/REQ-0007.md) | REQ-0016: learning要件ソース化、REQ-0007: ナレッジパイプライン高度化（ADR-0003本文に明示参照） |
| [ADR-0004](ADR-0004.md) | [REQ-0004](../requirements/REQ-0004.md) | 要件・ADRドキュメントシステム（ADR-0004本文に明示参照） |
| [ADR-0005](ADR-0005.md) | [REQ-0017](../requirements/REQ-0017.md) | AgentDevFlow plugin namespace統一（ADR-0005本文に明示参照） |
| [ADR-0006](ADR-0006.md) | [REQ-0020](../requirements/REQ-0020.md) | Epic Issue実行順序SSoT（ADR-0006本文に明示参照） |
| [ADR-0007](ADR-0007.md) | [REQ-0004](../requirements/REQ-0004.md) | 要件・ADRドキュメントシステム（ADR-0007本文に明示参照） |
| [ADR-0008](ADR-0008.md) | [REQ-0004](../requirements/REQ-0004.md), [REQ-0035](../requirements/REQ-0035.md) | REQ-0004: views関連要件のsupersede、REQ-0035: DOC-MAP導入とviews廃止 |
| [ADR-0009](ADR-0009.md) | [REQ-0041](../requirements/REQ-0041.md) | REQ体系再基準化 — 旧REQ分類・新基準REQ群・分類ゲート（ADR-0009本文に明示参照） |
