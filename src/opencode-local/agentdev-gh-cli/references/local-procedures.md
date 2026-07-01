# ローカル版実装手順（Case ファイル版）

agentdev-gh-cli の各手続きのローカル版（Case ファイル版）実装手順（REQ-0150-001, 002）。
標準版（GitHub 版）の実装手順（[../../skills/agentdev-gh-cli/references/standard-procedures.md](../../../skills/agentdev-gh-cli/references/standard-procedures.md)）で扱う gh CLI 呼び出しを、Case ファイル（`.agentdev/cases/case-{NNNN}.md`）の読み書きに読み替える。
操作契約（手続き名、引数、戻り値）は [contracts.md](contracts.md) 参照。

Case ファイルスキーマの意味仕様の正本は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md)。操作用定義は [../case-schema/case-file.md](../case-schema/case-file.md)。

## 共通制約

- 書き込み後の VERIFY 操作（[verify.md](verify.md)）を全手続きで実行する
- 保存形式は **UTF-8 (BOMなし)**、改行コード **LF** とする（標準版と共通）
- 書き込みには OpenCode の Write tool、または `[System.IO.File]::WriteAllText` に `UTF8Encoding($false)` を指定する（標準版の WRITE 手続き Section 2 と共通）
- `gh` コマンド、`gh issue`、`gh pr` は使用しない（REQ-0141-026, REQ-0150-008）
- Windows PowerShell の `Out-File`, `Set-Content`, `>` リダイレクトによる Case ファイル書き込みは禁止（標準版と共通。BOM 付きや Shift-JIS になるため）

## Case 番号の採番

新規作成時（Issue 作成 / Case ファイル新規作成手続き）の採番手順。

1. `.agentdev/cases/` ディレクトリ配下の既存 `case-*.md` ファイルから最大番号を特定する
2. 最大番号 + 1 を新規番号とする（4 桁ゼロ埋め、例: `0042`）
3. 欠番は再利用しない（過去に削除、リネームされた番号を再採番しない）
4. 同一 Case 番号のファイルが既存の場合は上書きせず失敗とする

採番規則の意味仕様は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md) の「採番規則」セクション、運用参照資料は [../case-schema/case-file.md](../case-schema/case-file.md) の「採番規則」セクション参照。

## 各手続きのローカル版実装

### Issue 作成（Case ファイル新規作成）

1. Case 番号を採番（前述「Case 番号の採番」）
2. Case ファイル `.agentdev/cases/case-{NNNN}.md` を以下の構造で生成:
   - YAML 前書き: `id`, `title`, `status: open`, `created_at`, `updated_at`, `closed_at: ""`, `labels`
   - 本文: 入力の Markdown（`## 入力`、`## 背景`、`## 目的` 等のセクションを含む）
3. UTF-8 (BOMなし)、LF で保存
4. VERIFY を直後に実行

YAML 前書きの各フィールド制約は [../case-schema/rules/frontmatter.yaml](../case-schema/rules/frontmatter.yaml) 参照。

### Issue 本文読込（Case ファイル読込）

1. Case ファイル `.agentdev/cases/case-{NNNN}.md` を Read tool で読み込む
2. ファイルが存在しない場合は失敗

### Issue 本文更新（Case ファイル本文更新）

1. 更新前に本文読込でスナップショットを取得（推奨）
2. Case ファイルを新しい本文で書き直す。YAML 前書きの `updated_at` を現在日時（ISO 8601）に更新する
3. UTF-8 (BOMなし)、LF で保存
4. VERIFY を直後に実行

本文の一部だけを書き換える場合は、Edit tool で対象セクションを置換し、YAML 前書きの `updated_at` だけを別途更新する。

### Issue コメント追加（作業ログ追記）

1. Case ファイルを読み込む
2. `## 作業ログ` セクションを探す。存在しない場合は `## SPEC確定候補` または `## Findings / Capture候補` の直前（Case ファイル末尾に近い位置）に新規に `## 作業ログ` 見出しを追加する
3. `## 作業ログ` 配下にコメント本文を追記（タイムスタンプ、ヘッダ等の構造は呼び出し元の責務。本手続きは本文の追記のみを担保する）
4. YAML 前書きの `updated_at` を現在日時に更新
5. UTF-8 (BOMなし)、LF で保存
6. VERIFY を直後に実行

### PR 作成（PR 相当セクション追記）

1. Case ファイルを読み込む
2. Case ファイル本文に以下の PR 相当セクションを追記:
   - `## マージ前確認`
   - `## SPEC確定候補`（必須）
   - `## Findings / Capture候補`（必須。`### intake` と `### learning` サブ見出しを含む）
3. 入力の PR 本文を各セクションへ振り分けて配置
4. YAML 前書きの `updated_at` を現在日時に更新
5. UTF-8 (BOMなし)、LF で保存
6. VERIFY を直後に実行

必須セクションが入力に含まれない場合は失敗とする（[contracts.md](contracts.md) PR 作成のエラー扱い参照）。

### PR 本文読込（PR 相当セクション読込）

1. Case ファイルを読み込む
2. `## マージ前確認`、`## SPEC確定候補`、`## Findings / Capture候補` セクションを抽出して返す
3. いずれかの必須セクションが存在しない場合は失敗

### PR merge（マージ結果記録）

1. Case ファイルを読み込む
2. `## マージ結果` セクションを探す。存在しない場合は `## Findings / Capture候補` の直後に新規に `## マージ結果` 見出しを追加する
3. `## マージ結果` 配下に以下を記録:
   - 実行した操作（merge 方式）
   - 関連するコミットハッシュ
   - 実行日時
   - 結果: `PASS` / `FAIL`
   - ブランチ使用時: 取り込み先ブランチ、取り込み元ブランチ
4. YAML 前書きの `updated_at` を現在日時に更新
5. UTF-8 (BOMなし)、LF で保存
6. VERIFY を直後に実行

`## マージ結果` の記録方針は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md) の「マージ結果の記録方針」セクション参照。

### Issue close（Case close）

1. Case ファイルを読み込む
2. YAML 前書きを更新:
   - `status`: `closed`（close 理由 `completed` の場合）または `cancelled`（close 理由 `not_planned` の場合）
   - `closed_at`: 現在日時（ISO 8601）
   - `updated_at`: 現在日時
3. UTF-8 (BOMなし)、LF で保存
4. VERIFY を直後に実行

`closed_at` の値条件は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md) の「closed_at の値条件」セクション参照。

## status 状態遷移との協調

本手続きは Case ファイルの status 状態遷移の一部を担う。状態遷移表の全体は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md) の「状態遷移表」、運用参照資料は [../case-schema/case-file.md](../case-schema/case-file.md) の「status enum と状態遷移」参照。

| 手続き | status 遷移 |
|---|---|
| Issue 作成 | （新規）→ `open` |
| Issue 本文更新、Issue コメント追加 | （状態変更なし。`updated_at` のみ） |
| PR 作成 | `running` → `review`（呼び出し元の責務。本手続きは本文追記のみ） |
| PR merge | `review` → `closed`（呼び出し元の責務。本手続きは `## マージ結果` 記録のみ） |
| Issue close | `*` → `closed` または `cancelled` |

status 遷移そのものは呼び出し元（各 command）の責務である。本手続きは対象セクションの読み書きと YAML 前書きの `updated_at` 更新のみを担う。ただし Issue close は例外的に `status` と `closed_at` を直接更新する。
