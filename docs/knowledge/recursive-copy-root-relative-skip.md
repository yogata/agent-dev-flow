---
title: 再帰コピーの skip 判定は root 起点の相対パスで行う（再帰レベルごとの path.relative 計算は壊れる）
created: 2026-09-30
updated: 2026-09-30
---

## 知識内容

copyTree 型の再帰コピー・再帰列挙では、除外（skip）判定に使う相対パスを各再帰レベルで `path.relative` により計算してはならない。再帰先ディレクトリ基準の相対パスは root 起点の除外プレフィックス（`tests/`、`vendor/` 等）と一致しなくなり、除外が効かない。相対パスは root 起点で一度計算して再帰呼出へ伝播させる。また skip 判定はファイル形式とディレクトリ自体（末尾スラッシュなしの名前）の両形式を扱う。

## 適用条件

- 再帰コピー・再帰列挙の実装で exclude プレフィックス判定を相対パス比較で行う場合
- テスト fixture や配布物コピー等、除外対象ディレクトリ配下の残留が検査で検出されるべき場面

## 適用対象

- 配布物コピースクリプト・類似 util の実装時の判断基準（scripts/self/release/ 系、package-release-archive 系）
- 再帰列挙を含む検査・生成スクリプトの設計レビュー観点

## 根拠

- Case #3236（PR #3238、TS-005 配布検査の fix）: `path.relative` を各再帰レベルで計算した結果、fixture への test ファイル残留を検出すべき TS-005 テストが初回 4 fail。従来の `tests/` 除外は fixture に test ファイルが残留していても検査が壊れないため潜在化していた
- 修正（commit ba6bc9bb）: root 起点相対パスの伝播方式へ変更し、ディレクトリ自体の除外を追加。最終 HEAD で 8 pass / 0 fail を再確認

## 関連知識

- [windows-powershell-bulk-io-corruption.md](windows-powershell-bulk-io-corruption.md)（Windows 環境のファイル I/O 系知見。本知見は OS 非依存のパス計算基準の知見）
