# アーキテクチャ決定記録（ADR）

アーキテクチャ決定記録（ADR）のインデックス。

## 現行基盤ビュー

承認済みステータス（accepted）の ADR-01XX 17件が、現在のアーキテクチャ判断の基盤である。各 ADR は基準再編により旧 ADR の内容を統合・再定義している。現行基盤ビューは承認済み ADR のみを現行根拠として含み、置き換え済み（superseded）・非推奨（deprecated）の ADR は別セクション（ステータス別ビュー）に分離する。

| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| ADR-0101 | AgentDevFlow プラグイン名前空間の統一 | accepted | 2026-06-08 |
| ADR-0102 | 実行時 / 編集時 関心分離 | accepted | 2026-06-08 |
| ADR-0103 | 文書種別責務境界・記述対象境界 | accepted | 2026-06-08 |
| ADR-0104 | 実行時独立性 | accepted | 2026-06-08 |
| ADR-0105 | OpenCode ソース・プロジェクション分離 | accepted | 2026-06-08 |
| ADR-0106 | /repo/* Namespace for Repo-Local Tooling | accepted | 2026-06-08 |
| ADR-0107 | コマンド・スキル・テンプレート・スクリプト責任分界の正式定義 | accepted | 2026-06-08 |
| ADR-0108 | オーケストレーションスキル作成基準の導入 | accepted | 2026-06-08 |
| ADR-0109 | Epic Issue 本文を実行順序 SSoT とする設計 | accepted | 2026-06-08 |
| ADR-0110 | DOC-MAP 採用判断 | accepted | 2026-06-08 |
| ADR-0112 | サブエージェント委譲の一般化と委譲時最小契約 | accepted | 2026-06-10 |
| ADR-0114 | case-run 実行責務の外部実行バックエンド委譲 | accepted | 2026-06-16 |
| ADR-0123 | SPEC lifecycle と spec-save の導入 | accepted | 2026-06-18 |
| ADR-0124 | req_draft soft-contract 原則: LLM推論消費・厳格schemaなし | accepted | 2026-06-19 |
| ADR-0125 | case-auto Wave 内並列子Issue実行モデル | accepted | 2026-06-20 |
| ADR-0126 | ローカル版 OpenCode 生成基盤: source model 拡張と生成安全性制約 | accepted | 2026-06-20 |
| ADR-0127 | case-auto 構成工程の task() 委譲によるスケーラビリティ確立 | accepted | 2026-06-21 |

> この README は分類ビューであり、ADR本文のSSoTではない。基準は各 `ADR-{NNNN}.md` ファイルである（REQ-0101）。

## ステータス別ビュー

### 承認済み（accepted）

- [ADR-0101](ADR-0101.md) — AgentDevFlow プラグイン名前空間の統一
- [ADR-0102](ADR-0102.md) — 実行時 / 編集時 関心分離
- [ADR-0103](ADR-0103.md) — 文書種別責務境界・記述対象境界
- [ADR-0104](ADR-0104.md) — 実行時独立性
- [ADR-0105](ADR-0105.md) — OpenCode ソース・プロジェクション分離
- [ADR-0106](ADR-0106.md) — /repo/* Namespace for Repo-Local Tooling
- [ADR-0107](ADR-0107.md) — コマンド・スキル・テンプレート・スクリプト責任分界の正式定義
- [ADR-0108](ADR-0108.md) — オーケストレーションスキル作成基準の導入
- [ADR-0109](ADR-0109.md) — Epic Issue 本文を実行順序 SSoT とする設計
- [ADR-0110](ADR-0110.md) — DOC-MAP 採用判断
- [ADR-0112](ADR-0112.md) — サブエージェント委譲の一般化と委譲時最小契約
- [ADR-0114](ADR-0114.md) — case-run 実行責務の外部実行バックエンド委譲
- [ADR-0123](ADR-0123.md) — SPEC lifecycle と spec-save の導入
- [ADR-0124](ADR-0124.md) — req_draft soft-contract 原則: LLM推論消費・厳格schemaなし
- [ADR-0125](ADR-0125.md) — case-auto Wave 内並列子Issue実行モデル
- [ADR-0126](ADR-0126.md) — ローカル版 OpenCode 生成基盤: source model 拡張と生成安全性制約
- [ADR-0127](ADR-0127.md) — case-auto 構成工程の task() 委譲によるスケーラビリティ確立

### 置き換え済み（superseded）

- [ADR-0111](ADR-0111.md) — マネージャー・オーケストレータパターンの限定採用（superseded by ADR-0112）

### 非推奨（deprecated）

- [ADR-0113](ADR-0113.md) — 診断ワークフロー導入とレビュー系コマンド完全削除（diagnostics → inspect 改名により現行根拠として非適用。現行状態は REQ-0124 / SPEC 参照）

## トピック別ビュー

### 名前空間・プラグイン

- [ADR-0101](ADR-0101.md) — AgentDevFlow プラグイン名前空間の統一
- [ADR-0106](ADR-0106.md) — /repo/* Namespace for Repo-Local Tooling

### アーキテクチャ

- [ADR-0102](ADR-0102.md) — 実行時 / 編集時 関心分離
- [ADR-0103](ADR-0103.md) — 文書種別責務境界・記述対象境界
- [ADR-0104](ADR-0104.md) — 実行時独立性
- [ADR-0105](ADR-0105.md) — OpenCode ソース・プロジェクション分離
- [ADR-0124](ADR-0124.md) — req_draft soft-contract 原則: LLM推論消費・厳格schemaなし

### コマンド・スキル設計

- [ADR-0107](ADR-0107.md) — コマンド・スキル・テンプレート・スクリプト責任分界の正式定義
- [ADR-0108](ADR-0108.md) — オーケストレーションスキル作成基準の導入
- [ADR-0111](ADR-0111.md) — マネージャー・オーケストレータパターンの限定採用
- [ADR-0112](ADR-0112.md) — サブエージェント委譲の一般化と委譲時最小契約
- [ADR-0113](ADR-0113.md) — 診断ワークフロー導入とレビュー系コマンド完全削除
- [ADR-0123](ADR-0123.md) — SPEC lifecycle と spec-save の導入

### ワークフロー

- [ADR-0109](ADR-0109.md) — Epic Issue 本文を実行順序 SSoT とする設計
- [ADR-0114](ADR-0114.md) — case-run 実行責務の外部実行バックエンド委譲
- [ADR-0125](ADR-0125.md) — case-auto Wave 内並列子Issue実行モデル
- [ADR-0127](ADR-0127.md) — case-auto 構成工程の task() 委譲によるスケーラビリティ確立

### 文書

- [ADR-0110](ADR-0110.md) — DOC-MAP 採用判断

## 関連マップ

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
| ADR-0127 | relates-to | ADR-0114 | case-run CLI subprocess 委譲モデルの維持（本 ADR は残り4工程の task() 委譲を追加） |
| ADR-0127 | relates-to | ADR-0125 | Wave/子Issueオーケストレーションの維持（case-auto 保持責務は変更しない） |

## 関連 REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| ADR-0101 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md) | namespace統一・command migration・ドメイン状態定義 |
| ADR-0102 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | frontmatter規約reversal・integrity検査reversal |
| ADR-0103 | [REQ-0101](../requirements/REQ-0101.md), [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | 文書種別責務境界・記述対象境界の宣言 |
| ADR-0104 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | 実行時独立性・SPEC非依存の宣言 |
| ADR-0105 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | source/projection分離・sync script・integrity scan分離 |
| ADR-0106 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | repo-local namespace定義・docs-check移管・配布対象外制約 |
| ADR-0107 | [REQ-0103](../requirements/REQ-0103.md) | Command/Skill/Template/Script責務分界の要件定義 |
| ADR-0108 | [REQ-0103](../requirements/REQ-0103.md) | orchestration skill化基準の要件定義 |
| ADR-0109 | [REQ-0104](../requirements/REQ-0104.md), [REQ-0106](../requirements/REQ-0106.md) | Epic Issue実行順序SSoT・case-run Epic Orchestrator |
| ADR-0110 | [REQ-0101](../requirements/REQ-0101.md) | DOC-MAP導入・views廃止 |
| ADR-0111 | — | 対応REQなし（architecture principleとして定義）。superseded by ADR-0112 |
| ADR-0112 | [REQ-0119](../requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界の再基準化 |
| ADR-0113 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md), [REQ-0109](../requirements/REQ-0109.md), [REQ-0115](../requirements/retired/REQ-0115.md) (retired) | 診断ワークフロー導入・レビュー系コマンド完全削除（deprecated: 現行状態は REQ-0124 / SPEC 参照） |
| ADR-0114 | [REQ-0104](../requirements/REQ-0104.md), [REQ-0106](../requirements/REQ-0106.md) | case-run 実行責務の外部実行バックエンド委譲 |
| ADR-0123 | [REQ-0136](../requirements/REQ-0136.md), [REQ-0102](../requirements/REQ-0102.md), [REQ-0103](../requirements/REQ-0103.md) | SPEC lifecycle と spec-save の導入 |
| ADR-0124 | [REQ-0138](../requirements/REQ-0138.md) | 構造化 req_draft 契約 |
| ADR-0125 | [REQ-0106](../requirements/REQ-0106.md), [REQ-0114](../requirements/REQ-0114.md) | case-auto Wave 内並列子Issue実行モデル |
| ADR-0126 | [REQ-0141](../requirements/REQ-0141.md), [REQ-0134](../requirements/REQ-0134.md) | ローカル版 OpenCode 生成基盤: source model 拡張と生成安全性制約 |
| ADR-0127 | [REQ-0114](../requirements/REQ-0114.md), [REQ-0119](../requirements/REQ-0119.md) | case-auto 構成工程の task() 委譲によるスケーラビリティ確立 |

## 廃止済み・履歴ビュー

ADR-0001 から ADR-0023 までの23件は、ADR-01XX 現行基盤導入に伴い `retired/` ディレクトリに移動された歴史的決定記録である。これらは再編前の判断を保持しており、現行アーキテクチャの基盤は上記 現行基盤ビューの ADR-01XX にある。

| ADR番号 | タイトル | retired時ステータス | 引き継ぎ先 |
|---------|---------|-------------------|-----------|
| [ADR-0001](retired/ADR-0001.md) | Command/Skill/Template/Script責任分界の正式定義 | proposed | ADR-0107 |
| [ADR-0002](retired/ADR-0002.md) | Orchestration skill作成基準の導入 | proposed | ADR-0108 |
| [ADR-0003](retired/ADR-0003.md) | issue-req入力の抽象化 | deprecated | なし（再編前から非現行） |
| [ADR-0004](retired/ADR-0004.md) | 要件管理構造の area-based 移行方針 | superseded | なし（再編前から非現行） |
| [ADR-0005](retired/ADR-0005.md) | AgentDevFlow を配布 plugin 名として採用し、公開 command namespace を /agentdev/*、domain state を .agentdev/、skill prefix を agentdev-* に統一する | accepted | ADR-0101 |
| [ADR-0006](retired/ADR-0006.md) | Epic Issue 本文を実行順序 SSoT とする設計 | proposed | ADR-0109 |
| [ADR-0007](retired/ADR-0007.md) | REQ/ADR基準構造と分類ビュー運用の再定義 | superseded | なし（再編前から非現行） |
| [ADR-0008](retired/ADR-0008.md) | DOC-MAP導入と requirements/views 廃止 | proposed | ADR-0110 |
| [ADR-0009](retired/ADR-0009.md) | REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入 | deprecated | なし（再編前から非現行） |
| [ADR-0010](retired/ADR-0010.md) | HITL boundary — 全 agentdev command の Human-in-the-Loop 境界原則 | deprecated | なし（再編前から非現行） |
| [ADR-0011](retired/ADR-0011.md) | マネージャー・オーケストレータパターンの限定採用 — 標準構造とはしない | proposed | ADR-0111 |
| [ADR-0012](retired/ADR-0012.md) | Requirement Source pipeline の正式定義 — promoted→RU→req-define の一貫流 | deprecated | なし（再編前から非現行） |
| [ADR-0013](retired/ADR-0013.md) | runtime / authoring 関心分離 | accepted | ADR-0102 |
| [ADR-0014](retired/ADR-0014.md) | ADR / SPEC 再分類基準 | superseded | なし（再編前から非現行） |
| [ADR-0015](retired/ADR-0015.md) | docs/specs 非runtime依存宣言 | superseded | なし（再編前から非現行） |
| [ADR-0016](retired/ADR-0016.md) | skill references runtime-only 制約 | superseded | なし（再編前から非現行） |
| [ADR-0017](retired/ADR-0017.md) | 文書種別責務境界 | accepted | ADR-0103 |
| [ADR-0018](retired/ADR-0018.md) | runtime 独立性 | accepted | ADR-0104 |
| [ADR-0019](retired/ADR-0019.md) | OpenCode ソース・プロジェクション分離 | accepted | ADR-0105 |
| [ADR-0020](retired/ADR-0020.md) | Adopt /repo/* Namespace for Repo-Local Tooling | accepted | ADR-0106 |
| [ADR-0021](retired/ADR-0021.md) | Upstream Handoff Metadata Convention | deprecated | なし（再編前から非現行） |
| [ADR-0022](retired/ADR-0022.md) | review/refine 系中間コマンドを promote 内フェーズへ統合 | deprecated | なし（再編前から非現行） |
| [ADR-0023](retired/ADR-0023.md) | backlog-save 廃止とパイプライン再構築 | deprecated | なし（再編前から非現行） |
