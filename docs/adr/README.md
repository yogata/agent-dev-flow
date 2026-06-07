# Architecture Decision Records

アーキテクチャ決定記録（ADR）のインデックス。

## ADR一覧

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
| ADR-0111 | Manager/orchestrator パターンの限定採用 | accepted | 2026-06-08 |

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
- [ADR-0111](ADR-0111.md) — Manager/orchestrator パターンの限定採用

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

## Related REQ

| ADR | 関連REQ | 説明 |
|-----|---------|------|
| ADR-0101 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0105](../requirements/REQ-0105.md) | namespace統一・command migration・domain state定義 |
| ADR-0102 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | frontmatter規約reversal・integrity検査reversal |
| ADR-0103 | [REQ-0101](../requirements/REQ-0101.md), [REQ-0103](../requirements/REQ-0103.md) | 文書種別責務境界の宣言 |
| ADR-0104 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | runtime独立性・SPEC非依存の宣言 |
| ADR-0105 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | source/projection分離・sync script・integrity scan分離 |
| ADR-0106 | [REQ-0103](../requirements/REQ-0103.md), [REQ-0108](../requirements/REQ-0108.md) | repo-local namespace定義・integrity-check移管・配布対象外制約 |
| ADR-0107 | [REQ-0103](../requirements/REQ-0103.md) | Command/Skill/Template/Script責務分界の要件定義 |
| ADR-0108 | [REQ-0103](../requirements/REQ-0103.md) | orchestration skill化基準の要件定義 |
| ADR-0109 | [REQ-0104](../requirements/REQ-0104.md), [REQ-0106](../requirements/REQ-0106.md) | Epic Issue実行順序SSoT・case-run Epic Orchestrator |
| ADR-0110 | [REQ-0101](../requirements/REQ-0101.md) | DOC-MAP導入・views廃止 |
| ADR-0111 | — | 対応REQなし（architecture principleとして定義） |

## Retired ADRs

ADR-0001 から ADR-0023 までの23件は、ADR-01XX baseline導入に伴い `retired/` ディレクトリに移動された。各ファイルに引き継ぎ先が記載されている。

- [retired/](retired/) — ADR-0001〜ADR-0023
