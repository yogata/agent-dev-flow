# 操作契約（ローカル版）

ローカル版 agentdev-gh-cli が提供する I/O 手続きと VERIFY の操作契約（REQ-0150-001, ADR-0130 decision #4, #5）。
標準版（GitHub 版）の操作契約（[../../skills/agentdev-gh-cli/references/contracts.md](../../../skills/agentdev-gh-cli/references/contracts.md)）と手続き名、引数、戻り値を一致させる。対象リソースが GitHub Issue/PR から Case ファイル（`.agentdev/cases/case-{NNNN}.md`）に読み替わる点のみが相違である。
ローカル版（Case ファイル版）の具体的実装手順は [local-procedures.md](local-procedures.md) 参照。

Case ファイルのスキーマ、status enum、見出し一覧は [../case-schema/case-file.md](../case-schema/case-file.md) 参照（操作用定義）。意味仕様の正本は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md) である。

## I/O 手続き

### Issue 作成（ローカル版: Case ファイル新規作成）

| 項目 | 内容 |
|---|---|
| 入力 | タイトル（文字列）、本文（Markdown）、ラベル（文字列配列、省略可） |
| 出力 | Case 番号（`{NNNN}`）、Case ファイルパス |
| エラー扱い | 同一 Case 番号のファイルが既存の場合は上書きせず失敗。Case ファイルの書き込みに失敗した場合は失敗 |
| 後続 | VERIFY（[verify.md](verify.md)）を直後に実行 |
| 読替先 | Case ファイルの YAML 前書き（`id`, `title`, `status: open`, `created_at`, `updated_at`, `closed_at`, `labels`）と本文 |

### Issue 本文読込（ローカル版: Case ファイル読込）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号 |
| 出力 | Case ファイル本文（YAML 前書き + Markdown 本文） |
| エラー扱い | Case ファイルが存在しない場合は失敗 |

### Issue 本文更新（ローカル版: Case ファイル本文更新）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号、本文（Markdown） |
| 出力 | なし（VERIFY で反映を確認） |
| エラー扱い | Case ファイルの書き込みに失敗した場合は失敗 |
| 前提 | 更新前後の本文比較のため、更新前に本文読込でスナップショットを取得することを推奨 |
| 後続 | VERIFY を直後に実行 |
| 副作用 | YAML 前書きの `updated_at` を更新日時に更新すること |

### Issue コメント追加（ローカル版: 作業ログ追記）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号、コメント本文（Markdown） |
| 出力 | なし（VERIFY で反映を確認） |
| エラー扱い | Case ファイルの書き込みに失敗した場合は失敗 |
| 後続 | VERIFY を直後に実行 |
| 読替先 | Case ファイルの `## 作業ログ` セクションへ追記。セクション未存在時は新規に `## 作業ログ` 見出しを追加してから追記する |

### PR 作成（ローカル版: PR 相当セクション追記）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号、PR 本文（Markdown。`## マージ前確認`、`## SPEC確定候補`、`## Findings / Capture候補` を含む）、ベースブランチ（記録用、省略可）、ヘッドブランチ（記録用、省略可） |
| 出力 | Case 番号、Case ファイルパス（PR URL に代わる一意識別子） |
| エラー扱い | Case ファイルの書き込みに失敗した場合は失敗。必須セクション（`## SPEC確定候補`、`## Findings / Capture候補`）が欠落している場合は失敗 |
| 後続 | VERIFY（[verify.md](verify.md)）を直後に実行 |
| 読替先 | Case ファイルに `## マージ前確認`、`## SPEC確定候補`、`## Findings / Capture候補`（`### intake`/`### learning` サブ見出し含む）を追記 |
| 備考 | PR 関連手続きをスキップせず、Case ファイル上の対応セクションで代置する（REQ-0150-002） |

### PR 本文読込（ローカル版: PR 相当セクション読込）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号 |
| 出力 | Case ファイルの PR 相当セクション（`## マージ前確認`、`## SPEC確定候補`、`## Findings / Capture候補`）の Markdown |
| エラー扱い | Case ファイルが存在しない、または必須セクションが存在しない場合は失敗 |

### PR merge（ローカル版: マージ結果記録）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号、merge 方式（`squash` / `merge` / `rebase`。記録用）、merge コミットハッシュ（ローカル Git 上の取り込み結果） |
| 出力 | なし（Case ファイルの `## マージ結果` に記録） |
| エラー扱い | Case ファイルの書き込みに失敗した場合は失敗。merge 操作自体が失敗した場合は呼び出し元が `status: blocked` へ遷移させる |
| 読替先 | Case ファイルの `## マージ結果` セクションへ記録（実行操作、関連コミットハッシュ、実行日時、結果 `PASS`/`FAIL`、ブランチ使用時は取り込み先/元ブランチ） |
| 備考 | GitHub PR 取り込みは実行しない。ローカル Git 上で実施済みの取り込み結果を記録する（REQ-0141-025） |

### Issue close（ローカル版: Case close）

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号、close 理由（`completed` / `not_planned`、省略時は `completed`） |
| 出力 | なし |
| エラー扱い | Case ファイルの書き込みに失敗した場合は失敗 |
| 読替先 | Case ファイルの YAML 前書き `status: closed`、`closed_at` を更新日時で設定。`not_planned` の場合は `status: cancelled` とする |

## VERIFY

| 項目 | 内容 |
|---|---|
| 入力 | Case 番号（または Case ファイルパス）と、書き込み元テキスト |
| 出力 | 検証結果（PASS / FAIL）、検証観点別（4観点）の結果 |
| 実行契約 | 各書き込み操作の直後に個別に実行（一括検証は不可） |
| 失敗時 | [retry.md](retry.md) の3段階リトライロジックに従う |

VERIFY の観点と実装詳細は [verify.md](verify.md) 参照。

## エラー扱いの共通原則

- Case ファイルの読み書きに失敗した場合は失敗とする
- Case ファイルが存在しない、または必須セクション/YAML 前書きフィールドが欠落している場合は失敗とする
- 書き込み内容が Case ファイルスキーマ（[../case-schema/case-file.md](../case-schema/case-file.md)）に違反する場合は失敗とする
- 上記以外の失敗は停止し、ユーザーに報告する
- gh CLI は使用しない（REQ-0150-008）。GitHub Issue/PR 操作を必須としない（REQ-0141-026）
