---
title: Targeted Docs Guard 実装詳細
status: accepted
created: 2026-07-15
updated: 2026-07-24
---

# Targeted Docs Guard 実装詳細

REQ-0158（Targeted Docs Integrity Guard、retired）から移送された実装計画・スキーマ詳細。配布物たる REQ 側は WHAT（結果要件）のみを残し、HOW（実装計画、スキーマ詳細）は本 SPEC に配置する。REQ-0158 は Issue #1713（Epic #1711 Wave 2 OU-002）で retire 完了。WHAT 側の恒久契約は REQ-0108（REQ-0108-279/280/281/282）へ統合済み。

## Phase1-6 実装計画

check_changed_docs.ts 中心の変更文書限定検査契約を Phase 1-6 で成熟させる。コマンドと check_changed_docs.ts の責務分担（コマンドが対象確定、check_changed_docs.ts が検査実行）、評価対象はフォーマット検査に限定（意味評価しない）を基本方針とする。

### Phase 1: SPEC 配置

- check_changed_docs.ts の変更文書限定検査契約は、挙動SPEC（entry/対象解決/profile/validator呼出/report契約/exit code）、カタログSPEC（TargetedDocsReport 型定義、workflow profile 定義）、実装詳細SPEC（validator内部アルゴリズム、分割基準）に配置されること。
- 個別判定条件は IR-*.md に配置されること。

### Phase 2: report 契約固定

- TargetedDocsReport 型が固定され、型/戻り値/JSON/text出力/テストが一致すること。
- 必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, docInputsCheckRequired, declared_files_check。上記リストのみを必須フィールドとし、それ以外を許容しない。

### Phase 3: 対象確定の命令側移行

- 対象確定はコマンド側が行うこと。check_changed_docs.ts は対象選定の十分性を判定しないこと。
- 対象があれば --files を渡し、対象なければ原則呼出さないこと。
- --files の区切り形式は space 区切り（推奨）と comma 区切り（後方互換）の両方を受入れること（REQ-0158-001 より統合）。例: `--files a.md b.md c.md`（space 区切り推奨）、`--files a.md,b.md,c.md`（comma 区切りも受入）。両形式の混在も可。usage メッセージ、--help 出力で区切り形式を明示すること。後方互換性を担保し space 区切り仕様を変更しないこと。
- --files 指定で files_checked が空の場合は失敗（FAILURE）扱い、--base-ref 指定で files_checked が空の場合は警告（WARNING）扱いとすること。

### Phase 4: コマンド別最小監査範囲

- req-save/spec-save/case-run/case-close の各コマンドが、対象ファイル種別に応じた最小監査範囲を定義すること。
- 各コマンド SPEC と integrity-contracts.md の Workflow×ツールマトリックス表が SSoT であること。
- case-run/case-close は永続文書更新を契機に検査すること。

### Phase 5: 回帰テスト

- 変更文書限定検査の回帰テストが存在すること。
- TargetedDocsReport の型/戻り値/JSON/text出力の一致を検証するテストを含むこと。

### Phase 6: validator 分割基準

- validator の分割基準が実装詳細SPEC に文書化されること。
- 分割基準は validator の責務境界、ファイルサイズ上限、関心分離ルールを含むこと。

## CLI 引数

check_changed_docs.ts が受け付ける CLI 引数（REQ-0158-004 より移管）。

| 引数 | 必須 | 値 | 説明 |
|------|------|-----|------|
| `--workflow` | ✓ | `req-save` / `spec-save` / `case-run` / `case-close` / `docs-check` | 検査プロファイル切替え。各 workflow で対象ファイル種別と検査ルールセットを切替える（REQ-0108-282） |
| `--files <path...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | main 環境（マージ後、case-close 等）で PR 変更ファイルを直接指定して使用。files_checked 空の場合は FAILURE（REQ-0108-282、Phase 3） |
| `--base-ref <git-ref>` | -- | git ref（既定: `origin/main`） | worktree 環境（マージ前、case-run 等）で変更ファイル検出に使用。files_checked 空の場合は WARNING（REQ-0108-282、Phase 3） |
| `--json` | -- | flag | JSON 出力を有効化 |
| `--fail-level <level>` | -- | `strict` / `warning` | failure とする severity の閾値。既定は `strict` |
| `--declared-files <path...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | Issue/PR で宣言した文書更新対象と実変更ファイルの対応を検査する任意引数 |

`--files` と `--base-ref` は排他ではなく、いずれかで変更対象を特定する。両方未指定の場合はエラー。

## workflow 別検査項目

各 workflow profile が実行する検査項目（REQ-0158 より移管）。検出ルールの詳細は IR-*.md ならびに `integrity-rule-catalog.md` 参照。

### req-save 向け検査

変更ファイルが `docs/requirements/REQ-*.md` の場合、以下を確認する。

- REQ frontmatter の必須項目とファイル名・IDの一致
- 要件行ID形式の妥当性
- WHAT/HOW境界の逸脱検出
- 新規REQ・タイトル変更時の `docs/requirements/README.md` 同期
- DOC-MAP更新要否判定
- ADR参照がある場合の相互参照更新要否判定
- 関連SPEC候補がある場合の `docs/specs/README.md` 更新要否判定
- 旧SPEC直下パス混入検出（IR-057）
- local版旧生成方式語彙混入検出（IR-057）
- 文書種別責務と日本語執筆規範の機械化可能範囲の検査

### spec-save 向け検査

変更ファイルが `docs/specs/**/*.md` の場合、以下を確認する。

- SPEC frontmatter の必須項目
- status 値の妥当性
- `docs/specs/README.md` のstatus表との同期
- SPECドメイン分類の妥当性
- 新規SPEC、移動、改名、主要入口変更時の DOC-MAP 更新要否判定
- 変更SPECと近接リンクのリンク整合
- 旧SPEC直下パス混入検出（IR-057）
- local版旧生成方式語彙混入検出（IR-057）
- command SPECの場合の対象command原本との最低限の整合
- skill SPECの場合の対象skill原本との最低限の整合
- integrity SPECの場合の catalog/rule file/script 整合
- REQ相当、ADR相当、guide相当の混入検出

### case-close 向け検査

case-close では保存工程より広めに以下を確認する。

- 変更ファイル対象の targeted docs guard 実行
- draft→accepted 等の SPEC status変更時の `docs/specs/README.md` 同期
- Issue/PRで宣言した文書更新対象と実変更ファイルの対応（`--declared-files` 使用時）
- 旧SPEC直下パス混入検出（IR-057）
- local版旧生成方式語彙混入検出（IR-057）
- full docs-check 実行要否判定

### case-run 向け検査

case-run プロファイルは docs/** 変更ファイルを対象とし、req-save/spec-save プロファイルと同等の docs 整合性検査ルールセット（obsolete-spec-path, legacy-local-generation-vocab, doc-type-responsibility 等）を適用する。case-run プロファイル固有の追加ルールとして `full_docs_check_recommended` 判定は持たない（case-close の責務）。appliesTo は `docs/specs/**`, `docs/requirements/**`, `docs/adr/**`, `docs/guides/**`, `AGENTS.md`, `README.md`, `docs/DOC-MAP.md` 等、docs 配下および文書整合性に関連するファイルに限定する。

## full_docs_check_recommended 条件

更新要否フラグ（`requirements_readme_update_required`、`spec_readme_update_required`、`extensions_check_required`、`full_docs_check_recommended`）は、変更ファイルの存在または変更種別名ではなく、行レベル差分が次の導出元へ影響するかで判定する。

- 文書の追加、削除、移動、名称変更
- 索引に使用される frontmatter 値（id、title、status 等）
- 公開入口、manifest、一覧に影響する値
- extension が参照する対象や責務
- DOC-MAP や README の生成元情報

REQ と SPEC の README 更新要否（`requirements_readme_update_required`、`spec_readme_update_required`）は、対象文書の追加、削除、移動、名称変更、または索引に使用される frontmatter 値の変更で `true` とする。相互参照追記、相対パス是正、表記修正など、上記導出元に影響しない変更では全フラグを `false` にする。

case-close profile の `full_docs_check_recommended` の判定条件（REQ-0158 より移管）。以下の変更を検出した場合に `true` とする。

- integrity rule追加・削除・大幅変更
- DOC-MAP構造変更
- `docs/specs/` の大規模移動・改名
- `repo-agentdev-integrity` の検査スコープ変更
- 文書分類・責務境界の基準変更
- `docs/specs/integrity/rules/**`、`integrity-rule-catalog.md`、`rule-ownership.md`、`document-model.md`、`document-type-responsibilities.md`、`docs/DOC-MAP.md`、`docs/specs/README.md`、`.agentdev/doc-inputs/**` の変更

## false-clean 予防（REQ-0108-281 詳細）

case-close 向け changed docs guard の false-clean 予防契約（REQ-0158 より移管、REQ-0108-281 で要件化）。

- docs guard 検査の対象ファイルが空（`files_checked: 0`）の場合、検査結果を warning として報告し、silent pass としないこと
- case-close は `--files <PR変更ファイル>` 指定を標準とし、`--base-ref` のみの指定を補助的使用に限定すること。main worktree 実行時に HEAD==merge-base となる環境では `--base-ref` が空 diff を生じため、`--files` を優先すること
- case-close 手順に `files_checked` が空でないことの確認ステップを含めること
- verification-only PR（実装差分0件、検証のみで作成された PR）で `files_checked` が空になる場合は REQ-0108-279 の verification-only 判定を経て PASS 処理すること

## verification-only PR PASS ロジック（REQ-0108-279 詳細）

verification-only PR 判定と PASS 処理の振る舞い（REQ-0158-002 より移管、REQ-0108-279 で要件化）。

- verification-only PR（実装差分0件、検証のみで作成された PR）で files_checked が空になる場合、case-close は当該 PR を verification-only と判定する
- REQ-0108-281（false-clean 予防）の確認事項を経て正当と判断された場合に PASS 処理する
- GitHub が空 PR の squash merge を許可し空 commit を生成することを前提とする
- files_checked 空は false-clean 警告レイヤをトリガーするが、verification-only の正当性確認により当該警告を PASS 処理できる

## report フィールド一覧

check_changed_docs.ts の report JSON に含まれる全フィールドを列挙する（REQ-0158-004 より移管）。

| フィールド | 型 | 説明 |
|---|---|---|
| `workflow` | string | 実行された workflow profile 名 |
| `files_checked` | string[] | 検査対象ファイル一覧 |
| `coupled_files_checked` | string[] | 連動ファイル（README、DOC-MAP、mapping-table 等）一覧 |
| `failures` | Failure[] | 検出された違反一覧。各 failure は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ |
| `warnings` | string[] | 警告一覧。`files_checked` 空の場合は理由（`--files` 指定の不備、PR 変更ファイル取得の失敗、検査対象パスの誤り等）の確認を促す内容を含む |
| `doc_map_update_required` | boolean | DOC-MAP 更新要否 |
| `spec_readme_update_required` | boolean | `docs/specs/README.md` 更新要否 |
| `requirements_readme_update_required` | boolean | `docs/requirements/README.md` 更新要否 |
| `full_docs_check_recommended` | boolean | full docs-check 実行要否（前節「full_docs_check_recommended 条件」参照） |
| `extensions_check_required` | boolean | project extensions 検査の必要性 |
| `docInputsCheckRequired` | boolean | 検査入力の必要性 |
| `declared_files_check` | object | 宣言ファイル検査の実行結果（`--declared-files` 使用時） |

`failure` オブジェクトのフィールド: `rule_id`、`severity`、`file`、`line`、`message`、`expected`。

## files_checked 空時の警告

`files_checked` が空の場合、検査対象ファイルが検出されなかった旨の警告（warnings 配列）を出力する。空の理由（`--files` 指定の不備、PR 変更ファイル取得の失敗、検査対象パスの誤り等）の確認を促す内容とする（Phase 3、REQ-0108-281 連動）。

## 検査失敗時の取り扱い

- req-save、spec-save の検査失敗時は保存対象文書と連動文書を修正して再実行する（REQ-0108-280）
- case-close で `full_docs_check_recommended` が true の場合は case-close 完了判定の追加確認として扱う

## 旧SPEC直下配置前提の除去

本 SPEC 導入に併せて実施された、旧SPEC直下配置前提の除去対応（REQ-0158 より移管、完了済み）。

- spec-save.md（原本）と `docs/specs/commands/spec-save.md`（SPEC）に残存する旧SPEC直下配置前提（`docs/specs/*.md`、`docs/specs/{topic-slug}.md`、`docs/specs/<existing-spec>.md`、SPEC 用 `new:{topic-slug}`）を廃止した
- 新表現として `docs/specs/{domain}/{topic-slug}.md`、`docs/specs/**/*.md`、`target_spec: {operation, domain, slug}` 構造化へ寄せた
- `docs/DOC-MAP.md` と `docs/specs/README.md` の SPEC 配置表現（`specs/*.md`）を `specs/**/*.md` またはドメイン分割説明へ更新した
- SPEC 配下の二系統（実行単位: commands/skills/workflows、基盤: foundations/responsibilities/quality/integrity/local/authoring）を説明に含めた
- requirements/adr 配下の歴史記載（履歴マーカー付き）は例外として更新対象外とした

## repo-agentdev-integrity の docs/specs/**/*.md 再帰対応

check_integrity.ts 側の対応（REQ-0158 より移管、完了済み）。

- `collectAllArtifactPaths`、`checkDocMapSpecSync`、`checkSpecReadmeIndexSync`、`checkUpdateNotesInDocs`、`scanned.Specs`、SPEC inventory 生成・照合処理、DOC-MAP と SPEC の照合処理を `docs/specs/*.md`（直下）から `docs/specs/**/*.md`（再帰）へ更新した
- SPEC本文の検査では `docs/specs/README.md` を除外する
- SPEC inventory/status 同期検査と DOC-MAP との照合では `docs/specs/README.md` を対象とする
- DOC-MAP との照合では SPEC status の重複確認ではなく、入口・読み込み契約との整合を確認する

## obsolete-path-map.yaml 運用

`docs/specs/integrity/obsolete-path-map.yaml` による旧SPEC直下パス→現行ドメイン分割パス対応表の運用（REQ-0158 より移管）。

- 各エントリは `old`、`new`、`severity`、`scope`（`include`、`exclude`）を持つ
- `severity` は旧直下パス参照を `ng` とする
- `scope.include` は `AGENTS.md`、`README.md`、`docs/**`、`src/**`、`.opencode/**` とする
- `scope.exclude` は `docs/requirements/retired/**` と `docs/adr/retired/**` とする
- ドメイン分割による移送が発生した場合は、移送単位で旧パスと新パスの対応を追記する（REQ-0156-010）

検出語彙の分類（単独検出語 / 近接条件つき検出語）は IR-057（`rules/IR-057-obsolete-spec-path-after-domain-split.md`）ならびに `obsolete-path-map.yaml` を SSoT とする。

## 関連

- REQ-0108（docs-check / 検証・テスト、REQ-0108-279/280/281/282 で本 SPEC の WHAT を要件化）
- REQ-0158（Targeted Docs Integrity Guard、retired。履歴参照）
- `docs/specs/integrity/validator-split-criteria.md`（validator 分割基準、Phase 6 の詳細）
- `docs/specs/integrity/integrity-contracts.md`（Workflow×ツールマトリックス表、TargetedDocsReport 型契約）
- `docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md`（旧SPEC直下パス検出、link mode 統一で廃止確定となった旧生成方式語彙の検出）
- `docs/specs/integrity/obsolete-path-map.yaml`（旧パス対照表）

