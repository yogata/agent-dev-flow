# 現行の正規構造一覧

配布版が正とする .agentdev/ 配下の正規配置である。
個別プロジェクトの永続・非永続の境界記述と状態表は、適用先の .agentdev/README.md が担う（本ファイルとの役割分離）。移行は本一覧に従い、境界記述の更新は移行の結果報告で案内する。

## 永続配置

| 配置 | 役割 |
|---|---|
| `.agentdev/README.md` | 境界の正本（永続・非永続の境界と状態表） |
| `.agentdev/install-state.json` | 導入済み配布版の記録。install.ps1 apply 完了時に記録し、check が記録版と配布版の比較を行う |
| `.agentdev/drafts/` | 要件ドラフト。req-define が保存し、case-open / case-ready / case-revise で消費する |
| `.agentdev/backlog/` | バックログ集約領域（取込・学習・検査・要件単位・一気通貫実行の状態） |
| `backlog/intake/inbox/` | 取込待ち intake item |
| `backlog/intake/promoted/` | intake-promote workflow の採用 artifact |
| `backlog/learning/inbox/` | 未整理 learning entry |
| `backlog/learning/deferred/` | 分類済み learning entry の living pool |
| `backlog/learning/promoted/` | learning-promote workflow の採用 artifact |
| `backlog/learning/evaluation-report.md` | learning-promote workflow の評価レポート（毎回上書き） |
| `backlog/inspect/inbox/` | 未分類 inspect finding |
| `backlog/inspect/promoted/` | inspect-promote workflow の採用 artifact（auto-promote-log.md を含む） |
| `backlog/req-units/` | 要件単位（RU） |
| `backlog/runs/` | backlog-auto 一気通貫実行の状態記録（実行中の一式の set-state.json と evidence） |
| `.agentdev/project/` | 工程駆動の正規保存先（識別・テーマ・受領・課題・工程ゲート・変更・判断） |
| `project/README.md` | project 配下の様式と導出規律 |
| `project/identity.yaml` | 取組識別（project・target_version・current_phase） |
| `project/themes.md` | 検討テーマ正本（テーマ一覧はこのファイルから導出） |
| `project/issue-log.md` | 課題（未決事項と判断根拠） |
| `project/received/` | 受領済み途中検討知見（1受領1ファイル） |
| `project/phase-gates/` | 工程ゲート（遷移記録。1遷移1ファイル） |
| `project/change-log/` | 変更記録 |
| `project/decision-log/` | 判断記録（直接採用の採否記録。1採用1ファイル） |

## 非永続例外

| 配置 | 役割 |
|---|---|
| `.agentdev/integrity/reports/` | docs-check が保存する検証レポート。非永続・git管理対象外 |
