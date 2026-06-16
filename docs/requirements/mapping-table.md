---
id: mapping-table
title: "旧REQから新active REQへの移行表"
created: "2026-05-30"
updated: "2026-06-16"
---

## 目的

REQ-0001〜REQ-0050 をすべて retired とし、REQ-0101〜REQ-0133（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は retired）を active set として再構成した結果を記録する。旧REQを削除せず履歴として残しつつ、現行要件判断の入口は25件（retired 8件を除く）である。

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
| REQ-0122 | retired-no-successor | なし | 実装完了（PR #743, commit 90064c2）により RFC2119 完全廃止の目的達成、自己矛盾解消のため retire（2026-06-15）。条項は他REQへの吸収なしで廃止。retired 文書は `retired/REQ-0122.md` を参照 |
| REQ-0116 | migrated | REQ-0101 | 文書分類ポリシー定義の恒久内容を REQ-0101 に吸収（REQ-0101-057: 分類ポリシー恒久内容のREQ-0101帰属、REQ-0101-058: 分類定義の一次所有先を REQ-0101 + document-model.md に統一）。文書分類ポリシー SPEC 配置先は document-model.md に正規化し、独立REQは不要と判断（agentdev-system-reorganization OU-04）。retired 文書は `retired/REQ-0116.md` を参照 |
| REQ-0118 | migrated | REQ-0119 | Subagent edit safety 制約を REQ-0119 に吸収（REQ-0119-027: edit safety 制約の REQ-0119/REQ-0103 吸収）。責務分界REQとして一元管理するため独立REQは不要と判断（agentdev-system-reorganization OU-04）。retired 文書は `retired/REQ-0118.md` を参照 |
| REQ-0120 | migrated | REQ-0103 | Runtime Command Authoring 制約（非必須参照除去）を REQ-0103 に吸収（REQ-0103-152: Runtime Command Authoring 制約の統合先）。独立REQは不要と判断（agentdev-system-reorganization OU-04）。retired 文書は `retired/REQ-0120.md` を参照 |
| REQ-0121 | migrated | REQ-0103, REQ-0108 | Runtime Command 規範語構成を REQ-0103 に吸収（REQ-0103-152）、Integrity 検査定義（規範語検査の責務境界違反検査への再定義・規範語残存前提の除去）を REQ-0108 に吸収（REQ-0108-242, REQ-0108-243）。語彙ポリシー整合は REQ-0103/REQ-0108/REQ-0119 で一貫管理するため独立REQは不要と判断（agentdev-system-reorganization OU-04）。retired 文書は `retired/REQ-0121.md` を参照 |
| REQ-0115 | migrated | REQ-0108, REQ-0109, REQ-0124 | 恒久要件を REQ-0108（docs-check 検査責務）、REQ-0109（inspect-docs）、REQ-0124（inspect 命名恒久制約）へ移行し retire（2026-06-16）。タイトル「docs-* command suite」が移行主題であり REQ-0124-021 に抵触。retired 文書は `retired/REQ-0115.md` を参照 |
| REQ-0117 | migrated | REQ-0110 | Git worktree junction cleanup フォールバック手順を REQ-0110 に統合（REQ-0110-008: Windows + junction 環境の "Not a directory" エラーフォールバック）。worktree 削除信頼性を一元管理するため独立REQは不要と判断（agentdev-system-reorganization OU-06）。retired 文書は `retired/REQ-0117.md` を参照 |

## Active Set

| 新REQ | 関心対象 |
|---|---|
| REQ-0101 | 文書・REQ管理基準 |
| REQ-0102 | 要件定義・保存 |
| REQ-0103 | Artifact責任分界 |
| REQ-0104 | Workflow / Command Protocol |
| REQ-0105 | RU lifecycle / Requirement Unit 管理 |
| REQ-0106 | Case実行オーケストレーション / Epic・Wave |
| REQ-0107 | Reporting / Writing Quality |
| REQ-0108 | Integrity / Validation / Tests |
| REQ-0109 | inspect-docs / REQ再構成運用 |
| REQ-0110 | Git worktree cleanup 信頼性 |
| REQ-0112 | ADRライフサイクル標準化・文書体系正規化・runtime独立性 |
| REQ-0113 | Skill References SPEC分離基準 |
| REQ-0114 | /agentdev/case-auto 最大自走モード |
| REQ-0119 | コマンド・スキル・サブエージェント責務分界の再基準化（新規、旧REQ移行なし） |
| REQ-0123 | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管（新規、旧REQ移行なし） |
| REQ-0124 | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle（新規、旧REQ移行なし） |
| REQ-0125 | inspect-skills / Command/Skill参照妥当性検出（新規、旧REQ移行なし） |
| REQ-0126 | inspect-promote / 検出finding分類・昇格（新規、旧REQ移行なし） |
| REQ-0127 | Intake command群 (capture / from-github / promote)（新規、REQ-0105 から分割） |
| REQ-0128 | Learning-promote（新規、REQ-0105 から分割） |
| REQ-0129 | Backlog-review（新規、REQ-0105 から分割） |
| REQ-0130 | case-run / 実装パイプライン（新規、REQ-0106 から分割） |
| REQ-0131 | case-close / 完了処理（新規、REQ-0106 から分割） |
| REQ-0132 | case-open / Issue作成（新規、REQ-0105 から分割） |
| REQ-0133 | case-update / Issue更新（新規、旧REQ移行なし） |
