# Wave 並列実行時のファイル変更重複によるマージコンフリクト

## 背景

Epic Orchestrator の Wave 並列実行で複数 PR が同一ファイル（system.md 等）を変更し、squash merge 順次処理でマージコンフリクトが発生。手動 rebase + コンフリクト解決が必要になった。

一方、後続 Epic #595 では RU 設計時にファイル変更範囲の非重複を事前設計し、全 6 PR が conflict-free で merge できることを確認済み。

## 問題

`agentdev-workflow-orchestration` スキルの Wave scheduling 手順にファイル非重複チェックが存在しない。Wave 内の複数 RU が同じファイルを変更対象としている場合、並列 PR 作成後にマージコンフリクトが確定する。

## 望ましい変更

`agentdev-workflow-orchestration` スキルの Wave scheduling 手順に、Wave 内の変更対象ファイル非重複チェックを追加する。具体的には:
1. Wave 内の各 RU の変更対象ファイルリストを収集
2. RU 間でファイル変更が重複している場合、Wave 構成の見直しを促す
3. 共通設定ファイル（AGENTS.md, system.md 等）の変更は Wave を跨いで直列化するガイダンスを追加

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` — Wave scheduling セクション
- `src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` — マージコンフリクト対応手順

### 対象外

- 他のスキルファイル
- コマンドファイル
- Epic Orchestrator のロジック自体（ガイダンスの追加のみ）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` | Wave scheduling 手順にファイル非重複チェックを追加 |
| skill | `src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` | マージコンフリクト予防のガイダンスを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（一部）
- **該当ファイル**: `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: Wave scheduling protocol は存在するが、ファイル非重複チェックが明示されていない。SKILL.md は 43 行と短く、詳細は references/self-healing-and-errors.md に委譲されているが、そちらにもファイル重複の予防策が記載されていない

## 制約

- スキルの Steps または Guardrails セクションに追加（SKILL.md の行数増加に留意）
- 詳細な手順は references/ に配置し、SKILL.md 本体は簡潔に保つ
- 既存の Wave scheduling ロジックを変更しない（ガイダンスの追加のみ）

## 受け入れ条件

- [ ] Wave scheduling 手順に「変更対象ファイルの非重複確認」ステップが追加されている
- [ ] 共通設定ファイルの直列化ガイダンスが追加されている
- [ ] references/self-healing-and-errors.md にマージコンフリクト予防の記載が追加されている
- [ ] SKILL.md の行数が 500 行を超過していない

## 元learning item / 根拠

- **要約**: Wave 並列実行で同一ファイル変更によるマージコンフリクトが発生。事前のファイル変更範囲設計で予防可能だった
- **根拠**: Epic #580 Wave 2 で PR #588/#589 が system.md を重複変更しコンフリクト発生。Epic #595 では事前設計により全 PR conflict-free
- **再発条件**: Wave 内並列実行で複数 RU が同一ファイルを変更する場合。特に AGENTS.md, system.md 等の共通設定ファイル
- **横展開可能性**: 全プロジェクトの Epic 並列実行で発生可能。ファイル重複は Wave 設計の一般的な問題

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Epic #580, PR #588, #589, Epic #595
