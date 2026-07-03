# REQ インデックス

## 現行要件

現在の要件判断では、以下51件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止）を第一参照先とする。
旧REQ 50件はすべて廃止済みであり、履歴参照に限定する。

各 REQ の詳細関心は各 REQ ファイル本文を参照のこと。
本表の「関心対象」列は核心契約の要約に留める。

| REQ ID | タイトル | 関心対象 |
|---|---|---|
| [REQ-0101](REQ-0101.md) | 文書、REQ管理基準 | 文書種別の基準境界と ADR 記述対象 |
| [REQ-0102](REQ-0102.md) | 要件定義、保存 | req-define、req-save、分類ゲート |
| [REQ-0103](REQ-0103.md) | Artifact責任分界 | command/skill/template/script の責務境界 |
| [REQ-0104](REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type/scale 分類、SSoT |
| [REQ-0105](REQ-0105.md) | RU lifecycle / Requirement Unit 管理 | RU lifecycle と RU メタデータ |
| [REQ-0106](REQ-0106.md) | Case実行オーケストレーション / Epic、Wave | Epic/Wave 並列実行と子Issue 状態整合 |
| [REQ-0107](REQ-0107.md) | Reporting / Writing Quality | 完了報告と自然言語成果物品質 |
| [REQ-0108](REQ-0108.md) | docs-check / Validation / Tests | 整合性検査と検出事項ライフサイクル |
| [REQ-0109](REQ-0109.md) | inspect-docs / REQ体系整合性 | retired archive と REQ 再構成運用 |
| [REQ-0110](REQ-0110.md) | Git worktree cleanup 信頼性 | git worktree cleanup 信頼性 |
| [REQ-0112](REQ-0112.md) | ADRライフサイクル、文書体系基盤、実行時独立性 | ADR lifecycle 基盤と文書体系正規化 |
| [REQ-0113](REQ-0113.md) | Skill References SPEC分離 | skill references の SPEC 分離基準 |
| [REQ-0114](REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto 最大自走と複数 execution_unit |
| [REQ-0119](REQ-0119.md) | コマンド、スキル、サブエージェント責務分界 | command/skill/サブエージェント責務分界 |
| [REQ-0123](REQ-0123.md) | workflow-lifecycle 宣言的定義責務とコマンド固有手順のスキル分担 | workflow-lifecycle 宣言的責務とスキル移管 |
| [REQ-0124](REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | inspect-* コマンド群と lifecycle |
| [REQ-0125](REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 | inspect-skills 参照妥当性検出 |
| [REQ-0126](REQ-0126.md) | inspect-promote / 検出事項分類、昇格 | inspect 検出事項の分類、昇格 |
| [REQ-0127](REQ-0127.md) | Intake command群 (capture / from-github / promote) | intake コマンド群とドメイン状態 |
| [REQ-0128](REQ-0128.md) | Learning-promote | learning-promote と 8-axis 評価 |
| [REQ-0129](REQ-0129.md) | Backlog-review | backlog-review と RU 生成 |
| [REQ-0130](REQ-0130.md) | case-run / 実装パイプライン | case-run 実装パイプラインと QG-3 |
| [REQ-0131](REQ-0131.md) | case-close / 完了処理 | case-close 完了処理と branch cleanup |
| [REQ-0132](REQ-0132.md) | case-open / Issue作成 | case-open Issue 作成と flow routing |
| [REQ-0133](REQ-0133.md) | case-update / Issue更新 | case-update Issue/REQ 更新 |
| [REQ-0134](REQ-0134.md) | 配布基盤: source/projection、sync、repo type、consumer install | 配布基盤の source/projection と consumer install |
| [REQ-0135](REQ-0135.md) | Drafts配置、Draft Type Registry | drafts 配置と type registry |
| [REQ-0136](REQ-0136.md) | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設、req-define 強化） | spec-save 新設と REQ/SPEC 責務分離 |
| [REQ-0137](REQ-0137.md) | 並列実行安全 git 操作規律 | 並列実行安全 git 操作規律 |
| [REQ-0138](REQ-0138.md) | 構造化req_draft契約 | 構造化 req_draft 契約 |
| [REQ-0139](REQ-0139.md) | 外部エージェント統合契約 | 外部エージェント統合契約 |
| [REQ-0140](REQ-0140.md) | 文書品質ゲート | 文書品質ゲートと SSoT 分割 |
| [REQ-0141](REQ-0141.md) | ローカル版 OpenCode 導入方式とローカルCaseファイル運用 | link mode と Case ファイル運用 |
| [REQ-0142](REQ-0142.md) | 配布物ID除去後の文意保持、構文健全性、責務整合 | 配布物 ID 除去後の品質保持 |
| [REQ-0143](REQ-0143.md) | Command 定義ファイルフォーマット標準化 | command 定義ファイルフォーマット標準 |
| [REQ-0144](REQ-0144.md) | docs-check/integrity 運用是正 | docs-check/integrity 運用是正の完了条件 |
| [REQ-0145](REQ-0145.md) | docs-check/integrity 検出設計改善 | docs-check/integrity 検出設計改善 |
| [REQ-0146](REQ-0146.md) | 実行契約、委譲、プロセス設計 | 実行契約、委譲、プロセス設計 |
| [REQ-0147](REQ-0147.md) | 文書化規律、HITL境界 | 文書化規律と HITL 境界 |
| [REQ-0148](REQ-0148.md) | RU群バッチ処理と複数 execution_unit 並列実行 | RU 群バッチと複数 execution_unit 並列 |
| [REQ-0149](REQ-0149.md) | `agentdev-gh-cli` 手続き委譲基盤 | gh-cli 手続き委譲基盤と I/O 責務分離 |
| [REQ-0150](REQ-0150.md) | ローカル版 `agentdev-gh-cli` 実装 | ローカル版 `agentdev-gh-cli` と Case ファイル差し替え |
| [REQ-0151](REQ-0151.md) | コンフリクト解消モデルと実行時間観測 | 3レベルコンフリクト解消モデルと工程別タイムスタンプ計測 |
| [REQ-0152](REQ-0152.md) | gh 直接記述機械検出（IR-053） | gh CLI 直接呼出しの機械検出ルール（IR-053）と inspect-skills 診断観点との協調 |
| [REQ-0153](REQ-0153.md) | 機械横断是正の完了証明 | 機械横断是正 PR の再 grep 0 件証拠の完了条件化と PR 本文記載 |
| [REQ-0154](REQ-0154.md) | SPEC status 追跡と draft 放置検出 | SPEC status 単一情報源化と draft 放置機械検出 |
| [REQ-0155](REQ-0155.md) | 文書粒度モデル | SPEC内部5論理区分、文書7分類モデル、粒度ゲート2点必須化、局所物理分離許容 |
| [REQ-0156](REQ-0156.md) | docs/specs 基盤SPECドメイン別体系化 | docs/specs 直下基盤SPECの6ドメイン分類と段階移送方針 |
| [REQ-0157](REQ-0157.md) | Project Doc Inputs Migration | 配布コードの docs/specs/** 直接参照を doc-inputs 経由に移行 |
| [REQ-0158](REQ-0158.md) | Targeted Docs Integrity Guard | 変更ファイル限定文書整合性ガードと旧パス検出機構 |
| [REQ-0159](REQ-0159.md) | 配布物依存スキルの src 昇格方針と未トラックスキル検出 | 配布物依存スキルの src 昇格、repo-local 境界、docs-check 未トラック検出 |

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
- `.sisyphus/` は現行REQ体系の管理対象に含めない
