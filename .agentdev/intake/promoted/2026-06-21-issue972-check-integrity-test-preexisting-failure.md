# check_integrity.test.ts の既存テスト5件が main 時点で失敗（fixture 経年劣化）

## 観測

`scripts/tests/check_integrity.test.ts` の既存テスト5件が main ブランチ時点で失敗している。IR-044 新規テストとは独立して残存。valid fixture テスト（exit code/ng count）と Classification Policy テストが失敗しており、フィクスチャ期待値と実装の経年乖離が原因。

## 影響

- IR-044 新規テスト7件は合格するが既存5件が赤のため `bun test` 全体が赤
- 今後 integrity スクリプト変更時に「既知の赤」を除外判断するコストが発生

## 課題

- フィクスチャ経年劣化の一括修正要否
- Classification Policy 期待値の整理（テスト側更新か実装側更新か）

## 既存要件との関連

- IR-044 実装のテスト品質（間接的）
- REQ-0108（regression test 信頼性・fixture copy）

## 根拠

- 元 inbox item: `2026-06-21-issue972-check-integrity-test-preexisting-failure.md`
- Issue #972 / PR #976
