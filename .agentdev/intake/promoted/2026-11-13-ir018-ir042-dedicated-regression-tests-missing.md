# IR-018・IR-042 の専用回帰試験未実装（verification_path が check_integrity.test.ts 全体を指す）

## 観測内容

- Case #4026 Wave 1（PR #4039）の 65 規則分類確定で、IR-018（req-range-notation-freshness）・IR-042（hardcoded-req-count）は machine-check に分類されているが、専用の回帰試験（fixture 試験）が未実装で、verification_path が check_integrity.test.ts 全体を指す状態のまま分類確定された。
- PR #4039 本文 Findings で専用 fixture 試験の追加は是正候補として申告済み。

## 影響

- machine-check 分類の規則に専用回帰試験がなく、verification_path が全体指し示しのため回帰検出の確定性が低い。IR-074（分類機械検査）のパス実在・IR ID 参照一致検査との整合も限定試験の不在のまま。

## 課題

- IR-018・IR-042 の検出関数に対する専用 fixture 試験（違反パターン・適合パターンの最小 fixture）を追加し、verification_path を専用試験へ限定する。
- IR-074（分類機械検査）のパス実在・IR ID 参照一致検査との整合を維持する。

## 既存要件との関連

- Case #4026・PR #4039 本文 Findings / Capture候補（DEL-4029-1）
- IR-018・IR-042・IR-074（docs/designs/integrity/rules/）
