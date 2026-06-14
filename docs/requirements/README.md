# Requirements Index

## Active Requirements

現在の要件判断では、以下22件（REQ-0111 は retired）を第一参照先とする。旧REQ 50件はすべて retired であり、履歴参照に限定する。

| REQ ID | タイトル | 関心対象 |
|---|---|---|
| [REQ-0101](REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](REQ-0102.md) | 要件定義・保存 | req-define / req-save / Requirement Source / 分類ゲート |
| [REQ-0103](REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / frontmatter 規約 / runtime-only 配布制約 / source-projection分離 / sync・migration / namespace予約 / SSOT化 / registry化 / consumer導入モデル / repo-local namespace・配布対象外制約 / .agentdev domain state / drafts配置 / sync除外 / consumer plugin checkout・install script分離 |
| [REQ-0104](REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close基本契約、upstream handoff protocol |
| [REQ-0105](REQ-0105.md) | Intake / Learning / Backlog | intake-promote（review統合）、learning-promote（refine統合）、backlog-review、RU lifecycle |
| [REQ-0106](REQ-0106.md) | Case実行・完了 | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](REQ-0108.md) | docs-check / Validation / Tests | 整合性検査、finding分類・route、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、baseline管理、rule catalog、REQ impact map、3層gate、meta-integrity、repo-local自己監査・配布対象外 |
| [REQ-0109](REQ-0109.md) | docs-review / REQ再構成運用 | retired archive、移行表、REQ再構成intake、REQ再構成レビューコマンド、100番台採番 |
| [REQ-0110](REQ-0110.md) | Git worktree 削除リトライ | git-worktree、リトライ、信頼性 |
| [REQ-0112](REQ-0112.md) | ADRライフサイクル標準化・文書体系正規化・runtime独立性 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、6状態否定、integrity検査追加、ADR全面改定例外・01XX baseline・retired移動 |
| [REQ-0113](REQ-0113.md) | Skill References SPEC分離基準 | skill / skill references 内 SPEC 相当記述の分離基準、移管先 SPEC 選択、runtime 自己完束制約 |
| [REQ-0114](REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件 |
| [REQ-0115](REQ-0115.md) | docs-* command suite 定義 | /repo/docs-check 改名、/agentdev/docs-review 新設、docs-review 統合、req-*/case-* workflow 補強、是正ルーティング |
| [REQ-0116](REQ-0116.md) | 文書分類ポリシー定義 | REQ/ADR/SPEC/Guide/Report/DOC-MAP/Retired 分類ルール・Document Authority Model・Classification Decision Tree・Cross-document Projection Rules・Re-baseline Rules・Synchronization Rules・Report分類・ADR定義拡張・SPEC責務境界 |
| [REQ-0117](REQ-0117.md) | Git worktree junction 削除フォールバック手順 | git-worktree、junction、Windows、フォールバック手順 |
| [REQ-0118](REQ-0118.md) | Subagent edit safety ガイドライン | subagent、edit safety、command-authoring、skill-authoring、パス参照 |
| [REQ-0119](REQ-0119.md) | コマンド・スキル・サブエージェント責務分界の再基準化 | command 薄型化 / skill 詳細移管 / sub-agent 委譲境界 / Step 整数化 / verbatim 条件付き / delegation_type SPEC降格 / ADR-0112 accepted化 |
| [REQ-0120](REQ-0120.md) | Runtime Command 非必須参照除去 | command / token 最適化 / 非必須参照節削除 / 高頻度 command 優先 |
| [REQ-0121](REQ-0121.md) | Runtime Command 規範語見直し + Integrity 検査再定義 | command / token 最適化 / 規範語 / 自然文置換 / integrity 検査再定義 / 語彙ポリシー整合 |
| [REQ-0122](REQ-0122.md) | 規範語ルールおよび記載の完全削除 | active REQ / SPEC / ADR / integrity / runtime / 語彙ポリシー |
| [REQ-0123](REQ-0123.md) | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管 | workflow-lifecycle 責務限定実装 / 4新規スキル移管 / Skill粒度基準 / DO NOT USE FOR整合 |

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
