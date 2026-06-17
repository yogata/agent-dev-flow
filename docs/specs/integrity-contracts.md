# Integrity Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

整合性検査の分類フレームワークを定義し、検査結果の深刻度と対応フローを規定する（REQ-0108）。

## Severity Classification

| 分類 | 意味 | 判定時の動作 | 例 |
|---|---|---|---|
| **strict** | 基準違反。即座に修正が必要 | NG として報告し、当該コマンドの完了をブロックする | frontmatter 禁止フィールド混入、必須セクション欠落、broken reference |
| **heuristic** | ヒューリスティック検出（パターンベース・誤検知リスクあり）。修正を推奨 | warning として報告し、完了はブロックしない | 行数超過、旧 namespace 残存、旧 terminology 使用 |
| **observation** | 情報提供。改善の参考 | info として報告し、対応は任意 | 未使用 skill の発見、改善候補の提示、潜在的 drift |

## Finding Classification

検査で検出された問題の分類:

| Finding 種別 | 説明 | 既定 severity |
|---|---|---|
| document-drift | 文書内容と実装の乖離 | heuristic |
| broken-reference | リンク切れ・参照先不存在 | strict |
| obsolete-structure | 廃止済み構造の残存 | heuristic |
| canonical-conflict | 基準文書間の矛盾 | strict |
| workflow-gap | workflow 定義の欠落 | heuristic |
| integrity-rule-gap | 検査ルール自体の欠落 | observation |

> **REQ/SPEC boundary violation**（REQ-0108-260）: Active REQ 要件行の主たる文意が SPEC detail（schema field・enum 値一覧・fixture detail・checker 個別ルール・false positive 抑制方式・Step 番号・Phase 番号・内部アルゴリズム・作業履歴）である場合は canonical-conflict の subcategory として扱い、IR-044 で heuristic 検出する。REQ-0101-069 の安定契約例外（公開 command 名・公開入口・domain state 位置づけ・他 command 接続契約・利用者可視分類体系・安全境界・停止条件の大枠・後続工程が依存する安定した外部契約）に該当する要約残留は検出対象外とする。

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
| ADR | status 遷移妥当性、参照 REQ 存在確認、current/retired collection 区別（REQ-0112-050） |
| Skill | USE FOR / DO NOT USE FOR 整合性、references/ 存在確認 |
| Command | frontmatter 許可フィールド、Steps 構造 |
| Template | 必須セクション存在、プレースホルダー妥当性 |
| Workflow | workflow route 定義の整合性 |
| Link | 文書間リンクの到達性 |
| Canonical | canonical 境界の遵守 |
| Lifecycle | 状態遷移の妥当性 |
| Namespace | 旧 namespace 残存確認 |
| ImplementationPattern | frontmatter 禁止フィールド検査（REQ-0108-026〜038 から反転、REQ-0108-109/124 に統合済） |
| ADRStatusNormalization | ADR status 旧形式検出（REQ-0108-121） |
| RuidGroundReference | docs 永続文書内の RU-ID 参照検出（REQ-0108-122） |
| WorkflowStatusProhibition | workflow status / 6 マイクロフェーズ検出（REQ-0108-123） |
| AcceptedAdrCitation | accepted 以外の ADR 引用検出（REQ-0108-125, 推奨）。retired ADR への履歴参照は現行根拠引用 heuristic と区別する（REQ-0112-050） |
| AbolishedSkillReference | 廃止済み skill への参照検知（REQ-0108-126） |
| CommandLocalTemplate | command-local template 存在・整合性検査（REQ-0108-127） |
| SkillSpecDependency | runtime skill から docs/specs/ への直接依存検出（REQ-0108-128） |
| RetiredAdrCitation | retired ADR への現行根拠引用検出（REQ-0112-048, heuristic/observation） |
| ReqSpecBoundary | Active REQ 要件行への SPEC detail 混入検出（REQ-0108-260, REQ-0101-067〜069。IR-044 として catalog 定義。REQ-0101-069 安定契約例外は対象外） |

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

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0104）。

## Guardrails Classification

command guardrails を以下の6カテゴリに分類する:

| カテゴリ | 意味 | 例 |
|---|---|---|
| **KEEP_AS_GUARDRAIL** | ユーザー安全性に関わる制約。command 定義に残置 | ファイル操作制限、ユーザー承認必須、破壊的操作禁止 |
| **STATIC_CHECK** | 機械的検証可能な検査。docs-check に移行 | frontmatter 規約、必須セクション存在、行数上限 |
| **POSTFLIGHT_DIFF** | 実行後の diff 検証。postflight スクリプトで検査 | 意図しないファイル変更、スコープ外の編集 |
| **HELPER_SCRIPT** | 補助的処理。script に移行 | 検査・変換・フォーマット処理 |
| **MOVE_TO_SPEC** | SPEC へ移譲すべき内容。SPEC 定義に委譲 | アーティファクト構造定義、命名規則の詳細 |
| **DELETE_AS_OBVIOUS** | 自明な制約。削除可能 | LLM 既知の常識的内容 |

## Allowed Changes Profiles

各 command の allowed changes（許可されるファイル変更範囲）:

| Command | Allowed Changes | Forbidden |
|---|---|---|
| `req-define` | なし（read-only 対話） | 全ファイル書込 |
| `req-save` | `docs/requirements/`, `docs/adr/`, `docs/DOC-MAP.md`, `.agentdev/intake/inbox/req-restructure/`（REQ再構成intakeのみ） | `.agentdev/`（req-restructure 除く）, `.opencode/` |
| `case-open` | GitHub Issue/PR のみ | ローカルファイル |
| `case-run` | worktree 内の全ファイル | worktree 外、`.agentdev/` |
| `case-close` | GitHub Issue/PR, worktree 削除 | `.agentdev/intake/inbox/` 直接書込 |
| `case-update` | GitHub Issue のみ | ローカルファイル |
| `docs-check` | `.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`（実行時。実行自体を承認として扱い、追加のユーザー承認は不要。REQ-0108-225, REQ-0112-059） | 検査対象 artifact |

> **Note**: `docs-check` は `/repo/docs-check` として実行される配布対象外コマンドである（ADR-0106）。AgentDevFlow の配布対象外。

| Command | Allowed Changes | Forbidden |
|---|---|---|
| `intake-capture` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-from-github` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-promote` | `.agentdev/intake/promoted/` | 他パス |
| `learning-promote` | `.agentdev/learning/promoted/` | 他パス |
| `backlog-review` | `.agentdev/backlog/req-units/`, `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` | `.opencode/`, 検査対象外artifact |
| `inspect-docs` | なし（read-only 診断） | 全ファイル書込 |

## Postflight Diff Checking

postflight diff checking は read-only command から段階導入する:

**read-only command 検証**:
- `inspect-docs` は実行後にローカルファイル変更がないことを確認（真の read-only 診断）
- `docs-check`（配布対象外 `/repo/docs-check`）は検査対象 artifact を変更しないが、許可された出力（`.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`）を生成する。postflight は「検査対象 artifact への変更がないこと」を確認し、許可出力範囲外の変更を warning として報告する
- `backlog-review` も検査対象外 artifact を変更せず、許可された `.agentdev/` 配下の出力のみを行う
- 変更が検出された場合は warning として報告
