# valid fixture 系テスト失敗5件の調査

## 観測

PR #1119（ir044-req-correction REQ-0144-008/082 IR-044 WARNING=0）の検証過程で、`check_integrity.test.ts` の valid fixture 系5件が main ブランチでも同一に失敗することが確認された。CanonicalBoundary や CaptureBoundary の既存 NG に起因する可能性。

## 根拠

PR #1119:

> - **既存テスト失敗5件（本 PR 起因以外）**: `check_integrity.test.ts` の "valid fixture > exits with code 0"、"valid fixture > has zero ng results"、Classification Policy 系3件は main ブランチでも同一に失敗する。valid fixture が一部検査で NG を出す状態（CanonicalBoundary や CaptureBoundary の既存 NG に起因する可能性）。別 Issue での調査推奨。
