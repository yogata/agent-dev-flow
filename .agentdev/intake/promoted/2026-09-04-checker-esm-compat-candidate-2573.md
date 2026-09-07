# repo-agentdev-integrity checker 群の ESM 互換化

## 観測内容
PR #2586（Issue #2573）で、複数 checker が CommonJS API（`require.main`、`require`）を含み、ESM import 経由では ReferenceError となることが実証された。

## 影響
安定実行経路を import 経由へ統一できず、checker ごとに CLI 例外経路へ依存する。

## 課題
`import.meta.main`、`node:module` の `createRequire` 等を含む ESM 互換化の方針を checker 全体へ適用するか、実行契約へ互換性要件を追記するかを判断する。

## 既存要件・正規成果物との関連
Issue #2573、PR #2586（3f878ae1）、checker-execution-contracts Design。learning 側の近縁記録とは別の具体的反映候補。
