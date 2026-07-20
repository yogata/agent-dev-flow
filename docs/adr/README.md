# アーキテクチャ決定記録（ADR）

アーキテクチャ決定記録（ADR）のインデックス。

## 現行基盤ビュー

<!-- AUTOGEN:BEGIN:id=adr-baseline-count -->
承認済みステータス（accepted）の ADR-01XX 25件が、現在のアーキテクチャ判断の基盤である。
<!-- AUTOGEN:END -->
各 ADR は基準再編により旧 ADR の内容を統合、再定義している。
現行基盤ビューは承認済み ADR のみを現行根拠として含み、置き換え済み（superseded）、非推奨（deprecated）の ADR は別セクション（ステータス別ビュー）に分離する。

<!-- AUTOGEN:BEGIN:id=adr-baseline-table -->
| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| ADR-0101 | AgentDevFlow プラグイン名前空間の統一 | accepted | 2026-06-08 |
| ADR-0102 | 実行時 / 編集時 関心分離 | accepted | 2026-06-08 |
| ADR-0103 | 文書種別責務境界 | accepted | 2026-06-08 |
| ADR-0104 | 実行時独立性 | accepted | 2026-06-08 |
| ADR-0105 | OpenCode ソース・プロジェクション分離 | accepted | 2026-06-08 |
| ADR-0106 | リポジトリローカルツールのための /repo/* 名前空間 | accepted | 2026-06-08 |
| ADR-0107 | コマンド・スキル・テンプレート・スクリプト責任分界の正式定義 | accepted | 2026-06-08 |
| ADR-0108 | オーケストレーションスキル作成基準の導入 | accepted | 2026-06-08 |
| ADR-0109 | Epic Issue 本文を実行順序 SSoT とする設計 | accepted | 2026-06-08 |
| ADR-0110 | DOC-MAP 採用判断 | accepted | 2026-06-08 |
| ADR-0112 | サブエージェント委譲の一般化と委譲時最小契約 | accepted | 2026-06-10 |
| ADR-0114 | case-run 実行責務の外部実行バックエンド委譲 | accepted | 2026-06-16 |
| ADR-0123 | SPEC ライフサイクルと spec-save の導入 | accepted | 2026-06-18 |
| ADR-0124 | req_draft ソフトコントラクト原則: LLM推論消費・厳格スキーマなし | accepted | 2026-06-19 |
| ADR-0125 | case-auto Wave 内並列子Issue実行モデル | accepted | 2026-06-20 |
| ADR-0127 | case-auto 構成工程の委譲によるスケーラビリティ確立 | accepted | 2026-06-21 |
| ADR-0128 | case-run の実行モデル: 実行担当サブエージェント委譲 | accepted | 2026-06-21 |
| ADR-0129 | 複数 execution_unit 並列実行モデル（複数 SSoT 並立と Epic 間並列 orchestration"） | accepted | 2026-06-23 |
| ADR-0130 | `agentdev-gh-cli` を差し替え可能な I/O 境界として確立 | accepted | 2026-06-23 |
| ADR-0131 | ローカル版導入方式を link mode へ統一し生成方式を廃止 | accepted | 2026-06-23 |
| ADR-0132 | コンフリクト解消モデル（3レベルエスカレーションと責務割当） | accepted | 2026-06-24 |
| ADR-0135 | Project Extensions Architecture | accepted | 2026-07-04 |
| ADR-0136 | 配布物の harness 実行制御分離 | accepted | 2026-07-12 |
| ADR-0137 | case-auto における case-run インライン実行（多重委譲回避） | accepted | 2026-07-16 |
| ADR-0138 | case-auto オーケストレーション制御の AgentDevFlow 側集約 | accepted | 2026-07-19 |
<!-- AUTOGEN:END -->

> この README は分類ビューであり、ADR本文のSSoTではない。
> 基準は各 `ADR-{NNNN}.md` ファイルである（REQ-0101）。

## ステータス別ビュー

### 承認済み（accepted）

<!-- AUTOGEN:BEGIN:id=adr-status-accepted -->
- [ADR-0101](ADR-0101.md)（AgentDevFlow プラグイン名前空間の統一）
- [ADR-0102](ADR-0102.md)（実行時 / 編集時 関心分離）
- [ADR-0103](ADR-0103.md)（文書種別責務境界）
- [ADR-0104](ADR-0104.md)（実行時独立性）
- [ADR-0105](ADR-0105.md)（OpenCode ソース・プロジェクション分離）
- [ADR-0106](ADR-0106.md)（リポジトリローカルツールのための /repo/* 名前空間）
- [ADR-0107](ADR-0107.md)（コマンド・スキル・テンプレート・スクリプト責任分界の正式定義）
- [ADR-0108](ADR-0108.md)（オーケストレーションスキル作成基準の導入）
- [ADR-0109](ADR-0109.md)（Epic Issue 本文を実行順序 SSoT とする設計）
- [ADR-0110](ADR-0110.md)（DOC-MAP 採用判断）
- [ADR-0112](ADR-0112.md)（サブエージェント委譲の一般化と委譲時最小契約）
- [ADR-0114](ADR-0114.md)（case-run 実行責務の外部実行バックエンド委譲）
- [ADR-0123](ADR-0123.md)（SPEC ライフサイクルと spec-save の導入）
- [ADR-0124](ADR-0124.md)（req_draft ソフトコントラクト原則: LLM推論消費・厳格スキーマなし）
- [ADR-0125](ADR-0125.md)（case-auto Wave 内並列子Issue実行モデル）
- [ADR-0127](ADR-0127.md)（case-auto 構成工程の委譲によるスケーラビリティ確立）
- [ADR-0128](ADR-0128.md)（case-run の実行モデル: 実行担当サブエージェント委譲）
- [ADR-0129](ADR-0129.md)（複数 execution_unit 並列実行モデル（複数 SSoT 並立と Epic 間並列 orchestration"））
- [ADR-0130](ADR-0130.md)（`agentdev-gh-cli` を差し替え可能な I/O 境界として確立）
- [ADR-0131](ADR-0131.md)（ローカル版導入方式を link mode へ統一し生成方式を廃止）
- [ADR-0132](ADR-0132.md)（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
- [ADR-0135](ADR-0135.md)（Project Extensions Architecture）
- [ADR-0136](ADR-0136.md)（配布物の harness 実行制御分離）
- [ADR-0137](ADR-0137.md)（case-auto における case-run インライン実行（多重委譲回避））
- [ADR-0138](ADR-0138.md)（case-auto オーケストレーション制御の AgentDevFlow 側集約）
<!-- AUTOGEN:END -->

### 提案中（proposed）

<!-- AUTOGEN:BEGIN:id=adr-status-proposed -->
- [ADR-0134](ADR-0134.md)（配布物依存スキルの src 昇格方針）
<!-- AUTOGEN:END -->

### 置き換え済み（superseded）

<!-- AUTOGEN:BEGIN:id=adr-status-superseded -->
- [ADR-0111](ADR-0111.md)（マネージャー・オーケストレータパターンの限定採用）
- [ADR-0126](ADR-0126.md)（ローカル版 OpenCode 生成基盤: ソースモデル拡張と生成安全性制約）
<!-- AUTOGEN:END -->

### 非推奨（deprecated）

<!-- AUTOGEN:BEGIN:id=adr-status-deprecated -->
- [ADR-0113](ADR-0113.md)（診断ワークフロー導入とレビュー系コマンド完全削除）
<!-- AUTOGEN:END -->

## トピック別ビュー

### 名前空間、プラグイン

- [ADR-0101](ADR-0101.md)（AgentDevFlow プラグイン名前空間の統一）
- [ADR-0106](ADR-0106.md)（/repo/* Namespace for Repo-Local Tooling）

### アーキテクチャ

- [ADR-0102](ADR-0102.md)（実行時 / 編集時 関心分離）
- [ADR-0103](ADR-0103.md)（文書種別責務境界、記述対象境界）
- [ADR-0104](ADR-0104.md)（実行時独立性）
- [ADR-0105](ADR-0105.md)（OpenCode ソース、プロジェクション分離）
- [ADR-0124](ADR-0124.md)（req_draft soft-contract 原則: LLM推論消費、厳格schemaなし）
- [ADR-0134](ADR-0134.md)（配布物依存スキルの src 昇格方針）

### コマンド、スキル設計

- [ADR-0107](ADR-0107.md)（コマンド・スキル・テンプレート・スクリプト責任分界の正式定義）
- [ADR-0108](ADR-0108.md)（オーケストレーションスキル作成基準の導入）
- [ADR-0111](ADR-0111.md)（マネージャー、オーケストレータパターンの限定採用）
- [ADR-0112](ADR-0112.md)（サブエージェント委譲の一般化と委譲時最小契約）
- [ADR-0113](ADR-0113.md)（診断ワークフロー導入とレビュー系コマンド完全削除）
- [ADR-0123](ADR-0123.md)（SPEC lifecycle と spec-save の導入）

### ワークフロー

- [ADR-0109](ADR-0109.md)（Epic Issue 本文を実行順序 SSoT とする設計）
- [ADR-0114](ADR-0114.md)（case-run 実行責務の外部実行バックエンド委譲）
- [ADR-0125](ADR-0125.md)（case-auto Wave 内並列子Issue実行モデル）
- [ADR-0127](ADR-0127.md)（case-auto 構成工程の委譲によるスケーラビリティ確立）
- [ADR-0128](ADR-0128.md)（case-run の実行モデル: 実行担当サブエージェント委譲）
- [ADR-0129](ADR-0129.md)（複数 execution_unit 並列実行モデル）（複数 SSoT 並立と Epic 間並列 orchestration）
- [ADR-0132](ADR-0132.md)（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
- [ADR-0136](ADR-0136.md)（配布物ハーネス境界の浄化）
- [ADR-0137](ADR-0137.md)（case-auto における case-run インライン実行（多重委譲回避））
- [ADR-0138](ADR-0138.md)（case-auto オーケストレーション制御の AgentDevFlow 側集約）

### 文書

- [ADR-0110](ADR-0110.md)（DOC-MAP 採用判断）
- [ADR-0135](ADR-0135.md)（Project Extensions Architecture）

Decision Map（ADR 間の supersedes / relates-to / superseded-by 関係）。

| ADR | 関係 | 対象 | 説明 |
|-----|------|------|------|
| ADR-0101 | supersedes | ADR-0005 (retired) | namespace統一を現行基盤として再定義 |
| ADR-0102 | supersedes | ADR-0013 (retired) | 実行時/編集時分離を基準として再定義 |
| ADR-0102 | relates-to | ADR-0101 | 責務分界の具体化 |
| ADR-0102 | relates-to | ADR-0103 | 文書体系への適用 |
| ADR-0103 | supersedes | ADR-0017 (retired) | 文書種別責務境界を現行基盤として再定義 |
| ADR-0103 | relates-to | ADR-0102 | 本判断の基盤 |
| ADR-0103 | relates-to | ADR-0104 | 補完関係 |
| ADR-0104 | supersedes | ADR-0018 (retired) | 実行時独立性を基準として再定義 |
| ADR-0104 | supersedes | ADR-0016 (retired) | skill references の実行時専用制約を統合 |
| ADR-0104 | supersedes | ADR-0015 (retired) | docs/specs の実行時非依存宣言を統合 |
| ADR-0104 | relates-to | ADR-0102 | 本判断の基盤 |
| ADR-0104 | relates-to | ADR-0103 | 補完関係 |
| ADR-0105 | supersedes | ADR-0019 (retired) | source/projection分離を現行基盤として再定義 |
| ADR-0105 | relates-to | ADR-0102 | 実行時/編集時分離の具体化 |
| ADR-0105 | relates-to | ADR-0103 | 文書種別責務境界の物理層での裏付け |
| ADR-0105 | relates-to | ADR-0104 | 実行時独立性のsource/projection分離による実現 |
| ADR-0106 | supersedes | ADR-0020 (retired) | repo-local namespaceを現行基盤として再定義 |
| ADR-0106 | relates-to | ADR-0101 | canonical namespaceとrepo-local namespaceの境界定義 |
| ADR-0106 | relates-to | ADR-0105 | repo-local artifactをsource/projection同期対象外にする根拠 |
| ADR-0107 | supersedes | ADR-0001 (retired) | 責任分界を現行基盤として再定義 |
| ADR-0107 | relates-to | ADR-0108 | 補完関係 |
| ADR-0108 | supersedes | ADR-0002 (retired) | orchestration skill作成基準を現行基盤として再定義 |
| ADR-0108 | relates-to | ADR-0107 | 補完関係 |
| ADR-0109 | supersedes | ADR-0006 (retired) | Epic Issue SSoTを現行基盤として再定義 |
| ADR-0109 | relates-to | ADR-0101 | case-open/case-runのコマンド体系 |
| ADR-0110 | supersedes | ADR-0008 (retired) | DOC-MAP導入を現行基盤として再定義 |
| ADR-0110 | supersedes | ADR-0007 (retired) | views導入決定をsupersede |
| ADR-0110 | relates-to | ADR-0004 (retired) | area-based移行方針の最終撤回 |
| ADR-0111 | supersedes | ADR-0011 (retired) | manager/orchestratorパターンを現行基盤として再定義 |
| ADR-0111 | relates-to | ADR-0108 | skill化基準とpattern採用基準の区別 |
| ADR-0111 | relates-to | ADR-0109 | Epic OrchestratorのSSoT基盤 |
| ADR-0111 | superseded-by | ADR-0112 | 委譲一般化に包括 |
| ADR-0112 | supersedes | ADR-0111 | 委譲の一般化として包括 |
| ADR-0112 | relates-to | ADR-0107 | Command薄さの根拠 |
| ADR-0112 | relates-to | ADR-0108 | skill化基準 |
| ADR-0114 | relates-to | ADR-0112 | 委譲一般化の特定適用（driver subagent が最小契約に従う） |
| ADR-0114 | relates-to | ADR-0109 | orchestration は Epic Issue を SSoT として維持 |
| ADR-0123 | relates-to | ADR-0103 | SPEC の責務境界（現在仕様の基準）を維持しつつ lifecycle 層を追加 |
| ADR-0123 | relates-to | ADR-0107 | 新コマンド spec-save の責務分界（コマンド・スキル・テンプレート・スクリプト責任分界の適用） |
| ADR-0124 | relates-to | ADR-0107 | コマンド・スキル・テンプレート・スクリプト責任分界の適用 |
| ADR-0124 | relates-to | ADR-0123 | SPEC lifecycle と spec-save の導入との整合 |
| ADR-0125 | relates-to | ADR-0109 | SSoT 原則の維持（Epic Issue 本文から Wave 構成を読み取り） |
| ADR-0125 | relates-to | ADR-0114 | 委譲モデルの維持（case-run は1 Issue/call のまま） |
| ADR-0126 | relates-to | ADR-0105 | source/projection 分離の source model 拡張 |
| ADR-0127 | relates-to | ADR-0112 | 委譲一般化の case-auto 工程への特定適用（委譲時最小契約に従う） |
| ADR-0127 | relates-to | ADR-0114 | case-run 外部実行バックエンド委譲モデルの維持（本 ADR は残り4工程の委譲を追加） |
| ADR-0127 | relates-to | ADR-0125 | Wave/子Issueオーケストレーションの維持（case-auto 保持責務は変更しない） |
| ADR-0127 | relates-to | ADR-0136 | 本 ADR の委譲記述から harness 固有詳細を除去し、result 契約を4状態へ拡張 |
| ADR-0128 | relates-to | ADR-0114 | case-run 実行モデルを外部実行バックエンドから実行担当サブエージェント委譲に変更（result 契約4状態、worktree隔離、Findings/Capture配置は維持） |
| ADR-0128 | relates-to | ADR-0127 | case-auto から Epic/Wave orchestration を削除し case-run/case-close に移管 |
| ADR-0128 | relates-to | ADR-0125 | Epic Issue 本文の単一書き手を case-auto から case-close に移行 |
| ADR-0128 | relates-to | ADR-0109 | Epic Issue 本文を SSoT として維持（case-run/case-close が進行状況を判定する基盤） |
| ADR-0128 | relates-to | ADR-0136 | result 契約を3状態から4状態へ拡張し、harness 固有詳細を配布物から除去 |
| ADR-0129 | relates-to | ADR-0109 | SSoT 原則の per-Epic 拡張（複数 Epic の SSoT 並立） |
| ADR-0129 | relates-to | ADR-0125 | Wave 内並列の維持、Epic 間並列の追加（直交する別次元の並列制御） |
| ADR-0129 | relates-to | ADR-0127 | case-auto orchestration 拡張（複数 execution_unit 並列 orchestration の追加、委譲モデルは維持） |
| ADR-0129 | relates-to | ADR-0128 | case-run スコープ維持（case-run は引き続き単一 standard/epic の現在 Wave を実行） |
| ADR-0126 | superseded-by | ADR-0131 | ローカル版導入方式の link mode 統一と生成方式廃止 |
| ADR-0130 | relates-to | ADR-0107 | コマンド・スキル・テンプレート・スクリプト責任分界の適用 |
| ADR-0130 | relates-to | ADR-0112 | サブエージェント委譲の一般化の適用 |
| ADR-0130 | relates-to | ADR-0126 | ローカル版 OpenCode 生成基盤（差し替え可能性の基盤） |
| ADR-0131 | supersedes | ADR-0126 | ローカル版導入方式の link mode 統一と生成方式廃止 |
| ADR-0131 | relates-to | ADR-0105 | source/projection 分離の link mode 適用 |
| ADR-0131 | relates-to | ADR-0130 | I/O 境界確立を前提とした link mode 統一 |
| ADR-0132 | relates-to | ADR-0129 | ADR-0129 が受容したコンフリクトコストの解決メカニズムを定義 |
| ADR-0132 | relates-to | ADR-0128 | case-run の再委譲は既存の委譲モデルを使用 |
| ADR-0134 | relates-to | ADR-0105 | 配布物依存スキルの src 昇格は source/projection 分離における配布物自己完結性の具体化 |
| ADR-0135 | relates-to | ADR-0104 | 実行時独立性の具体化機構を提供（project-extensions 機構） |
| ADR-0136 | relates-to | ADR-0114 | case-run 実行委譲の結果契約拡張（3状態→4状態、delegation-unavailable 追加） |
| ADR-0136 | relates-to | ADR-0127 | case-auto 構成工程委譲の harness 固有詳細除去 |
| ADR-0136 | relates-to | ADR-0128 | case-run 実行委譲の harness 固有詳細除去 |
| ADR-0137 | relates-to | ADR-0114 | case-auto 経由 case-run の実行モデルを case-run 実行担当委譲に整理（result 契約4状態は維持） |
| ADR-0137 | relates-to | ADR-0125 | Wave 内並列実行を case-run インライン実行で実現（子Issue ごと case-run 委譲という旧実行方式には依存しない） |
| ADR-0137 | relates-to | ADR-0127 | case-run を構成工程委譲の対象から除外し、case-auto 内インライン実行を標準動作化（委譲起点の折りたたみ） |
| ADR-0137 | relates-to | ADR-0128 | case-auto 経由時の委譲起点を折りたたみ、単独 case-run と case-auto 経由 case-run の2形態を読み分ける |
| ADR-0137 | relates-to | ADR-0136 | 多重委譲を要求しない形でハーネス境界を維持（harness 固有詳細の配布物依存を回避しつつ、実行制御は harness 側） |
| ADR-0138 | relates-to | ADR-0125 | Wave 内固定並列数5と Phase 2 実行制御主体を AgentDevFlow 側制御点として具体化（REQ-0114-106） |
| ADR-0138 | relates-to | ADR-0136 | case-auto の Phase 分離、固定並列数、bg task 状態管理を AgentDevFlow 側へ集約（決定2の限定注記） |
| ADR-0138 | relates-to | ADR-0137 | case-run インライン実行モデルを維持しつつ Phase 2 並列実行の安全境界を規定 |
| ADR-0138 | relates-to | ADR-0129 | 複数 execution_unit 並列実行モデルの上に Phase 分離モデルを重ね、Phase 2 同時起動数を固定値5として規定 |
| ADR-0138 | relates-to | ADR-0132 | bg task 破棄時の状態別回復とコンフリクト解消モデルの協調 |

## 関連 REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| ADR-0101 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md) | namespace統一、command migration、ドメイン状態定義 |
| ADR-0102 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | frontmatter規約reversal、integrity検査reversal |
| ADR-0103 | [REQ-0101](../requirements/REQ-0101.md), [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | 文書種別責務境界、記述対象境界の宣言 |
| ADR-0104 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | 実行時独立性、SPEC非依存の宣言 |
| ADR-0105 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | source/projection分離、sync script、integrity scan分離 |
| ADR-0106 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | repo-local namespace定義、docs-check移管、配布対象外制約 |
| ADR-0107 | [REQ-0103](../requirements/REQ-0103.md) | Command/Skill/Template/Script責務分界の要件定義 |
| ADR-0108 | [REQ-0103](../requirements/REQ-0103.md) | orchestration skill化基準の要件定義 |
| ADR-0109 | [REQ-0104](../requirements/REQ-0104.md), [REQ-0106](../requirements/REQ-0106.md) | Epic Issue実行順序SSoT、case-run Epic Orchestrator |
| ADR-0110 | [REQ-0101](../requirements/REQ-0101.md) | DOC-MAP導入、views廃止 |
| ADR-0111 | - | 対応REQなし（architecture principleとして定義）。superseded by ADR-0112 |
| ADR-0112 | [REQ-0119](../requirements/REQ-0119.md) | コマンド、スキル、サブエージェント責務分界の再基準化 |
| ADR-0113 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md), [REQ-0109](../requirements/REQ-0109.md), REQ-0115 (旧REQ、削除済み) | 診断ワークフロー導入、レビュー系コマンド完全削除（deprecated: 現行状態は REQ-0124 / SPEC 参照） |
| ADR-0114 | [REQ-0104](../requirements/REQ-0104.md), [REQ-0106](../requirements/REQ-0106.md) | case-run 実行責務の外部実行バックエンド委譲 |
| ADR-0123 | [REQ-0136](../requirements/REQ-0136.md), [REQ-0102](../requirements/REQ-0102.md), [REQ-0103](../requirements/REQ-0103.md) | SPEC lifecycle と spec-save の導入 |
| ADR-0124 | [REQ-0138](../requirements/REQ-0138.md) | 構造化 req_draft 契約 |
| ADR-0125 | [REQ-0106](../requirements/REQ-0106.md), [REQ-0114](../requirements/REQ-0114.md) | case-auto Wave 内並列子Issue実行モデル |
| ADR-0126 | [REQ-0141](../requirements/REQ-0141.md), [REQ-0134](../requirements/REQ-0134.md) | ローカル版 OpenCode 生成基盤: source model 拡張と生成安全性制約 |
| ADR-0127 | [REQ-0114](../requirements/REQ-0114.md), [REQ-0119](../requirements/REQ-0119.md) | case-auto 構成工程の委譲によるスケーラビリティ確立 |
| ADR-0128 | [REQ-0130](../requirements/REQ-0130.md), [REQ-0131](../requirements/REQ-0131.md), [REQ-0114](../requirements/REQ-0114.md), [REQ-0139](../requirements/REQ-0139.md) | case-run の実行モデル: 実行担当サブエージェント委譲 |
| ADR-0129 | [REQ-0148](../requirements/REQ-0148.md), [REQ-0114](../requirements/REQ-0114.md) | 複数 execution_unit 並列実行モデル（複数 SSoT 並立、Epic 間並列 orchestration） |
| ADR-0130 | [REQ-0149](../requirements/REQ-0149.md), [REQ-0150](../requirements/REQ-0150.md) | `agentdev-gh-cli` を差し替え可能な I/O 境界として確立 |
| ADR-0131 | [REQ-0141](../requirements/REQ-0141.md), [REQ-0134](../requirements/REQ-0134.md), [REQ-0150](../requirements/REQ-0150.md) | ローカル版導入方式を link mode へ統一し生成方式を廃止 |
| ADR-0132 | [REQ-0151](../requirements/REQ-0151.md), [REQ-0148](../requirements/REQ-0148.md), [REQ-0114](../requirements/REQ-0114.md), [REQ-0131](../requirements/REQ-0131.md), [REQ-0130](../requirements/REQ-0130.md) | コンフリクト解消モデル（3レベルエスカレーションと責務割当） |
| ADR-0134 | [REQ-0159](../requirements/REQ-0159.md) | 配布物依存スキルの src 昇格方針と未トラックスキル検出 |
| ADR-0135 | [REQ-0160](../requirements/REQ-0160.md), [REQ-0103](../requirements/REQ-0103.md) | Project Extensions Architecture（doc-inputs から project-extensions への全面置換） |
| ADR-0136 | [REQ-0162](../requirements/REQ-0162.md), [REQ-0139](../requirements/REQ-0139.md), [REQ-0130](../requirements/REQ-0130.md), [REQ-0114](../requirements/REQ-0114.md), [REQ-0151](../requirements/REQ-0151.md) | 配布物ハーネス境界の浄化（harness 固有詳細の配布物からの除去、4状態結果契約） |
| ADR-0138 | [REQ-0114](../requirements/REQ-0114.md), [REQ-0148](../requirements/REQ-0148.md), [REQ-0162](../requirements/REQ-0162.md) | case-auto オーケストレーション制御の AgentDevFlow 側集約（Phase 分離、固定並列数、bg task 状態管理と回復） |

ADR-0001 から ADR-0023 までの23件は、ADR-01XX 現行基盤導入に伴い現行基準から外された歴史的決定記録である（2026-07-20に物理削除）。これらは再編前の判断を保持しており、現行アーキテクチャの基盤は上記 現行基盤ビューの ADR-01XX にある。後継関係（各 ADR-01XX の supersedes 宣言）は Decision Map（関連 ADR 依存関係）の欄を参照。

<!-- AUTOGEN:BEGIN:id=adr-retired-table -->
| ADR番号 | タイトル | retired時ステータス |
|---------|---------|-------------------|
<!-- AUTOGEN:END -->
