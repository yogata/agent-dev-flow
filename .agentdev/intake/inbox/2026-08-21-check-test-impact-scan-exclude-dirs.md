# check_test_impact.ts の SCAN_EXCLUDE_DIRS と現行ディレクトリ配置の乖離（依存パッケージのテストファイル約160件が走査対象）

## 観測
`check_test_impact.ts` の走査除外リスト SCAN_EXCLUDE_DIRS は `node_modules/` をルート直下のみ前提とする先頭一致のため、`src/opencode/skills/*/scripts/node_modules` 配下の依存パッケージ（zod 等）のテストファイル約 160 件が tests_scanned（455 件）に含まれる。移行前から同様であり、PR 2357 では列挙契約維持のためそのまま保持した。

## 今回扱わない理由
Issue 2353 の完了条件は移行前後の列挙契約維持であり、除外リストの変更は列挙対象ファイル集合の契約変更になるため本 PR のスコープ外。

## 影響
tests_scanned が依存パッケージ由来のテストで膨らみ、テスト影響解析の精度・実行時間に影響する可能性がある。現状は正常動作。

## レビューで決めること
- 除外リストを任意階層の node_modules を除外する一致へ更新するか、依存パッケージのテストを含めたまま妥当とするか

## 根拠
- PR 2357 本文「Findings / Capture候補」4件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2357）
