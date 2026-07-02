# valid fixture 系テスト失敗5件の調査

## 観測内容

PR #1119（ir044-req-correction REQ-0144-008/082 IR-044 WARNING=0）の検証過程で、`check_integrity.test.ts` の valid fixture 系5件が main ブランチでも同一に失敗することが確認された。CanonicalBoundary や CaptureBoundary の既存 NG に起因する可能性がある。

## 影響

- `check_integrity.test.ts` の valid fixture 系5件（「exits with code 0」「has zero ng results」、Classification Policy 系3件）が main ブランチでも失敗している状態
- valid fixture が一部検査で NG を出す状態

## 課題

- `check_integrity.test.ts` の valid fixture 系5件の原因調査と修正
- CanonicalBoundary / CaptureBoundary の既存 NG との関係確認

## 既存要件との関連

- REQ-0144-008 / REQ-0144-082 / IR-044 WARNING=0: PR #1119 の関連要件
- 本 item は `2026-07-02-epic1363-pr1366-check-integrity-test-3-fails.md` と同一テストファイル（`check_integrity.test.ts`）の既存失敗であり、統合推奨

## 観測元

- PR #1119 (ir044-req-correction REQ-0144-008/082 IR-044 WARNING=0)
