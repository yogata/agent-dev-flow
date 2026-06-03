# Requirements Index

## Active Requirements

現在の要件判断では、以下12件を第一参照先とする。旧REQ 50件はすべて retired であり、履歴参照に限定する。

| REQ ID | タイトル | 関心対象 |
|---|---|---|
| [REQ-0101](REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](REQ-0102.md) | 要件定義・保存 | req-define / req-save / Requirement Source / 分類ゲート |
| [REQ-0103](REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / frontmatter 規約 / runtime-only 配布制約 |
| [REQ-0104](REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close基本契約 |
| [REQ-0105](REQ-0105.md) | Intake / Learning / Backlog | intake、learning、backlog-review、backlog-save、RU lifecycle |
| [REQ-0106](REQ-0106.md) | Case実行・完了 | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](REQ-0108.md) | Integrity / Validation / Tests | 整合性検査、finding分類・route、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査 |
| [REQ-0109](REQ-0109.md) | REQ再構成運用 | retired archive、移行表、REQ再構成intake、REQ再構成レビューコマンド、100番台採番 |
| [REQ-0110](REQ-0110.md) | Git worktree 削除リトライ | git-worktree、リトライ、信頼性 |
| [REQ-0111](REQ-0111.md) | Command authoring 後方互換性維持原則 | command-authoring、後方互換性、設計原則 |
| [REQ-0112](REQ-0112.md) | ADRライフサイクル・文書責務・runtime独立性・状態モデル統合是正 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、6状態否定、integrity検査追加 |

## Retired Requirements

旧REQは削除せず、[retired/](retired/) に移動した。retired REQ は履歴・根拠の参照用であり、現行要件判断に使わない。

| 範囲 | 状態 | 備考 |
|---|---|---|
| 旧REQ 50件 | retired | 2026-05-30 の再構成で active set から除外 |

## Migration Table

[mapping-table.md](mapping-table.md) は旧REQごとの移行判定を保持する。

| 判定 | 意味 |
|---|---|
| migrated | 新active REQへ要件内容を移行した |
| retired-no-successor | 最新方針では不要なため新active REQへ移行しない |
| historical-only | 当時の判断・経緯として残すが現行要件ではない |

## 基準構造

- active REQ: `docs/requirements/REQ-{NNNN}.md`
- retired REQ: `docs/requirements/retired/REQ-{NNNN}.md`
- retired REQ のIDは再利用しない
- 文書間に矛盾がある場合は active REQ を優先する
- `.sisyphus/` は現行REQ体系の管理対象に含めない
