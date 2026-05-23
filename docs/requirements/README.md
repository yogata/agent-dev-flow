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
| REQ-0024 | 完了報告フォーマットの次工程提示を全コマンドで強制する | enhancement/workflow-reporting/command-system |
| REQ-0025 | intake 系コマンドの .agentdev/intake 更新後の git 永続化 | agentdev/git/persistence/intake |
| REQ-0026 | intake lifecycle の queue/archive 再定義 | agentdev/intake/lifecycle/queue/archive/refactor |
| REQ-0027 | learning artifact lifecycle の責任範囲明確化 | learning/lifecycle/artifact/documentation/command/skill |
| REQ-0028 | Documentation granularity and responsibility restructuring | documentation/granularity/responsibility |

## ディレクトリ構造の方針

### 現在の構造（per-file）

現在は `REQ-{NNNN}.md` の per-file 構造で運用している。各要件が1ファイルに対応するシンプルな構成である。

### 将来の標準構造（area-based）

将来の標準構造として、area（領域）単位での要件管理に移行する予定である:

```
docs/requirements/
├── README.md          # 運用説明（本ファイル）
├── INDEX.md           # generated artifact（手動編集禁止）
├── core.md            # 初期・暫定area
├── {area}.md          # 安定area
└── REQ-{NNNN}.md      # 移行対象（将来廃止予定）
```

- **INDEX.md** は generated artifact であり、手動での編集は行わない。INDEX.md の生成は `req-file-manager` スキルが管轄する
- **core.md** は初期・暫定area として全要件を配置する。area の分割は自然な凝集度が確認できた段階で実施する
- `unclassified.md`、`sources/`、`areas/` は作成しない
- 既存 `REQ-{NNNN}.md` ファイルの一括移行は行わず、別 Issue で段階的に実施する

詳細は ADR-0004（要件管理構造の area-based 移行方針）を参照。
