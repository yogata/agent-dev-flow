# REQ インデックス

## 現行要件

<!-- AUTOGEN:BEGIN:id=req-active-count -->
現在の要件判断では、以下54件を第一参照先とする。
<!-- AUTOGEN:END -->
旧REQ 50件はすべて廃止済みであり、履歴参照に限定する。

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
| [REQ-0158](REQ-0158.md) | Targeted Docs Integrity Guard |
| [REQ-0159](REQ-0159.md) | 配布物依存スキルの src 昇格方針と未トラックスキル検出 |
| [REQ-0160](REQ-0160.md) | Project Extensions 機構と配布物参照境界 |
| [REQ-0161](REQ-0161.md) | config.yaml および旧 doc-inputs 機構定義の完全削除 |
| [REQ-0162](REQ-0162.md) | 配布物の harness 実行制御分離 |
| [REQ-0163](REQ-0163.md) | subagent 委譲プロトコル要件（category 選定、MUST NOT DO） |
<!-- AUTOGEN:END -->

## 廃止済み要件

旧REQは削除せず、[retired/](retired/) に移動した。
廃止済み REQ は履歴、根拠の参照用であり、現行要件判断に使わない。

| 範囲 | 状態 | 備考 |
|---|---|---|
| 旧REQ 50件 | 廃止済み | 2026-05-30 の再構成で現行セットから除外 |
| REQ-0111 | 廃止済み | REQ-0119-025 により廃止（2026-06-14）。条項は他REQへの吸収なしで廃止 |
| REQ-0122 | 廃止済み | RFC2119 完全廃止の目的達成（PR #743）により廃止（2026-06-15）。条項は他REQへの吸収なしで廃止 |
| REQ-0116 | 移行→廃止済み | 文書分類ポリシー定義の恒久内容を REQ-0101 に吸収（REQ-0101-057/058）。OU-04 再編成で廃止（2026-06-16）。`retired/REQ-0116.md` 参照 |
| REQ-0118 | 移行→廃止済み | サブエージェント編集安全制約を REQ-0119 に吸収（REQ-0119-027）。OU-04 再編成で廃止（2026-06-16）。`retired/REQ-0118.md` 参照 |
| REQ-0120 | 移行→廃止済み | 実行時コマンドの非必須参照除去を REQ-0103 に吸収（REQ-0103-152）。OU-04 再編成で廃止（2026-06-16）。`retired/REQ-0120.md` 参照 |
| REQ-0121 | 移行→廃止済み | 実行時コマンド規範語を REQ-0103（REQ-0103-152）、整合性検査を REQ-0108（REQ-0108-242/243）に吸収。OU-04 再編成で廃止（2026-06-16）。`retired/REQ-0121.md` 参照 |
| REQ-0115 | 移行→廃止済み | docs-* command suite の恒久要件を REQ-0108（docs-check 検査責務）、REQ-0109（inspect-docs）、REQ-0124（inspect 命名恒久制約）へ移行。タイトルが移行主題であり REQ-0124-021 に抵触。OU-05 再編成で廃止（2026-06-16）。`retired/REQ-0115.md` 参照 |
| REQ-0117 | 移行→廃止済み | Git worktree ジャンクション cleanup フォールバック手順を REQ-0110 に統合（REQ-0110-008）。OU-06 再編成で廃止（2026-06-16）。`retired/REQ-0117.md` 参照 |

<!-- AUTOGEN:BEGIN:id=req-retired-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-0001](retired/REQ-0001.md) | AgentDevFlow ワークフローアーキテクチャ |
| [REQ-0002](retired/REQ-0002.md) | AgentDevFlow コマンドプロトコル |
| [REQ-0003](retired/REQ-0003.md) | Case 並列実行 |
| [REQ-0004](retired/REQ-0004.md) | 要件・ADRドキュメントシステム |
| [REQ-0005](retired/REQ-0005.md) | Epic Issue 管理 |
| [REQ-0006](retired/REQ-0006.md) | Sisyphus プラン基盤 |
| [REQ-0007](retired/REQ-0007.md) | ナレッジパイプライン高度化 |
| [REQ-0008](retired/REQ-0008.md) | スキル品質フレームワーク |
| [REQ-0009](retired/REQ-0009.md) | テンプレートシステム |
| [REQ-0010](retired/REQ-0010.md) | AgentDevFlow Command実装改善：安全性・品質・状態管理 |
| [REQ-0011](retired/REQ-0011.md) | Issue/PR書き込み後の内容品質自動検証 |
| [REQ-0012](retired/REQ-0012.md) | AI-slop 執筆品質基準 |
| [REQ-0013](retired/REQ-0013.md) | intake 承認フロー分割と解消済み確認機能 |
| [REQ-0014](retired/REQ-0014.md) | case-run 自律修正ループと責務分離の明確化 |
| [REQ-0015](retired/REQ-0015.md) | 関連ドキュメントの要件達成対象化 |
| [REQ-0016](retired/REQ-0016.md) | Command/Skill/Template/Script責任分界とlearning要件ソース化 |
| [REQ-0017](retired/REQ-0017.md) | AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化 |
| [REQ-0018](retired/REQ-0018.md) | agentdev-req-analysis 未決分岐解消メソドロジー |
| [REQ-0019](retired/REQ-0019.md) | intake / learning の責任境界明確化と workflow 組み込み |
| [REQ-0020](retired/REQ-0020.md) | Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化 |
| [REQ-0021](retired/REQ-0021.md) | AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針 |
| [REQ-0022](retired/REQ-0022.md) | .agentdev domain state 更新後の git 永続化 |
| [REQ-0023](retired/REQ-0023.md) | learning staging stub の取り込み追跡と取り込み後アーカイブ |
| [REQ-0024](retired/REQ-0024.md) | 全 agentdev コマンドの完了報告フォーマット統一 |
| [REQ-0025](retired/REQ-0025.md) | intake 系コマンドの .agentdev/intake 更新後の git 永続化 |
| [REQ-0026](retired/REQ-0026.md) | intake lifecycle の queue/archive 再定義 |
| [REQ-0027](retired/REQ-0027.md) | learning artifact lifecycle の責任範囲明確化 |
| [REQ-0028](retired/REQ-0028.md) | Documentation granularity and responsibility restructuring |
| [REQ-0029](retired/REQ-0029.md) | intake-open promoted artifact 一括処理 |
| [REQ-0030](retired/REQ-0030.md) | agentdev コマンド群の体系的テスト実装 |
| [REQ-0031](retired/REQ-0031.md) | GitHub本文内リポジトリ参照リンクの正規化 |
| [REQ-0032](retired/REQ-0032.md) | case-close 未チェック項目達成判定 |
| [REQ-0033](retired/REQ-0033.md) | AgentDevFlow command / skill 定義の二次整合性是正 |
| [REQ-0034](retired/REQ-0034.md) | req-define 関連ドキュメント更新候補抽出と後続工程への伝播 |
| [REQ-0035](retired/REQ-0035.md) | DOC-MAP導入と requirements/views 廃止による文書探索・維持管理再設計 |
| [REQ-0036](retired/REQ-0036.md) | agentdev-no-ai-slop-writing Skill 追加 |
| [REQ-0037](retired/REQ-0037.md) | worktree 削除時の残存ファイル対策強化 |
| [REQ-0038](retired/REQ-0038.md) | case実行信頼性向上（チェックボックス確認・pull前チェック・docs整合性grep） |
| [REQ-0039](retired/REQ-0039.md) | req-backlog コマンドと Requirement Unit パイプライン |
| [REQ-0040](retired/REQ-0040.md) | 子Issue PRに Findings / Intake候補を永続化し、case-closeで回収する |
| [REQ-0041](retired/REQ-0041.md) | REQ体系再基準化：旧REQ分類・新基準REQ群・分類ゲート |
| [REQ-0042](retired/REQ-0042.md) | REQ/ADR/SPEC/DOC-MAP 基準構造 |
| [REQ-0043](retired/REQ-0043.md) | req-define / req-save / REQ分類ゲート |
| [REQ-0044](retired/REQ-0044.md) | Command / Skill / Template / Script 責任分界 |
| [REQ-0045](retired/REQ-0045.md) | AgentDevFlow command protocol |
| [REQ-0046](retired/REQ-0046.md) | intake / learning / req-backlog / RU lifecycle |
| [REQ-0047](retired/REQ-0047.md) | case-run / case-close / post-run capture |
| [REQ-0048](retired/REQ-0048.md) | reporting / GitHub body / link / writing quality |
| [REQ-0049](retired/REQ-0049.md) | integrity / validation / tests |
| [REQ-0050](retired/REQ-0050.md) | REQ再構成intakeの分離保存と回収導線 |
| [REQ-0111](retired/REQ-0111.md) | Command authoring 後方互換性維持原則 |
| [REQ-0115](retired/REQ-0115.md) | docs-* command suite 構成 |
| [REQ-0116](retired/REQ-0116.md) | 文書分類ポリシー |
| [REQ-0117](retired/REQ-0117.md) | Git worktree junction cleanup フォールバック |
| [REQ-0118](retired/REQ-0118.md) | Subagent edit safety ガイドライン |
| [REQ-0120](retired/REQ-0120.md) | Runtime Command 最小参照構成 |
| [REQ-0121](retired/REQ-0121.md) | Runtime Command 規範語構成と Integrity 検査定義 |
| [REQ-0122](retired/REQ-0122.md) | RFC2119 ルールおよび記載の完全削除 |
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
- 廃止済み REQ: `docs/requirements/retired/REQ-{NNNN}.md`
- 廃止済み REQ のIDは再利用しない
- 文書間に矛盾がある場合は現行 REQ を優先する
