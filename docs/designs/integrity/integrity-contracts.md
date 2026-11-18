---
title: 整合性契約
status: accepted
created: 2026-08-20
updated: 2026-11-18
---
<!-- ADF-COVERS(implementation): REQ-010-006 -->
<!-- ADF-COVERS(implementation): REQ-036-022 -->
<!-- ADF-COVERS(implementation): REQ-007-010 -->
<!-- ADF-COVERS(implementation): REQ-099-020 -->
<!-- ADF-COVERS(design): REQ-010-007, REQ-010-008 -->

# 整合性契約

本 Design は agent-dev-flow リポジトリのみに適用される。

## 目的

整合性検査で用いる分類方法を定義し、検査結果の深刻度と対応フローを規定する（REQ-010）。

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
> REQ-001-068 の安定契約例外（公開コマンド名、公開入口、ドメイン状態位置づけ、他コマンド接続契約、利用者可視分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約）に該当する要約残留は検出対象外とする。

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
| ReqSpecBoundary | 現行 REQ 要件行への Design 詳細混入検出（REQ-001-067、REQ-001-068。IR-044 としてカタログ定義。REQ-001-068 安定契約例外は対象外） |

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

check_changed_docs.ts は以下の挙動 Design 契約に従う。まず引数を解析して対象を確定し（entry）、--files または --base-ref から files_checked を生成し（対象解決）、--workflow に応じた profileFor を適用し（profile 呼出）、profile rules を実行し（validator 呼出）、TargetedDocsReport 形式で JSON/text を出力し（report 契約）、終了コードを FAILURE/WARNING/OK の 3 値で返す（exit code）。

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
| `case-ready` / `case-revise`（Definition 保存の内部責務、Capability Skill 委譲） | `docs/requirements/`, `docs/decisions/`, `docs/designs/`, `.agentdev/intake/inbox/req-restructure/`（REQ 再構成 intake のみ） | `.agentdev/`（req-restructure 除く）, `.opencode/` |
| `case-open` | GitHub Issue/PR のみ | ローカルファイル |
| `case-run` | worktree 内の全ファイル | worktree 外、`.agentdev/` |
| `case-close` | GitHub Issue/PR, worktree 削除 | `.agentdev/intake/inbox/` 直接書込 |
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

## IR 存在条件モデル（DEC-013 適用、retired REQ-028-008/009/010/012 から移管）

DEC-013（AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化）を適用し、IR の状態モデルを「現存 IR = 現行 = executable detector」へ統一した。
`lifecycle_state`、`enforcement_mode`、`baseline_status` は現行 IR の属性から全て削除し、`active+none` の恒久状態を禁止する（retired REQ-028-009）。
tombstone（IR-011 型 file-backed）は AG-008 により物理削除し、廃止 IR の履歴保存のみを目的とする file-backed tombstone を保持しない（retired REQ-028-008）。
識別子の再利用禁止は `foundations/numbering-policy.md` が保持し、履歴性は Git で担保する。

### 8 項目存在条件（retired REQ-028-001 から移管）

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

`severity`、`gate_level` は現行 IR に対する独立軸として維持し、IR lifecycle の代替にしない（REQ-036-022、retired REQ-028-009 決定7）。

### 非実効 IR の禁止（retired REQ-028-002 から移管）

detector 不在、部分実装、test 不在、到達不能、finding 未接続の IR を恒久的な現行 IR として許容しない。
必要な invariant は IMPLEMENT、不要な場合は DELETE/MERGE とする。

### 関連 Design

- `integrity-rule-catalog.md`: IR スキーマ（DEC-013 適用後の12 field）
- `rule-ownership.md`: 所有権マトリックス
- `foundations/numbering-policy.md`: 欠番管理、識別子再利用禁止
- `foundations/document-model.md`: IR frontmatter フィールド定義

## baseline 分類・免除機構の撤廃（REQ-010-074/079、Epic #4126 Phase 4）

baseline による既知/新規分類（旧 finding-baseline 分類）、恒久免除レジストリ（baselines/exemptions.json）、NG baseline・IR-055 baseline による免除管理・delta 運用は撤廃済みである。
検出違反は全件を新規扱いで報告し、免除せず対象ファイル側の直接修正で即時解消する（REQ-010-079、REQ-010-082、REQ-010-084）。
IR-055・IR-059 の検出器自体は存続する（baseline 運用のみ撤廃済み）。

## 新規 IR 登録 gate（retired REQ-028-012 から移管、TS-020）

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
4. ユーザー安全性に関わる必須の制約であること
5. 機械的検証可能であること（意味判断を要しない）
6. 運用コストが便益を上回らないこと
7. 例外条件、false positive 抑制方式が文書化されていること

### gate 実施手順

新規 IR 登録時に `integrity-rule-catalog.md`「新規カテゴリ追加判定フロー（REQ-010-005）」へ従い gate を実施する。
catalog エントリ追加前に (a) を、blocking IR の場合は (b) も確認する。
gate 不合格の場合は新規 IR 登録を取り下げ、retired REQ-028-013「IR 件数削減数で評価しない」に従い別途 backlog → RU → req-define → case-open → case-ready 経路で提起する。





## 一時移行検査 registry（retired REQ-028-006 から移管）

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
retired REQ-028-006 の詳細運用は別途 Definition 保存（case-ready / case-revise の Design 保存内部責務）工程で確定する。

### 旧 obsolete-spec-path ルール（削除済み）

旧 obsolete-spec-path ルール（obsolete-spec-path-after-domain-split）は Epic #4126 Phase 4（OU-004）で削除された。一時移行検査 registry の Phase 3 §7.2 判定（現状維持＝恒久 IR 扱い）は撤廃後の実態に従うものではない。

## reference-path-existence 検出における backtick 囲みパスの扱い（REQ-010-009）

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

## IR-055 検出責務境界と現行運用（REQ-010-007/079）

IR-055（runtime-unresolved-reference）の検出器は存続し、検出した違反は全件を厳格度どおりに報告する（strict は NG、heuristic は warning）。
baseline による既知/新規の区別・`warning_total_cap` ratchet・恒久免除レジストリ・NG baseline による免除管理は撤廃済みである。
検出違反は免除せず、対象ファイル側の直接修正で即時解消する。検出器の正規パターン定義は docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md が所有する。

## docs-check delta 検出における除外設定方針（REQ-010-007, REQ-010-009 準拠）

docs-check は path exemption（`IR055_EXEMPT_PATH_PATTERNS`）で検出対象を絞る（baseline 運用は撤廃済み）。
両者とも「正当な除外」と「NG 隠蔽」を区別して運用する（REQ-010-007）。

### 正当な除外（legitimate exclusions）

| 除外種別 | 対象 | 根拠 |
|----------|------|------|
| ルール自己参照 | `vocabulary-registry.md`、`integrity-rule-catalog.md`、`integrity-contracts.md`、`rules/IR-*.md`（全IRルールファイル、REQ-010-009） | 検出ルール自体の記述、正規語彙の対照表はルールを説明するためにパターンを列挙する。これを検出するとルール自身が NG となるため自己参照除外とする。個別 IR ルールファイル（`rules/IR-*.md`）は検出ルールの説明文であり、例示用 ID、廃止 skill 例、廃止 ADR 番号帯例示は自己参照的な説明資料であるため、全検出関数（broken-reference, abolished-skill-references, obsolete-spec-path 等）の検出スコープから除外する（REQ-010-009） |
| コードブロック内部 | ` ``` ` で囲まれた範囲 | 例示、パターン説明は検出対象外（integrity-rule-catalog.md「対象ファイル設計」準拠） |
| template placeholder | `{xxx}` 形式のプレースホルダーを含む行 | プレースホルダーは実参照ではない |

### NG 隠蔽（禁止）

| 隠蔽種別 | 例 | 対処 |
|----------|----|------|
| 広域 exemption || 広域 exemption | 対象を絞らない glob（`docs/**` 等）で検出を回避する | 許容しない。exemption は対象ファイル単位、かつ根拠文書化を必須とする |
| 検出無効化 | check_integrity.ts の検出関数をコメントアウト、条件付きで回避 | 許容しない。検出の廃止は catalog↔実装双方向同期運用（REQ-010-003）に従い IR エントリの物理削除（AG-008、retired REQ-028-008）を行う |

### 除外設定の文書化要件

新規 exemption pattern を `IR055_EXEMPT_PATH_PATTERNS` へ追加する場合、当該コミットは以下のいずれかを満たす根拠を PR 本文に記載する。

1. 当該パスがルール自己参照であること（ファイルパスとルール ID の対応）
2. 当該パスが履歴参照領域（retired 等）であること
3. 当該パスが検出原理上の技術的除外であること（テスト fixture 等、検出すると恒久的に false となる場合）

根拠なしの exemption 追加は NG 隠蔽（REQ-010-009 違反）として扱い、レビューで却下する。

## IR-053 検出器仕様と既知許容（否定文文脈許容、Case #4081）

IR-053（gh 直接記述検出）の正規検出条件と既知許容を本節に集約する（導入経緯: RU-0288・inspect D-1 false positive 確定〔confidence high〕の継承）。ルール単位の15フィールド詳細は [rules/IR-053-gh-direct-invocation-detection.md](rules/IR-053-gh-direct-invocation-detection.md)、スキャン対象と除外対象の境界は [responsibilities/custom-tool-contracts.md](../responsibilities/custom-tool-contracts.md)「迂回防止」節が所有する。

### 正規検出条件（検出器仕様）

| 要素 | 契約 |
|---|---|
| スキャン対象 | `src/common/commands/agentdev/*.md`、`src/common/skills/agentdev-*/**/*.md` |
| 検出パターン | `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`（大小文字無視） |
| コードブロック除外 | fence 内部の記述は検出対象外（例示・パターン説明、v2:REQ-0108-254） |
| ファイル単位例外 | IR053_EXEMPT_PATHS（読取系 contingency 2ファイル。登録は「迂回防止」節の宣言に従う） |
| 否定文文脈許容（既知許容） | マッチ位置から次の文境界（。！？!? または行末）までの同一文中に否定述語（〜しない／しません／せず）が後続する記述は、gh 直接起動を行わない旨の行動契約の説明であり検出対象外とする |
| severity | heuristic（warning） |

### 否定文文脈許容の構造条件

- 許容単位は文である。マッチ位置より後方・同一文中の否定述語のみを許容し、文をまたぐ否定（「`gh pr view` で mergeable を確認する。ラベルは付与しない。」の後半文など）とマッチ前方の否定は許容しない。肯定形の使用指示が別文の否定表現で隠れない構造を維持する
- 否定述語は「する」の否定一般形（〜しない／しません／せず）とし、出現箇所個別の語彙列挙は行わない。`agentdev-workflow-case-close/scripts/README.md` の「`gh pr view` を発行しない」記述は文言を維持したまま本許容で解消する（inspect D-1 false positive 確定、Case #4081）

### area-based 除外宣言方式との整合

本許容は、検出語彙の引用・記録領域を領域ベースの構造的除外として宣言・管理し、個別出現箇所の許容条件列挙で代替しない area-based 除外宣言方式の原則と次の点で整合する。

- 本許容の正当性の所在は引用・記録領域（領域スコープ）ではなく、否定述語が同一文中に後続するという文ローカルの構造条件である。このためファイル単位・領域単位の除外は採らず、当該領域内の真の violation を隠蔽しない
- 個別出現箇所の許容（baseline / exemptions への当該 warning 登録）も行わない（正の検出器仕様を迂回しない。両機構は撤廃済み）。許容条件は検出器仕様として本節が宣言・管理する
- 既存の例外経路（読取系 contingency のファイル単位例外、コードブロック除外）は本許容と独立に維持し、相互に置換しない

## catalog ↔ 実装双方向同期運用（REQ-010-003/004）

[integrity-rule-catalog.md](integrity-rule-catalog.md) と `check_integrity.ts` 実装は双方向同期運用を行う。同期ルール:

| イベント | catalog 側の処理 | 実装側の処理 |
|---|---|---|
| 整合性ルール削除 | 該当 IR エントリを catalog から物理削除（AG-008、REQ-028-008）。交叉参照は `responsibilities/req-impact-map.md` の Retired cross-references 節へ再配置する | 実装も削除 |
| 実装削除 | 該当 IR エントリを catalog から物理削除。実装のみ残置は8項目存在条件（retired REQ-028-001）違反のため認めない | - |
| 実装復活 | 復活時は新規 IR 登録 gate を再適用する | - |
| 新規ルール追加 | 新規 IR エントリを追加。新規 IR 登録 gate（(a)/(b)）を必須とする | 実装追加 |

docs-check 項目役割範囲（バックエンド対象 vs skill 定義対象）、対象ファイル設計（`.md` のみ、正当使用例外）、NG ルール間依存関係マップの詳細は [integrity-rule-catalog.md](integrity-rule-catalog.md) 参照。

## Workflow × 使用ツールマトリックス

本セクションは全 workflow の使用検査ツールを肯定表現で一元管理する SSoT であり、各 workflow Design から参照される。
case-ready/case-revise（Definition 保存の内部責務）/case-run/case-close の各コマンドは対象ファイル種別に応じた最小監査範囲を定義し、case-run/case-close は永続文書更新を契機に検査する。

| workflow | check_changed_docs.ts | check_extensions.ts | check_integrity.ts | test_strategy |
|---|---|---|---|---|
| case-ready / case-revise | ✓（REQ/Decision/Design files） | — | — | — |
| case-open | — | — | — | — |
| case-run | ✓（docs/** 変更時、--workflow case-run） | ✓（src/common/{commands,skills}/** 変更時、IR-056） | — | ✓（Issue 完了条件検証） |
| case-close | ✓（PR files、--workflow case-close） | ✓（src/common/{commands,skills}/** 変更時、IR-056） | — | ✓（QG-4 完了条件確認） |
| req-define | — | — | ✓（全体監査、検証手順） | — |
| /repo/docs-check | ✓ | ✓ | ✓（全体監査） | — |

全セル肯定表現（✓ または —）を使用する（REQ-010-002, REQ-010-003 準拠）。
check_integrity.ts 列は req-define と /repo/docs-check のみ ✓ とし、他 workflow は — で「使用しない」を暗黙表現する。

参照元 workflow Design 一覧（各 Design から本マトリックス表を参照）:

- [commands/case-open.md](../commands/case-open.md)
- [commands/case-ready.md](../commands/case-ready.md)
- [commands/case-revise.md](../commands/case-revise.md)
- [commands/case-run.md](../commands/case-run.md)
- [commands/case-close.md](../commands/case-close.md)

## 実行プロファイル分離

check_integrity.ts は3つの実行 profile（source/installed/release）を取り、原本検査、配置後検査、配布アーカイブ検査を区別する。
各 profile における配布依存境界検査の契約（source/installed/release projection の分離、検査エラーの gate-not-passed 扱い、release profile の公開前検査における違反残存時の成功経路非保持）は `integrity/distribution-boundary.md` が正規所有する（DEC-014 決定5..7）。

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

原本（`src/common/`、`src/opencode/`（ホスト接続領域）、docs、repo-local checker/tests）を直接検査する。

- `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*` が存在しないことを NG にしない（worktree 等）
- 原本ディレクトリや必須ファイルが欠落している場合は NG
- source/projection 一致検査、IR-058（distribution-untracked-skill）、broken-junction、junction-scan-coverage は対象外。report へ `ProfileScope` info として明示する
- runtime 参照検査は原本を直接対象とし、配置先からの fallback によって欠落を隠さない（`resolvePathWithFallback` は source profile 既定の挙動を保つ）

### installed profile

原本（`src/common/` と `src/opencode/`（ホスト接続領域））と配置先（`.opencode/`）を比較し、配置漏れを検出する。

- `cmdDir` を `.opencode/commands/agentdev` へ直接解決し、原本 fallback を無効化する
- 次を NG として報告する: `projection_missing`（原本に有て配置先に無い）、`projection_extra`（配置先に有て原本に無い、`repo-*` repo-local skill は除く）、`content_mismatch`（原本と配置先で内容が異なる）、`broken_junction`（配置先の junction/symlink が解決不能）、`missing_required_dir`（原本必須ディレクトリ欠落）
- 配置先が存在しない場合は NG とし、原本 fallback だけで成功扱いにしない
- Windows junction は `realpath` で実体を比較する（健康な junction で `content_mismatch` が発火しないようにする）

### release profile

host 側 checker を起点とし、archive を展開→install→installed profile を `--root` 付きで実行する。
archive は配布物の自己完結を保証するが、checker（`repo-agentdev-integrity`）は archive に同梱せず host 側のものを使う（archive 自己完結と検査実行の分離、v2:REQ-0145-014）。

処理順序:

1. `--archive` で指定された ZIP を一時ディレクトリ `<temp>` へ展開する
2. `<temp>/<root>/scripts/install.ps1 -Source <temp>/<root>/src -Target <temp>/<root>/.opencode -Mode copy` を実行する（archive 版 installer。原本は `scripts/consumer/archive/install.ps1` で、archive 内では投影名 `scripts/install.ps1` として配置される）
3. host 側 checker を `--profile installed --root <temp>/<root> --json` で起動し、installed profile を実行する
4. archive は docs/ を含まないため、exit code は `InstalledProfile` カテゴリ（projection_missing/extra/content_mismatch/broken_junction/missing_required_dir）の結果のみで判定する。全文結果は report へ転送する
5. 成功・失敗の双方で `<temp>` を削除する（cleanup 失敗は warning、exit code は変えない）

ZIP 自体に junction が保存されていなくても install 後に配置できれば通過する。
install 後も配置先が欠落する場合は NG とする。

### archive 生成・導入コマンド（§7.5.1, §7.5.2）

archive 生成: `scripts/self/release/package-release-archive.ps1`（原本 `src/common/` と `src/opencode/`（ホスト接続領域）配下を junction 解決済み実ファイルとして ZIP へ格納）。
出力は `dist/agentdev-release-<commit-short>.zip`。
archive 内レイアウトは `agentdev-release-<sha>/` ルートの下に `src/common/commands/agentdev/**`、`src/common/skills/agentdev-*/**`、`src/common/tools/agentdev-*/**`（Custom Tool 配布種別）、`src/opencode/plugins/agentdev-*/**`（Plugin / Hook 配布種別）、`scripts/install.ps1`（archive 版。原本 `scripts/consumer/archive/install.ps1` を投影名 `scripts/install.ps1` として格納）、`README-INSTALL.md`（原本 `scripts/consumer/archive/README-INSTALL.md`）を格納する。third-party Skill の本体は release archive へ含めず、利用者環境では宣言（skills.yaml）と取得機構経由で配置する（REQ-002-043、third-party-skill-management Design）。

| 実行結果 | exit code |
|---|---|
| 成功（`dist/*.zip` 生成、archive パスを標準出力へ1行出力） | 0 |
| 原本欠落・必須ファイル不在 | 2 |
| 既存 dist 上書き検出（`-Force` 無し） | 3 |

archive 展開・install: archive 版 `scripts/install.ps1 -Source <src> -Target <.opencode> -Mode copy` が実ファイルを `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`、`.opencode/tools/agentdev-*/`、`.opencode/plugins/agentdev-*/` 配下へ配置する（原本は `scripts/consumer/archive/install.ps1`）。third-party Skill の配置は本 install の対象外であり、third-party 取得機構（skills.yaml 宣言に基づく取得）が `.opencode/skills/<name>/` へ配置する（REQ-002-043）。
junction は作成しない。

| 実行結果 | exit code |
|---|---|
| 成功（全配置完了、内容一致） | 0 |
| 配置先既存ファイルとの不一致（上書きせず停止） | 4 |
| 必須ディレクトリ作成失敗、または Source 不在 | 5 |

### 検出力回帰マトリクス（§7.7.1）

profile 分離によって検出力が低下していないことを保証するため、意図的 violation を各 profile へ投入し、期待する NG が必ず発生することを照合する。
このマトリクスは必須ゲートであり、いずれかのセルで期待 NG が発生しない場合は検出器の変更を完了扱いにしない。

## IR-020 移管に伴う追記（2026-11-15）

IR-020（基準既知（baseline-known）と新規 finding の区別）は本 Design へ移管して廃止した（Epic #4054、RU-0278）。のちに baseline 機構自体が撤廃された（Epic #4126 Phase 4、REQ-010-074/079）。IR-020 が担っていた「baseline 既知と新規 finding の区別」は、移管先節の撤廃に伴い現行では管理対象外である（検出違反は全件を新規扱いで直接修正する）。IR-020 は独立の機械検出を持たず、検出器名義は IR-055（checkRuntimeUnresolvedReference）と共用であったため、本移管に伴う検出器変更はない（annotateIrIds の IR-020 名義除去は検出挙動不変の参照整理である）。IR-020 本文が基準集合として参照していた旧パス記述は移管対象から除外した。旧基準集合（ng-baseline.json・ir-055-baseline.json）は baseline 機構の撤廃（REQ-010-074/079、Epic #4126 Phase 4）に伴い削除済みであり、現行に基準集合は存在しない。検出違反は全件を新規扱いで直接修正する。
