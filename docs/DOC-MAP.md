# DOC-MAP

> DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない。基準は現行 REQ、ADR、SPEC の各ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|---|---|---|
| 現行 REQ | `requirements/REQ-{NNNN}.md` | 現行要件の永続基準 |
| 廃止済み REQ | `requirements/retired/REQ-{NNNN}.md` | 履歴参照。現行要件判断には使わない |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録 |
| 廃止済み ADR | `adr/retired/ADR-00XX.md` | 再編前 ADR の履歴番号帯。現行根拠として引用しない（REQ-0112-047/048） |
| SPEC | `specs/*.md` | リポジトリ内部の設計文書（現在仕様）。実行時配布物の依存先ではない（ADR-0103, ADR-0104） |
| Guides | `guides/*.md` | 人間向けの案内層。規範的権限を持たない（ADR-0103） |
| DOC-MAP | このファイル | 文書探索入口 |

## 現行 REQ

| REQ | タイトル | 概要 |
|---|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 | REQ/廃止済み REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 | req-define / req-save / 分類ゲート / operation unit / execution_groups / SPEC候補分離（draft-meta.spec-candidates） / SPLIT予兆検知（draft-meta.split-forecast） |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / frontmatter 規約 / 実行時専用配布制約 / source-projection分離 / sync・migration / namespace予約 / SSOT化 / registry化 / consumer導入モデル / consumer plugin checkout・install script分離 |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close、前工程からの引き継ぎプロトコル、OU処理モード、Epic候補グループ |
| [REQ-0105](requirements/REQ-0105.md) | RU lifecycle / Requirement Unit 管理 | intake-promote（review統合）、learning-promote（refine統合）、backlog-review、RU lifecycle |
| [REQ-0106](requirements/REQ-0106.md) | Case実行オーケストレーション / Epic・Wave | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、自然言語成果物品質 |
| [REQ-0108](requirements/REQ-0108.md) | docs-check / Validation / Tests | 整合性検査、検出事項の分類・振り分け先、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、基準管理、rule catalog、REQ impact map、3層gate、meta-integrity、配布対象外自己監査（/repo/docs-check） |
| [REQ-0109](requirements/REQ-0109.md) | inspect-docs / REQ体系整合性 | 廃止済みアーカイブ、移行表、REQ再構成intake |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree cleanup 信頼性 | git-worktree、リトライ、信頼性 |
| [REQ-0112](requirements/REQ-0112.md) | ADRライフサイクル・文書体系基盤・実行時独立性 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、integrity検査追加、ADR全面改定例外・01XX 基準・廃止済みへの移動 |
| [REQ-0113](requirements/REQ-0113.md) | Skill References SPEC分離 | skill references 内 SPEC 相当記述の分離、実行時の自己完束制約 |
| [REQ-0114](requirements/REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件、OU queue処理、連結成分ベース複数Standard/Epic分散（REQ-0114-088破壊的UPDATE） |
| [REQ-0119](requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界 | command 薄型化 / skill 詳細移管 / sub-agent 委譲境界 / Step 整数化 / verbatim 条件付き / delegation_type SPEC降格 / ADR-0112 承認済み化 |
| [REQ-0123](requirements/REQ-0123.md) | workflow-lifecycle 宣言的定義責務とコマンド固有手順のスキル分担 | workflow-lifecycle 責務限定実装 / 4新規スキル移管 / Skill粒度基準 / DO NOT USE FOR整合 |
| [REQ-0124](requirements/REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | docs-review/skill-review/diagnostics-* 廃止・inspect-* 統一・draft type 廃止 |
| [REQ-0125](requirements/REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 | inspect-skills 検出コマンド定義 |
| [REQ-0126](requirements/REQ-0126.md) | inspect-promote / 検出事項の分類・昇格 | inspect-promote 昇格コマンド定義 |
| [REQ-0127](requirements/REQ-0127.md) | Intake command群 (capture / from-github / promote) | intake-capture / intake-from-github / intake-promote 定義 |
| [REQ-0128](requirements/REQ-0128.md) | Learning-promote | learning-promote コマンド定義 |
| [REQ-0129](requirements/REQ-0129.md) | Backlog-review | backlog-review コマンド定義 |
| [REQ-0130](requirements/REQ-0130.md) | case-run / 実装パイプライン | case-run 3フェーズ構成・自律修正ループ |
| [REQ-0131](requirements/REQ-0131.md) | case-close / 完了処理 | case-close 完了ゲート・QG-4・達成判定 |
| [REQ-0132](requirements/REQ-0132.md) | case-open / Issue作成 | case-open Epic・子Issue作成、連結成分ベース複数Standard/Epic構成生成・3軸判断・単独根Standard flow |
| [REQ-0133](requirements/REQ-0133.md) | case-update / Issue更新 | case-update Issue本文更新・コメント追加 |
| [REQ-0134](requirements/REQ-0134.md) | 配布基盤: source/projection・sync・repo type・consumer install | source/projection layout、sync/migration script、repo type、consumer install |
| [REQ-0135](requirements/REQ-0135.md) | Drafts配置・Draft Type Registry | `.agentdev/drafts/` 配置ルール、draft type registry、`.sisyphus/` 除外 |
| [REQ-0136](requirements/REQ-0136.md) | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設・req-define 強化） | spec-save 新設、req-define SPEC分離強化、case-* SPEC確定フロー、inspect-promote 自動promote、REQ健全性メトリクス、SPEC lifecycle（draft/accepted） |
| [REQ-0137](requirements/REQ-0137.md) | 並列実行安全 git 操作規律（共有作業ツリーでの case-auto 並行実行支援） | 並列実行安全 git 操作規律、スイープ操作禁止、明示パスステージ&コミット、消費アーティファクト(draft/RU)削除信頼性・Form Zero解消・削除検証 Standard/Epic 全flow適用 |
| [REQ-0138](requirements/REQ-0138.md) | 構造化req_draft契約 | コマンド間引き継ぎ draft 契約、soft-contract原則、artifact_actions構造、LLM推論消費、depends_on意義拡張（技術的+機能的依存ヒント）・case_open_hints記録 |
| [REQ-0139](requirements/REQ-0139.md) | 外部エージェント統合契約 | 外部エージェント統合、case-run外部実行委譲、driver adapter契約、req-define分類結果アクション |
| [REQ-0140](requirements/REQ-0140.md) | 文書品質ゲート | 文書種別責務・要件性・文意品質・粒度の査読、IR-045、ドリフト検出、既存文書への遡及準拠修正 |
| [REQ-0141](requirements/REQ-0141.md) | ローカル版 OpenCode 導入方式とローカルCaseファイル運用 | link mode導入方式、src/opencode-local/ agentdev-gh-cli原本領域、agentdev-gh-cli差し替え、ローカルCaseファイル、GitHub Issue/PR 置換、unlink/relink、link target確認 |
| [REQ-0142](requirements/REQ-0142.md) | 配布物ID除去後の文意保持・構文健全性・責務整合 | 配布物 ID 除去後の完了条件としての文意保持・構文健全性・責務整合、Markdown 構文破損回避・主要構造重複回避・壊れた参照残骸除去、command / skill / SPEC 間責務説明整合（case-open / case-run / case-close / case-auto）、横断検査観点拡充、NG / false positive 分類明確化、docs-spec-rebuild-integrity.md |
| [REQ-0143](requirements/REQ-0143.md) | Command 定義ファイルフォーマット標準化 | AgentDevFlow 管理 command 定義ファイル（src/opencode/commands/agentdev/*.md・.opencode/commands/repo/*.md）の command file format 準拠、適用対象限定、consumer project 独自 command 強制対象外 |
| [REQ-0144](requirements/REQ-0144.md) | docs-check/integrity 運用是正 | 廃止REQ履歴マーク参照・workflow否定表現・RFC2119マーカー・日本語品質・skill-category-gap・コマンド一覧網羅・REQ範囲表記・fixture経年劣化・QG/case-close Step番号・Sisyphus-Junior×/ulw-loop 誤分類表記・integrity reports git除外 |
| [REQ-0145](requirements/REQ-0145.md) | docs-check/integrity 検出設計改善 | IR-044 SPEC詳細混入解消・委譲キーワード境界ケース・catalog↔実装双方向同期・docs-check項目役割範囲・新カテゴリ追加判定フロー・IR-050/051 語彙レジストリ・閾値確定・3層検出構造責務分担・draft SPEC参照リスト・references checker偽陽性・完了条件grep設計 |
| [REQ-0146](requirements/REQ-0146.md) | 実行契約・委譲・プロセス設計 | oh-my-openagent CLI引数正規化・委譲プロンプト雛形・case-open即時push・case-auto委譲契約MUST NOT DO・case-close squash merge後reset・git-common-procedures・実行主体分類表・3層検出構造SPEC化・doc-writing査読観点・前工程完了度3段階・subagent-protocol・command-authoring判断基準・バッチIssue完了判定追跡性 |
| [REQ-0147](requirements/REQ-0147.md) | 文書化規律・HITL境界 | SKILL↔command同一ルール重複許容基準・新旧REQ適用運用ルール・promote/review系HITL限定・判断確定後自動実行・破壊的変更承認維持・learning-promote prune・intake-promote自動実行・backlog-review矛盾検出時追加判断 |
| [REQ-0148](requirements/REQ-0148.md) | RU群バッチ処理と複数 execution_unit 並列実行 | 複数RUバッチ統合・連結成分ベース複数Standard/Epic構成・3軸判断（依存強度・Epicサイズ・機能的一貫性）・execution_unit 並列 orchestration・blocked部分停止・REQ-0114-088破壊的UPDATE |

## 廃止済み REQ

旧REQ 50件は [requirements/retired/](requirements/retired/) に移動した。旧REQから新たな現行 REQ への移行有無は [mapping-table.md](requirements/mapping-table.md) を参照する。

## 仕様（SPEC）

SPEC は 3 層構造を持つ（AG-007）。横断 SPEC（`specs/workflows/`）は共通契約のみを扱い、個別 command / skill の動作は代替しない（AG-008）。

> **SPEC status 追跡**: SPEC の status（draft / accepted、ADR-0123 定義）は [specs/README.md](specs/README.md) が単一の追跡情報源である（REQ-0154-001）。本 DOC-MAP の SPEC 表には status 列を設けず、重複管理しない。draft SPEC 放置検出（IR-054）は [specs/integrity-rule-catalog.md](specs/integrity-rule-catalog.md) 参照（REQ-0154-002）。

### 横断 SPEC（`specs/workflows/`）

共通契約・共通状態・artifact lifecycle 等、複数コマンド・スキルにまたがる契約。個別 command / skill の現在動作は各 SPEC を参照のこと。

| SPEC | 内容 |
|---|---|
| [workflows/workflow-contracts.md](specs/workflows/workflow-contracts.md) | ワークフロー全体像・共通フェーズ・共通状態・artifact lifecycle・実装分類（Pattern Taxonomy） |
| [workflows/delegation-contracts.md](specs/workflows/delegation-contracts.md) | サブエージェント委譲契約（委譲時最小契約・委譲種別・制約・manager-orchestrator 分離） |
| [workflows/capture-boundaries.md](specs/workflows/capture-boundaries.md) | キャプチャ境界（intake / learning 境界・Split Rule・PR 本文永続チャネル・REQ 再構成 intake） |
| [workflows/epic-wave-model.md](specs/workflows/epic-wave-model.md) | Epic / Wave / Issue 実行モデル（OU 階層・子Issue 状態 enum・Wave スケジューリング・execution_unit 定義・連結成分アルゴリズム・3軸判断モデル・per-Epic 単一書き手） |
| [workflows/backlog-artifact-lifecycle.md](specs/workflows/backlog-artifact-lifecycle.md) | RU / 採用済み成果物 / draft ライフサイクル・検出事項プロトコル・artifact_actions 工程分岐 |

### command SPEC（`specs/commands/`）

各 `/agentdev/*` 公開コマンドの現在動作。配布物（`src/opencode/commands/`）の動作を docs 内部から参照する用。

- [commands/_template.md](specs/commands/_template.md) — command SPEC テンプレート
- [commands/req-define.md](specs/commands/req-define.md) — `/agentdev/req-define`
- [commands/req-save.md](specs/commands/req-save.md) — `/agentdev/req-save`
- [commands/spec-save.md](specs/commands/spec-save.md) — `/agentdev/spec-save`
- [commands/case-open.md](specs/commands/case-open.md) — `/agentdev/case-open`
- [commands/case-run.md](specs/commands/case-run.md) — `/agentdev/case-run`
- [commands/case-close.md](specs/commands/case-close.md) — `/agentdev/case-close`
- [commands/case-auto.md](specs/commands/case-auto.md) — `/agentdev/case-auto`
- [commands/case-update.md](specs/commands/case-update.md) — `/agentdev/case-update`
- [commands/intake-capture.md](specs/commands/intake-capture.md) — `/agentdev/intake-capture`
- [commands/intake-from-github.md](specs/commands/intake-from-github.md) — `/agentdev/intake-from-github`
- [commands/intake-promote.md](specs/commands/intake-promote.md) — `/agentdev/intake-promote`
- [commands/learning-promote.md](specs/commands/learning-promote.md) — `/agentdev/learning-promote`
- [commands/backlog-review.md](specs/commands/backlog-review.md) — `/agentdev/backlog-review`
- [commands/inspect-docs.md](specs/commands/inspect-docs.md) — `/agentdev/inspect-docs`
- [commands/inspect-skills.md](specs/commands/inspect-skills.md) — `/agentdev/inspect-skills`
- [commands/inspect-promote.md](specs/commands/inspect-promote.md) — `/agentdev/inspect-promote`

### skill SPEC（`specs/skills/`）

各 `agentdev-*` 配布スキルの現在動作。配布物（`src/opencode/skills/`）の動作を docs 内部から参照する用。

- [skills/_template.md](specs/skills/_template.md) — skill SPEC テンプレート
- skill SPEC 一覧は `specs/skills/` ディレクトリ配下（27 件）。`repo-agentdev-integrity` は repo-local・配布対象外のため対象外。

### その他 SPEC（`specs/` 直下）

システム全体の構成・フォーマット・整合性検査など、複数層にまたがる基盤 SPEC。

| SPEC | 内容 |
|---|---|
| [system.md](specs/system.md) | コマンドシステムの構成 |
| [patterns.md](specs/patterns.md) | 実装パターンと文書フォーマット |
| [design-principles.md](specs/design-principles.md) | 設計原則 |
| [quality-specs.md](specs/quality-specs.md) | 品質基準・検証ルール |
| [quality-gates.md](specs/quality-gates.md) | QG-1〜QG-4 品質ゲート定義 |
| [document-model.md](specs/document-model.md) | 文書種別の責務マトリックス |
| [document-type-responsibilities.md](specs/document-type-responsibilities.md) | 文書種別責務・配置基準 |
| [artifact-contracts.md](specs/artifact-contracts.md) | アーティファクト間契約 |
| [integrity-contracts.md](specs/integrity-contracts.md) | 整合性検査分類フレームワーク |
| [workflow-contracts.md](specs/workflow-contracts.md) | ワークフロー契約（旧版・縮小済み・横断契約は `workflows/` を参照） |
| [runtime-package-boundary.md](specs/runtime-package-boundary.md) | 実行時配布物の境界と依存制約 |
| [local-case-file.md](specs/local-case-file.md) | ローカル版 OpenCode の Case ファイルスキーマ・状態遷移・採番・見出し |
| [local-generation.md](specs/local-generation.md) | ローカル版 OpenCode link mode 導入フロー・link target 確認・unlink / relink による更新運用（ADR-0131, REQ-0141） |
| [local-transform.md](specs/local-transform.md) | 変換プロンプトの廃止根拠・変換品質検証の agentdev-gh-cli 差し替え版品質検証への読み替え（ADR-0131, REQ-0141） |
| [integrity-rule-catalog.md](specs/integrity-rule-catalog.md) | 整合性検査ルールのカタログ |
| [artifact-responsibilities.md](specs/artifact-responsibilities.md) | アーティファクト責務マトリックス |
| [req-impact-map.md](specs/req-impact-map.md) | REQ 影響マッピング |
| [req-health-metrics.md](specs/req-health-metrics.md) | REQ 健全性メトリクス（肥大化・関心ズレ閾値） |
| [rule-ownership.md](specs/rule-ownership.md) | ルール所有権マトリックス |
| [docs-spec-rebuild-integrity.md](specs/docs-spec-rebuild-integrity.md) | 配布物 ID 除去後の整合性検査ルール（構文健全性・文意保持・責務整合・NG 分類） |
| [command-file-format.md](specs/command-file-format.md) | command 定義ファイルの Markdown 構成標準（Step 形式・ガードレール番号・禁止形式・機械検査対象） |
| [backticks-identifier-threshold.md](specs/backticks-identifier-threshold.md) | backticks 識別子（必須）/ 一般名詞（任意）の機械判定閾値（document-type-responsibilities.md 補完 SPEC、mechanical-replacement-rules.md 相互参照先） |

## SPEC 探索経路ガイド

1. 個別コマンドの現在動作を知りたい → `specs/commands/<command>.md`
2. 個別スキルの現在動作を知りたい → `specs/skills/<skill-name>.md`
3. 複数コマンド・スキルにまたがる共通契約 → `specs/workflows/*.md`
4. 文書フォーマット・設計原則・整合性検査基盤 → `specs/*.md`（直下）

## ADR

| Index | 内容 |
|---|---|
| [ADR インデックス](adr/README.md) | ADR 一覧、Status View、Topic View |

## ガイド

| Guide | 内容 |
|---|---|
| [ガイド入口](guides/README.md) | ガイド一覧・案内 |
| [クイックスタート](guides/quickstart.md) | 5コマンドで機能追加を完了する最小フロー |
| [コマンド選択](guides/command-selection.md) | 現在の状態から次のコマンドを選ぶ入口表 |
| [要件定義 → Case実行フロー](guides/req-case-flow.md) | req-define から case-close までの流れ |
| [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md) | 作業候補・学びの収集から RU 生成まで |
| [診断・メンテナンス](guides/diagnostics-and-maintenance.md) | docs-check（/repo/docs-check: AgentDevFlow 本体リポジトリ専用自己監査） / inspect-docs |
| [成果物・状態モデル](guides/artifacts-and-state.md) | 成果物の種別・配置・ライフサイクル |
| [プロジェクトドキュメントと SPEC](guides/project-docs-and-specs.md) | REQ / ADR / SPEC / DOC-MAP の関係 |
| [Consumer Project 導入](guides/consumer-project-setup.md) | 外部プロジェクトへの AgentDevFlow 導入手順 |
| [トラブルシューティング](guides/troubleshooting.md) | よくある問題と対処法 |
| [用語集](guides/glossary.md) | AgentDevFlow の用語定義 |
