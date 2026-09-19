# ドキュメント入口

AgentDevFlow の基本原則と管理方式は [DEC-001](decisions/DEC-001.md) と [憲章](guides/charter.md) を参照。
現行の REQ/Decision は `REQ-NNN`、`DEC-NNN`（3桁ゼロ埋め）のIDを使用する。

## 要件

<!-- AUTOGEN:BEGIN:id=readme-req-summary-count -->
現行 REQ: 54件、廃止済み: 12件
<!-- AUTOGEN:END -->

現行要件は54件である。廃止済み要件のIDは再利用せず、廃止済み要件は [retired/](requirements/retired/) に配置する。番号には欠番が存在する。
REQ-063〜REQ-081 は REQ-082 採番時（2026-09-15 ユーザー裁定）による意図的予約欠番であり、実体は存在しない（[採番管理](designs/foundations/numbering-policy.md) 参照）。
REQ-084〜REQ-086 は共有予約枠（REQ-083〜REQ-096）の未使用・返却枠であり、意図的予約欠番として維持する。
各 REQ の詳細は各 REQ ファイル本文を参照。

<!-- AUTOGEN:BEGIN:id=readme-req-summary-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-001](REQ-001.md) | 文書体系と持続可能な基準構造 |
| [REQ-002](REQ-002.md) | 配布成果物の責務境界 |
| [REQ-003](REQ-003.md) | 委譲時の判断・承認・副作用境界 |
| [REQ-004](REQ-004.md) | 要求の形成と合意 |
| [REQ-005](REQ-005.md) | ワークフロープロトコルと工程接続 |
| [REQ-006](REQ-006.md) | Case実行オーケストレーション |
| [REQ-007](REQ-007.md) | 完了報告と成果物品質ゲート |
| [REQ-008](REQ-008.md) | 一時成果物ライフサイクル |
| [REQ-009](REQ-009.md) | 配布基盤と導入モデル |
| [REQ-010](REQ-010.md) | 自己監査コマンド（docs-check） |
| [REQ-011](REQ-011.md) | I/O境界と外部連携手段 |
| [REQ-012](REQ-012.md) | 成果物トレーサビリティ |
| [REQ-014](REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](REQ-015.md) | adversarial-review caller integration（7 caller と case-auto 停止伝播） |
| [REQ-016](REQ-016.md) | adversarial-review caller integration 横断整合 |
| [REQ-017](REQ-017.md) | Issue Execution Contract |
| [REQ-018](REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-021](REQ-021.md) | トレーサビリティのワークフロー統合 |
| [REQ-027](REQ-027.md) | Capability Skill・Soft guard・代表ケース検証 |
| [REQ-029](REQ-029.md) | 配布依存境界 |
| [REQ-030](REQ-030.md) | case-open 実行契約（Root Case 確立と Definition Package） |
| [REQ-031](REQ-031.md) | case-run 実行契約（実装実行と委譲） |
| [REQ-032](REQ-032.md) | case-close 実行契約（完了判定とマージ） |
| [REQ-034](REQ-034.md) | case-auto 実行契約（自走オーケストレーション） |
| [REQ-035](REQ-035.md) | Epic と Wave 実行モデル |
| [REQ-036](REQ-036.md) | 検出と診断コマンド群（inspect 系） |
| [REQ-037](REQ-037.md) | 取り込みパイプライン（intake） |
| [REQ-038](REQ-038.md) | 学習パイプライン（learning） |
| [REQ-039](REQ-039.md) | バックログ統合（backlog-review） |
| [REQ-041](REQ-041.md) | backlog 一括整理コマンド（backlog-auto）実行契約 |
| [REQ-044](REQ-044.md) | 標準API委譲の状態制約 |
| [REQ-045](REQ-045.md) | 現行成果物体系の整合性網羅監査 |
| [REQ-046](REQ-046.md) | 横断正規化後の不変条件 |
| [REQ-047](REQ-047.md) | 規則所有権の一方向化 |
| [REQ-048](REQ-048.md) | ADF 実行観測と統制縮小評価 |
| [REQ-049](REQ-049.md) | 追跡Issue管理機構 |
| [REQ-050](REQ-050.md) | scripts 公開入口境界 |
| [REQ-051](REQ-051.md) | ガードレール識別体系と機械検査の再編 |
| [REQ-052](REQ-052.md) | Custom Tool・Plugin/Hook の種別契約と配布境界 |
| [REQ-053](REQ-053.md) | 文書と配布物の文章品質契約 |
| [REQ-054](REQ-054.md) | 変更誘発境界リスク分析 |
| [REQ-055](REQ-055.md) | production-equivalent verification の定義 |
| [REQ-056](REQ-056.md) | Project Knowledge の所有と workflow 利用 |
| [REQ-057](REQ-057.md) | docs corpus 整合・現行化バッチ |
| [REQ-058](REQ-058.md) | ADF 管理投影物の廃止時クリーンアップ契約 |
| [REQ-059](REQ-059.md) | Decision と REQ の関連宣言管理 |
| [REQ-060](REQ-060.md) | bun test 実行形態の統一（repo root 起 cwd・`./` 付きパス指定） |
| [REQ-061](REQ-061.md) | case-ready 実行契約 |
| [REQ-062](REQ-062.md) | case-revise 実行契約 |
| [REQ-082](REQ-082.md) | 対論型レビュー審議契約 |
| [REQ-083](REQ-083.md) | Definition PR の状態契約（通常 Pull Request・ブランチ命名・用語・正規操作完結） |
| [REQ-087](REQ-087.md) | 採番例外の記録と REQ 番号ギャップ検査 |
| [REQ-088](REQ-088.md) | ADF v4 基盤要件（三層責務・情報寿命・Project Contract・中核文書モデル） |
<!-- AUTOGEN:END -->

- [要件インデックス](requirements/README.md)

## Decision

現行 Decision は DEC-001 から DEC-039 の38件である（DEC-005、DEC-007、DEC-017、DEC-029、DEC-030 は superseded、proposed は 0 件）。
詳細は [Decision インデックス](decisions/README.md) 参照。

| Decision | タイトル |
|---|---|
| [DEC-001](decisions/DEC-001.md) | AgentDevFlow 憲章 |
| [DEC-002](decisions/DEC-002.md) | OpenCode ソース・プロジェクション分離 |
| [DEC-003](decisions/DEC-003.md) | req_draft ソフトコントラクト原則 |
| [DEC-004](decisions/DEC-004.md) | 差し替え可能な I/O 境界 |
| [DEC-005](decisions/DEC-005.md) | Project Extensions Architecture（superseded by DEC-006） |
| [DEC-006](decisions/DEC-006.md) | inspect 3-command 構成への正規化 |
| [DEC-007](decisions/DEC-007.md) | Artifact Graph 標準化と配布スキル昇格（superseded by DEC-017） |
| [DEC-008](decisions/DEC-008.md) | case-auto の限定的親判断解決（bounded parent decision resolution） |
| [DEC-009](decisions/DEC-009.md) | ADR から Decision への正規成果物モデル移行 |
| [DEC-010](decisions/DEC-010.md) | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則 |
| [DEC-011](decisions/DEC-011.md) | STEP resume point と会話記憶非依存 |
| [DEC-012](decisions/DEC-012.md) | Extension を file-kind から workflow/capability responsibility へ再編 |
| [DEC-013](decisions/DEC-013.md) | IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定 |
| [DEC-014](decisions/DEC-014.md) | 配布依存境界の多層 enforcement |
| [DEC-015](decisions/DEC-015.md) | ADF決定論的実行中核と実行基盤実行機構の責務分界 |
| [DEC-016](decisions/DEC-016.md) | 導入系スクリプトの副作用ゼロ原則 |
| [DEC-017](decisions/DEC-017.md) | 最小トレーサビリティモデルの採用と Artifact Graph の廃止（superseded by DEC-037） |
| [DEC-019](decisions/DEC-019.md) | 一般処理の標準API委譲とADF固有意味論の所有境界 |
| [DEC-020](decisions/DEC-020.md) | GitHub Issue 共通管理単位の採用 |
| [DEC-021](decisions/DEC-021.md) | scripts 公開入口の2本固定と安定契約 |
| [DEC-022](decisions/DEC-022.md) | 実行定義層の正規所有モデルと機械強制への移行 |
| [DEC-023](decisions/DEC-023.md) | third-party Skill の分離管理と取得機構の導入 |
| [DEC-024](decisions/DEC-024.md) | 変更誘発境界リスク分析の導入と検証契約への投影 |
| [DEC-025](decisions/DEC-025.md) | プロジェクト知識を Capability Skill から分離し、独立した正規知識層として管理する |
| [DEC-026](decisions/DEC-026.md) | 実現面変更方針の構造化ハンドオフ（realization_actions） |
| [DEC-027](decisions/DEC-027.md) | 観測ベース統制縮小評価ループ |
| [DEC-028](decisions/DEC-028.md) | 文章表層品質の共通実行基盤 |
| [DEC-029](decisions/DEC-029.md) | 公開ワークフローの状態遷移中心再構成と Definition 確定境界の導入 |
| [DEC-030](decisions/DEC-030.md) | トレーサビリティ標準機能への一般化と producer / consumer 境界の確立（superseded by DEC-037） |
| [DEC-031](decisions/DEC-031.md) | ADF v4 Standard Operating Model の採用とプロセス・実装の責務分離 |
| [DEC-032](decisions/DEC-032.md) | ADF 責務の三層モデルと Project Contract の論理ビュー・情報寿命モデル |
| [DEC-033](decisions/DEC-033.md) | ADF v4 公開運用モデル（UX 2入口収斂・内部 lifecycle・継続コラボレーションループ・学習昇格ガード） |
| [DEC-034](decisions/DEC-034.md) | v4 の移行・release 標準境界（非破壊移行原則・v4.0.0-rc.1 cutover・self-hosting） |
| [DEC-035](decisions/DEC-035.md) | v4 Quality / Verification / Evidence / Gate モデルへの分解 |
| [DEC-036](decisions/DEC-036.md) | 意味 Skill と決定的実装の責務分離および Harness/Backend adapter 境界 |
| [DEC-037](decisions/DEC-037.md) | Traceability の Change / Evidence 中心への再中心化 |
| [DEC-038](decisions/DEC-038.md) | ADF v4 durable state 配置と再構成の契約（状態権威・証跡分離・非原子調整原則） |
| [DEC-039](decisions/DEC-039.md) | ADF v4 authority・副作用統制と冪等・並行性モデル |

## 設計（Design）

Design は 3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
詳細は [Design インデックス](designs/README.md) 参照。

### 横断 Design（`designs/workflows/`）

- [Workflow Skill Model](designs/workflows/workflow-skill-model.md)
- [サブエージェント委譲契約](designs/workflows/delegation-contracts.md)
- [キャプチャ境界](designs/workflows/capture-boundaries.md)
- [RU / 採用済み成果物 / draft lifecycle](designs/workflows/backlog-artifact-lifecycle.md)
- [execution_unit 構成アルゴリズム参照](designs/workflows/references/execution-unit-construction.md)
- [ADF v4 標準ライフサイクル](designs/workflows/v4-standard-lifecycle.md)
- [ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）](designs/workflows/v4-lifecycle-state-machine.md)

### command Design / skill Design

- [command Design 一覧](designs/commands/)：各 `/agentdev/*` コマンド専用 Design（`_template.md` 含む）
- [skill Design 一覧](designs/skills/)：各 `agentdev-*` スキル専用 Design（`_template.md` 含む）

### 基盤 Design（`designs/{foundations,responsibilities,quality,integrity,local,authoring}/`）

基盤 Design は 6 ドメインで構成する。
各ドメイン直下に主要 Design を置き、詳細・実装固有事項は `references/` サブディレクトリへ分離する。
status（draft / accepted）を含む完全一覧は [Design インデックス](designs/README.md) を正とする。

#### foundations/（基盤モデル）

- [採番管理](designs/foundations/numbering-policy.md)
- [システム仕様](designs/foundations/system.md)
- [文書モデル](designs/foundations/document-model.md)
- [Decision Lifecycle](designs/foundations/decision-lifecycle.md)
- [文書フォーマット規約](designs/foundations/patterns.md)
- [設計原則](designs/foundations/design-principles.md)
- [Project Extensions](designs/foundations/project-extensions.md)
- [harness 分離モデル](designs/foundations/harness-separation-model.md)
- [最小トレーサビリティモデル（TIM）](designs/foundations/traceability-model.md)
- [ADF v4 Operating Model](designs/foundations/v4-operating-model.md)
- [ADF v4 実装責務境界](designs/foundations/v4-responsibility-boundaries.md)
- [ADF v4 Traceability モデル](designs/foundations/v4-traceability-model.md)
- [v3 -> v4 Concept / Artifact Crosswalk](designs/foundations/v3-v4-crosswalk.md)
- [ADF v4 Migration と Release の標準境界](designs/foundations/v4-migration-and-release.md)
- [ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整）](designs/foundations/v4-durable-state-and-recovery.md)
- [ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）](designs/foundations/v4-runtime-execution-model.md)

#### responsibilities/（文書種別、成果物責務）

- [文書種別責務・配置基準](designs/responsibilities/document-type-responsibilities.md)
- [成果物責任表](designs/responsibilities/artifact-responsibilities.md)
- [アーティファクト契約](designs/responsibilities/artifact-contracts.md)
- [REQ 影響マップ](designs/responsibilities/req-impact-map.md)
- [責務境界浄化](designs/responsibilities/responsibility-boundary-purification.md)
- [Artifact Quality Control Routing](designs/responsibilities/artifact-quality-control-routing.md)
- [Custom Tool 操作契約](designs/responsibilities/custom-tool-contracts.md)

#### quality/（品質、メトリクス）

- [品質仕様](designs/quality/quality-specs.md)
- [REQ 健全性メトリクス](designs/quality/req-health-metrics.md)
- [Design 健全性メトリクス](designs/quality/design-health-metrics.md)
- [ADF v4 Quality / Verification / Evidence / Gate モデル](designs/quality/v4-quality-gate-model.md)

#### integrity/（整合性契約、ルール）

- [索引類自動生成](designs/integrity/index-auto-generation.md)
- [整合性契約](designs/integrity/integrity-contracts.md)
- [整合性ルールカタログ](designs/integrity/integrity-rule-catalog.md)
- [整合性ルール詳細（IR-NNN）](designs/integrity/rules/)
- [ルール所有権マトリックス](designs/integrity/rule-ownership.md)
- [配布物整合性検査ルール](designs/integrity/docs-spec-rebuild-integrity.md)
- [配布依存境界](designs/integrity/distribution-boundary.md)
- [backticks 識別子/一般名詞 判定閾値](designs/integrity/backticks-identifier-threshold.md)
- [validator 分割基準](designs/integrity/validator-split-criteria.md)
- [Targeted Docs Guard 実装詳細](designs/integrity/targeted-docs-guard-implementation.md)
- [AUTOGEN ブロック鮮度検出 gate](designs/integrity/autogen-freshness-gate.md)
- [テスト影響範囲検出 gate](designs/integrity/test-impact-detection-gate.md)
- [checker 実行契約と検出基盤規則](designs/integrity/checker-execution-contracts.md)
- [決定的破損検査クラス](designs/integrity/content-corruption-checker.md)

#### local/（ローカル版 Design）

- [実行時パッケージ境界](designs/local/runtime-package-boundary.md)
- [ローカルIssue共通スキーマ](designs/local/local-case-file.md)
- [導入スクリプトの使いやすさ詳細](designs/local/install-script-usability.md)
- [third-party Skill 管理](designs/local/third-party-skill-management.md)

#### authoring/（執筆規約）

- [コマンドファイルフォーマット規約](designs/authoring/command-file-format.md)
- [語彙レジストリ](designs/authoring/vocabulary-registry.md)

## 知識（Knowledge）

プロジェクト知識（プロジェクト固有の再利用可能な判断材料）は [knowledge/](knowledge/) 配下へ 1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）で配置する。
所有と workflow 利用の契約は [REQ-056](requirements/REQ-056.md) を参照する。

## Report

監査・評価・観測記録は Report として `docs/reports/` へ分離している。
Report は Design インデックスの管理対象外である（`designs/README.md`「Report の分離」参照）。

## ガイド

- [ガイド入口](guides/README.md)
- [憲章](guides/charter.md)
- [クイックスタート](guides/quickstart.md)
- [コマンド選択](guides/command-selection.md)
- [要件定義 → Case実行フロー](guides/req-case-flow.md)
- [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md)
- [診断・メンテナンス](guides/diagnostics-and-maintenance.md)
- [成果物・状態モデル](guides/artifacts-and-state.md)
- [プロジェクトドキュメントと Design](guides/project-docs-and-specs.md)
- [Consumer Project 導入](guides/consumer-project-setup.md)
- [トラブルシューティング](guides/troubleshooting.md)
- [用語集](guides/glossary.md)
