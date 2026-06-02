# Integrity Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

整合性検査の分類フレームワークを定義し、検査結果の深刻度と対応フローを規定する（REQ-0108）。

## Premise Reversal Record

以下の検査は前提の reversal を反映している（ADR-0013, Case 5 / RU-0020）:

| 検査 | 旧前提 | 新前提 | 根拠 REQ |
|---|---|---|---|
| implementation_pattern | frontmatter に必須 | frontmatter への混入を禁止 | REQ-0108-022, 095 |
| secondary_pattern | frontmatter に検証 | frontmatter への混入を禁止 | REQ-0108-028, 096 |
| load_skills | frontmatter に必須・整合性検査 | frontmatter への混入を禁止 | REQ-0108-024, 097 |
| frontmatter allowed fields | 複数フィールド許可 | description + agent のみ | REQ-0108-046, 098 |
| dev メタデータ混入 | 検査対象外 | error として検出 | REQ-0108-109 |
| skill references 存在 | 検査対象外 | runtime パスのみ確認 | REQ-0108-110 |

## Severity Classification

| 分類 | 意味 | 判定時の動作 | 例 |
|---|---|---|---|
| **strict** | 基準違反。即座に修正が必要 | NG として報告し、当該コマンドの完了をブロックする | frontmatter 禁止フィールド混入、必須セクション欠落、broken reference |
| **warning** | 推奨からの逸脱。修正を推奨 | warning として報告し、完了はブロックしない | 行数超過、旧 namespace 残存、旧 terminology 使用 |
| **observation** | 情報提供。改善の参考 | info として報告し、対応は任意 | 未使用 skill の発見、改善候補の提示、潜在的 drift |

## Finding Classification

検査で検出された問題の分類:

| Finding 種別 | 説明 | 既定 severity |
|---|---|---|
| document-drift | 文書内容と実装の乖離 | warning |
| broken-reference | リンク切れ・参照先不存在 | strict |
| obsolete-structure | 廃止済み構造の残存 | warning |
| canonical-conflict | 基準文書間の矛盾 | strict |
| workflow-gap | workflow 定義の欠落 | warning |
| integrity-rule-gap | 検査ルール自体の欠落 | observation |

## Finding Route Map

検出された Finding の対応先:

| Finding 種別 | Route | 対応コマンド |
|---|---|---|
| document-drift | intake | `/agentdev/intake-capture` |
| broken-reference | intake | `/agentdev/intake-capture` |
| obsolete-structure | intake | `/agentdev/intake-capture` |
| canonical-conflict | req-define | `/agentdev/req-define` |
| workflow-gap | intake + learning | `/agentdev/intake-capture` + `learning-capture` |
| integrity-rule-gap | learning | `learning-capture` |

## Integrity Check Categories

| カテゴリ | 検査対象 |
|---|---|
| REQ | frontmatter 整合性、ID 一意性、タグ妥当性 |
| ADR | status 遷移妥当性、参照 REQ 存在確認 |
| Skill | USE FOR / DO NOT USE FOR 整合性、references/ 存在確認 |
| Command | frontmatter 許可フィールド、Steps 構造 |
| Template | 必須セクション存在、プレースホルダー妥当性 |
| Workflow | workflow route 定義の整合性 |
| Link | 文書間リンクの到達性 |
| Canonical | canonical 境界の遵守 |
| Lifecycle | 状態遷移の妥当性 |
| Namespace | 旧 namespace 残存確認 |
| ImplementationPattern | pattern 定義妥当性（REQ-0108-026〜038） |

## Report Format

検査結果のレポート形式:

- 出力先: `.agentdev/integrity/reports/`
- 形式: JSON / Markdown
- Schema: チェック項目ごとの status（OK / NG / warning / info）+ Finding 一覧

## Script Contract

整合性検査スクリプトは共通 CLI 契約に準拠する:

- `--help`, `--json`, `--dry-run` オプションをサポート
- exit code: 0（OK）、1（NG/warning）、2（error）
- stdout = 機械可読出力、stderr = 診断メッセージ
- 非対話実行、破壊的変更禁止

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用である。他プロジェクトへの適用を意図しない。
