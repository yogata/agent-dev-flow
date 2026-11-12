# IR-055 baseline JSON の pattern 表記（repo-*）と checker 現行 evidence（repo-local）の正規化差による外部突合スクリプトの見かけ上の count diff

## 観測事実

- Case #4005（PR #4020 本文 Findings/intake 候補）で記録。IR-055 baseline JSON の pattern 表記（`repo-*`）と checker の現行 evidence（`repo-local`）の正規化差により、外部突合スクリプト側で見かけ上の count diff が出る。checker 自身の delta 判定は新規 0 で正しく、突合実装側の正規化の注意知見。

## 処置候補

- baseline entries と checker evidence の正規化規則の明文化（突合実装時の注意書き）の追加を promote 判断で評価する。本 Case の受入では checker 自身の判定（40 baseline-known・新規違反 0）を正とした。

## 関連

- Case #4005・PR #4020（検証差分 #8 IR-055 基線突合）・check_integrity.ts RuntimeReference（IR-055）
