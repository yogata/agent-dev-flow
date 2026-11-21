# ドキュメント入口

AgentDevFlow の基本原則と管理方式は [DEC-001](decisions/DEC-001.md) と [憲章](guides/charter.md) を参照。
現行の REQ/Decision は `REQ-NNN`、`DEC-NNN`（3桁ゼロ埋め）のIDを使用する。

## 現在像への導線

第4世代（v4）の現在像を定義する正規文書への導線は次のとおりである。

- 憲章と責務境界: [DEC-001](decisions/DEC-001.md)、[憲章](guides/charter.md)
- 三層責務と標準運用モデル: [REQ-088](requirements/REQ-088.md)、[Operating Model](designs/foundations/operating-model.md)、[DEC-053](decisions/DEC-053.md)
- Project Contract の論理ビューと再構成方法: [REQ-088](requirements/REQ-088.md)、[ADF v4 Operating Model](designs/foundations/operating-model.md)「Project Contract の論理ビュー」節
- 標準入口と標準実行: [クイックスタート](guides/quickstart.md)、[要件定義 → Case実行フロー](guides/req-case-flow.md)。req-define と backlog-auto が要求入口、case-auto が標準実行
- 判断方法と確定権限の分離、人間判断境界: [REQ-096](requirements/REQ-096.md)、[DEC-048](decisions/DEC-048.md)
- REQ / Decision / Design / Knowledge / Report / Guide の文書責務: [REQ-001](requirements/REQ-001.md)、[プロジェクトドキュメントと Design](guides/project-docs-and-specs.md)

採用済み（`status: accepted`）の v5 基盤と v5.1 の正規文書への導線は次のとおりである。

- v5 基盤（工程・成果物モデル、追跡・品質検証、有限実行、移行境界）: [REQ-104](requirements/REQ-104.md)〜[REQ-109](requirements/REQ-109.md)、[DEC-053](decisions/DEC-053.md)〜[DEC-056](decisions/DEC-056.md)
- v5.1（工程駆動コラボレーション、工程遷移・双経路併存）: [REQ-110](requirements/REQ-110.md)、[REQ-111](requirements/REQ-111.md)、[DEC-057](decisions/DEC-057.md)、[DEC-058](decisions/DEC-058.md)

## 要件

<!-- AUTOGEN:BEGIN:id=readme-req-summary-count -->
REQ: 79件
<!-- AUTOGEN:END -->

現行要件は79件である。
各 REQ の詳細は各 REQ ファイル本文を参照。

<!-- AUTOGEN:BEGIN:id=readme-req-summary-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-001](requirements/REQ-001.md) | 文書体系と持続可能な基準構造 |
| [REQ-002](requirements/REQ-002.md) | 配布成果物の責務境界 |
| [REQ-003](requirements/REQ-003.md) | 委譲時の判断・承認・副作用境界 |
| [REQ-004](requirements/REQ-004.md) | 要求の形成と合意 |
| [REQ-005](requirements/REQ-005.md) | ワークフロープロトコルと工程接続 |
| [REQ-006](requirements/REQ-006.md) | Case実行オーケストレーション |
| [REQ-007](requirements/REQ-007.md) | 完了報告と成果物品質ゲート |
| [REQ-008](requirements/REQ-008.md) | 一時成果物ライフサイクル |
| [REQ-009](requirements/REQ-009.md) | 配布基盤と導入モデル |
| [REQ-010](requirements/REQ-010.md) | 自己監査コマンド（docs-check） |
| [REQ-011](requirements/REQ-011.md) | I/O境界と外部連携手段 |
| [REQ-012](requirements/REQ-012.md) | 成果物トレーサビリティ |
| [REQ-014](requirements/REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](requirements/REQ-015.md) | adversarial-review caller integration（7 caller と case-auto 停止伝播） |
| [REQ-017](requirements/REQ-017.md) | Issue Execution Contract |
| [REQ-018](requirements/REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](requirements/REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-021](requirements/REQ-021.md) | トレーサビリティのワークフロー統合 |
| [REQ-027](requirements/REQ-027.md) | Capability Skill・Soft guard・代表ケース検証 |
| [REQ-029](requirements/REQ-029.md) | 配布依存境界 |
| [REQ-030](requirements/REQ-030.md) | case-open 実行契約（Root Case 確立と Definition Package） |
| [REQ-031](requirements/REQ-031.md) | case-run 実行契約（実装実行と委譲） |
| [REQ-032](requirements/REQ-032.md) | case-close 実行契約（完了判定とマージ） |
| [REQ-034](requirements/REQ-034.md) | case-auto 実行契約（自走オーケストレーション） |
| [REQ-035](requirements/REQ-035.md) | Epic と Wave 実行モデル |
| [REQ-036](requirements/REQ-036.md) | 検出と診断コマンド群（inspect 系） |
| [REQ-037](requirements/REQ-037.md) | 取り込みパイプライン（intake） |
| [REQ-038](requirements/REQ-038.md) | 学習パイプライン（learning） |
| [REQ-039](requirements/REQ-039.md) | バックログ統合（backlog-review） |
| [REQ-041](requirements/REQ-041.md) | backlog 一括整理コマンド（backlog-auto）実行契約 |
| [REQ-044](requirements/REQ-044.md) | 標準API委譲の状態制約 |
| [REQ-047](requirements/REQ-047.md) | 規則所有権の一方向化 |
| [REQ-048](requirements/REQ-048.md) | ADF 実行観測と統制縮小評価 |
| [REQ-049](requirements/REQ-049.md) | 追跡Issue管理機構 |
| [REQ-050](requirements/REQ-050.md) | scripts 公開入口境界 |
| [REQ-051](requirements/REQ-051.md) | ガードレール識別体系と機械検査の再編 |
| [REQ-052](requirements/REQ-052.md) | Custom Tool・Plugin/Hook の種別契約と配布境界 |
| [REQ-053](requirements/REQ-053.md) | 文書と配布物の文章品質契約 |
| [REQ-054](requirements/REQ-054.md) | 変更誘発境界リスク分析 |
| [REQ-055](requirements/REQ-055.md) | production-equivalent verification の定義 |
| [REQ-056](requirements/REQ-056.md) | Project Knowledge の所有と workflow 利用 |
| [REQ-058](requirements/REQ-058.md) | ADF 管理投影物の廃止時クリーンアップ契約 |
| [REQ-059](requirements/REQ-059.md) | Decision と REQ の関連宣言管理 |
| [REQ-060](requirements/REQ-060.md) | bun test 実行形態の統一（リポジトリルートを cwd にして実行・`./` 付きパス指定） |
| [REQ-061](requirements/REQ-061.md) | case-ready 実行契約 |
| [REQ-062](requirements/REQ-062.md) | case-revise 実行契約 |
| [REQ-082](requirements/REQ-082.md) | 対論型レビュー審議契約 |
| [REQ-083](requirements/REQ-083.md) | 設計PRの状態契約（通常 Pull Request・ブランチ命名・用語・正規操作完結） |
| [REQ-088](requirements/REQ-088.md) | ADF v4 基盤要件（三層責務・情報寿命・Project Contract・中核文書モデル） |
| [REQ-091](requirements/REQ-091.md) | Supervisor 環境向け credential 供給ブリッジの原本管理 |
| [REQ-094](requirements/REQ-094.md) | ADF の Markdown 日本語表現および用語選択基準 |
| [REQ-095](requirements/REQ-095.md) | agentdev_gh 起票・読取操作の呼出側規律 |
| [REQ-096](requirements/REQ-096.md) | ADF判断アーキテクチャ（判断方法・確定権限・人間判断境界） |
| [REQ-097](requirements/REQ-097.md) | third-party 成果物の運用前提と導入検知 |
| [REQ-099](requirements/REQ-099.md) | ADF 共通原本とホスト接続領域の分離によるマルチホスト併存利用 |
| [REQ-100](requirements/REQ-100.md) | ADF が起票する Issue タイトルの記述規則 |
| [REQ-101](requirements/REQ-101.md) | Case Issue 工程記録モデル |
| [REQ-102](requirements/REQ-102.md) | Git 操作の非対話認証 |
| [REQ-103](requirements/REQ-103.md) | ADF v4 正規モデル再確定と現行規範の全面収束 |
| [REQ-104](requirements/REQ-104.md) | ADF v5 基盤要件（共通責務とプロジェクト別工程構成） |
| [REQ-105](requirements/REQ-105.md) | ADF v5 成果物の意味と工程別正式確定 |
| [REQ-106](requirements/REQ-106.md) | ADF v5 差分・変更影響と増分更新 |
| [REQ-107](requirements/REQ-107.md) | ADF v5 工程間追跡と品質検証の責務分離 |
| [REQ-108](requirements/REQ-108.md) | ADF v5 有限実行とワークフロー責務再編 |
| [REQ-109](requirements/REQ-109.md) | ADF v5 移行と互換性の境界 |
| [REQ-110](requirements/REQ-110.md) | ADF v5.1 工程駆動コラボレーション（検討テーマ・外部検討と正規成果物の段階形成） |
| [REQ-111](requirements/REQ-111.md) | ADF v5.1 工程遷移・独立レビューと変更駆動併存 |
| [REQ-112](requirements/REQ-112.md) | local package tsconfig 二重管理統合・typecheck gate 組込みの方針決定 |
| [REQ-113](requirements/REQ-113.md) | local package tsconfig 統合・typecheck 組込みの実装 |
| [REQ-114](requirements/REQ-114.md) | backlog-auto 一気通貫実行とパッチリリース実行契約 |
| [REQ-115](requirements/REQ-115.md) | case-run scripts 配下の型検査基盤導入方針 |
| [REQ-116](requirements/REQ-116.md) | GitHub 版隔離検証環境の管理者事前準備常備方針 |
| [REQ-117](requirements/REQ-117.md) | docs 整合・検査体系と機械工程の堅牢化（15 作業単位） |
| [REQ-118](requirements/REQ-118.md) | 検証に伴う一時資材の取扱いと後片付け責任 |
| [REQ-119](requirements/REQ-119.md) | backlog 一式 20261107T161204JST の整合是正と機械工程堅牢化（6 作業単位） |
| [REQ-120](requirements/REQ-120.md) | ADF 全体簡素化 C-α2 小修正（配布ゲート README 集約・evidence 拡張子規則・状態表約束範囲） |
| [REQ-122](requirements/REQ-122.md) | 整合性検証体制の刷新（IR 減量・検証エンジン分割・ローカル Git Hook ゲート・巨大コマンド分割・自動トリアージ）（16 作業単位） |
| [REQ-123](requirements/REQ-123.md) | 構造スリム化リファクタリング（trusted-distribution-gate 過剰防御の解体・traceability 試験再編・巨大設計書スリム化・大型スクリプト分割）（6 作業単位） |
| [REQ-124](requirements/REQ-124.md) | backlog 一式 20261121 の corpus 現行化と req-define 面強化（10 作業単位） |
<!-- AUTOGEN:END -->

- [要件インデックス](requirements/README.md)

## Decision

現行 Decision の件数と状態別内訳は [Decision インデックス](decisions/README.md) の集計を正とする。

<!-- AUTOGEN:BEGIN:id=readme-decision-summary-table -->
| Decision | タイトル |
|---|---|
| [DEC-001](decisions/DEC-001.md) | AgentDevFlow 憲章 |
| [DEC-003](decisions/DEC-003.md) | req_draft ソフトコントラクト原則 |
| [DEC-004](decisions/DEC-004.md) | 差し替え可能な I/O 境界 |
| [DEC-006](decisions/DEC-006.md) | inspect 3-command 構成への正規化 |
| [DEC-008](decisions/DEC-008.md) | case-auto の限定的親判断解決（bounded parent decision resolution） |
| [DEC-009](decisions/DEC-009.md) | ADR から Decision への正規成果物モデル移行 |
| [DEC-010](decisions/DEC-010.md) | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則 |
| [DEC-011](decisions/DEC-011.md) | STEP resume point と会話記憶非依存 |
| [DEC-012](decisions/DEC-012.md) | Extension を file-kind から workflow/capability responsibility へ再編 |
| [DEC-013](decisions/DEC-013.md) | IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定 |
| [DEC-014](decisions/DEC-014.md) | 配布依存境界の多層 enforcement |
| [DEC-016](decisions/DEC-016.md) | 導入系スクリプトの副作用ゼロ原則 |
| [DEC-019](decisions/DEC-019.md) | 一般処理の標準API委譲とADF固有意味論の所有境界 |
| [DEC-020](decisions/DEC-020.md) | GitHub Issue 共通管理単位の採用 |
| [DEC-021](decisions/DEC-021.md) | scripts 公開入口の2本固定と安定契約 |
| [DEC-022](decisions/DEC-022.md) | 実行定義層の正規所有モデルと機械強制への移行 |
| [DEC-023](decisions/DEC-023.md) | third-party Skill の分離管理と取得機構の導入 |
| [DEC-024](decisions/DEC-024.md) | 変更誘発境界リスク分析の導入と検証契約への投影 |
| [DEC-025](decisions/DEC-025.md) | プロジェクト知識を Capability Skill から分離し、独立した正規知識層として管理する |
| [DEC-026](decisions/DEC-026.md) | 実現面変更方針の構造化ハンドオフ（realization_actions） |
| [DEC-032](decisions/DEC-032.md) | ADF 責務の三層モデルと Project Contract の論理ビュー・情報寿命モデル |
| [DEC-035](decisions/DEC-035.md) | v4 Quality / Verification / Evidence / Gate モデルへの分解 |
| [DEC-036](decisions/DEC-036.md) | 意味 Skill と決定的実装の責務分離および Harness/Backend adapter 境界（superseded by DEC-048〔決定(1)（deterministic 処理／semantic 判断の二分法）は DEC-048 が部分置換。決定(2)（Harness/Backend adapter 境界）のうち配備形態（原本配置・投影モデル）に関する部分は DEC-049（ADF 共通原本とホスト接続領域の分離）が部分置換する。責務境界（semantic contract と実行機構の分離）、adapter 追加契機、決定(3)（Project Extensions の位置づけ）は本 Decision が維持する（status: accepted 維持）。semantic 6 項目・deterministic 11 項目の列挙の後継は foundations/responsibility-boundaries Design「v4 責務分類語彙の後継」節が所有する。〕） |
| [DEC-037](decisions/DEC-037.md) | Traceability の Change / Evidence 中心への再中心化（superseded by DEC-054〔トレーサビリティモデルの標準関係構造（Design への定義権委譲を前提とした covers 単独の標準コア関係を含む）を DEC-054 が拡張（covers＋採用された隣接工程間対応）。直接走査、標準能力（coverage/impact/check）、用語政策の各決定は維持する〕） |
| [DEC-038](decisions/DEC-038.md) | ADF v4 durable state 配置と再構成の契約（状態権威・証跡分離・非原子調整原則） |
| [DEC-039](decisions/DEC-039.md) | ADF v4 authority・副作用統制と冪等・並行性モデル |
| [DEC-041](decisions/DEC-041.md) | Wave 構成純度と実行並列上限の単一所有（superseded by DEC-051〔決定5（Wave 収束前提）は DEC-051 が置換。決定1〜4 は本 Decision が現行として維持〕） |
| [DEC-042](decisions/DEC-042.md) | case-auto 最大並列維持と同期逐次フォールバック禁止 |
| [DEC-047](decisions/DEC-047.md) | textlint 依存実体の版固定情報解決への転換 |
| [DEC-048](decisions/DEC-048.md) | ADF判断アーキテクチャ: 判断方法・確定権限・人間判断境界の統一モデル |
| [DEC-049](decisions/DEC-049.md) | ADF 共通原本とホスト接続領域の分離によるマルチホスト配布モデル |
| [DEC-050](decisions/DEC-050.md) | マージ済みリモートブランチの削除と操作安全性 |
| [DEC-051](decisions/DEC-051.md) | case-auto stage 3 のスロット型キューへの移行（Wave 収束前提の撤廃） |
| [DEC-053](decisions/DEC-053.md) | ADF v5 工程・成果物モデル（共通責務・参照モデル工程・成果物の意味と正式確定） |
| [DEC-054](decisions/DEC-054.md) | ADF v5 追跡・品質検証モデル（隣接工程間対応・構造/意味分離・差分影響評価） |
| [DEC-055](decisions/DEC-055.md) | ADF v5 有限実行と責務再編（工程独立実行・Issue 必要時利用・Wave の意味的依存グループ化） |
| [DEC-056](decisions/DEC-056.md) | ADF v5 移行と互換性の境界（後方互換非必須・意味保存移行・未処理改善情報の継続） |
| [DEC-057](decisions/DEC-057.md) | 工程駆動コラボレーションモデル（検討テーマ・外部検討・段階形成）の採用 |
| [DEC-058](decisions/DEC-058.md) | 工程遷移と双経路併存モデルの採用（REQ-005-001/010/011 改訂を含む） |
| [DEC-061](decisions/DEC-061.md) | 改善サイクルのパッチリリースと公開承認 |
| [DEC-062](decisions/DEC-062.md) | 要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離 |
| [DEC-063](decisions/DEC-063.md) | 分割③ CI 日次定期実行（cron schedule）の撤去 |
| [DEC-065](decisions/DEC-065.md) | 整合性検証体制の中核化（IR 24+IR-075 体系・プラグイン型検証エンジン・src 正本化） |
| [DEC-066](decisions/DEC-066.md) | ローカル Git Hook による決定論的検証ゲート（CI 非依存） |
| [DEC-067](decisions/DEC-067.md) | 仮説に基づく既存統制変更原則 |
<!-- AUTOGEN:END -->

## 設計（Design）

Design は 3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
詳細は [Design インデックス](designs/README.md) 参照。

### 横断 Design（`designs/workflows/`）

- [Workflow Skill Model](designs/workflows/workflow-skill-model.md)
- [サブエージェント委譲契約（v4）](designs/workflows/delegation-contracts.md)
- [キャプチャ境界](designs/workflows/capture-boundaries.md)
- [Issue タイトル記述規則](designs/workflows/issue-title-policy.md)
- [Case Issue 工程記録モデル](designs/workflows/issue-lifecycle-records.md)
- [execution_unit 構成アルゴリズム参照](designs/workflows/references/execution-unit-construction.md)
- [ADF v4 標準ライフサイクル](designs/workflows/standard-lifecycle.md)
- [ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）](designs/workflows/lifecycle-state-machine.md)
- [ADF v4 継続コラボレーションループ](designs/workflows/collaboration-loop.md)
- [Case Issue 工程記録モデル](designs/workflows/issue-lifecycle-records.md)
- [ADF 工程駆動コラボレーションモデル](designs/workflows/phase-driven-collaboration-model.md)
- [ADF 工程遷移・独立レビューと双経路併存モデル](designs/workflows/phase-transition-and-coexistence-model.md)
- [検証に伴う一時資材の取扱いと後片付け責任](designs/workflows/verification-resource-lifecycle.md)

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
- [ADF Operating Model](designs/foundations/operating-model.md)
- [ADF 実装責務境界](designs/foundations/responsibility-boundaries.md)
- [ADF Traceability モデル](designs/foundations/traceability-model.md)
- [マルチホスト原本モデル（共通原本とホスト別接続の分離）](designs/foundations/multi-host-canonical-model.md)
- [ADF durable state と再構成・恢復（配置表・権威移行・部分失敗調整）](designs/foundations/durable-state-and-recovery.md)
- [ADF Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）](designs/foundations/runtime-execution-model.md)
- [ADF 採用規約機構（採用済み工程・成果物規約の宣言・保存・解決）](designs/foundations/adopted-conventions.md)

#### responsibilities/（文書種別、成果物責務）

- [文書種別責務・配置基準](designs/responsibilities/document-type-responsibilities.md)
- [成果物責任表](designs/responsibilities/artifact-responsibilities.md)
- [アーティファクト契約](designs/responsibilities/artifact-contracts.md)
- [REQ 影響マップ](designs/responsibilities/req-impact-map.md)
- [Artifact Quality Control Routing](designs/responsibilities/artifact-quality-control-routing.md)
- [Custom Tool 操作契約](designs/responsibilities/custom-tool-contracts.md)

#### quality/（品質）

- [品質仕様](designs/quality/quality-specs.md)
- [ADF v4 Quality / Verification / Evidence / Gate モデル](designs/quality/quality-gate-model.md)

#### integrity/（整合性契約、ルール）

- [索引類自動生成](designs/integrity/index-auto-generation.md)
- [整合性契約](designs/integrity/integrity-contracts.md)
- [整合性ルールカタログ](designs/integrity/integrity-rule-catalog.md)
- [整合性ルール詳細（IR-NNN）](designs/integrity/rules/)
- [ルール所有権マトリックス](designs/integrity/rule-ownership.md)
- [配布物整合性検査ルール](designs/integrity/docs-spec-rebuild-integrity.md)
- [配布依存境界](designs/integrity/distribution-boundary.md)
- [validator 分割基準](designs/integrity/validator-split-criteria.md)
- [Targeted Docs Guard 実装詳細](designs/integrity/targeted-docs-guard-implementation.md)
- [AUTOGEN ブロック鮮度検出 gate](designs/integrity/autogen-freshness-gate.md)
- [テスト影響範囲検出 gate](designs/integrity/test-impact-detection-gate.md)
- [checker 実行契約と検出基盤規則](designs/integrity/checker-execution-contracts.md)
- [検証エンジン プラグインアーキテクチャ](designs/integrity/integrity-engine-plugin-architecture.md)
- [ローカル検証ゲート（draft）](designs/integrity/local-verification-gates.md)

#### local/（ローカル版 Design）

- [実行時パッケージ境界](designs/local/runtime-package-boundary.md)
- [ローカルIssue共通スキーマ](designs/local/local-case-file.md)
- [導入スクリプトの使いやすさ詳細](designs/local/install-script-usability.md)
- [third-party Skill 管理](designs/local/third-party-skill-management.md)

#### authoring/（執筆規約）

2026-11-18 時点で配下 Design なし（command-file-format.md・vocabulary-registry.md は DEC-065 により廃止。執筆規約は [品質仕様](designs/quality/quality-specs.md) が所有する）。

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
- [マルチホスト運用](guides/multi-host-operations.md)
- [トラブルシューティング](guides/troubleshooting.md)
- [Supervisor 環境向け opencode credential 供給ブリッジ導入](guides/supervisor-credential-bridge.md)
- [用語集](guides/glossary.md)
