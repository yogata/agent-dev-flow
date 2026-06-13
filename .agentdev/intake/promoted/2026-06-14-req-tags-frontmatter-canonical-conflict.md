# REQ frontmatter `tags` フィールド: validator と SPEC/REQ の canonical conflict

## 観測

`required-fields` 検査が全 active REQ（21 件）+ retired REQ-0111 の frontmatter に必須 `tags` が未設定と検出（NG 22 件）。

### 検証結果（根因は validator/SPEC 矛盾）

- `check_integrity.ts:387` は `required = ["id", "title", "created", "updated", "tags"]` と `tags` を要求
- しかし**正典 SPEC・REQ は `tags` を要求していない**:
  - REQ-0101-005: REQ frontmatter は `id`, `title`, `created`, `updated` のみ（4 フィールド）
  - `docs/specs/patterns.md:43-52`: REQ frontmatter を 4 フィールドに限定。L52 で「フィールドは `id`, `title`, `created`, `updated` のみ」と明記
- 元 item の根拠「REQ-0101 管理基準に違反」は**誤り**（REQ-0101 は `tags` を要求しない）
- テスト fixture（`tests/fixtures/REQ-0101.md:6` に `tags: [test, regression]`）は意図的と見られるが、権威文書に裏付けがない

## 影響

- NG 22 件が全 active REQ に及ぶ広範囲問題
- item の推奨「全 REQ に `tags` を一括付与」をそのまま実行すると `patterns.md:52` の「フィールドは〜のみ」と矛盾し、新たな違反を生む

## 課題

これは文書修正ではなく**方針決定が必要な canonical conflict**。以下のいずれかを決定する必要がある:

- **(A) `tags` を必須とする**: REQ-0101-005 と `patterns.md` を更新して `tags` を 5 番目の必須フィールドに追加 → 全 REQ へ `tags` 付与 → validator はそのまま
- **(B) `tags` を必須としない**: validator の `required` 配列から `tags` を削除 → REQ/SPEC はそのまま → NG 22 件が解消

## 既存要件との関連

- **REQ-0101-005**: REQ frontmatter 必須フィールド（4 フィールド、`tags` なし）
- **patterns.md:43-52**: REQ frontmatter の正典パターン（`tags` なし）
- **REQ-0108-099**: required-fields 検査

## 対応方針の方向性

- **route**: req-define（方針決定が前提）
- **category**: docs_chore または feature（方針次第）
- **優先度**: 高（NG 22 件は全 active REQ に及ぶ）
- backlog-review → req-define で (A) / (B) を判断することが必須

## 元 item 参照

- `.agentdev/intake/inbox/2026-06-14-req-tags-frontmatter-missing.md`
