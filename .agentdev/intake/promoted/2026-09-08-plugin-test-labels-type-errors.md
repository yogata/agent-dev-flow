# plugin.test.ts の labels プロパティ型エラー3件の修正

## 観測内容

`src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts` L56/58/61 に TS2339（`labels` プロパティ不存在）の型エラーが3件存在する。main 由来の既出（03f75b04 / PR #2676 系）であり、実行時テストは 7/7 成功しており動作への影響はない。labels schema 型整合は Issue #2663 由来の別課題として記録済み（record-in-findings）である。

## 影響

- plugin パッケージの型検証で常態化したエラーとなり、新規型不整合の検出妨げになる
- `bun run typecheck` を plugin パッケージの品質統制に組み込む判断の阻害要因

## 変更候補

- plugin.test.ts の labels プロパティ参照を現行 schema 型に整合させる修正を後続 Issue で実施する（#2663 系の labels schema 課題と一体で判断）
- `bun run typecheck` を plugin パッケージの品質統制に組み込むかどうかの判断材料とする

## 既存要件・成果物との関連

- Issue #2663（labels schema 型整合の由来課題。本項との一体判断候補）
- `src/opencode/plugins/agentdev-gh-tool/plugin.ts`（公開スキーマ、Epic #2686 で16操作対応済み）
- backlog-review で #2663 既有課題との統合・重複判定を行うこと

## 出所

- 元 intake item: `2026-09-08-plugin-test-type-errors-preexisting-2683.md`（PR #2684 Findings/Capture候補由来、Issue #2683・Epic #2681 Wave 1）
