# Changelog

## v3.0.0 (2026-07-26)

AgentDevFlow v3.0.0 は、過剰統制の削減、責務の限定と明確化、harness・model・project との責任分界の明確化を目的とする基準体系の再構築である。

### Breaking Changes

- REQ/ADR 番号体系を新枠（`REQ-001〜`、`ADR-001〜`）へ移行。v2 文書（`REQ-01XX`、`ADR-01XX`）は物理削除済み。v2 履歴は `v2.11.0` tag で参照可能。
- `requirements/mapping-table.md` を廃止。
- 配布 command frontmatter から `agent: sisyphus` 固定を削除（harness 非依存化）。
- docs_chore の「direct」完了経路を廃止、標準経路（req-define → case-open → case-run → case-close）へ統一。
- case-run 実行委譲のインラインフォールバックを配布 SPEC から除外（delegation-unavailable → pending 戻しのみ）。

### v3 charter（ADR-001）

6つの決定により過剰統制を削減する。

1. ADF の中心責務を明確化（要求形成、事実調査と意思決定の分離、成果物責任分界、工程接続、SSoT 移行、承認境界、副作用制御、永続状態、依存管理、受け入れ条件、実装中発見の還流）。
2. harness/model/project へ委譲する領域を明示（モデル選定、エージェント選定、skill 起動、timeout、retry、context 管理、TDD 手順、コードレビュー構成、デバッグ方法、実装計画形式、コード構造）。
3. hard governance を8点に限定（状態破壊、権限逸脱、ユーザー合意偽装、作業喪失、二重実行、誤正規化、下流不能、回復不能）。
4. 新規統制追加を原則禁止（7条件全部立証時のみ例外）。
5. v3 管理方式を採用（新枠番号、現行 docs 配置維持）。
6. cutover 条件10点を全て充足して v3.0.0 tag を付与。

### 文書体系

- v3 REQ: 11件（REQ-001〜011）。責任モデル単位の構成。
- v3 ADR: 5件（ADR-001 charter + ADR-002〜005）。
- v3 SPEC: 既存 SPEC を再構築、実装詳細を `references/` へ分離。

### 互換性

- v2 command 名は高頻度のものを維持。
- `inspect-docs`、`inspect-skills`、`inspect-promote`、`case-auto` の統廃合は別途判断。
- v2.11.0 tag で全 v2 文書の履歴を保持。

### 移行元

- 基準 commit: `v2.11.0` (`d1b4699c5fbc1b85f959e332d05e8b1ccec9c1cf`)
- 移行ブランチ: `v3/rebuild`

詳細は [ADR-001 v3 charter](docs/adr/ADR-001-v3-charter.md) を参照。
