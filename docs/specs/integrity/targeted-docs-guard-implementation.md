---
title: Targeted Docs Guard 実装詳細
status: accepted
created: 2026-07-15
updated: 2026-08-15
---

# Targeted Docs Guard 実装詳細

v2:REQ-0158（Targeted Docs Integrity Guard、retired）から移送された変更文書限定検査契約。
配布物たる REQ 側は WHAT（結果要件）のみを残し、HOW（実装計画、スキーマ詳細）は本 SPEC に配置する。
v2:REQ-0158 は Issue #1713（Epic #1711 Wave 2 OU-002）で retire 完了。
WHAT 側の恒久契約は REQ-010（REQ-010-012、変更ファイル限定検査）へ統合済み。

本 SPEC は契約（CLI 引数、workflow 別検査項目、判定条件、false-clean 予防、検査失敗時の取り扱い）のみを保持する。
Phase 1-6 実装計画、report フィールド一覧、完了済み移行作業経緯は [references/targeted-docs-guard-implementation-details.md](references/targeted-docs-guard-implementation-details.md) へ分離した。

## CLI 引数

check_changed_docs.ts が受け付ける CLI 引数（v2:REQ-0158-004 より移管）。

| 引数 | 必須 | 値 | 説明 |
|------|------|-----|------|
| `--workflow` | ✓ | `req-save` / `spec-save` / `case-run` / `case-close` / `docs-check` | 検査プロファイル切替え。各 workflow で対象ファイル種別と検査ルールセットを切替える（REQ-010-012） |
| `--files <path...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | main 環境（マージ後、case-close 等）で PR 変更ファイルを直接指定して使用。files_checked 空の場合は FAILURE（REQ-010-012、Phase 3） |
| `--base-ref <git-ref>` | -- | git ref（既定: `origin/main`） | worktree 環境（マージ前、case-run 等）で変更ファイル検出に使用。files_checked 空の場合は WARNING（REQ-010-012、Phase 3） |
| `--json` | -- | flag | JSON 出力を有効化 |
| `--fail-level <level>` | -- | `strict` / `warning` | failure とする severity の閾値。既定は `strict` |
| `--declared-files <path...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | Issue/PR で宣言した文書更新対象と実変更ファイルの対応を検査する任意引数 |

`--files` と `--base-ref` は排他ではなく、いずれかで変更対象を特定する。
両方未指定の場合はエラー。

### 標準実行契約（モード使い分け、起動手段、引数形式）

- モード使い分け: コミット前（worktree 上での検証）は `--base-ref` を標準とし、コミット後・PR 作成後（main 環境）は `--files` を標準とする。`--files` と `--base-ref` の誤用による誤 pass・誤 FAILURE を防ぐため、起動時に対象ファイルが検出できる見込みを確認してから実行する
- 起動手段: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` により起動する（スクリプト契約の共通 CLI 契約に従う）
- PowerShell での引数形式: 複数パスの引数は引用符でまとめて1文字列として渡さず、配列変数経由（`$files = @("a.md","b.md"); --files $files`）または個別渡しとする。`--files "a.md b.md"` 形式の引用符まとめ渡しは split 失敗の恐れがあるため使用しない
- USAGE 文言: check_changed_docs.ts の `--help` 出力および guard 実行手続 references は上記使い分け・起動手段・引数形式を明記する

## workflow 別検査項目

各 workflow profile が実行する検査項目（v2:REQ-0158 より移管）。
検出ルールの詳細は IR-*.md ならびに `integrity-rule-catalog.md` 参照。

### req-save 向け検査

変更ファイルが `docs/requirements/REQ-*.md` の場合、以下を確認する。

- REQ frontmatter の必須項目とファイル名・IDの一致
- 要件行ID形式の妥当性
- WHAT/HOW境界の逸脱検出
- 新規REQ・タイトル変更時の `docs/requirements/README.md` 同期
- README 索引更新要否判定
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
- 新規SPEC、移動、改名、主要入口変更時の README 索引更新要否判定
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

case-run プロファイルは docs/** 変更ファイルを対象とし、req-save/spec-save プロファイルと同等の docs 整合性検査ルールセット（obsolete-spec-path, legacy-local-generation-vocab, doc-type-responsibility 等）を適用する。
case-run プロファイル固有の追加ルールとして `full_docs_check_recommended` 判定は持たない（case-close の責務）。
appliesTo は `docs/specs/**`, `docs/requirements/**`, `docs/decisions/**`, `docs/guides/**`, `AGENTS.md`, `README.md` 等、docs 配下および文書整合性に関連するファイルに限定する。

## full_docs_check_recommended 条件

更新要否フラグ（`requirements_readme_update_required`、`spec_readme_update_required`、`extensions_check_required`、`full_docs_check_recommended`）は、変更ファイルの存在または変更種別名ではなく、行レベル差分が次の導出元へ影響するかで判定する。

- 文書の追加、削除、移動、名称変更
- 索引に使用される frontmatter 値（id、title、status 等）
- 公開入口、manifest、一覧に影響する値
- extension が参照する対象や責務
- README 索引の生成元情報

REQ と SPEC の README 更新要否（`requirements_readme_update_required`、`spec_readme_update_required`）は、対象文書の追加、削除、移動、名称変更、または索引に使用される frontmatter 値の変更で `true` とする。
相互参照追記、相対パス是正、表記修正など、上記導出元に影響しない変更では全フラグを `false` にする。

case-close profile の `full_docs_check_recommended` の判定条件（v2:REQ-0158 より移管）。
以下の変更を検出した場合に `true` とする。

- integrity rule追加・削除・大幅変更
- README 索引構造変更
- `docs/specs/` の大規模移動・改名
- `repo-agentdev-integrity` の検査スコープ変更
- 文書分類・責務境界の基準変更
- `docs/specs/integrity/rules/**`、`integrity-rule-catalog.md`、`rule-ownership.md`、`document-model.md`、`document-type-responsibilities.md`、`docs/specs/README.md`、`.agentdev/doc-inputs/**` の変更

## false-clean 予防（REQ-010-012 詳細）

case-close 向け changed docs guard の false-clean 予防契約（v2:REQ-0158 より移管、REQ-010-012 で要件化）。

- docs guard 検査の対象ファイルが空（`files_checked: 0`）の場合、検査結果を warning として報告し、silent pass としないこと
- case-close は `--files <PR変更ファイル>` 指定を標準とし、`--base-ref` のみの指定を補助的使用に限定すること。main worktree 実行時に HEAD==merge-base となる環境では `--base-ref` が空 diff を生じため、`--files` を優先すること
- case-close 手順に `files_checked` が空でないことの確認ステップを含めること
- verification-only PR（実装差分0件、検証のみで作成された PR）で `files_checked` が空になる場合は本 SPEC の verification-only 判定を経て PASS 処理すること

## verification-only PR PASS ロジック

verification-only PR 判定と PASS 処理の振る舞い（v2:REQ-0158-002 より移管、REQ-010-012 で要件化）。

- verification-only PR（実装差分0件、検証のみで作成された PR）で files_checked が空になる場合、case-close は当該 PR を verification-only と判定する
- REQ-010-012（false-clean 予防）の確認事項を経て正当と判断された場合に PASS 処理する
- GitHub が空 PR の squash merge を許可し空 commit を生成することを前提とする
- files_checked 空は false-clean 警告レイヤをトリガーするが、verification-only の正当性確認により当該警告を PASS 処理できる

## report 契約

report JSON の必須フィールド一覧、`failure` オブジェクトの構造、`files_checked` 空時の警告仕様は [references/targeted-docs-guard-implementation-details.md](references/targeted-docs-guard-implementation-details.md) report フィールド一覧節へ分離した。
TargetedDocsReport 型契約の正本は [integrity-contracts.md](integrity-contracts.md) TargetedDocsReport 型契約節である。

## files_checked 空時の警告

`files_checked` が空の場合、検査対象ファイルが検出されなかった旨の警告（warnings 配列）を出力する。
空の理由（`--files` 指定の不備、PR 変更ファイル取得の失敗、検査対象パスの誤り等）の確認を促す内容とする（Phase 3、REQ-010-012 連動）。

## 検査失敗時の取り扱い

- req-save、spec-save の検査失敗時は保存対象文書と連動文書を修正して再実行する（REQ-010-012）
- case-close で `full_docs_check_recommended` が true の場合は case-close 完了判定の追加確認として扱う

## 完了済み移行作業

旧SPEC直下配置前提の除去、repo-agentdev-integrity の `docs/specs/**/*.md` 再帰対応は [references/targeted-docs-guard-implementation-details.md](references/targeted-docs-guard-implementation-details.md) 完了済み移行作業節へ分離した。
両対応は v2:REQ-0158 から移管され、完了済みである。

## obsolete-path-map.yaml 運用

`docs/specs/integrity/obsolete-path-map.yaml` による旧SPEC直下パス→現行ドメイン分割パス対応表の運用（v2:REQ-0158 より移管）。

- 各エントリは `old`、`new`、`severity`、`scope`（`include`、`exclude`）を持つ
- `severity` は旧直下パス参照を `ng` とする
- `scope.include` は `AGENTS.md`、`README.md`、`docs/**`、`src/**`、`.opencode/**` とする
- `scope.exclude` は `docs/requirements/retired/**` と `docs/decisions/retired/**` とする
- ドメイン分割による移送が発生した場合は、移送単位で旧パスと新パスの対応を追記する（REQ-001-010）

検出語彙の分類（単独検出語 / 近接条件つき検出語）は IR-057（`rules/IR-057-obsolete-spec-path-after-domain-split.md`）ならびに `obsolete-path-map.yaml` を SSoT とする。

## skill rename 対称性検査観点

skill rename を伴う作業手順において、以下の対称性検査を deterministic に実施する。

### 物理 path 一致検査

src/opencode/skills/{name} と docs/specs/skills/{name} の物理 path が
一致することを検証する。
rename 後に両者が同一 name であることが必須。

### frontmatter id 一致検査

SPEC ファイルの frontmatter id が物理 path と一致することを検証する。
不一致の場合は warn または error として報告する。

### Artifact Graph node 関係整合検査

rename 後に旧 name の node が Artifact Graph に残存していないこと、
新 name への関係が更新されていることを検証する。

### 実装

3 検査は `.opencode/skills/repo-agentdev-integrity/scripts/check_skill_rename_symmetry.ts` が deterministic に実行する。
対象は配布 skill `agentdev-*`（`src/opencode/skills/` 配下）とし、repo-local skill (`repo-agentdev-*`) および `agentdev-` prefix を持たない skill は対象外（REQ-002 配布物境界）。
`status: superseded` の SPEC に対応する skill dir 欠落は許容し、`status: draft` の場合は warning とする。
Artifact Graph が未生成（`.agentdev/graph/nodes.jsonl` 不在）の場合は graph-node 検査を info として扱い、阻断しない。

## 関連

- REQ-010（docs-check / 検証・テスト、REQ-010-012 で本 SPEC の WHAT を要件化）
- v2:REQ-0158（Targeted Docs Integrity Guard、retired。履歴参照）
- `docs/specs/integrity/validator-split-criteria.md`（validator 分割基準、Phase 6 の詳細）
- `docs/specs/integrity/integrity-contracts.md`（Workflow×ツールマトリックス表、TargetedDocsReport 型契約）
- `docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md`（旧SPEC直下パス検出、link mode 統一で廃止確定となった旧生成方式語彙の検出）
- `docs/specs/integrity/obsolete-path-map.yaml`（旧パス対照表）

