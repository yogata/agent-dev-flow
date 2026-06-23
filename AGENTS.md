# AGENTS.md

AgentDevFlow を編集するエージェント向けのリポジトリガイドレール。

## 行動規範

- 基本言語は日本語。執筆規範（基本原則・術語の平易化・文体基準・不自然な日本語の典型・LLM っぽい表現の禁止）は `japanese-tech-writing` スキルを SSoT とし、すべての日本語文章は同スキルの規範に従うこと。
- 文書種別の配置基準・用語政策（英字許容リスト・訳語表）は [`docs/specs/document-type-responsibilities.md`](docs/specs/document-type-responsibilities.md) を参照すること。
- req-define に構造化された要件が渡された場合は別エージェントでの使用を想定し、AskUserQuestion を使用せずに質問すること。
- 本リポジトリは AgentDevFlow プラグインを管理する。
- コンテキストサイズは 1M token を想定する。自動圧縮機能およびサブエージェントへの委譲を使う。これらにより、大規模作業でもコンテキストサイズは管理・制御されている。タスク実行におけるコンテキストサイズ枯渇は検討不要とする。

## ハーネス選定

- oh-my-openagent を導入済み
