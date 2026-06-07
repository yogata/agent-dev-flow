# Integrity Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

整合性検査の分類フレームワークを定義し、検査結果の深刻度と対応フローを規定する（REQ-0108）。

## Premise Reversal Record

以下の検査は前提の reversal を反映している（ADR-0102）:

| 検査 | 旧前提 | 新前提 | 根拠 REQ |
|---|---|---|---|
| implementation_pattern | frontmatter に必須 | frontmatter への混入を禁止 | REQ-0108-022, 095 |
| secondary_pattern | frontmatter に検証 | frontmatter への混入を禁止 | REQ-0108-028, 096 |
| load_skills | frontmatter に必須・整合性検査 | frontmatter への混入を禁止 | REQ-0108-024, 097 |
| frontmatter allowed fields | 複数フィールド許可 | description + agent のみ | REQ-0108-046, 098 |
| dev メタデータ混入 | 検査対象外 | error として検出 | REQ-0108-109 |
| skill references 存在 | 検査対象外 | runtime パスのみ確認 | REQ-0108-110 |
| ADR status 正規化 | 検査対象外 | 旧形式 superseded-by:[ADR-XXXX] を検出 | REQ-0108-121 |
| RU-ID 根拠参照 | 検査対象外 | docs 永続文書内の RU-ID パターンを検出 | REQ-0108-122 |
| workflow status 禁止 | 検査対象外 | REQ/SPEC 内の workflow status / 6 マイクロフェーズを検出 | REQ-0108-123 |
| command 追加フィールド禁止 | 検査対象外 | pattern / workflow_route / branch_type / labels を検出 | REQ-0108-124 |
| accepted ADR のみ引用 | 検査対象外 | proposed / superseded / deprecated ADR 引用を warning として検出 | REQ-0108-125 |
| reference-path OK診断 | OK結果にfile/line/evidenceなし | per-reference OKにfile/line/evidenceを出力 | REQ-0108-117 |
| cross-skill裸参照 | 裸参照のcross-skill誤検知なし | 同一skill内になく別skillにある裸参照をstrict NG検出 | REQ-0108-119 |
| abolished-skill-reference | N/A (検査対象外) | 廃止済み skill (agentdev-workflow-reporting) への参照を strict として検出 | REQ-0108-126 |
| command-local-template-existence | completion report templates in skill directory | completion report templates in `.opencode/commands/agentdev/templates/{command}/{variant}.md` | REQ-0108-127 |
| skill-spec-dependency | N/A (検査対象外) | runtime skill から docs/specs/ への直接依存を warning として検出 | REQ-0108-128 |
| ADR current/retired collection | 検査対象外 | current ADR collection（`docs/adr/ADR-01XX.md`）と retired ADR collection（`docs/adr/retired/ADR-00XX.md`）を区別して検査 | REQ-0112-050 |

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
| ADR | status 遷移妥当性、参照 REQ 存在確認、current/retired collection 区別（REQ-0112-050） |
| Skill | USE FOR / DO NOT USE FOR 整合性、references/ 存在確認 |
| Command | frontmatter 許可フィールド、Steps 構造 |
| Template | 必須セクション存在、プレースホルダー妥当性 |
| Workflow | workflow route 定義の整合性 |
| Link | 文書間リンクの到達性 |
| Canonical | canonical 境界の遵守 |
| Lifecycle | 状態遷移の妥当性 |
| Namespace | 旧 namespace 残存確認 |
| ImplementationPattern | ~~pattern 定義妥当性（REQ-0108-026〜038, 反転済）~~ → frontmatter 禁止フィールド検査に統合済 |
| ADRStatusNormalization | ADR status 旧形式検出（REQ-0108-121） |
| RuidGroundReference | docs 永続文書内の RU-ID 参照検出（REQ-0108-122） |
| WorkflowStatusProhibition | workflow status / 6 マイクロフェーズ検出（REQ-0108-123） |
| AcceptedAdrCitation | accepted 以外の ADR 引用検出（REQ-0108-125, SHOULD）。retired ADR への履歴参照は現行根拠引用 warning と区別する（REQ-0112-050） |
| AbolishedSkillReference | 廃止済み skill への参照検知（REQ-0108-126） |
| CommandLocalTemplate | command-local template 存在・整合性検査（REQ-0108-127） |
| SkillSpecDependency | runtime skill から docs/specs/ への直接依存検出（REQ-0108-128） |
| RetiredAdrCitation | retired ADR への現行根拠引用検出（REQ-0112-048, warning/observation） |

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
| `req-save` | `docs/requirements/`, `docs/adr/`, `docs/DOC-MAP.md` | `.agentdev/`, `.opencode/` |
| `case-open` | GitHub Issue/PR のみ | ローカルファイル |
| `case-run` | worktree 内の全ファイル | worktree 外、`.agentdev/` |
| `case-close` | GitHub Issue/PR, worktree 削除 | `.agentdev/intake/inbox/` 直接書込 |
| `case-update` | GitHub Issue のみ | ローカルファイル |
| `docs-check` | `.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`（承認時） | 検査対象 artifact |

> **Note**: `docs-check` は `/repo/docs-check` として実行される repo-local コマンドである（ADR-0106）。AgentDevFlow の consumer 配布対象外。

| Command | Allowed Changes | Forbidden |
|---|---|---|
| `intake-capture` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-from-github` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-promote` | `.agentdev/intake/promoted/` | 他パス |
| `learning-promote` | `.agentdev/learning/promoted/` | 他パス |
| `backlog-review` | `.agentdev/backlog/req-units/`, `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` | `.opencode/`, 検査対象外artifact |
| `docs-review` | なし（read-only 診断） | 全ファイル書込 |

## Postflight Diff Checking

postflight diff checking は read-only command から段階導入する:

**Phase 1 — read-only command 検証**:
- `docs-check`（repo-local `/repo/docs-check`）, `docs-review`, `backlog-review` は実行後にローカルファイル変更がないことを確認
- 変更が検出された場合は warning として報告

**Phase 2 — 拡張適用**（将来）:
- `case-run` の実行後、意図しないスコープ外ファイル変更を検出
- allowed changes profile に基づく diff フィルタリング
