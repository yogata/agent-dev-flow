# REQ インデックス

## 現行要件

現在の要件判断では、以下40件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止）を第一参照先とする。旧REQ 50件はすべて廃止済みであり、履歴参照に限定する。

| REQ ID | タイトル | 関心対象 |
|---|---|---|
| [REQ-0101](REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界、ADR記述対象境界（意思決定のみ・作業手段除外・既存ADR重複確認） |
| [REQ-0102](REQ-0102.md) | 要件定義・保存 | req-define / req-save / 分類ゲート / 引数なし実行時入力優先順位 / auto_gate完了ゲート |
| [REQ-0103](REQ-0103.md) | Artifact責任分界 | command / skill / template / script の責務境界、namespace、frontmatter 規約、実行時専用配布制約、repo-local namespace・配布対象外制約、Skill 粒度・参照妥当性 |
| [REQ-0104](REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close基本契約、case-open共通終了の全フロー共通化、前工程からの引き継ぎプロトコル |
| [REQ-0105](REQ-0105.md) | RU lifecycle / Requirement Unit 管理 | RU lifecycle（生成・削除タイミング・一時成果物位置づけ）、セッション由来 RU、RU frontmatter メタデータ、promoted/ の RU 化対象統一 |
| [REQ-0106](REQ-0106.md) | Case実行オーケストレーション / Epic・Wave | Epic/Wave 並列実行、親Issue SSoT・子Issue実行状態整合、Wave rebase・コンフリクト時停止、委譲プロンプト事後検証、子Issue 実行状態ライフサイクル・skipped除外・Wave status導出 |
| [REQ-0107](REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、自然言語成果物品質（japanese-tech-writing準拠） |
| [REQ-0108](REQ-0108.md) | docs-check / Validation / Tests | 整合性検査、検出事項の分類・ルーティング、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、基準管理、ルールカタログ、REQ impact map、3層gate、meta-integrity、repo-local自己監査・配布対象外、ADR主題妥当性検出 |
| [REQ-0109](REQ-0109.md) | inspect-docs / REQ体系整合性 | retired archive、移行表、REQ再構成intake、REQ再構成レビューコマンド、100番台採番 |
| [REQ-0110](REQ-0110.md) | Git worktree cleanup 信頼性 | git-worktree、リトライ、cleanup、prune フォールバック、tracked files 復元、Windows + junction フォールバック |
| [REQ-0112](REQ-0112.md) | ADRライフサイクル・文書体系基盤・実行時独立性 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、6状態否定、integrity検査追加、ADR全面改定例外・01XX baseline・retired移動 |
| [REQ-0113](REQ-0113.md) | Skill References SPEC分離 | skill / skill references 内 SPEC 相当記述の分離基準、移管先 SPEC 選択、実行時自己完束制約 |
| [REQ-0114](REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件、Epic flowクリーンアップ検証ゲート、Standard flow複数draft一括処理、Issue番号/URL入力case-run移行、独立OU並列委譲・自動Epic化 |
| [REQ-0119](REQ-0119.md) | コマンド・スキル・サブエージェント責務分界 | command 薄型化 / skill 詳細移管 / サブエージェント委譲境界 / Step 整数化 / verbatim 条件付き / delegation_type SPEC降格 / ADR-0112 承認済み化 |
| [REQ-0123](REQ-0123.md) | workflow-lifecycle 宣言的定義責務とコマンド固有手順のスキル分担 | workflow-lifecycle 責務限定実装 / 4新規スキル移管 / Skill粒度基準 / DO NOT USE FOR整合 |
| [REQ-0124](REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | inspect-docs/skills/promote 命名統一、diagnostics→inspect 全面改名完了状態、draft type 単一化、inspect ドメイン状態、inspect 命名恒久制約 |
| [REQ-0125](REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 | Command→Skill参照妥当性、Skill構造、read-only診断、finding出力、推奨route提示 |
| [REQ-0126](REQ-0126.md) | inspect-promote / 検出事項分類・昇格 | inspect 検出事項分類（promote/defer/reject）、HITL 承認、採用済み成果物生成 |
| [REQ-0127](REQ-0127.md) | Intake command群 (capture / from-github / promote) | intake-capture / intake-from-github / intake-promote、`.agentdev/intake/` ドメイン状態、accepted/ 不使用、intake/learning capture 責務境界、REQ再構成intake ルーティング分離 |
| [REQ-0128](REQ-0128.md) | Learning-promote | learning-promote、`.agentdev/learning/` ドメイン状態、8-axis 評価、HITL 確定、promote/defer/reject/duplicate 判定 |
| [REQ-0129](REQ-0129.md) | Backlog-review | backlog-review、RU 直接生成、採用済み成果物の読込・統合・矛盾検出、depends_on（RU-ID限定・循環依存検証）、REQ再構成intake ルーティング分離 |
| [REQ-0130](REQ-0130.md) | case-run / 実装パイプライン | case-run、作業用 worktree 実装、PR 作成、QG-3（PR作成直前ゲート）、本筋外 検出事項のPR本文記録、capture 責務境界（inbox 非変更・PR本文経由引き継ぎ） |
| [REQ-0131](REQ-0131.md) | case-close / 完了処理 | case-close、完了ゲート、PR merge（squash・リトライ・フォールバック）、Issue close、capture 回収（PR本文→ドメイン状態）、branch/worktree cleanup、ローカル変更検出時の安全停止、force-with-lease制約 |
| [REQ-0132](REQ-0132.md) | case-open / Issue作成 | case-open、Issue本文生成（REQ番号埋め込み）、Standard/Epic flow ルーティング、連結成分ベース複数Standard/Epic構成生成・3軸判断・単独根Standard flow、RU削除責務（Issue作成+VERIFY成功後）、capture 非関与 |
| [REQ-0133](REQ-0133.md) | case-update / Issue更新 | case-update、Issue本文更新（テンプレート構造維持）、コメント追加、REQ ファイル更新（直接commit+push）、レビューNG対応、フェーズ維持 |
| [REQ-0134](REQ-0134.md) | 配布基盤: source/projection・sync・repo type・consumer install | source/projection layout、sync/migration script、repo type、consumer install |
| [REQ-0135](REQ-0135.md) | Drafts配置・Draft Type Registry | `.agentdev/drafts/` 配置ルール、draft type registry、`.sisyphus/` 除外 |
| [REQ-0136](REQ-0136.md) | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設・req-define 強化） | spec-save 新設、req-define SPEC分離強化、case-* SPEC確定フロー、inspect-promote 自動promote、REQ健全性メトリクス |
| [REQ-0137](REQ-0137.md) | 並列実行安全 git 操作規律 | 並列実行安全 git 操作規律、スイープ操作禁止、明示パスステージ&コミット、消費アーティファクト(draft/RU)削除信頼性・Form Zero解消・削除検証 Standard/Epic 全flow適用 |
| [REQ-0138](REQ-0138.md) | 構造化req_draft契約 | コマンド間引き継ぎ draft 契約、soft-contract原則、artifact_actions構造、LLM推論消費 |
| [REQ-0139](REQ-0139.md) | 外部エージェント統合契約 | 外部エージェント統合、case-run外部実行委譲、driver adapter契約、req-define分類結果アクション |
| [REQ-0140](REQ-0140.md) | 文書品質ゲート | 文書種別責務・要件性・文意品質・粒度の査読、執筆規範（japanese-tech-writing）・配置基準（document-type-responsibilities.md）のSSoT分割、IR-045、ドリフト検出、既存文書への遡及準拠修正 |
| [REQ-0141](REQ-0141.md) | ローカル版 OpenCode 生成方式とローカルCaseファイル運用 | ローカル版生成方式、src/opencode-local/ 生成時ソース領域、ローカルCaseファイル、GitHub Issue/PR 置換、変換プロンプト、生成安全性制約 |
| [REQ-0142](REQ-0142.md) | 配布物ID除去後の文意保持・構文健全性・責務整合 | 配布物 ID 除去後の完了条件（構文健全性・文意保持・責務整合）、command/skill/SPEC 間の責務説明整合（case-open/run/close/auto）、横断検査の観点拡充、NG 分類明確化 |
| [REQ-0143](REQ-0143.md) | Command 定義ファイルフォーマット標準化 | AgentDevFlow 管理 command 定義ファイル（src/opencode/commands/agentdev/*.md・.opencode/commands/repo/*.md）の command file format 準拠要件、適用対象限定、consumer project 独自 command の強制対象外 |
| [REQ-0144](REQ-0144.md) | docs-check/integrity 運用是正 | 廃止REQ履歴マーク参照・workflow否定表現・RFC2119マーカー・日本語品質・skill-category-gap・コマンド一覧網羅・REQ範囲表記・fixture経年劣化・QG/case-close Step番号・Sisyphus-Junior×/ulw-loop 誤分類表記・integrity reports git除外 |
| [REQ-0145](REQ-0145.md) | docs-check/integrity 検出設計改善 | IR-044 SPEC詳細混入解消・委譲キーワード境界ケース・catalog↔実装双方向同期・docs-check項目役割範囲・新カテゴリ追加判定フロー・IR-050/051 語彙レジストリ・閾値確定・3層検出構造責務分担・draft SPEC参照リスト・references checker偽陽性・完了条件grep設計 |
| [REQ-0146](REQ-0146.md) | 実行契約・委譲・プロセス設計 | oh-my-openagent CLI引数正規化・委譲プロンプト雛形・case-open即時push・case-auto委譲契約MUST NOT DO・case-close squash merge後reset・git-common-procedures・実行主体分類表・3層検出構造SPEC化・doc-writing査読観点・前工程完了度3段階・subagent-protocol・command-authoring判断基準・バッチIssue完了判定追跡性 |
| [REQ-0147](REQ-0147.md) | 文書化規律・HITL境界 | SKILL↔command同一ルール重複許容基準・新旧REQ適用運用ルール・promote/review系HITL限定・判断確定後自動実行・破壊的変更承認維持・learning-promote prune・intake-promote自動実行・backlog-review矛盾検出時追加判断 |
| [REQ-0148](REQ-0148.md) | RU群バッチ処理と複数 execution_unit 並列実行 | 複数RUバッチ統合・連結成分ベース複数Standard/Epic構成・3軸判断（依存強度・Epicサイズ・機能的一貫性）・execution_unit 並列 orchestration・blocked部分停止・REQ-0114-088破壊的UPDATE |

## 廃止済み要件

旧REQは削除せず、[retired/](retired/) に移動した。廃止済み REQ は履歴・根拠の参照用であり、現行要件判断に使わない。

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
| historical-only | 当時の判断・経緯として残すが現行要件ではない |

## 基準構造

- 現行 REQ: `docs/requirements/REQ-{NNNN}.md`
- 廃止済み REQ: `docs/requirements/retired/REQ-{NNNN}.md`
- 廃止済み REQ のIDは再利用しない
- 文書間に矛盾がある場合は現行 REQ を優先する
- `.sisyphus/` は現行REQ体系の管理対象に含めない
