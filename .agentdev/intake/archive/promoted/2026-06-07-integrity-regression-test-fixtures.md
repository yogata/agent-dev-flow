# integrity-check regression test fixture 追加

- **発見元**: PR #558 (Issue #552) / integrity-check反転実装時
- **内容**: 新規検査項目（ADR status正規化/RU-ID検出/6状態/Pattern残存）に対する regression test fixture が未追加。REQ-0108-055 に基づき別途対応推奨
- **分類**: test (テストカバレッジ)
- **提案**: 各新検査項目に対する test fixture を追加し、regression を防止
- **優先度**: medium
- **関連**: REQ-0108-055, check_integrity.ts
