---
status: accepted
---

# 整合性契約

本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

整合性検査の分類フレームワークを定義し、検査結果の深刻度と対応フローを規定する（REQ-0108）。

## 深刻度分類（Severity Classification）

| 分類 | 意味 | 判定時の動作 | 例 |
|---|---|---|---|
| **strict** | 基準違反。即座に修正が必要 | NG として報告し、当該コマンドの完了をブロックする | frontmatter 禁止フィールド混入、必須セクション欠落、参照切れ |
| **heuristic** | ヒューリスティック検出（パターンベース、誤検知リスクあり）。修正を推奨 | warning として報告し、完了はブロックしない | 行数超過、旧名前空間残存、旧用語使用 |
| **observation** | 情報提供。改善の参考 | info として報告し、対応は任意 | 未使用 skill の発見、改善候補の提示、潜在的乖離 |

## 検出事項分類（Finding Classification）

検査で検出された問題の分類:

| 検出事項種別 | 説明 | 既定 severity |
|---|---|---|
| document-drift | 文書内容と実装の乖離 | heuristic |
| broken-reference | リンク切れ、参照先不存在 | strict |
| obsolete-structure | 廃止済み構造の残存 | heuristic |
| canonical-conflict | 基準文書間の矛盾 | strict |
| workflow-gap | workflow 定義の欠落 | heuristic |
| integrity-rule-gap | 検査ルール自体の欠落 | observation |

> **REQ/SPEC 境界違反**（REQ-0108-260）: 現行 REQ 要件行の主たる文意が SPEC 詳細（スキーマフィールド、enum 値一覧、テストデータ詳細、チェッカー個別ルール、誤検知抑制方式、Step 番号、Phase 番号、内部アルゴリズム、作業履歴）である場合は canonical-conflict のサブカテゴリとして扱い、IR-044 で heuristic 検出する。
> REQ-0101-069 の安定契約例外（公開コマンド名、公開入口、ドメイン状態位置づけ、他コマンド接続契約、利用者可視分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約）に該当する要約残留は検出対象外とする。

## 検出事項経路マップ（Finding Route Map）

検出された検出事項の対応先:

| 検出事項種別 | 経路 | 対応コマンド |
|---|---|---|
| document-drift | intake | `/agentdev/intake-capture` |
| broken-reference | intake | `/agentdev/intake-capture` |
| obsolete-structure | intake | `/agentdev/intake-capture` |
| canonical-conflict | req-define | `/agentdev/req-define` |
| workflow-gap | intake + learning | `/agentdev/intake-capture` + `learning-capture` |
| integrity-rule-gap | learning | `learning-capture` |

## 整合性検査カテゴリ（Integrity Check Categories）

| カテゴリ | 検査対象 |
|---|---|
| REQ | frontmatter 整合性、ID 一意性、タグ妥当性 |
| ADR | status 遷移妥当性、参照 REQ 存在確認、現行、廃止コレクション区別（REQ-0112-050） |
| Skill | USE FOR / DO NOT USE FOR 整合性、`references/` 存在確認 |
| Command | frontmatter 許可フィールド、Steps 構造 |
| Template | 必須セクション存在、プレースホルダー妥当性 |
| Workflow | ワークフロー経路定義の整合性 |
| Link | 文書間リンクの到達性 |
| Canonical | 正規境界の遵守 |
| Lifecycle | 状態遷移の妥当性 |
| Namespace | 旧名前空間残存確認 |
| ImplementationPattern | frontmatter 禁止フィールド検査（REQ-0108-026〜038 から反転、REQ-0108-109/124 に統合済） |
| ADRStatusNormalization | ADR status 旧形式検出（REQ-0108-121） |
| RuidGroundReference | docs 永続文書内の RU-ID 参照検出（REQ-0108-122） |
| WorkflowStatusProhibition | ワークフロー状態 / 6 マイクロフェーズ検出（REQ-0108-123） |
| AcceptedAdrCitation | 承認済み以外の ADR 引用検出（REQ-0108-125, 推奨）。廃止 ADR への履歴参照は現行根拠引用 heuristic と区別する（REQ-0112-050） |
| AbolishedSkillReference | 廃止済み skill への参照検知（REQ-0108-126） |
| CommandLocalTemplate | command-local template 存在、整合性検査（REQ-0108-127） |
| SkillSpecDependency | 実行時スキルから docs/specs/ への直接依存検出（REQ-0108-128） |
| RetiredAdrCitation | 廃止 ADR への現行根拠引用検出（REQ-0112-048, heuristic/observation） |
| ReqSpecBoundary | 現行 REQ 要件行への SPEC 詳細混入検出（REQ-0108-260, REQ-0101-067〜069。IR-044 としてカタログ定義。REQ-0101-069 安定契約例外は対象外） |

## レポート形式（Report Format）

検査結果のレポート形式:

- 出力先: `.agentdev/integrity/reports/`
- 形式: JSON / Markdown
- スキーマ: チェック項目ごとの status（OK / NG / warning / info）+ 検出事項一覧

## スクリプト契約（Script Contract）

整合性検査スクリプトは共通 CLI 契約に準拠する:

- `--help`, `--json`, `--dry-run` オプションをサポート
- exit code: 0（OK）、1（NG/warning）、2（error）
- stdout = 機械可読出力、stderr = 診断メッセージ
- 非対話実行、破壊的変更禁止

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（ADR-0103）。
他プロジェクトへの適用を意図しない。
実行時コマンドは SPEC ファイルに依存しない（ADR-0104）。

## ガードレール分類（Guardrails Classification）

コマンドガードレールを以下の 6 カテゴリに分類する:

| カテゴリ | 意味 | 例 |
|---|---|---|
| **KEEP_AS_GUARDRAIL** | ユーザー安全性に関わる制約。command 定義に残置 | ファイル操作制限、ユーザー承認必須、破壊的操作禁止 |
| **STATIC_CHECK** | 機械的検証可能な検査。docs-check に移行 | frontmatter 規約、必須セクション存在、行数上限 |
| **POSTFLIGHT_DIFF** | 実行後の diff 検証。postflight スクリプトで検査 | 意図しないファイル変更、スコープ外の編集 |
| **HELPER_SCRIPT** | 補助的処理。script に移行 | 検査、変換、フォーマット処理 |
| **MOVE_TO_SPEC** | SPEC へ移譲すべき内容。SPEC 定義に委譲 | アーティファクト構造定義、命名規則の詳細 |
| **DELETE_AS_OBVIOUS** | 自明な制約。削除可能 | LLM 既知の常識的内容 |

## 許可変更プロファイル（Allowed Changes Profiles）

各コマンドの許可変更（allowed changes: 許可されるファイル変更範囲）:

| Command | 許可変更 | 禁止 |
|---|---|---|
| `req-define` | `.agentdev/drafts/req-draft-*.md` の生成（対話セッションで合意形成し、原本文書は変更しない） | 原本文書（`docs/`、`.opencode/`）の変更、Issue/PR 作成、更新、commit/push |
| `req-save` | `docs/requirements/`, `docs/adr/`, `docs/DOC-MAP.md`, `.agentdev/intake/inbox/req-restructure/`（REQ 再構成 intake のみ） | `.agentdev/`（req-restructure 除く）, `.opencode/` |
| `case-open` | GitHub Issue/PR のみ | ローカルファイル |
| `case-run` | worktree 内の全ファイル | worktree 外、`.agentdev/` |
| `case-close` | GitHub Issue/PR, worktree 削除 | `.agentdev/intake/inbox/` 直接書込 |
| `case-update` | GitHub Issue のみ | ローカルファイル |
| `docs-check` | `.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`（実行時。実行自体を承認として扱い、追加のユーザー承認は不要。REQ-0108-225, REQ-0112-059） | 検査対象アーティファクト |

> **注記**: `docs-check` は `/repo/docs-check` として実行される配布対象外コマンドである（ADR-0106）。
> AgentDevFlow の配布対象外。

| Command | 許可変更 | 禁止 |
|---|---|---|
| `intake-capture` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-from-github` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-promote` | `.agentdev/intake/promoted/` | 他パス |
| `learning-promote` | `.agentdev/learning/promoted/` | 他パス |
| `backlog-review` | `.agentdev/backlog/req-units/`, `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` | `.opencode/`, 検査対象外アーティファクト |
| `inspect-docs` | `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、`.agentdev/inspect/` 配下の git 永続化（commit / push） | 検査対象アーティファクト（docs/、REQ/ADR/SPEC/guides/DOC-MAP、Command/Skill/Template/Script）の変更、許可範囲外 commit/push、Issue/PR 作成、更新 |

## 実行後差分検査（Postflight Diff Checking）

実行後差分検査（postflight diff checking）は検査対象を直接修正しないコマンドから段階導入する:

**検査対象を直接修正しないコマンド検証**:
- `inspect-docs` は実行後に検査対象アーティファクト（docs/、REQ/ADR/SPEC/guides/DOC-MAP、Command/Skill/Template/Script）に変更がないことを確認。許可出力（`.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、`.agentdev/inspect/` 配下の commit/push）以外の変更を warning として報告する
- `docs-check`（配布対象外 `/repo/docs-check`）は検査対象アーティファクトを変更しないが、許可された出力（`.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`）を生成する。実行後差分検査は「検査対象アーティファクトへの変更がないこと」を確認し、許可出力範囲外の変更を warning として報告する
- `backlog-review` も検査対象外アーティファクトを変更せず、許可された `.agentdev/` 配下の出力のみを行う
- 変更が検出された場合は warning として報告

## 3層検出構造の責務分担（REQ-0145-008, REQ-0146-008）

整合性検出は以下の3層構造で責務分担する:

| 層 | 担当 | 検出対象 | 検出形式 |
|---|---|---|---|
| 機械的検出 | docs-check + IR（[integrity-rule-catalog.md](integrity-rule-catalog.md)） | 文書構造、ID 参照、frontmatter、命名規則等、決定論的検出可能な違反 | strict / heuristic / observation の severity 分類 |
| 意味的診断 | inspect-skills（REQ-0125） | Command → Skill 参照妥当性、Skill 構造、読み取り専用診断 | finding 出力、推奨 route 提示 |
| 査読時観点 | doc-writing skill（REQ-0140） | 文書種別責務、要件性、文意品質、粒度 | 査読コメント、follow-up 指摘 |

各層は他層の担当を重複して実施せず、検出内容に応じて適切な層へ委譲する。
機械的検出で偽陽性となる意味的判断は inspect-skills へ、文書品質の査読は doc-writing skill へ、それぞれ振り分ける。

## IR-050 / IR-051 適用条件（REQ-0145-006/007）

IR-050（load_skills 誤指定検出）、IR-051（実行主体 skill 表記誤認検出）は、語彙レジストリ（`.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`）の存在確認、必要語彙の補充後に適用する。
IR-051 の「一定文字距離内」は語彙レジストリで確定された具体閾値（文字数、行数）を使用する。
閾値未確定時は heuristic として報告するが auto-promote 対象外とする。

## catalog ↔ 実装双方向同期運用（REQ-0145-003/004）

[integrity-rule-catalog.md](integrity-rule-catalog.md) と `check_integrity.ts` 実装は双方向同期運用を行う。同期ルール:

| イベント | catalog 側の処理 | 実装側の処理 |
|---|---|---|
| 整合性ルール削除 | 該当 IR エントリの `baseline_status` を `resolved` へ更新 | 実装も削除、または存置して catalog 側で無効化 |
| 実装削除 | 該当 IR エントリの `baseline_status` を `resolved` へ更新 | - |
| 実装復活 | 該当 IR エントリの `baseline_status` を `new` へ更新 | - |
| 新規ルール追加 | 新規 IR エントリを `baseline_status: new` で追加 | 実装追加 |

docs-check 項目役割範囲（バックエンド対象 vs skill 定義対象）、対象ファイル設計（`.md` のみ、正当使用例外）、NG ルール間依存関係マップの詳細は [integrity-rule-catalog.md](integrity-rule-catalog.md) 参照。
