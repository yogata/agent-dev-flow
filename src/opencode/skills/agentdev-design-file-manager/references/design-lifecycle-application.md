# Design ライフサイクル適用

本資料は SKILL.md「Design ライフサイクル適用」「ファイル操作モード」セクションの補完であり、Design frontmatter の `status`（`draft` / `accepted` の2値）を Design 操作（CREATE/APPEND/UPDATE）で適用する規則を記述する。

## status 値と遷移契機

| status | 意味 | 遷移契機 |
|--------|------|----------|
| `draft` | design-save で保存された直後の状態。境界違反検査の対象外 | design-save が新規 Design 作成時に付与（既定値） |
| `accepted` | case-close で Design 確定チェックを通過した状態。すべての integrity rule の検査対象 | case-close Step 3 で実装が Design 内容を検証した旨を確認時 |

`status` 欠落は後方互換のため `accepted` 相当として扱う。

## CREATE 時の status 適用

新規 Design 作成時（`operation: create`）は frontmatter に `status: draft` を必ず付与する（G05）。

frontmatter 完全性（4フィールド）:
- `title`: Design タイトル
- `status`: `draft`（固定）
- `created`: 作成日（`YYYY-MM-DD`）
- `updated`: 作成日（`YYYY-MM-DD`、`created` と同値）

`accepted` を付与しないこと。
`draft` から `accepted` への昇格は case-close の責務（G11）。

## APPEND / UPDATE 時の status 扱い

既存 Design へ新規セクション追加（APPEND）またはセクション置換（UPDATE）の場合、当該 Design の `status` を変更しない（G06）。
既存 Design の成熟度を尊重する。

- `status: draft` の Design へ追記 → `status: draft` を維持
- `status: accepted` の Design へ追記 → `status: accepted` を維持
- frontmatter `updated` のみ更新日時に更新する

## 置換済み Design の扱い

置換済み Design は現行 Design ツリーへ保持しない。
置換時は旧 Design を現行ツリーから除外し、履歴は Git、Issue、Decision 等の既存履歴手段から確認する。
`superseded`、`superseded_by` を Design ライフサイクルで使用しない。

## Design 一覧表（docs/designs/README.md 相当）登録

新規 Design 作成時（CREATE）は Design 一覧表へ当該 Design の行を登録する。

登録内容:
- Design パス（相対リンク）
- `status`: `draft`（design-save 新規作成時）
- タイトル
- 責務の概要

既存 Design へ追記（APPEND/UPDATE）の場合は一覧表の `status` 列のみ更新し、行を追加しない。
Design のドメイン間移送が発生した場合は旧ドメイン表から行を削除し、新ドメイン表へ登録する。