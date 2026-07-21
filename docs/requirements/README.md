# REQ インデックス

## 現行要件

<!-- AUTOGEN:BEGIN:id=req-active-count -->
現在の要件判断では、以下52件を第一参照先とする。
<!-- AUTOGEN:END -->
旧REQ 50件は2026-07-20に物理削除された。移行履歴は [mapping-table.md](mapping-table.md) を参照する。

各 REQ の詳細関心は各 REQ ファイル本文を参照のこと。
本表の「関心対象」列は核心契約の要約に留める。

<!-- AUTOGEN:BEGIN:id=req-active-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-0101](REQ-0101.md) | 文書・REQ管理基準 |
| [REQ-0102](REQ-0102.md) | 要件定義・保存 |
| [REQ-0103](REQ-0103.md) | アーティファクト責任分界 |
| [REQ-0104](REQ-0104.md) | ワークフロー・コマンドプロトコル |
| [REQ-0105](REQ-0105.md) | RU ライフサイクル・RU 管理 |
| [REQ-0106](REQ-0106.md) | Case実行オーケストレーション / Epic・Wave |
| [REQ-0107](REQ-0107.md) | 完了報告・文書品質 |
| [REQ-0108](REQ-0108.md) | docs-check / 検証・テスト |
| [REQ-0109](REQ-0109.md) | inspect-docs / REQ体系整合性 |
| [REQ-0110](REQ-0110.md) | Git worktree 削除の信頼性 |
| [REQ-0112](REQ-0112.md) | ADRライフサイクル・文書体系基盤・実行時独立性 |
| [REQ-0113](REQ-0113.md) | Skill References SPEC分離 |
| [REQ-0114](REQ-0114.md) | /agentdev/case-auto 最大自走モード |
| [REQ-0119](REQ-0119.md) | コマンド・スキル・サブエージェント責務分界 |
| [REQ-0123](REQ-0123.md) | workflow-lifecycle 宣言的定義責務とコマンド固有手順のスキル分担 |
| [REQ-0124](REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle |
| [REQ-0125](REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 |
| [REQ-0126](REQ-0126.md) | inspect-promote / 検出事項分類・昇格 |
| [REQ-0127](REQ-0127.md) | Intake command群 (capture / from-github / promote) |
| [REQ-0128](REQ-0128.md) | Learning-promote |
| [REQ-0129](REQ-0129.md) | Backlog-review |
| [REQ-0130](REQ-0130.md) | case-run / 実装パイプライン |
| [REQ-0131](REQ-0131.md) | case-close / 完了処理 |
| [REQ-0132](REQ-0132.md) | case-open / Issue作成 |
| [REQ-0133](REQ-0133.md) | case-update / Issue更新 |
| [REQ-0134](REQ-0134.md) | 配布基盤: 原本/配置先・同期・リポジトリ種別・導入先インストール |
| [REQ-0135](REQ-0135.md) | Drafts配置・Draft Type Registry |
| [REQ-0136](REQ-0136.md) | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設・req-define 強化） |
| [REQ-0137](REQ-0137.md) | 並列実行安全 git 操作規律（共有作業ツリーでの case-auto 並行実行支援） |
| [REQ-0138](REQ-0138.md) | 構造化req_draft契約 |
| [REQ-0139](REQ-0139.md) | 外部エージェント統合契約 |
| [REQ-0140](REQ-0140.md) | 文書品質ゲート |
| [REQ-0141](REQ-0141.md) | ローカル版 OpenCode 導入方式とローカルCaseファイル運用 |
| [REQ-0142](REQ-0142.md) | 配布物ID除去後の文意保持・構文健全性・責務整合 |
| [REQ-0143](REQ-0143.md) | Command 定義ファイルフォーマット標準化 |
| [REQ-0144](REQ-0144.md) | docs-check/integrity 運用是正 |
| [REQ-0145](REQ-0145.md) | docs-check/integrity 検出設計改善 |
| [REQ-0146](REQ-0146.md) | 実行契約・委譲・プロセス設計 |
| [REQ-0147](REQ-0147.md) | 文書化規律・HITL境界 |
| [REQ-0148](REQ-0148.md) | RU群バッチ処理と複数 execution_unit 並列実行 |
| [REQ-0149](REQ-0149.md) | `agentdev-gh-cli` 手続き委譲基盤 |
| [REQ-0150](REQ-0150.md) | ローカル版 `agentdev-gh-cli` 実装 |
| [REQ-0151](REQ-0151.md) | コンフリクト解消モデルと実行時間観測 |
| [REQ-0152](REQ-0152.md) | gh 直接記述機械検出（IR-053） |
| [REQ-0153](REQ-0153.md) | 機械横断是正の完了証明 |
| [REQ-0154](REQ-0154.md) | SPEC status 追跡と draft 放置検出 |
| [REQ-0155](REQ-0155.md) | 文書粒度モデル |
| [REQ-0156](REQ-0156.md) | docs/specs 基盤SPECドメイン別体系化 |
| [REQ-0159](REQ-0159.md) | 配布物依存スキルの src 昇格方針と未トラックスキル検出 |
| [REQ-0160](REQ-0160.md) | Project Extensions 機構と配布物参照境界 |
| [REQ-0162](REQ-0162.md) | 配布物の harness 実行制御分離 |
| [REQ-0163](REQ-0163.md) | subagent 委譲プロトコル要件（category 選定、MUST NOT DO） |
<!-- AUTOGEN:END -->

旧REQ（REQ-0001〜REQ-0050、REQ-0111〜REQ-0121 の一部）は2026-07-20に物理削除された。移行履歴は [mapping-table.md](mapping-table.md) を参照。

## 廃止済み要件

<!-- AUTOGEN:BEGIN:id=req-retired-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-0158](retired/REQ-0158.md) | Targeted Docs Integrity Guard |
| [REQ-0161](retired/REQ-0161.md) | config.yaml および旧 doc-inputs 機構定義の完全削除 |
<!-- AUTOGEN:END -->

## 移行表

[mapping-table.md](mapping-table.md) は旧REQごとの移行判定を保持する。

| 判定 | 意味 |
|---|---|
| migrated | 新たな現行 REQ へ要件内容を移行した |
| retired-no-successor | 最新方針では不要なため新たな現行 REQ へ移行しない |
| historical-only | 当時の判断、経緯として残すが現行要件ではない |

## 基準構造

- 現行 REQ: `docs/requirements/REQ-{NNNN}.md`
- 廃止済み REQ のIDは再利用しない
- 文書間に矛盾がある場合は現行 REQ を優先する
