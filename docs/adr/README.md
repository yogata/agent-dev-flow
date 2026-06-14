# Architecture Decision Records

アーキテクチャ決定記録（ADR）のインデックス。

## Current Baseline View

ADR-01XX（accepted/proposed）の13件が、現在のアーキテクチャ判断の基盤である。各 ADR は baseline 再編により旧 ADR の内容を統合・再定義している。

| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| ADR-0101 | AgentDevFlow plugin namespace 統一 | accepted | 2026-06-08 |
| ADR-0102 | runtime / authoring 関心分離 | accepted | 2026-06-08 |
| ADR-0103 | 文書種別責務境界 | accepted | 2026-06-08 |
| ADR-0104 | runtime 独立性 | accepted | 2026-06-08 |
| ADR-0105 | OpenCode Source / Projection 分離 | accepted | 2026-06-08 |
| ADR-0106 | /repo/* Namespace for Repo-Local Tooling | accepted | 2026-06-08 |
| ADR-0107 | Command/Skill/Template/Script 責任分界の正式定義 | accepted | 2026-06-08 |
| ADR-0108 | Orchestration skill 作成基準の導入 | accepted | 2026-06-08 |
| ADR-0109 | Epic Issue 本文を実行順序 SSoT とする設計 | accepted | 2026-06-08 |
| ADR-0110 | DOC-MAP 導入と requirements/views 廃止 | accepted | 2026-06-08 |
| ADR-0111 | Manager/orchestrator パターンの限定採用 | superseded | 2026-06-08 |
| ADR-0112 | サブエージェント委譲の一般化と委譲時最小契約 | accepted | 2026-06-10 |
| ADR-0113 | diagnostics workflow 導入と review 系コマンド完全削除 | accepted | 2026-06-14 |

> この README は分類ビューであり、ADR本文のSSoTではない。基準は各 `ADR-{NNNN}.md` ファイルである（REQ-0101）。

## Status View

### accepted

- [ADR-0101](ADR-0101.md) — AgentDevFlow plugin namespace 統一
- [ADR-0102](ADR-0102.md) — runtime / authoring 関心分離
- [ADR-0103](ADR-0103.md) — 文書種別責務境界
- [ADR-0104](ADR-0104.md) — runtime 独立性
- [ADR-0105](ADR-0105.md) — OpenCode Source / Projection 分離
- [ADR-0106](ADR-0106.md) — /repo/* Namespace for Repo-Local Tooling
- [ADR-0107](ADR-0107.md) — Command/Skill/Template/Script 責任分界の正式定義
- [ADR-0108](ADR-0108.md) — Orchestration skill 作成基準の導入
- [ADR-0109](ADR-0109.md) — Epic Issue 本文を実行順序 SSoT とする設計
- [ADR-0110](ADR-0110.md) — DOC-MAP 導入と requirements/views 廃止
- [ADR-0112](ADR-0112.md) — サブエージェント委譲の一般化と委譲時最小契約
- [ADR-0113](ADR-0113.md) — diagnostics workflow 導入と review 系コマンド完全削除

### superseded

- [ADR-0111](ADR-0111.md) — Manager/orchestrator パターンの限定採用

### proposed

（現在なし）

## Topic View

### Namespace/Plugin

- [ADR-0101](ADR-0101.md) — AgentDevFlow plugin namespace 統一
- [ADR-0106](ADR-0106.md) — /repo/* Namespace for Repo-Local Tooling

### Architecture

- [ADR-0102](ADR-0102.md) — runtime / authoring 関心分離
- [ADR-0103](ADR-0103.md) — 文書種別責務境界
- [ADR-0104](ADR-0104.md) — runtime 独立性
- [ADR-0105](ADR-0105.md) — OpenCode Source / Projection 分離

### Command/Skill Design

- [ADR-0107](ADR-0107.md) — Command/Skill/Template/Script 責任分界の正式定義
- [ADR-0108](ADR-0108.md) — Orchestration skill 作成基準の導入
- [ADR-0111](ADR-0111.md) — Manager/orchestrator パターンの限定採用
- [ADR-0112](ADR-0112.md) — サブエージェント委譲の一般化と委譲時最小契約
- [ADR-0113](ADR-0113.md) — diagnostics workflow 導入と review 系コマンド完全削除

### Workflow

- [ADR-0109](ADR-0109.md) — Epic Issue 本文を実行順序 SSoT とする設計

### Documentation

- [ADR-0110](ADR-0110.md) — DOC-MAP 導入と requirements/views 廃止

## Decision Map

| ADR | 関係 | 対象 | 説明 |
|-----|------|------|------|
| ADR-0101 | supersedes | ADR-0005 (retired) | namespace統一をbaselineとして再定義 |
| ADR-0102 | supersedes | ADR-0013 (retired) | runtime/authoring分離をbaselineとして再定義 |
| ADR-0102 | relates-to | ADR-0101 | 責務分界の具体化 |
| ADR-0102 | relates-to | ADR-0103 | 文書体系への適用 |
| ADR-0103 | supersedes | ADR-0017 (retired) | 文書種別責務境界をbaselineとして再定義 |
| ADR-0103 | relates-to | ADR-0102 | 本判断の基盤 |
| ADR-0103 | relates-to | ADR-0104 | 補完関係 |
| ADR-0104 | supersedes | ADR-0018 (retired) | runtime独立性をbaselineとして再定義 |
| ADR-0104 | supersedes | ADR-0016 (retired) | skill references runtime-only制約を統合 |
| ADR-0104 | supersedes | ADR-0015 (retired) | docs/specs非runtime依存宣言を統合 |
| ADR-0104 | relates-to | ADR-0102 | 本判断の基盤 |
| ADR-0104 | relates-to | ADR-0103 | 補完関係 |
| ADR-0105 | supersedes | ADR-0019 (retired) | source/projection分離をbaselineとして再定義 |
| ADR-0105 | relates-to | ADR-0102 | runtime/authoring分離の具体化 |
| ADR-0105 | relates-to | ADR-0103 | 文書種別責務境界の物理層での裏付け |
| ADR-0105 | relates-to | ADR-0104 | runtime独立性のsource/projection分離による実現 |
| ADR-0106 | supersedes | ADR-0020 (retired) | repo-local namespaceをbaselineとして再定義 |
| ADR-0106 | relates-to | ADR-0101 | canonical namespaceとrepo-local namespaceの境界定義 |
| ADR-0106 | relates-to | ADR-0105 | repo-local artifactをsource/projection同期対象外にする根拠 |
| ADR-0107 | supersedes | ADR-0001 (retired) | 責任分界をbaselineとして再定義 |
| ADR-0107 | relates-to | ADR-0108 | 補完関係 |
| ADR-0108 | supersedes | ADR-0002 (retired) | orchestration skill作成基準をbaselineとして再定義 |
| ADR-0108 | relates-to | ADR-0107 | 補完関係 |
| ADR-0109 | supersedes | ADR-0006 (retired) | Epic Issue SSoTをbaselineとして再定義 |
| ADR-0109 | relates-to | ADR-0101 | case-open/case-runのコマンド体系 |
| ADR-0110 | supersedes | ADR-0008 (retired) | DOC-MAP導入をbaselineとして再定義 |
| ADR-0110 | supersedes | ADR-0007 (retired) | views導入決定をsupersede |
| ADR-0110 | relates-to | ADR-0004 (retired) | area-based移行方針の最終撤回 |
| ADR-0111 | supersedes | ADR-0011 (retired) | manager/orchestratorパターンをbaselineとして再定義 |
| ADR-0111 | relates-to | ADR-0108 | skill化基準とpattern採用基準の区別 |
| ADR-0111 | relates-to | ADR-0109 | Epic OrchestratorのSSoT基盤 |
| ADR-0111 | superseded-by | ADR-0112 | 委譲一般化に包括 |
| ADR-0112 | supersedes | ADR-0111 | 委譲の一般化として包括 |
| ADR-0112 | relates-to | ADR-0107 | Command薄さの根拠 |
| ADR-0112 | relates-to | ADR-0108 | skill化基準 |

## Related REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| ADR-0101 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md) | namespace統一・command migration・domain state定義 |
| ADR-0102 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | frontmatter規約reversal・integrity検査reversal |
| ADR-0103 | [REQ-0101](../requirements/REQ-0101.md), [REQ-0103](../requirements/REQ-0103.md) | 文書種別責務境界の宣言 |
| ADR-0104 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | runtime独立性・SPEC非依存の宣言 |
| ADR-0105 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | source/projection分離・sync script・integrity scan分離 |
| ADR-0106 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | repo-local namespace定義・docs-check移管・配布対象外制約 |
| ADR-0107 | [REQ-0103](../requirements/REQ-0103.md) | Command/Skill/Template/Script責務分界の要件定義 |
| ADR-0108 | [REQ-0103](../requirements/REQ-0103.md) | orchestration skill化基準の要件定義 |
| ADR-0109 | [REQ-0104](../requirements/REQ-0104.md), [REQ-0106](../requirements/REQ-0106.md) | Epic Issue実行順序SSoT・case-run Epic Orchestrator |
| ADR-0110 | [REQ-0101](../requirements/REQ-0101.md) | DOC-MAP導入・views廃止 |
| ADR-0111 | — | 対応REQなし（architecture principleとして定義）。superseded by ADR-0112 |
| ADR-0112 | [REQ-0119](../requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界の再基準化 |
| ADR-0113 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md), [REQ-0109](../requirements/REQ-0109.md), [REQ-0115](../requirements/REQ-0115.md) | diagnostics workflow 導入・review 系コマンド完全削除 |

## Retired / Historical View

ADR-0001 から ADR-0023 までの23件は、ADR-01XX baseline導入に伴い `retired/` ディレクトリに移動された歴史的決定記録である。これらは再編前の判断を保持しており、現行アーキテクチャの基盤は上記 Current Baseline View の ADR-01XX にある。

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
| [ADR-0011](retired/ADR-0011.md) | Manager/orchestrator パターンの限定採用 — 標準構造とはしない | proposed | ADR-0111 |
| [ADR-0012](retired/ADR-0012.md) | Requirement Source pipeline の正式定義 — promoted→RU→req-define の一貫流 | deprecated | なし（再編前から非現行） |
| [ADR-0013](retired/ADR-0013.md) | runtime / authoring 関心分離 | accepted | ADR-0102 |
| [ADR-0014](retired/ADR-0014.md) | ADR / SPEC 再分類基準 | superseded | なし（再編前から非現行） |
| [ADR-0015](retired/ADR-0015.md) | docs/specs 非runtime依存宣言 | superseded | なし（再編前から非現行） |
| [ADR-0016](retired/ADR-0016.md) | skill references runtime-only 制約 | superseded | なし（再編前から非現行） |
| [ADR-0017](retired/ADR-0017.md) | 文書種別責務境界 | accepted | ADR-0103 |
| [ADR-0018](retired/ADR-0018.md) | runtime 独立性 | accepted | ADR-0104 |
| [ADR-0019](retired/ADR-0019.md) | OpenCode Source / Projection 分離 | accepted | ADR-0105 |
| [ADR-0020](retired/ADR-0020.md) | Adopt /repo/* Namespace for Repo-Local Tooling | accepted | ADR-0106 |
| [ADR-0021](retired/ADR-0021.md) | Upstream Handoff Metadata Convention | deprecated | なし（再編前から非現行） |
| [ADR-0022](retired/ADR-0022.md) | review/refine 系中間コマンドを promote 内フェーズへ統合 | deprecated | なし（再編前から非現行） |
| [ADR-0023](retired/ADR-0023.md) | backlog-save 廃止とパイプライン再構築 | deprecated | なし（再編前から非現行） |
