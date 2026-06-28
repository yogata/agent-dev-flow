## 観測内容
2026-06-28 の `/repo/docs-check` 実行で以下の NG 検出があった（main リポジトリ）。

- Specs カテゴリ（`specs-existence`）: `docs/specs/system.md`、`docs/specs/patterns.md` の不存在を NG 検出
- LinkIntegrity カテゴリ（`broken-file-link`）: `README.md` から `docs/specs/system.md` へのリンク切れを NG 検出

`docs/specs/` 配下の実体確認結果: サブディレクトリ（authoring, commands, foundations, integrity, local, quality, responsibilities, skills, workflows）と `README.md` のみが存在し、`system.md`、`patterns.md` は存在しない。`docs/specs/` はサブディレクトリ構造に再編成済みだが、README.md は再編成前の旧パス `docs/specs/system.md` を参照したままである。実体は `docs/specs/foundations/system.md` に移動済み（要確認済み）。

既存の worktree 由来 item（`2026-06-27-epic1288-wave1-worktree-docs-specs-ng.md`）が扱った worktree 固有の問題とは文脈が異なる。

## 影響
リンク切れは UX 劣化を招き、ユーザーがシステム仕様（system.md）に到達できない。broken link は早急是正対象。

## 課題
以下の 3 点を解決する。

1. README.md の参照先（`docs/specs/system.md`）を現行構造の該当 SPEC（`docs/specs/foundations/system.md` 等）に更新する
2. `system.md`、`patterns.md` に相当する SPEC が現行どのファイル・ディレクトリに移動したかを特定する
3. `specs-existence` チェックの期待値リストを現行構造へ合わせるか、欠落 SPEC を復元するかの設計判断

## 既存要件との関連
なし
