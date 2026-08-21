---
title: 整合性契約
status: accepted
created: 2026-08-20
updated: 2026-08-18
---
<!-- ADF-COVERS(implementation): REQ-010-006 -->
<!-- ADF-COVERS(implementation): REQ-036-022 -->

# 整合性契約

本 Design は agent-dev-flow リポジトリのみに適用される。

## 目的

整合性検査の分類フレームワークを定義し、検査結果の深刻度と対応フローを規定する（REQ-010）。

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

> **REQ/Design 境界違反**: 現行 REQ 要件行の主たる文意が Design 詳細（スキーマフィールド、enum 値一覧、テストデータ詳細、チェッカー個別ルール、誤検知抑制方式、Step 番号、Phase 番号、内部アルゴリズム、作業履歴）である場合は canonical-conflict のサブカテゴリとして扱い、IR-044 で heuristic 検出する。
> REQ-001-069 の安定契約例外（公開コマンド名、公開入口、ドメイン状態位置づけ、他コマンド接続契約、利用者可視分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約）に該当する要約残留は検出対象外とする。

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
| ADR | status 遷移妥当性、参照 REQ 存在確認、現行、廃止コレクション区別（REQ-001-050） |
| Skill | USE FOR / DO NOT USE FOR 整合性、`references/` 存在確認 |
| Command | frontmatter 許可フィールド、Steps 構造 |
| Template | 必須セクション存在、プレースホルダー妥当性 |
| Workflow | ワークフロー経路定義の整合性 |
| Link | 文書間リンクの到達性 |
| Canonical | 正規境界の遵守 |
| Lifecycle | 状態遷移の妥当性 |
| Namespace | 旧名前空間残存確認 |
| ImplementationPattern | frontmatter 禁止フィールド検査（REQ-036-014〜021、REQ-037-001〜005 から反転） |
| ADRStatusNormalization | ADR status 旧形式検出 |
| RuidGroundReference | docs 永続文書内の RU-ID 参照検出 |
| WorkflowStatusProhibition | ワークフロー状態 / 6 マイクロフェーズ検出 |
| AcceptedAdrCitation | 承認済み以外の ADR 引用検出（推奨）。廃止 ADR への履歴参照は現行根拠引用 heuristic と区別する（REQ-001-050） |
| AbolishedSkillReference | 廃止済み skill への参照検知 |
| CommandLocalTemplate | command-local template 存在、整合性検査 |
| SkillSpecDependency | 実行時スキルから docs/designs/ への直接依存検出 |
| RetiredAdrCitation | 廃止 ADR への現行根拠引用検出（REQ-001-048, heuristic/observation） |
| ReqSpecBoundary | 現行 REQ 要件行への Design 詳細混入検出（REQ-001-067〜069。IR-044 としてカタログ定義。REQ-001-069 安定契約例外は対象外） |

## レポート形式（Report Format）

検査結果のレポート形式:

- 出力先: `.agentdev/integrity/reports/`
- 形式: JSON / Markdown
- スキーマ: チェック項目ごとの status（OK / NG / warning / info）+ 検出事項一覧

### TargetedDocsReport 型契約（targeted-docs-guard-implementation.md Phase 2）

check_changed_docs.ts の JSON 出力型である TargetedDocsReport の型定義を固定する。
必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check。
上記リストのみを必須フィールドとし、それ以外を許容しない。
型/戻り値/JSON/text出力/テストが一致する契約とする。

## スクリプト契約（Script Contract）

整合性検査スクリプトは共通 CLI 契約に準拠する:

- `--help`, `--json`, `--dry-run` オプションをサポート
- exit code: 0（OK）、1（NG/warning）、2（error）
- stdout = 機械可読出力、stderr = 診断メッセージ
- 非対話実行、破壊的変更禁止

### check_changed_docs.ts 挙動Design 契約（targeted-docs-guard-implementation.md Phase 1, 3）

check_changed_docs.ts は以下の挙動Design 契約に従う: entry（引数解析、対象確定）、対象解決（--files または --base-ref から files_checked を生成）、profile 呼出（--workflow に応じた profileFor 適用）、validator 呼出（profile rules の実行）、report 契約（TargetedDocsReport 形式での JSON/text 出力）、exit code（FAILURE/WARNING/OK の 3 値）。

対象確定はコマンド側が行い、check_changed_docs.ts は対象選定の十分性を判定しない。
--files 指定で files_checked が空の場合は FAILURE、--base-ref 指定で files_checked が空の場合は WARNING とする。
評価対象はフォーマット検査に限定し、意味評価を行わない。

## 適用範囲宣言

`docs/designs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは Design ファイルに依存しない（REQ-001）。

## ガードレール分類（Guardrails Classification）

コマンドガードレールを以下の 6 カテゴリに分類する:

| カテゴリ | 意味 | 例 |
|---|---|---|
| **KEEP_AS_GUARDRAIL** | ユーザー安全性に関わる制約。command 定義に残置 | ファイル操作制限、ユーザー承認必須、破壊的操作禁止 |
| **STATIC_CHECK** | 機械的検証可能な検査。docs-check に移行 | frontmatter 規約、必須セクション存在、行数上限 |
| **POSTFLIGHT_DIFF** | 実行後の diff 検証。postflight スクリプトで検査 | 意図しないファイル変更、スコープ外の編集 |
| **HELPER_SCRIPT** | 補助的処理。script に移行 | 検査、変換、フォーマット処理 |
| **MOVE_TO_SPEC** | Design へ移譲すべき内容。Design 定義に委譲 | アーティファクト構造定義、命名規則の詳細 |
| **DELETE_AS_OBVIOUS** | 自明な制約。削除可能 | LLM 既知の常識的内容 |

## 許可変更プロファイル（Allowed Changes Profiles）

各コマンドの許可変更（allowed changes: 許可されるファイル変更範囲）:

| Command | 許可変更 | 禁止 |
|---|---|---|
| `req-define` | `.agentdev/drafts/req-draft-*.md` の生成（対話セッションで合意形成し、原本文書は変更しない） | 原本文書（`docs/`、`.opencode/`）の変更、Issue/PR 作成、更新、commit/push |
| `req-save` | `docs/requirements/`, `docs/decisions/`, `.agentdev/intake/inbox/req-restructure/`（REQ 再構成 intake のみ） | `.agentdev/`（req-restructure 除く）, `.opencode/` |
| `case-open` | GitHub Issue/PR のみ | ローカルファイル |
| `case-run` | worktree 内の全ファイル | worktree 外、`.agentdev/` |
| `case-close` | GitHub Issue/PR, worktree 削除 | `.agentdev/intake/inbox/` 直接書込 |
| `case-update` | GitHub Issue のみ | ローカルファイル |
| `docs-check` | `.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`（実行時。実行自体を承認として扱い、追加のユーザー承認は不要。REQ-001-059） | 検査対象アーティファクト |

> **注記**: `docs-check` は `/repo/docs-check` として実行される配布対象外コマンドである（REQ-001）。
> AgentDevFlow の配布対象外。

| Command | 許可変更 | 禁止 |
|---|---|---|
| `intake-capture` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-from-github` | `.agentdev/intake/inbox/` | 他 `.agentdev/` パス |
| `intake-promote` | `.agentdev/intake/promoted/` | 他パス |
| `learning-promote` | `.agentdev/learning/promoted/` | 他パス |
| `backlog-review` | `.agentdev/backlog/req-units/`, `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` | `.opencode/`, 検査対象外アーティファクト |
| `inspect-docs` | `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、`.agentdev/inspect/` 配下の git 永続化（commit / push） | 検査対象アーティファクト（docs/、REQ/Decision/Design/guides、Command/Skill/Template/Script）の変更、許可範囲外 commit/push、Issue/PR 作成、更新 |

## 実行後差分検査（Postflight Diff Checking）

実行後差分検査（postflight diff checking）は検査対象を直接修正しないコマンドから段階導入する:

**検査対象を直接修正しないコマンド検証**:
- `inspect-docs` は実行後に検査対象アーティファクト（docs/、REQ/Decision/Design/guides、Command/Skill/Template/Script）に変更がないことを確認。許可出力（`.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、`.agentdev/inspect/` 配下の commit/push）以外の変更を warning として報告する
- `docs-check`（配布対象外 `/repo/docs-check`）は検査対象アーティファクトを変更しないが、許可された出力（`.agentdev/integrity/reports/`, `.agentdev/intake/inbox/`）を生成する。実行後差分検査は「検査対象アーティファクトへの変更がないこと」を確認し、許可出力範囲外の変更を warning として報告する
- `backlog-review` も検査対象外アーティファクトを変更せず、許可された `.agentdev/` 配下の出力のみを行う
- 変更が検出された場合は warning として報告

## 3層検出構造の責務分担（REQ-010-008, REQ-003-008）

整合性検出は以下の3層構造で責務分担する:

| 層 | 担当 | 検出対象 | 検出形式 |
|---|---|---|---|
| 機械的検出 | docs-check + IR（[integrity-rule-catalog.md](integrity-rule-catalog.md)） | 文書構造、ID 参照、frontmatter、命名規則等、決定論的検出可能な違反 | strict / heuristic / observation の severity 分類 |
| 意味的診断 | inspect-skills（REQ-036） | Command → Skill 参照妥当性、Skill 構造、読み取り専用診断 | finding 出力、推奨 route 提示 |
| 査読時観点 | doc-writing skill（v2:REQ-0140） | 文書種別責務、要件性、文意品質、粒度 | 査読コメント、follow-up 指摘 |

各層は他層の担当を重複して実施せず、検出内容に応じて適切な層へ委譲する。
機械的検出で偽陽性となる意味的判断は inspect-skills へ、文書品質の査読は doc-writing skill へ、それぞれ振り分ける。

## IR 存在条件モデル（DEC-013 適用、REQ-028-008/009/010/012）

DEC-013（AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化）を適用し、IR の状態モデルを「現存 IR = 現行 = executable detector」へ統一した。
`lifecycle_state`、`enforcement_mode`、`baseline_status` は現行 IR の属性から全て削除し、`active+none` の恒久状態を禁止する（REQ-028-009）。
tombstone（IR-011 型 file-backed）は AG-008 により物理削除し、廃止 IR の履歴保存のみを目的とする file-backed tombstone を保持しない（REQ-028-008）。
識別子の再利用禁止は `foundations/numbering-policy.md` が保持し、履歴性は Git で担保する。

### 8 項目存在条件（REQ-028-001）

現存 IR は次の8項目存在条件をすべて満たす場合にのみ現行成果物として存在できる。
detector 関数の専有は必須ではなく、invariant ごとの到達性が追跡可能で回帰証拠が存在すれば他 IR との detector 共有を許容する。
既存であることのみを KEEP の根拠としない。

1. canonical basis（REQ/Decision/Design のいずれか）
2. invariant（検出すべき不変条件）
3. executable detector（専有または共有）
4. regression test
5. execution route（docs-check / CI / 保存工程の正規実行経路から到達可能）
6. finding route（検出事項の対応経路）
7. 他 IR 非包含（独立 invariant を持つ）
8. severity / gate_level 実行可能性（AG-009 決定7、実行中の IR に対する独立軸として維持）

`severity`、`gate_level` は現行 IR に対する独立軸として維持し、IR lifecycle の代替にしない（REQ-036-022、REQ-028-009 決定7）。

### 非実効 IR の禁止（REQ-028-002）

detector 不在、部分実装、test 不在、到達不能、finding 未接続の IR を恒久的な現行 IR として許容しない。
必要な invariant は IMPLEMENT、不要な場合は DELETE/MERGE とする。

### 関連 Design

- `integrity-rule-catalog.md`: IR スキーマ（DEC-013 適用後の12 field）
- `rule-ownership.md`: 所有権マトリックス
- `foundations/numbering-policy.md`: 欠番管理、識別子再利用禁止
- `foundations/document-model.md`: IR frontmatter フィールド定義

## finding-baseline 分類（REQ-028-009/010、TS-014）

`baseline_status` を IR schema から分離し、finding 側の状態として定義する。
IR は finding-baseline 分類を持たず、finding が生成される時に finding 側で new/known/resolved を判定する。

| finding-baseline 状態 | 内容 |
|---|---|
| `new` | 現行の baseline 集合に含まれない新規検出事項。厳密な取扱い（strict なら NG、heuristic なら warning）を適用する |
| `known` | baseline 集合に記録済みの検出事項。`info`（observation）へ降格し、PR review で情報参照扱いとする |
| `resolved` | 実修復により現行の finding/baseline 集合から除去された検出事項。baseline 更新で除去される |

baseline 集合の管理は検出器（`check_integrity.ts`、`check_extensions.ts`）が行う。
各 checker は baseline ファイル（`baselines/ng-baseline.json`、`baselines/ir-055-baseline.json` 等）を持ち、新規検出事項と既知事項を区別する（REQ-010-007、REQ-036-009）。
IR 側で baseline を事前登録せず、finding が発生した時点で baseline 比較を行う。

tombstone 群（IR-011 型 file-backed）の `baseline_status: superseded` 表現は AG-008 により物理削除で解消し、file-backed 上の baseline 属性は持たない（REQ-028-010）。

## 新規 IR 登録 gate（REQ-028-012、TS-020）

新規 IR 登録時に次の2種 gate を適用する。
区別は `enforcement_mode` 非依存、blocking/non-blocking で判定する。

### (a) IR 存在資格 gate（全新規 IR 対象、hard）

全新規 IR は次の5要素の同時成立を必須とする。

1. canonical basis（REQ/Decision/Design のいずれか）が存在する
2. invariant（検出すべき不変条件）が明文化されている
3. executable detector（専有または共有）が実装されている
4. regression test が存在する
5. execution route（docs-check / CI / 保存工程の正規実行経路）から到達可能である

いずれか1要素でも欠ける場合は新規 IR 登録を認めない。
既存 IR に対しても8項目存在条件（前述）が要求されるため、(a) は新規登録時の初期 gate として機能する。

### (b) hard governance 追加 gate（blocking hard-control IR 対象、hard）

blocking hard-control IR（command 完了をブロックし得る strict severity の IR）は、(a) に加えて DEC-001 決定4「新規統制追加原則」の7条件立証を必須とする。
非 blocking IR（heuristic / observation、または blocking しない strict）は (b) を不要とする。

DEC-001 決定4 の7条件:
1. 新規統制が既存統制と重複しないこと
2. 新規統制が既存統制を置換しないこと（置換の場合は元統制の廃止手続きを伴う）
3. 削除/統合/interface 縮小を優先すること
4. ユーザー安全性に関わる本質的制約であること
5. 機械的検証可能であること（意味判断を要しない）
6. 運用コストが便益を上回らないこと
7. 例外条件、false positive 抑制方式が文書化されていること

### gate 実施手順

新規 IR 登録時に `integrity-rule-catalog.md`「新規カテゴリ追加判定フロー（REQ-010-005）」へ従い gate を実施する。
catalog エントリ追加前に (a) を、blocking IR の場合は (b) も確認する。
gate 不合格の場合は新規 IR 登録を取り下げ、REQ-028-013「IR 件数削減数で評価しない」に従い別途 backlog → RU → req-define → req-save 経路で提起する。

## 一時移行検査 registry（REQ-028-006）

一時移行検査（migration residual 等）は原則として恒久 IR とせず、期限/終了条件を持つ別種検査として扱う。
別種検査の所在は対象 Design または migration plan 配下とし、終了条件監視機構（期限超過警告、または docs-check 等の既存鮮度監視経路の拡張）を規定する。

### 別種検査の要件

| 項目 | 内容 |
|---|---|
| 配置先 | 対象 Design の `## Migration checks` 等の独立セクション、または `.agentdev/migration-plans/` 配下 |
| 終了条件 | 期限（例: ドメイン再編完了後2四半期）、または状態条件（例: 対象参照の新規発生件数が閾値以下） |
| 監視機構 | docs-check、または対象 Design での定期確認手順 |
| 廃止手順 | 終了条件達成後、別種検査を廃止し catalog/実装から除去する |

継続的再発防止価値がある場合のみ恒久 IR へ昇格する。
昇格時は新規 IR 登録 gate（前述）を適用する。
REQ-028-006 の詳細運用は別途 design-save 工程で確定する。

### IR-057 適用（REQ-028-006 移行判断、Phase 3 §7.2 判定）

IR-057（obsolete-spec-path-after-domain-split、Phase 2 KEEP 確定）は Phase 3 §7.2 判定に基づき現状維持（恒久 IR）とする。
`docs/designs/` ドメイン再編が未完了であり、obsolete-path 参照の新規発生リスクが継続するため。
別種検査への移行条件は次の2条件が両立した場合、Phase 6（OU-007）全体検証で再評価する。

1. `docs/designs/` ドメイン再編が完了し、obsolete-spec-path 構造が安定する
2. obsolete-path 参照の新規発生が一定期間（目安: 移行判断時点から2四半期以上）発生しない

## IR-050 / IR-051 適用条件（REQ-010-006/007）

IR-050（load_skills 誤指定検出）、IR-051（実行主体 skill 表記誤認検出）は、語彙レジストリ（`.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`）の存在確認、必要語彙の補充後に適用する。
IR-051 の「一定文字距離内」は語彙レジストリで確定された具体閾値（文字数、行数）を使用する。
閾値未確定時は heuristic として報告するが auto-promote 対象外とする。

## reference-path-existence 検出における backtick 囲みパスの扱い（REQ-036-008）

`checkScriptTemplateReferencePaths`（`check_integrity.ts`）は command 定義と SKILL.md から抽出したパス参照（`.opencode/**`、`scripts/*.ts`、`templates/*.md`、`references/*.md`）の実在確認を行う。
このとき Markdown backtick で囲まれたパス成分はインラインコード修飾（code formatting）と解釈し、パス解決前に backtick を除去する（例: `.opencode/commands/agentdev/templates/case-close/\`agentdev-push-failed\`.md` → `.opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md`）。
backtick 囲みのパス成分を実在確認する既存契約は維持する。

パス成分に `<...>` 形式の placeholder を含む参照は置換前のパラメータ表現として扱い、実在確認の対象外とする。
placeholder を含まない具体パスには実在確認を行い、未解決の場合は NG を報告する。

| 取扱い | 根拠 |
|--------|------|
| backtick 囲み成分をパス参照として解釈する | 読者は当該箇所をナビゲーション先とみなし得る。実在確認を行うことでリンク切れを防止する |
| パス解決前に backtick を除去する | backtick は Markdown の修飾記号であり、ファイルシステム上のパス成分ではない。修飾起因で実在確認が偽陰性となることを防ぐ |
| `<...>` 形式の placeholder を含む参照を実在確認の対象外とする | placeholder は具体パスではなく置換対象のパラメータ表現である。実在確認を行うと必ず偽陰性となるため対象外とする |
| 報告時の evidence は backtick 含む原文を保持する | 著者が修正箇所を特定しやすくするため |

本扱いは backtick 囲みをインラインコード表現として検出対象から除外する運用（パス参照として解釈しない運用）と対比した上で、実在確認の価値を維持するためパス参照として解釈する運用を採用した。
検出ロジック（`check_integrity.ts`）と本節の記述は整合している。

PR #2152（merge 4bf264b7）で実装された検出拡張4点を本節の正規契約として反映する。

1. ネストサブディレクトリ参照の検出: `references/xxx/yyy.md` 等の多階層パス参照も抽出対象とする
2. skill `references/*.md` の走査: command 定義に加え skill の references 配下ファイルを検出対象へ含める
3. reference ファイルの文脈解決: reference ファイル本文中のパス参照は当該 reference ファイルの配置位置を基準に相対解決する
4. CJK 句読点隣接の誤延長防止: パス直後に句読点（、。）等の CJK 文字が隣接する場合、パス境界を誤って延長しない

実装は main 入り済みであり、本節は文面の追従として機能する。

## RuntimeReference baseline 運用手順（REQ-036-009）

IR-055（runtime-unresolved-reference）は段階導入（REQ-010-007）のため、baseline 既知違反と新規違反を区別する。
baseline は `.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json` に格納する。

| 項目 | 定義 |
|------|------|
| 更新タイミング | delta guard / impact guard で「new violation」と報告された場合。ただし根因調査の結果、当該違反が正当な実装修復の結果ではなく baseline 陳腐化（周辺文書の改修や対象外領域の再編等）に起因すると判断された場合に限り baseline を更新する |
| 更新対象範囲 | IR-055 baseline のみ。他ルール（IR-001〜IR-054, IR-056, IR-057）は baseline 運用を行わず、新規違反は即座に修正する |
| 実行者 | agent-dev-flow リポジトリの maintainer。PR を経由して更新する |
| 根因特定手順 | (1) 報告された new violation の evidence を確認する。(2) 当該箇所が本来除去されるべき違反か、baseline に記録された既知違反の周辺改修による見え方の変化かを分類する。(3) 前者の場合は違反を修正し baseline は更新しない。後者の場合は baseline 更新を正当化する根因（baseline 再計算で当該 bucket の count が増加する理由）を PR 本文に記載する |
| 更新実行手順 | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ir055-baseline` を実行し、生成された baseline ファイルを commit する。更新後は `--json` 実行で new violation が 0 件になることを確認する |
| 更新非対象 | strict 違反（REQ-NNNN、ADR-NNNN、`src/opencode/`、`/repo/*`、`repo-*`）の新規発生は baseline 更新で解消せず、必ず実装修復を行う。baseline 更新が許容されるのは heuristic 違反（`docs/designs/`、`docs/guides/`、本体 GitHub URL、行番号付き参照）の bucket 再計算のみ |

### baseline 再生成分実行契約

- **移設を伴う変更**: 文書の移設・改名・参照構造変更を伴う PR では、baseline 再生成（再計算）を標準手順として PR 内で実行する。移設完了と baseline 不整合の残存を分離して報告する
- **並列 Wave 実行時**: 並列 Wave で同一 baseline への更新競合が生じ得る場合、再生成スコープは Wave 境界（各 Wave の取り込み完了時点）または最終 merge 後（Epic 全体の取り込み後）のいずれかとし、PR 間で同一 bucket の二重更新を発生させない
- **保存工程での要否判定**: docs/designs 配下への新規参照追加・参照変更を伴う保存工程では、変更後に IR-055 の new violation を確認し、正当な実装修復由来でない場合に再生成要否を判定する
- **ratchet 性の維持**: baseline は純減を健全とする ratchet であり、再生成により既知違反の隠蔽と検出対象の縮小を行わない。再生成の根拠は PR 本文に記録する

## NG baseline 運用手順（全カテゴリ strict pass、v2:REQ-0161-005 統合）

`check_integrity.ts` と `check_extensions.ts` は、既知の NG 集合を NG baseline として `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` へ格納する。
各実行は「当該変更起因の新規 NG が 0 件であること」を以て strict pass（exit 0）と判定する。
既知 NG が残存する状態でも strict pass が到達可能な構造を提供する（v2:REQ-0161-005）。

baseline は `category` / `check` / `file` / `evidence` の4組を bucket key とする集計値（`count`）を持つ。
実行結果は同 bucket key で集計し、各 bucket について現在の count が baseline count 以下であれば当該 NG を `info`（observation）へ降格する。
現在の count が baseline count を超える bucket に属する NG は新規 NG として `ng` / `warning` レベルを維持し、exit code を非ゼロにする。

| 項目 | 定義 |
|------|------|
| 適用対象 | `check_integrity.ts` と `check_extensions.ts` の出力全カテゴリ（ADR、Canonical、CanonicalConflict、Inventory、LinkIntegrity、RuntimeReference 等）。`level` が `ng` または `warning` の結果を対象とする |
| baseline 形式 | `version`, `rule_id: "NG-BASELINE"`, `generated_at`, `entries[]`（各 entry は `category` / `check` / `file`（null 許容）/ `evidence`（null 許容）/ `count` / `provenance`（由来ラベル）/ `reason`（承認理由）を持つ）|
| bucket key | `${category}\t${check}\t${file||""}\t${evidence||""}` の4組。同一 bucket 内の複数結果は `count` で集計する |
| pass 判定 | 全 bucket で現在 count ≤ baseline count を満たす場合に strict pass（exit 0）。1 bucket でも超過があれば非 pass（exit 非ゼロ）|
| 報告形式 | baseline 既知 NG（`info` 降格件数）、承認済み追加分（由来ラベル付き baseline 追加件数）、新規かつ未管理の NG（非 pass 起因件数）の3分類を件数で区別して示す。新規 NG 件数だけを報告する形式は採らず、既知 NG を `info` へ降格した件数を識別可能にする |
| 降格動作 | baseline 既知の bucket では、現在 count が baseline count 以下の範囲の NG を `info`（observation）へ降格し、`[baseline-known]` prefix を付与する。降格済み NG は PR review で情報参照扱いとする |
| 更新タイミング | 周辺文書の改修、ファイル削除、対象外領域の再編等により既知 NG の見え方が変化した場合。新規の strict 違反は baseline 更新ではなく実装修復を必須とする（NG 隠蔽禁止、後述「NG 隠蔽（禁止）」参照）|
| 更新実行者 | agent-dev-flow リポジトリの maintainer。PR を経由して更新する |
| 更新実行手順 | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ng-baseline`（`check_extensions.ts` も同様）は現行 NG 全体を無条件に再生成して取り込まない。承認済み差分に由来ラベル（`provenance`）と理由（`reason`）を付与して baseline entry へ追加する。追加対象でない既存未管理 NG は baseline へ取り込まず実修復対象として残す。更新後は `--json` 実行で新規 NG が 0 件になることを確認する |
| 更新非対象 | 当該変更に直接起因する新規 NG。これらは baseline 更新で隠蔽せず、必ず実装修復を行う。既存未管理 NG は baseline 更新だけで解決済み扱いとせず、修復候補として追跡可能な状態を維持する |

RuntimeReference baseline（IR-055、前節）は heuristic 違反の段階導入を目的とし、本 NG baseline は strict 違反（`ng` / `warning`）の既知集合を管理して「既知違反の解消」により strict pass を到達可能にすることを目的とする。
両 baseline は独立に運用し、相互に影響しない。
NG baseline は v2:REQ-0161-005（旧 `docs/requirements/v2:REQ-0161.md`、現 `docs/requirements/retired/v2:REQ-0161.md`）から Design 統合された恒久契約である。

### baseline entry 運用契約（機械生成・パス bucket key・生成環境・報告分類）

NG baseline entry の運用は次の契約に従う。

1. entry 追加は機械生成を必須とし、手書きによる追加を行わない。`--update-ng-baseline --ng-baseline-additions` が manifest 入力から provenance・reason を付与して生成する。手書き追加は NG 隠蔽（禁止）と同様に扱う
2. パス bucket key は環境依存差を含む。worktree と main でパス表記が変化する場合、正規化（相対パス基準への統一）または unmatched additions / unmanaged delta 対警告により検知可能にする。bucket key 仕様自体（category/check/file/evidence の4組）は維持する
3. baseline の生成環境を前提として明示する。worktree 環境で生成した baseline は main 環境（junction 実在環境）で新規未管理 NG が 0 件であることを確認してから確定する
4. 由来ラベル（legacy、superseded、AUTOGEN、実欠陥等）と報告分類（baseline-known 降格、approved additions、新規未管理）の対応を明確に保つ。承認済み entry の解消（実装修復完了）後は当該 entry を除去する（ratchet の純減）

### 宣言的データ YAML と detector の契約（REQ-028-015/016 移管受入れ）

REQ-028 の RETIRE に伴い、次の恒常契約の移管を受入れる（詳細な実行規則は checker-execution-contracts Design が所有する）。

- 検出用の宣言的データ YAML は Design が正となる schema を持ち、YAML は検出用ビューとして扱うこと
- detector 実装は IR 識別子に基づく命名規約を持ち、IR から detector 実装への機械的逆引きが可能であること

## docs-check delta 検出における除外設定方針（REQ-036-010, REQ-036-003 準拠）

docs-check は baseline 運用（IR-055）と path exemption（`IR055_EXEMPT_PATH_PATTERNS`）の二系統で検出対象を絞る。
両者とも「正当な除外」と「NG 隠蔽」を区別して運用する（REQ-036-003）。

### 正当な除外（legitimate exclusions）

| 除外種別 | 対象 | 根拠 |
|----------|------|------|
| ルール自己参照 | `vocabulary-registry.md`、`integrity-rule-catalog.md`、`integrity-contracts.md`、`rules/IR-*.md`（全IRルールファイル、REQ-036-003）、`baselines/ir-055-baseline.json` | 検出ルール自体の記述、正規語彙の対照表はルールを説明するためにパターンを列挙する。これを検出するとルール自身が NG となるため自己参照除外とする。個別 IR ルールファイル（`rules/IR-*.md`）は検出ルールの説明文であり、例示用 ID、廃止 skill 例、廃止 ADR 番号帯例示は自己参照的な説明資料であるため、全検出関数（broken-reference, abolished-skill-references, obsolete-spec-path 等）の検出スコープから除外する（REQ-036-003） |
| コードブロック内部 | ` ``` ` で囲まれた範囲 | 例示、パターン説明は検出対象外（integrity-rule-catalog.md「対象ファイル設計」準拠） |
| template placeholder | `{xxx}` 形式のプレースホルダーを含む行 | プレースホルダーは実参照ではない |

### NG 隠蔽（禁止）

| 隠蔽種別 | 例 | 対処 |
|----------|----|------|
| baseline 過大計上 | 実修復されていない違反を baseline count に含め報告を抑止する | 許容しない。baseline 更新は前節「RuntimeReference baseline 運用手順」の根因特定を経た場合のみ認める |
| 広域 exemption | 対象を絞らない glob（`docs/**` 等）で検出を回避する | 許容しない。exemption は対象ファイル単位、かつ根拠文書化を必須とする |
| 検出無効化 | check_integrity.ts の検出関数をコメントアウト、条件付きで回避 | 許容しない。検出の廃止は catalog↔実装双方向同期運用（REQ-010-003）に従い IR エントリの物理削除（AG-008、REQ-028-008）を行う |

### 除外設定の文書化要件

新規 exemption pattern を `IR055_EXEMPT_PATH_PATTERNS` へ追加する場合、当該コミットは以下のいずれかを満たす根拠を PR 本文に記載する。

1. 当該パスがルール自己参照であること（ファイルパスとルール ID の対応）
2. 当該パスが履歴参照領域（retired 等）であること
3. 当該パスが検出原理上の技術的除外であること（テスト fixture 等、検出すると恒久的に false となる場合）

根拠なしの exemption 追加は NG 隠蔽（REQ-036-003 違反）として扱い、レビューで却下する。

## catalog ↔ 実装双方向同期運用（REQ-010-003/004）

[integrity-rule-catalog.md](integrity-rule-catalog.md) と `check_integrity.ts` 実装は双方向同期運用を行う。同期ルール:

| イベント | catalog 側の処理 | 実装側の処理 |
|---|---|---|
| 整合性ルール削除 | 該当 IR エントリを catalog から物理削除（AG-008、REQ-028-008）。交叉参照は `responsibilities/req-impact-map.md` の Retired cross-references 節へ再配置する | 実装も削除 |
| 実装削除 | 該当 IR エントリを catalog から物理削除。実装のみ残置は8項目存在条件（REQ-028-001）違反のため認めない | - |
| 実装復活 | 復活時は新規 IR 登録 gate（REQ-028-012）を再適用する | - |
| 新規ルール追加 | 新規 IR エントリを追加。新規 IR 登録 gate（REQ-028-012 (a)/(b)）を必須とする | 実装追加 |

docs-check 項目役割範囲（バックエンド対象 vs skill 定義対象）、対象ファイル設計（`.md` のみ、正当使用例外）、NG ルール間依存関係マップの詳細は [integrity-rule-catalog.md](integrity-rule-catalog.md) 参照。

## Workflow × 使用ツールマトリックス

本セクションは全 workflow の使用検査ツールを肯定表現で一元管理する SSoT であり、各 workflow Design から参照される。
req-save/design-save/case-run/case-close の各コマンドは対象ファイル種別に応じた最小監査範囲を定義し、case-run/case-close は永続文書更新を契機に検査する。

| workflow | check_changed_docs.ts | check_extensions.ts | check_integrity.ts | test_strategy |
|---|---|---|---|---|
| req-save | ✓（REQ files） | — | — | — |
| design-save | ✓（Design files） | — | — | — |
| case-open | — | — | — | — |
| case-run | ✓（docs/** 変更時、--workflow case-run） | ✓（src/opencode/{commands,skills}/** 変更時、IR-056） | — | ✓（Issue 完了条件検証） |
| case-close | ✓（PR files、--workflow case-close） | ✓（src/opencode/{commands,skills}/** 変更時、IR-056） | — | ✓（QG-4 完了条件確認） |
| req-define | — | — | ✓（全体監査、検証手順） | — |
| /repo/docs-check | ✓ | ✓ | ✓（全体監査） | — |

全セル肯定表現（✓ または —）を使用する（REQ-010-002, REQ-010-003 準拠）。
check_integrity.ts 列は req-define と /repo/docs-check のみ ✓ とし、他 workflow は — で「使用しない」を暗黙表現する。

参照元 workflow Design 一覧（各 Design から本マトリックス表を参照）:

- [commands/req-save.md](../commands/req-save.md)
- [commands/design-save.md](../commands/design-save.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-run.md](../commands/case-run.md)
- [commands/case-close.md](../commands/case-close.md)

## 実行プロファイル分離

check_integrity.ts は3つの実行 profile（source/installed/release）を取り、原本検査、配置後検査、配布アーカイブ検査を区別する。
各 profile における配布依存境界検査の契約（source/installed/release projection の分離、検査エラーの gate-not-passed 扱い、release profile の公開前検査における違反残存時の成功経路非保持）は `integrity/distribution-boundary.md` が正規所有する（DEC-014 決定5..7）。
詳細 normative は移行計画 §7（`.omo/plans/agentdev-migration-2026-08-05.md`）を正とする。

### CLI

```text
bun run check_integrity.ts --profile source
bun run check_integrity.ts --profile installed
bun run check_integrity.ts --profile release --archive <zip-path>
```

`--profile` 未指定時は `source` とする。
`release` は `--archive` 必須。
各 profile と `archive` パスは report（JSON / Markdown）へ記録する。

### source profile

原本（`src/opencode/`、docs、repo-local checker/tests）を直接検査する。

- `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*` が存在しないことを NG にしない（worktree 等）
- 原本ディレクトリや必須ファイルが欠落している場合は NG
- source/projection 一致検査、IR-058（distribution-untracked-skill）、broken-junction、junction-scan-coverage は対象外。report へ `ProfileScope` info として明示する
- runtime 参照検査は原本を直接対象とし、配置先からの fallback によって欠落を隠さない（`resolvePathWithFallback` は source profile 既定の挙動を保つ）

### installed profile

原本（`src/opencode/`）と配置先（`.opencode/`）を比較し、配置漏れを検出する。

- `cmdDir` を `.opencode/commands/agentdev` へ直接解決し、原本 fallback を無効化する
- 次を NG として報告する: `projection_missing`（原本に有て配置先に無い）、`projection_extra`（配置先に有て原本に無い、`repo-*` repo-local skill は除く）、`content_mismatch`（原本と配置先で内容が異なる）、`broken_junction`（配置先の junction/symlink が解決不能）、`missing_required_dir`（原本必須ディレクトリ欠落）
- 配置先が存在しない場合は NG とし、原本 fallback だけで成功扱いにしない
- Windows junction は `realpath` で実体を比較する（健康な junction で `content_mismatch` が発火しないようにする）

### release profile

host 側 checker を起点とし、archive を展開→install→installed profile を `--root` 付きで実行する。
archive は配布物の自己完結を保証するが、checker（`repo-agentdev-integrity`）は archive に同梱せず host 側のものを使う（archive 自己完結と検査実行の分離、REQ-0145-014）。

処理順序:

1. `--archive` で指定された ZIP を一時ディレクトリ `<temp>` へ展開する
2. `<temp>/<root>/scripts/install-from-archive.ps1 -Source <temp>/<root>/src/opencode -Target <temp>/<root>/.opencode -Mode copy` を実行する
3. host 側 checker を `--profile installed --root <temp>/<root> --json` で起動し、installed profile を実行する
4. archive は docs/ を含まないため、exit code は `InstalledProfile` カテゴリ（projection_missing/extra/content_mismatch/broken_junction/missing_required_dir）の結果のみで判定する。全文結果は report へ転送する
5. 成功・失敗の双方で `<temp>` を削除する（cleanup 失敗は warning、exit code は変えない）

ZIP 自体に junction が保存されていなくても install 後に配置できれば通過する。
install 後も配置先が欠落する場合は NG とする。

### archive 生成・導入コマンド（§7.5.1, §7.5.2）

archive 生成: `scripts/package-release-archive.ps1`（原本 `src/opencode/` 配下を junction 解決済み実ファイルとして ZIP へ格納）。
出力は `dist/agentdev-release-<commit-short>.zip`。
archive 内レイアウトは `agentdev-release-<sha>/` ルートの下に `src/opencode/commands/agentdev/**`、`src/opencode/skills/agentdev-*/**`、`src/opencode/skills/japanese-tech-writing/**`、`scripts/install-from-archive.ps1`、`README-INSTALL.md` を格納する。

| 実行結果 | exit code |
|---|---|
| 成功（`dist/*.zip` 生成、archive パスを標準出力へ1行出力） | 0 |
| 原本欠落・必須ファイル不在 | 2 |
| 既存 dist 上書き検出（`-Force` 無し） | 3 |

archive 展開・install: `scripts/install-from-archive.ps1 -Source <src/opencode> -Target <.opencode> -Mode copy` が実ファイルを `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`、`.opencode/skills/japanese-tech-writing/` 配下へ配置する。
junction は作成しない。

| 実行結果 | exit code |
|---|---|
| 成功（全配置完了、内容一致） | 0 |
| 配置先既存ファイルとの不一致（上書きせず停止） | 4 |
| 必須ディレクトリ作成失敗、または Source 不在 | 5 |

### 検出力回帰マトリクス（§7.7.1）

profile 分離によって検出力が低下していないことを保証するため、意図的 violation を各 profile へ投入し、期待する NG が必ず発生することを baseline 更新前に照合する。
このマトリクスは baseline 更新前の必須ゲートであり、いずれかのセルで期待 NG が発生しなければ baseline を更新せず WP-3 を完了扱いにしない。
実行結果は `.omo/plans/agentdev-migration-2026-08-05.regression.md` へ記録する。
