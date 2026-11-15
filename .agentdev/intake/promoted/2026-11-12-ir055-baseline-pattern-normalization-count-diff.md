# IR-055 baseline JSON の pattern 表記（repo-*）と checker 現行 evidence（repo-local）の正規化差による外部突合スクリプトの見かけ上の count diff

## 観測内容

- Case #4005（PR #4020 本文 Findings/intake 候補）で記録。IR-055 baseline JSON の pattern 表記（`repo-*`）と checker の現行 evidence（`repo-local`）の正規化差により、外部突合スクリプト側で見かけ上の count diff が出る。checker 自身の delta 判定は新規 0 で正しく、突合実装側の正規化の注意知見。
- 本 Case の受入では checker 自身の判定（40 baseline-known・新規違反 0）を正とした。

## 影響

- 外部突合スクリプトを実装する際、正規化規則の差異を考慮しないと見かけ上の count diff が誤検出として報告され得る。checker 自身の判定には影響しないが、突合実装側の注意書きが未整備。

## 課題

- baseline entries と checker evidence の正規化規則の明文化（突合実装時の注意書き）の追加の要否を判断する。

## 既存要件との関連

- Case #4005・PR #4020（検証差分 #8 IR-055 基線突合）・check_integrity.ts RuntimeReference（IR-055）

## 突合対象

- 2026-11-14-adf-survey-n09-ir055-baseline-counting.md は同 IR 領域の計数訂正記録として promote 判定で却下済み（修正対象なし・訂正完了・証跡は Issue #4026 コメント 6855025626・6860233995）。本 item の正規化規則明文化との関連は別論点。
