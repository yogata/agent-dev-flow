---
title: ローカル Case ファイル
status: draft
created: 2026-06-20
updated: 2026-06-26
---

# ローカル Case ファイル

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。
> ローカル版 OpenCode 導入先リポジトリで運用される Case ファイルのスキーマ、状態遷移、採番、見出しを定義する。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0104）。
> REQ-0141 の詳細仕様を正とする。
> Case ファイル仕様の正本は本 SPEC であり、`src/opencode-local/agentdev-gh-cli/case-schema/` 配下の定義は操作用定義（正本ではない）とする（AG-008）。

## 目的

GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）で、Issue / PR 相当の永続情報を保持する Case ファイルの構造を定義する（REQ-0141-016〜020, 024）。
ローカル版コマンド（`case-open` / `case-run` / `case-close`）は本 SPEC に従って `.agentdev/cases/case-{NNNN}.md` を生成、更新する。

## 配置先

- パス: `.agentdev/cases/case-{NNNN}.md`
- `{NNNN}`: 4 桁ゼロ埋め番号（例: `0001`, `0042`）
- リポジトリ管理対象: `.agentdev/cases/` 配下の Case ファイルは Issue / PR 相当の永続情報としてリポジトリ管理対象とする（REQ-0141-016）

## YAML 前書きスキーマ

Case ファイルの YAML 前書きは以下のフィールドを持つ。
各フィールドの型、必須/任意、値域を定義する。

| フィールド | 型 | 必須/任意 | 値域、制約 |
|---|---|---|---|
| `id` | 文字列 | 必須 | `case-{NNNN}` 形式。ファイル名 `case-{NNNN}.md` と一致すること |
| `title` | 文字列 | 必須 | 自由記述。Case の概要を簡潔に表す日本語または英語 |
| `status` | 文字列（enum） | 必須 | `open`, `running`, `blocked`, `review`, `closed`, `cancelled` のいずれか |
| `created_at` | 文字列（日時） | 必須 | ISO 8601 形式（例: `2026-06-20T21:39:00+09:00`） |
| `updated_at` | 文字列（日時） | 必須 | ISO 8601 形式。最終更新日時 |
| `closed_at` | 文字列（日時）または空 | 条件付き必須 | `status: closed` または `status: cancelled` の場合のみ値を持つ。それ以外では空文字列またはフィールド値なし |
| `labels` | 配列（文字列） | 必須 | `rules/labels.yaml` の `label_enum` から選定。補助分類であり状態遷移やワークフロー状態の代替として扱わない |

### YAML 前書きに含めないフィールド

以下のフィールドは YAML 前書きに持たせない（REQ-0141-017, 024）。

- `work_type`
- `source`
- `branch`
- `base_branch`

ブランチ情報はブランチを使った場合のみ `## マージ結果` セクションに記録する。
YAML 前書きには持たせない。

### 前書きスキーマ定義ファイル

前書きスキーマの形式定義は `src/opencode-local/agentdev-gh-cli/case-schema/rules/frontmatter.yaml` に機械可読形式で保持する。
本 SPEC は意味仕様の原本であり、`frontmatter.yaml` は本 SPEC と矛盾してはならない。
`frontmatter.yaml` は操作用定義（正本ではない）とする（AG-008）。

## status enum と状態遷移

### status 値域

`status` は以下のいずれかの値を取る（REQ-0141-018）。

| status | 意味 | 終端状態 |
|---|---|---|
| `open` | Case オープン済み、作業前 | いいえ |
| `running` | 作業中 | いいえ |
| `blocked` | 停止中（障害、未解決事項あり） | いいえ |
| `review` | 作業完了、レビュー対象 | いいえ |
| `closed` | 完了 | はい |
| `cancelled` | 中止 | はい |

`closed` と `cancelled` は終端状態とする。
終端状態からの遷移は定義しない。

### 状態遷移表

ローカル版各コマンドの操作に対応する状態遷移を定義する（REQ-0141-018）。

| 操作 | 変更前 status | 変更後 status |
|---|---|---|
| ローカル版 `case-open` | （新規作成） | `open` |
| ローカル版 `case-run` 開始 | `open` / `blocked` | `running` |
| ローカル版 `case-run` 完了 | `running` | `review` |
| ローカル版 `case-run` 停止 | `running` | `blocked` |
| ローカル版 `case-close` 停止 | `review` | `blocked` |
| ローカル版 `case-close` 再開 | `blocked` | `review` |
| ローカル版 `case-close` 完了 | `review` | `closed` |
| 明示中止 | `open` / `running` / `blocked` / `review` | `cancelled` |

### 再開経路

- ローカル版 `case-run` 停止後の再開経路: `blocked` → `running` → `review`
- ローカル版 `case-close` 停止後の再開経路: `blocked` → `review` → `closed`

### 禁止遷移

- `blocked` から `closed` への直接遷移は禁止する。`blocked` から `closed` に至る場合は `review` を経由すること。
- 終端状態（`closed`, `cancelled`）からの遷移は定義しない。

### status 定義ファイル

状態遷移表の形式定義は `src/opencode-local/agentdev-gh-cli/case-schema/rules/status.yaml` に機械可読形式で保持する。
本 SPEC と `status.yaml` は矛盾してはならない。

## 採番規則

`{NNNN}` の採番規則を定義する（REQ-0141-016）。

- 4 桁ゼロ埋め番号とする（例: `0001`, `0042`, `9999`）
- 新規作成時は `.agentdev/cases/case-*.md` の既存最大番号 + 1 を使用する
- 欠番は再利用しない（過去に削除、リネームされた番号を再採番しない）
- 同一番号のファイルが既に存在する場合、ローカル版 `case-open` は停止する（上書きしない）
- 複数プロセスによる同時作成の排他制御は対象外とする（暫定ローカル版の前提）

## labels 値域

`labels` は配列とし、`rules/labels.yaml` の `label_enum` から選定する（REQ-0141-019）。
`labels` は補助分類であり、状態遷移やワークフロー状態の代替として扱わない。

`label_enum` の値域:

- `feature`
- `bugfix`
- `maintenance`
- `docs`
- `refactor`
- `chore`
- `epic`

### labels 定義ファイル

ラベル値域の形式定義は `src/opencode-local/agentdev-gh-cli/case-schema/rules/labels.yaml` に機械可読形式で保持する。
本 SPEC と `labels.yaml` は矛盾してはならない。

## 見出し一覧

Case ファイル本文は以下の 15 セクション見出しを持つ（REQ-0141-020）。
各見出しの必須/任意を定義する。

| # | 見出し | 必須/任意 | 役割 |
|---|---|---|---|
| 1 | `## 入力` | 任意 | Case の入力情報（REQ パス、要件 doc パス、参照 Issue 等） |
| 2 | `## 背景` | 任意 | Case の背景説明 |
| 3 | `## 問題` | 任意 | Case が解決する問題 |
| 4 | `## 目的` | 任意 | Case の目的 |
| 5 | `## 対象範囲` | 任意 | Case の対象範囲 |
| 6 | `## 対象外` | 任意 | Case の対象外 |
| 7 | `## 受け入れ条件` | 任意 | Case の受け入れ条件 |
| 8 | `## 作業ログ` | 任意 | 作業の進行ログ。GitHub Issue コメント相当の内容を記録 |
| 9 | `## マージ前確認` | 任意 | マージ前確認事項。GitHub PR 本文の引き継ぎ情報の一部 |
| 10 | `## SPEC確定候補` | **必須** | SPEC 確定候補。GitHub PR 本文が担っていた引き継ぎ情報の代替（REQ-0141-020） |
| 11 | `## Findings / Capture候補` | **必須** | Findings / Capture候補。GitHub PR 本文が担っていた引き継ぎ情報の代替。下位に `### intake` と `### learning` サブ見出しを持つ |
| 12 | `## マージ結果` | 任意 | ローカル Git 上の取り込み結果。ブランチ情報は本セクションに記録する（YAML 前書きには持たせない） |
| 13 | `## 残課題` | 任意 | 残課題、フォローアップ項目 |
| 14 | `## 完了判定` | 任意 | 完了判定結果 |
| 15 | （自由拡張） | 任意 | 上記以外のセクションは必要に応じて追加可能 |

`SPEC確定候補` と `Findings / Capture候補` を必須とする理由: これらは GitHub 版で PR 本文が担っていた引き継ぎ情報の代替であり、case-close への引き継ぎ経路を失わせないため（REQ-0141-020）。

### Findings / Capture候補 サブ見出し

`## Findings / Capture候補` は以下のサブ見出しを持つ。

```markdown
## Findings / Capture候補

### intake

（intake 候補のリスト）

### learning

（learning 候補のリスト）
```

### headings 定義ファイル

見出し一覧の形式定義は `src/opencode-local/agentdev-gh-cli/case-schema/rules/headings.yaml` に機械可読形式で保持する。
本 SPEC と `headings.yaml` は矛盾してはならない。

## closed_at の値条件

`closed_at` は以下の条件でのみ値を持つ（REQ-0141-017）。

- `status: closed` の場合: 値を持つ（クローズ日時を ISO 8601 形式で記録）
- `status: cancelled` の場合: 値を持つ（キャンセル日時を ISO 8601 形式で記録）
- それ以外の `status`: 空文字列またはフィールド値なし

## マージ結果の記録方針

`## マージ結果` セクションには、ローカル版 `case-close` がローカル Git 上で実施済みの取り込み、反映結果を記録する（REQ-0141-025）。
GitHub PR 取り込みは実行しない。

### 記録項目

以下を必須項目とする。

- 実行した操作
- 関連するコミットハッシュ
- 実行日時
- 結果: `PASS` / `FAIL`

### ブランチ使用時の追記項目

ブランチを使った場合は以下も記録する。
ブランチを使わない場合はブランチ名の記録を必須としない。

- 取り込み先ブランチ
- 取り込み元ブランチ

### 失敗、未完了時の扱い

ローカル Git 上で実施済みの取り込み、反映結果が失敗または未完了の場合、ローカル版 `case-close` は `status` を `blocked` に更新し、理由を `## 残課題` に記録する（REQ-0141-025）。

## GitHub Issue / PR 置換対応表

ローカル版では GitHub Issue / PR が担う情報を Case ファイルに集約する（REQ-0141-021〜023, 026）。

| GitHub 版 | ローカル版 |
|---|---|
| GitHub Issue 本文 | Case ファイル本文 |
| GitHub Issue コメント | `## 作業ログ` |
| GitHub Issue の状態 | Case ファイルの `status` |
| GitHub Issue のラベル | Case ファイルの `labels` |
| GitHub PR 本文 | `## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` |
| GitHub PR 取り込み結果 | `## マージ結果` |
| GitHub Issue のクローズ | `status: closed` + `closed_at` |

ローカル版各コマンドの責務:

- ローカル版 `case-open`: GitHub Issue 作成ではなく Case ファイル作成を行う（REQ-0141-021）
- ローカル版 `case-run`: GitHub PR 作成ではなく Case ファイルの PR 相当セクション追記を行う（REQ-0141-022）
- ローカル版 `case-close`: GitHub PR 取り込み / Issue クローズではなく Case ファイルの完了更新を行う（REQ-0141-023）
- GitHub Issue 作成、PR 作成、PR 取り込み、Issue クローズおよび `gh issue` / `gh pr` をローカル版の必須操作にしない（REQ-0141-026）

## 関連項目

- **関連 ADR**: ADR-0131（ローカル版導入方式を link mode へ統一し生成方式を廃止。ADR-0126 を supersede）
- **関連 REQ**: REQ-0141（ローカル版 OpenCode 導入方式とローカルCaseファイル運用）、REQ-0150（ローカル版 `agentdev-gh-cli` 実装）
- **関連 SPEC**: local-generation.md、runtime-package-boundary.md

ADR-0126（superseded）は履歴参照のみとし、現行根拠として扱わない（REQ-0112-053 準拠）。
