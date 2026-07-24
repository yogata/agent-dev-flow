# SPEC ライフサイクル適用

本資料は SKILL.md「SPEC ライフサイクル適用」「ファイル操作モード」セクションの補完であり、SPEC frontmatter の `status`（`draft` / `accepted` / `superseded`）を SPEC 操作（CREATE/APPEND/UPDATE）で適用する規則を記述する。

## status 値と遷移契機

| status | 意味 | 遷移契機 |
|--------|------|----------|
| `draft` | spec-save で保存された直後の状態。境界違反検査の対象外 | spec-save が新規 SPEC 作成時に付与（既定値） |
| `accepted` | case-close で SPEC 確定チェックを通過した状態。すべての integrity rule の検査対象 | case-close Step 3 で実装が SPEC 内容を検証した旨を確認時 |
| `superseded` | 後継 SPEC へ移行した廃止状態。`superseded_by` で後継 SPEC を明示。通常内容検査の対象外 | spec-save または case-close が後継 SPEC への移行を確定した時 |

`status` 欠落は後方互換のため `accepted` 相当として扱う。

## CREATE 時の status 適用

新規 SPEC 作成時（`operation: create` / `spec-create`）は frontmatter に `status: draft` を必ず付与する（G05）。

frontmatter 完全性（4フィールド）:
- `title`: SPEC タイトル
- `status`: `draft`（固定）
- `created`: 作成日（`YYYY-MM-DD`）
- `updated`: 作成日（`YYYY-MM-DD`、`created` と同値）

`accepted` を付与しないこと。`draft` から `accepted` への昇格は case-close の責務（G11）。

## APPEND / UPDATE 時の status 扱い

既存 SPEC へ追記（APPEND）またはセクション置換（UPDATE）の場合、当該 SPEC の `status` を変更しない（G06）。既存 SPEC の成熟度を尊重する。

- `status: draft` の SPEC へ追記 → `status: draft` を維持
- `status: accepted` の SPEC へ追記 → `status: accepted` を維持
- frontmatter `updated` のみ更新日時に更新する

## superseded 遷移

後継 SPEC への移行を確定する場合、元 SPEC へ以下を設定する:

- `status: superseded`
- `superseded_by`: 後継 SPEC のパスまたは ID

`superseded_by` を持つ SPEC は通常内容検査の対象から除外する。

## SPEC 一覧表（docs/specs/README.md 相当）登録

新規 SPEC 作成時（CREATE）は SPEC 一覧表へ当該 SPEC の行を登録する。

登録内容:
- SPEC パス（相対リンク）
- `status`: `draft`（spec-save 新規作成時）
- タイトル
- 責務の概要

既存 SPEC へ追記（APPEND/UPDATE）の場合は一覧表の `status` 列のみ更新し、行を追加しない。SPEC のドメイン間移送が発生した場合は旧ドメイン表から行を削除し、新ドメイン表へ登録する。
