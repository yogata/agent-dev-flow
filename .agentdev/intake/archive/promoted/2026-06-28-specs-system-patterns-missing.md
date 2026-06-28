# docs/specs/system.md, patterns.md 欠落と README.md のリンク切れ（main repo）

## 観察

`check_integrity.ts` の Specs カテゴリ（`specs-existence`）が `docs/specs/system.md`、`docs/specs/patterns.md` の不存在を NG 検出した（route: intake）。同 LinkIntegrity カテゴリ（`broken-file-link`）が `README.md` から `docs/specs/system.md` へのリンク切れを NG 検出した（route: intake）。

`docs/specs/` 配下は foundations, integrity, skills 等のサブディレクトリ構造に再編成されており、フラットな `system.md`、`patterns.md` は存在しない。README.md（ルート）は再編成前の旧パス `docs/specs/system.md` を参照したままである。

メインリポジトリでの検出であり、既存の worktree 由来 item（`2026-06-27-epic1288-wave1-worktree-docs-specs-ng.md`）が扱った worktree 固有の問題とは文脈が異なる。重複判定は `intake-promote` に委譲する。

## 課題

- README.md の参照先（`docs/specs/system.md`）を現行構造の該当 SPEC に更新する（原因分類: 確認済 — docs/specs 配下の実体確認済、system.md は存在せず）
- `system.md`、`patterns.md` に相当する SPEC が現行どのファイル・ディレクトリに移動したかを特定する（原因分類: 仮説 — foundations 等のサブディレクトリへ分割移動された可能性）
- `specs-existence` チェックの期待値リストを現行構造へ合わせるか、欠落 SPEC を復元するか（原因分類: 不明 — 設計判断を要する）

## 根拠

`docs/specs/` 配下の実体確認結果（`Get-ChildItem docs\specs`）:

- サブディレクトリ: authoring, commands, foundations, integrity, local, quality, responsibilities, skills, workflows
- ファイル: README.md のみ
- `system.md`、`patterns.md` は存在しない

## 観測元

- `/repo/docs-check` 実行（2026-06-28）
- 検出カテゴリ: Specs（`specs-existence` NG 2件）、LinkIntegrity（`broken-file-link` NG 1件）
