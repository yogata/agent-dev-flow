# AGENTS.md

AgentDevFlow を編集するエージェント向けのリポジトリガイドレール。

## 行動規範

- 基本言語は日本語。執筆規範は `japanese-tech-writing` スキルに従うこと。
- 思考・thinking・出力における基本言語は日本語。
- 文書種別の配置基準、用語政策（英字許容リスト、訳語表）は `docs/specs/responsibilities/document-type-responsibilities.md` を参照すること。
- req-define に構造化された要件が渡された場合は別エージェントでの使用を想定し、AskUserQuestion を使用せずに質問すること。
- 本リポジトリは AgentDevFlow プラグインを管理する。
- Windows 環境で既存 UTF-8（BOM なし）ファイルを編集する際は edit ツール（per-line string replace）を優先し、Write ツール（全面上書き）は新規ファイル作成時に限定すること。Write ツールが既存 UTF-8 ファイルを cp932 で書き出し文字化けを生む事象が実証済みのため。詳細手順は `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` を参照すること。

## ハーネス選定

- oh-my-openagent を導入済み
