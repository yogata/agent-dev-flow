---
status: accepted
updated: 2026-07-07
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

### TargetedDocsReport 型契約（REQ-0158 Phase 2）

check_changed_docs.ts の JSON 出力型である TargetedDocsReport の型定義を固定する。必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check。上記リストのみを必須フィールドとし、それ以外を許容しない。型/戻り値/JSON/text出力/テストが一致する契約とする。

## スクリプト契約（Script Contract）

整合性検査スクリプトは共通 CLI 契約に準拠する:

- `--help`, `--json`, `--dry-run` オプションをサポート
- exit code: 0（OK）、1（NG/warning）、2（error）
- stdout = 機械可読出力、stderr = 診断メッセージ
- 非対話実行、破壊的変更禁止

### check_changed_docs.ts 挙動SPEC 契約（REQ-0158 Phase 1, 3）

check_changed_docs.ts は以下の挙動SPEC 契約に従う: entry（引数解析、対象確定）、対象解決（--files または --base-ref から files_checked を生成）、profile 呼出（--workflow に応じた profileFor 適用）、validator 呼出（profile rules の実行）、report 契約（TargetedDocsReport 形式での JSON/text 出力）、exit code（FAILURE/WARNING/OK の 3 値）。

対象確定はコマンド側が行い、check_changed_docs.ts は対象選定の十分性を判定しない。--files 指定で files_checked が空の場合は FAILURE、--base-ref 指定で files_checked が空の場合は WARNING とする。評価対象はフォーマット検査に限定し、意味評価を行わない。

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

## reference-path-existence 検出における backtick 囲みパスの扱い（REQ-0144-020）

`checkScriptTemplateReferencePaths`（`check_integrity.ts`）は command 定義と SKILL.md から抽出したパス参照（`.opencode/**`、`scripts/*.ts`、`templates/*.md`、`references/*.md`）の実在確認を行う。このとき Markdown backtick で囲まれたパス成分はインラインコード修飾（code formatting）と解釈し、パス解決前に backtick を除去する（例: `.opencode/commands/agentdev/templates/case-close/\`agentdev-push-failed\`.md` → `.opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md`）。

| 取扱い | 根拠 |
|--------|------|
| backtick 囲み成分をパス参照として解釈する | 読者は当該箇所をナビゲーション先とみなし得る。実在確認を行うことでリンク切れを防止する |
| パス解決前に backtick を除去する | backtick は Markdown の修飾記号であり、ファイルシステム上のパス成分ではない。修飾起因で実在確認が偽陰性となることを防ぐ |
| 報告時の evidence は backtick 含む原文を保持する | 著者が修正箇所を特定しやすくするため |

本扱いは backtick 囲みをインラインコード表現として検出対象から除外する運用（パス参照として解釈しない運用）と対比した上で、実在確認の価値を維持するためパス参照として解釈する運用を採用した。検出ロジック（`check_integrity.ts`）と本節の記述は整合している。

## RuntimeReference baseline 運用手順（REQ-0144-021）

IR-055（runtime-unresolved-reference）は段階導入（REQ-0108-264）のため、baseline 既知違反と新規違反を区別する。baseline は `.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json` に格納する。

| 項目 | 定義 |
|------|------|
| 更新タイミング | delta guard / impact guard で「new violation」と報告された場合。ただし根因調査の結果、当該違反が正当な実装修復の結果ではなく baseline 陳腐化（周辺文書の改修や対象外領域の再編等）に起因すると判断された場合に限り baseline を更新する |
| 更新対象範囲 | IR-055 baseline のみ。他ルール（IR-001〜IR-054, IR-056, IR-057）は baseline 運用を行わず、新規違反は即座に修正する |
| 実行者 | agent-dev-flow リポジトリの maintainer。PR を経由して更新する |
| 根因特定手順 | (1) 報告された new violation の evidence を確認する。(2) 当該箇所が本来除去されるべき違反か、baseline に記録された既知違反の周辺改修による見え方の変化かを分類する。(3) 前者の場合は違反を修正し baseline は更新しない。後者の場合は baseline 更新を正当化する根因（baseline 再計算で当該 bucket の count が増加する理由）を PR 本文に記載する |
| 更新実行手順 | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ir055-baseline` を実行し、生成された baseline ファイルを commit する。更新後は `--json` 実行で new violation が 0 件になることを確認する |
| 更新非対象 | strict 違反（REQ-NNNN、ADR-NNNN、`src/opencode/`、`/repo/*`、`repo-*`）の新規発生は baseline 更新で解消せず、必ず実装修復を行う。baseline 更新が許容されるのは heuristic 違反（`docs/specs/`、`docs/guides/`、本体 GitHub URL、行番号付き参照）の bucket 再計算のみ |

## docs-check delta 検出における除外設定方針（REQ-0144-022, REQ-0144-015 準拠）

docs-check は baseline 運用（IR-055）と path exemption（`IR055_EXEMPT_PATH_PATTERNS`）の二系統で検出対象を絞る。両者とも「正当な除外」と「NG 隠蔽」を区別して運用する（REQ-0144-015）。

### 正当な除外（legitimate exclusions）

| 除外種別 | 対象 | 根拠 |
|----------|------|------|
| ルール自己参照 | `vocabulary-registry.md`、`integrity-rule-catalog.md`、`integrity-contracts.md`、`rules/IR-*.md`（全IRルールファイル、REQ-0145-015）、`baselines/ir-055-baseline.json` | 検出ルール自体の記述、正規語彙の対照表はルールを説明するためにパターンを列挙する。これを検出するとルール自身が NG となるため自己参照除外とする。個別 IR ルールファイル（`rules/IR-*.md`）は検出ルールの説明文であり、例示用 ID、廃止 skill 例、廃止 ADR 番号帯例示は自己参照的な説明資料であるため、全検出関数（broken-reference, abolished-skill-references, obsolete-spec-path 等）の検出スコープから除外する（REQ-0145-015） |
| コードブロック内部 | ` ``` ` で囲まれた範囲 | 例示、パターン説明は検出対象外（integrity-rule-catalog.md「対象ファイル設計」準拠） |
| template placeholder | `{xxx}` 形式のプレースホルダーを含む行 | プレースホルダーは実参照ではない |
| retired 領域 | `docs/requirements/retired/**`、`docs/adr/retired/**` | 履歴参照用。旧表記を履歴として残すことを許容する |

### NG 隠蔽（禁止）

| 隠蔽種別 | 例 | 対処 |
|----------|----|------|
| baseline 過大計上 | 実修復されていない違反を baseline count に含め報告を抑止する | 許容しない。baseline 更新は前節「RuntimeReference baseline 運用手順」の根因特定を経た場合のみ認める |
| 広域 exemption | 対象を絞らない glob（`docs/**` 等）で検出を回避する | 許容しない。exemption は対象ファイル単位、かつ根拠文書化を必須とする |
| 検出無効化 | check_integrity.ts の検出関数をコメントアウト、条件付きで回避 | 許容しない。検出の廃止は catalog↔実装双方向同期運用（REQ-0145-003）に従い `baseline_status: resolved` を経て行う |

### 除外設定の文書化要件

新規 exemption pattern を `IR055_EXEMPT_PATH_PATTERNS` へ追加する場合、当該コミットは以下のいずれかを満たす根拠を PR 本文に記載する。

1. 当該パスがルール自己参照であること（ファイルパスとルール ID の対応）
2. 当該パスが履歴参照領域（retired 等）であること
3. 当該パスが検出原理上の技術的除外であること（テスト fixture 等、検出すると恒久的に false となる場合）

根拠なしの exemption 追加は NG 隠蔽（REQ-0144-015 違反）として扱い、レビューで却下する。

## catalog ↔ 実装双方向同期運用（REQ-0145-003/004）

[integrity-rule-catalog.md](integrity-rule-catalog.md) と `check_integrity.ts` 実装は双方向同期運用を行う。同期ルール:

| イベント | catalog 側の処理 | 実装側の処理 |
|---|---|---|
| 整合性ルール削除 | 該当 IR エントリの `baseline_status` を `resolved` へ更新 | 実装も削除、または存置して catalog 側で無効化 |
| 実装削除 | 該当 IR エントリの `baseline_status` を `resolved` へ更新 | - |
| 実装復活 | 該当 IR エントリの `baseline_status` を `new` へ更新 | - |
| 新規ルール追加 | 新規 IR エントリを `baseline_status: new` で追加 | 実装追加 |

docs-check 項目役割範囲（バックエンド対象 vs skill 定義対象）、対象ファイル設計（`.md` のみ、正当使用例外）、NG ルール間依存関係マップの詳細は [integrity-rule-catalog.md](integrity-rule-catalog.md) 参照。

## Workflow × 使用ツールマトリックス

本セクションは全 workflow の使用検査ツールを肯定表現で一元管理する SSoT であり、各 workflow SPEC から参照される。req-save/spec-save/case-run/case-close の各コマンドは対象ファイル種別に応じた最小監査範囲を定義し、case-run/case-close は永続文書更新を契機に検査する。

| workflow | check_changed_docs.ts | check_extensions.ts | check_integrity.ts | test_strategy |
|---|---|---|---|---|
| req-save | ✓（REQ files） | — | — | — |
| spec-save | ✓（SPEC files） | — | — | — |
| case-open | — | — | — | — |
| case-run | ✓（docs/** 変更時、--workflow case-run） | ✓（src/opencode/{commands,skills}/** 変更時、IR-056） | — | ✓（Issue 完了条件検証） |
| case-close | ✓（PR files、--workflow case-close） | ✓（src/opencode/{commands,skills}/** 変更時、IR-056） | — | ✓（QG-4 完了条件確認） |
| req-define | — | — | ✓（全体監査、検証手順） | — |
| /repo/docs-check | ✓ | ✓ | ✓（全体監査） | — |

全セル肯定表現（✓ または —）を使用する（REQ-0144-002, REQ-0144-003 準拠）。check_integrity.ts 列は req-define と /repo/docs-check のみ ✓ とし、他 workflow は — で「使用しない」を暗黙表現する。

参照元 workflow SPEC 一覧（各 SPEC から本マトリックス表を参照）:

- [commands/req-save.md](../commands/req-save.md)
- [commands/spec-save.md](../commands/spec-save.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-run.md](../commands/case-run.md)
- [commands/case-close.md](../commands/case-close.md)
