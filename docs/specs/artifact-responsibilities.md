# Artifact Responsibility Table

各 artifact 種別の canonical owner と責務を定義する（REQ-0103-057）。

## 成果物責任表

| Artifact | Canonical Owner | Source Location | Runtime Location | 責務 |
|----------|----------------|-----------------|------------------|------|
| Command 定義 | `src/opencode/commands/agentdev/` | Source first | `.opencode/commands/agentdev/` | ユーザー向け入口、入出力、ガードレール、高レベル Steps |
| Skill 定義 | `src/opencode/skills/` | Source first | `.opencode/skills/` | 再利用可能な判断基準、domain knowledge |
| Skill References | `src/opencode/skills/*/references/` | Source first | `.opencode/skills/*/references/` | Progressive disclosure の詳細 |
| Skill Scripts | `src/opencode/skills/*/scripts/` | Source first | `.opencode/skills/*/scripts/` | 決定的でテスト可能な実行ロジック |
| Command Template | `src/opencode/commands/agentdev/templates/` | Source first | `.opencode/commands/agentdev/templates/` | 完了報告・Issue/PR 本文の出力構造 |
| Skill Template | `src/opencode/skills/*/templates/` | Source first | `.opencode/skills/*/templates/` | ドキュメント生成テンプレート |
| REQ | `docs/requirements/REQ-*.md` | — | — | 要件定義（基準） |
| ADR | `docs/adr/ADR-*.md` | — | — | アーキテクチャ決定記録（基準） |
| SPEC | `docs/specs/*.md` | — | — | 現在仕様（repo-internal） |
| DOC-MAP | `docs/DOC-MAP.md` | — | — | 文書探索入口（非基準） |
| Guide | `docs/guides/*.md` | — | — | 参照用読み物（navigation 層） |
| Domain State | `.agentdev/` | — | — | Intake / Learning / Backlog / Integrity 永続状態 |
| Repo-local Command | `.opencode/commands/repo/` | — | — | Self-hosting repo 専用コマンド（ADR-0020）。AgentDevFlow 配布対象外。source/projection 同期対象外 |
| Repo-local Skill | `.opencode/skills/repo-*/` | — | — | Self-hosting repo 専用スキル（ADR-0020）。AgentDevFlow 配布対象外。source/projection 同期対象外 |
| Repo-local Registry | `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` | — | — | Repo-local 語彙レジストリ。`.agentdev/` には配置しない（ADR-0020） |

## 責務境界原則

1. **Command は薄い**: 入口・入出力・ガードレール・高レベル Steps のみ（REQ-0103-001）
2. **Skill は再利用可能**: 共通判断基準・domain knowledge（REQ-0103-003）
3. **Template は構造のみ**: 出力フォーマット・プレースホルダー（REQ-0103-005）
4. **Script は決定的**: テスト可能・再現可能（REQ-0103-006）
5. **Source first**: Canonical source は `src/opencode/`、runtime は `.opencode/` projection（ADR-0019）

## Reserved Names

| 名前 | 種別 | 予約先 |
|------|------|--------|
| `agentdev` | Command namespace | AgentDevFlow 本体 |
| `agentdev-*` | Skill prefix | AgentDevFlow 本体 |
| `.agentdev/` | Domain state directory | AgentDevFlow 永続状態 |
