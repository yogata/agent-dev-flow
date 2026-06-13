---
id: mapping-table
title: "旧REQから新active REQへの移行表"
created: "2026-05-30"
updated: "2026-05-30"
---

## 目的

REQ-0001〜REQ-0050 をすべて retired とし、REQ-0101〜REQ-0116 を active set として再構成した結果を記録する。旧REQを削除せず履歴として残しつつ、現行要件判断の入口を16件に限定する。

## 判定

| 判定 | 意味 |
|---|---|
| migrated | 新active REQへ要件内容を移行した |
| retired-no-successor | 最新方針では不要なため新active REQへ移行しない |
| historical-only | 当時の判断・経緯として残すが現行要件ではない |

## 対応表

| 旧REQ | 判定 | 移行先 | 非移行理由 / 備考 |
|---|---|---|---|
| REQ-0001 | migrated | REQ-0104 | ワークフローアーキテクチャをWorkflow / Command Protocolへ移行 |
| REQ-0002 | migrated | REQ-0102, REQ-0104 | 要件定義操作とcommand protocolへ分割移行 |
| REQ-0003 | migrated | REQ-0106 | 並列実行をCase実行・完了へ移行 |
| REQ-0004 | migrated | REQ-0101 | 文書・REQ管理基準へ移行 |
| REQ-0005 | migrated | REQ-0104, REQ-0106 | Epic管理をworkflowとcase実行へ移行 |
| REQ-0006 | retired-no-successor | なし | `.sisyphus/` 非関与方針により移行しない |
| REQ-0007 | migrated | REQ-0105 | learning pipelineをIntake / Learning / Backlogへ移行 |
| REQ-0008 | migrated | REQ-0103 | skill品質基準をArtifact責任分界へ移行 |
| REQ-0009 | migrated | REQ-0103 | template規約をArtifact責任分界へ移行 |
| REQ-0010 | migrated | REQ-0104 | command実装改善方針をworkflowへ移行 |
| REQ-0011 | migrated | REQ-0107 | Issue/PR本文品質検証をReporting / Writing Qualityへ移行 |
| REQ-0012 | migrated | REQ-0107 | AI-slop品質基準をReporting / Writing Qualityへ移行 |
| REQ-0013 | migrated | REQ-0105 | intake承認フローをintake lifecycleへ移行 |
| REQ-0014 | migrated | REQ-0106 | case-run自律修正ループをCase実行・完了へ移行 |
| REQ-0015 | migrated | REQ-0106 | 関連ドキュメントの達成対象化をCase実行・完了へ移行 |
| REQ-0016 | migrated | REQ-0103 | artifact責任分界へ移行 |
| REQ-0017 | migrated | REQ-0103, REQ-0105 | namespaceとdomain stateを分割移行 |
| REQ-0018 | migrated | REQ-0102 | 未決分岐解消を要件定義へ移行 |
| REQ-0019 | migrated | REQ-0105 | intake / learning責任境界を移行 |
| REQ-0020 | migrated | REQ-0104, REQ-0106 | Epic実行順序SSoTをworkflowとcase実行へ移行 |
| REQ-0021 | migrated | REQ-0103, REQ-0108 | guardrail script方針をartifact責任分界とintegrityへ移行 |
| REQ-0022 | migrated | REQ-0108 | domain state git永続化をintegrityへ移行 |
| REQ-0023 | migrated | REQ-0105 | learning staging管理をlearning/RU lifecycleへ移行 |
| REQ-0024 | migrated | REQ-0107 | 完了報告フォーマットを移行 |
| REQ-0025 | migrated | REQ-0108 | intake domain state git永続化をintegrityへ移行 |
| REQ-0026 | migrated | REQ-0105 | intake lifecycleを移行 |
| REQ-0027 | migrated | REQ-0105 | learning artifact lifecycleを移行 |
| REQ-0028 | migrated | REQ-0101 | documentation granularityを文書基準へ移行 |
| REQ-0029 | migrated | REQ-0105 | intake-open一括処理の現行化分をreq-backlog lifecycleへ移行 |
| REQ-0030 | migrated | REQ-0108 | command群テスト体系を移行 |
| REQ-0031 | migrated | REQ-0107 | GitHubリンク正規化を移行 |
| REQ-0032 | migrated | REQ-0106 | case-close未チェック項目判定を移行 |
| REQ-0033 | migrated | REQ-0108 | 二次整合性是正をintegrityへ移行 |
| REQ-0034 | migrated | REQ-0102 | 関連ドキュメント更新候補抽出を要件定義へ移行 |
| REQ-0035 | migrated | REQ-0101 | DOC-MAP導入とviews廃止を文書基準へ移行 |
| REQ-0036 | migrated | REQ-0107 | no-ai-slop skill方針を文章品質へ移行 |
| REQ-0037 | migrated | REQ-0106 | worktree削除対策をcase完了へ移行 |
| REQ-0038 | migrated | REQ-0106 | case実行信頼性を移行 |
| REQ-0039 | migrated | REQ-0105 | req-backlog / RU pipelineを移行 |
| REQ-0040 | migrated | REQ-0106 | Findings / Intake候補回収を移行 |
| REQ-0041 | migrated | REQ-0101, REQ-0109 | 再基準化方針を文書基準とREQ再構成運用へ移行 |
| REQ-0042 | migrated | REQ-0101 | 文書基準境界を移行 |
| REQ-0043 | migrated | REQ-0102 | req-define / req-saveを移行 |
| REQ-0044 | migrated | REQ-0103 | artifact責任分界を移行 |
| REQ-0045 | migrated | REQ-0104 | command protocolを移行 |
| REQ-0046 | migrated | REQ-0105 | intake / learning / RU lifecycleを移行 |
| REQ-0047 | migrated | REQ-0106 | case-run / case-closeを移行 |
| REQ-0048 | migrated | REQ-0107 | reporting / writing qualityを移行 |
| REQ-0049 | migrated | REQ-0108 | integrity / validation / testsを移行 |
| REQ-0050 | migrated | REQ-0105, REQ-0109 | REQ再構成intake保存導線を移行 |
| REQ-0111 | retired-no-successor | なし | REQ-0119-025 により retire（2026-06-14）。条項は他REQへの吸収なしで廃止。REQ-0119 の破壊的再基準化が REQ-0111 の中核原則（既存Step変更禁止）と矛盾したため。retired 文書は `retired/REQ-0111.md` を参照 |

## Active Set

| 新REQ | 関心対象 |
|---|---|
| REQ-0101 | 文書・REQ管理基準 |
| REQ-0102 | 要件定義・保存 |
| REQ-0103 | Artifact責任分界 |
| REQ-0104 | Workflow / Command Protocol |
| REQ-0105 | Intake / Learning / Backlog |
| REQ-0106 | Case実行・完了 |
| REQ-0107 | Reporting / Writing Quality |
| REQ-0108 | Integrity / Validation / Tests |
| REQ-0109 | REQ再構成運用 |
| REQ-0110 | Git worktree 削除リトライ |
| REQ-0111 | Command authoring 後方互換性維持原則 |
| REQ-0112 | ADRライフサイクル・文書責務・runtime独立性・状態モデル統合是正 |
| REQ-0113 | Skill References SPEC分離基準 |
| REQ-0114 | /agentdev/case-auto 最大自走モード |
| REQ-0115 | docs-* command suite 定義（新規、旧REQ移行なし） |
| REQ-0116 | 文書分類ポリシー定義（新規、旧REQ移行なし） |
