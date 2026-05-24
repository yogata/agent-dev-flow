# Requirements Index

## 有効な要件

| REQ ID   | Title                                | 領域              |
| -------- | ------------------------------------ | ----------------- |
| REQ-0001 | AgentDevFlow ワークフローアーキテクチャ          | workflow          |
| REQ-0002 | AgentDevFlow コマンドプロトコル               | commands          |
| REQ-0003 | Case 並列実行             | parallel          |
| REQ-0004 | 要件・ADRドキュメントシステム   | requirements/adr  |
| REQ-0005 | Epic Issue 管理                | epic              |
| REQ-0006 | Sisyphus プラン基盤         | sisyphus          |
| REQ-0007 | ナレッジパイプライン高度化                   | knowledge/learning         |
| REQ-0008 | スキル品質フレームワーク              | skill             |
| REQ-0009 | テンプレートシステム                      | templates         |
| REQ-0010 | AgentDevFlow Command実装改善：安全性・品質・状態管理 | workflow/safety/quality |
| REQ-0011 | Issue/PR書き込み後の内容品質自動検証 | quality-assurance/encoding |
| REQ-0012 | 自然言語ポリシー | language/japanese |
| REQ-0013 | intake 承認フロー分割と解消済み確認機能 | commands/intake/workflow |
| REQ-0014 | case-run 自律修正ループと責務分離の明確化 | workflow/self-healing/ci-cd |
| REQ-0015 | 関連ドキュメントの要件達成対象化 | workflow/issue-commands/documentation/scope/verification |
| REQ-0016 | Command/Skill/Template/Script責任分界とtips要件ソース化 | commands/skills/templates/scripts/knowledge |
| REQ-0017 | AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化 | agentdev/namespace/plugin/learning/intake/integrity/migration |
| REQ-0018 | agentdev-req-analysis 未決分岐解消メソドロジー | req-analysis/wall-discussion/methodology |
| REQ-0019 | intake / learning の責任境界明確化と workflow 組み込み | agentdev/intake/learning/workflow/boundary |
| REQ-0020 | Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化 | epic/orchestration/ssot/wave |
| REQ-0021 | AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針 | integrity/scripts/skill-structure/guardrails |
| REQ-0022 | .agentdev domain state 更新後の git 永続化 | agentdev/git/persistence/domain-state |
| REQ-0023 | learning staging stub の消費追跡と消費後アーカイブ | learning/staging-stub/archive/consumption-tracking |
| REQ-0024 | 全 agentdev コマンドの完了報告フォーマット統一 | enhancement/workflow-reporting/command-system/completion-reports |
| REQ-0025 | intake 系コマンドの .agentdev/intake 更新後の git 永続化 | agentdev/git/persistence/intake |
| REQ-0026 | intake lifecycle の queue/archive 再定義 | agentdev/intake/lifecycle/queue/archive/refactor |
| REQ-0027 | learning artifact lifecycle の責任範囲明確化 | learning/lifecycle/artifact/documentation/command/skill |
| REQ-0028 | Documentation granularity and responsibility restructuring | documentation/granularity/responsibility |
| REQ-0029 | intake-open promoted artifact 一括処理 | agentdev/intake/batch-processing/enhancement |
| REQ-0030 | agentdev コマンド群の体系的テスト実装 | testing/quality/commands/skills/templates/epic |
| REQ-0031 | GitHub本文内リポジトリ参照リンクの正規化 | github/link-normalization/url/templates/verification/commands |
| REQ-0032 | case-close 未チェック項目達成判定 | enhancement/case-close/checkbox/completion-gate/achievement-check |
| REQ-0033 | AgentDevFlow command / skill 定義の二次整合性是正 | agentdev/consistency/guardrails/command-definitions/skill-definitions |

## ディレクトリ構造の方針

### 正本構造（per-file）

`REQ-{NNNN}.md` を要件の永続正本とする。各要件が1ファイルに対応する。

### views（観点別体系化ビュー）

`views/*.md` は正本REQを観点別に体系化した非正本文書である。正本と views が矛盾する場合、`REQ-{NNNN}.md` を正とする。

- `views/*.md` は generated artifact である必要はない（手動で体系化・編集してよい）
- `INDEX.md` は作成しない（ADR-0007 で README.md 分類ビューに統一方針）
- `areas/`、`sources/` は作成しない
- `views/` が未作成の領域は更新不要

### 関連

- ADR-0004: 要件管理構造の area-based 移行方針（superseded by ADR-0007）
- ADR-0007: REQ/ADR正本構造と分類ビュー運用の再定義
