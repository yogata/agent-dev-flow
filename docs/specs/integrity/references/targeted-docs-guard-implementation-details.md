# Targeted Docs Guard 実装詳細参照

> 本ファイルは `docs/specs/integrity/targeted-docs-guard-implementation.md` から移管した実装詳細（Phase 1-6 実装計画、report フィールド一覧、完了済みの移行作業）を保持する。
> SPEC 本体は契約のみを残し、実装計画と完了済み作業経緯は本ファイルへ分離した。

## Phase1-6 実装計画

check_changed_docs.ts 中心の変更文書限定検査契約を Phase 1-6 で成熟させる。
コマンドと check_changed_docs.ts の責務分担（コマンドが対象確定、check_changed_docs.ts が検査実行）、評価対象はフォーマット検査に限定（意味評価しない）を基本方針とする。

### Phase 1: SPEC 配置

- check_changed_docs.ts の変更文書限定検査契約は、挙動SPEC（entry/対象解決/profile/validator呼出/report契約/exit code）、カタログSPEC（TargetedDocsReport 型定義、workflow profile 定義）、実装詳細SPEC（validator内部アルゴリズム、分割基準）に配置されること。
- 個別判定条件は IR-*.md に配置されること。

### Phase 2: report 契約固定

- TargetedDocsReport 型が固定され、型/戻り値/JSON/text出力/テストが一致すること。
- 必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, docInputsCheckRequired, declared_files_check。
上記リストのみを必須フィールドとし、それ以外を許容しない。

### Phase 3: 対象確定の命令側移行

- 対象確定はコマンド側が行うこと。check_changed_docs.ts は対象選定の十分性を判定しないこと。
- 対象があれば --files を渡し、対象なければ原則呼出さないこと。
- --files の区切り形式は space 区切り（推奨）と comma 区切り（後方互換）の両方を受入れること（v2:REQ-0158-001 より統合）。
  例: `--files a.md b.md c.md`（space 区切り推奨）、`--files a.md,b.md,c.md`（comma 区切りも受入）。
両形式の混在も可。
usage メッセージ、--help 出力で区切り形式を明示すること。
後方互換性を担保し space 区切り仕様を変更しないこと。
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

## report フィールド一覧

check_changed_docs.ts の report JSON に含まれる全フィールドを列挙する（v2:REQ-0158-004 より移管）。

| フィールド | 型 | 説明 |
|---|---|---|
| `workflow` | string | 実行された workflow profile 名 |
| `files_checked` | string[] | 検査対象ファイル一覧 |
| `coupled_files_checked` | string[] | 連動ファイル（README 等）一覧 |
| `failures` | Failure[] | 検出された違反一覧。各 failure は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ |
| `warnings` | string[] | 警告一覧。`files_checked` 空の場合は理由（`--files` 指定の不備、PR 変更ファイル取得の失敗、検査対象パスの誤り等）の確認を促す内容を含む |
| `doc_map_update_required` | boolean | README 索引更新要否（後方互換フィールド名、現在は README 索引更新要否判定に使用） |
| `spec_readme_update_required` | boolean | `docs/specs/README.md` 更新要否 |
| `requirements_readme_update_required` | boolean | `docs/requirements/README.md` 更新要否 |
| `full_docs_check_recommended` | boolean | full docs-check 実行要否 |
| `extensions_check_required` | boolean | project extensions 検査の必要性 |
| `docInputsCheckRequired` | boolean | 検査入力の必要性 |
| `declared_files_check` | object | 宣言ファイル検査の実行結果（`--declared-files` 使用時） |

`failure` オブジェクトのフィールド: `rule_id`、`severity`、`file`、`line`、`message`、`expected`。

TargetedDocsReport 型契約の正本は `docs/specs/integrity/integrity-contracts.md` TargetedDocsReport 型契約節である。
本表は実装参照用途のフィールド一覧である。

## 旧SPEC直下配置前提の除去（完了済み）

旧SPEC直下配置前提の除去対応（v2:REQ-0158 より移管、完了済み）。

- spec-save.md（原本）と `docs/specs/commands/spec-save.md`（SPEC）に残存する旧SPEC直下配置前提（`docs/specs/*.md`、`docs/specs/{topic-slug}.md`、`docs/specs/<existing-spec>.md`、SPEC 用 `new:{topic-slug}`）を廃止した。
- 新表現として `docs/specs/{domain}/{topic-slug}.md`、`docs/specs/**/*.md`、`target_spec: {operation, domain, slug}` 構造化へ寄せた。
- `docs/specs/README.md` の SPEC 配置表現（`specs/*.md`）を `specs/**/*.md` またはドメイン分割説明へ更新した。
- SPEC 配下の二系統（実行単位: commands/skills/workflows、基盤: foundations/responsibilities/quality/integrity/local/authoring）を説明に含めた。
- requirements/adr 配下の歴史記載（履歴マーカー付き）は例外として更新対象外とした。

## repo-agentdev-integrity の docs/specs/**/*.md 再帰対応（完了済み）

check_integrity.ts 側の対応（v2:REQ-0158 より移管、完了済み）。

- `collectAllArtifactPaths`、`checkSpecReadmeIndexSync`、`checkUpdateNotesInDocs`、`scanned.Specs`、SPEC inventory 生成・照合処理を `docs/specs/*.md`（直下）から `docs/specs/**/*.md`（再帰）へ更新した。
- SPEC本文の検査では `docs/specs/README.md` を除外する。
- SPEC inventory/status 同期検査では `docs/specs/README.md` を対象とする。
- SPEC 一覧との照合では SPEC status の重複確認ではなく、入口・読み込み契約との整合を確認する。
