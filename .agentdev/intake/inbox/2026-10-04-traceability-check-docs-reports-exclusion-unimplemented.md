# intake: traceability check の docs/reports 除外未実装（歴史記録内 REQ 行 ID が unknown-req-refs に計上され続ける）

## 内容

REQ-053-039 が歴史記録（docs/reports/・retired/）を是正対象外と契約するが、traceability check の unknown-req-refs は reports 内の REQ 行 ID を計上し続ける（PR #3439 時点で 16件。REQ-053-013〜038 系が docs/reports/req-053-textlint-*.md L10 に歴史記録として残存）。

checker 側の REQ-053-039 除外実装の候補。reports 除外は未実装の既知限界として PR #3439 検証差分に記録済み。

対応候補: traceability check（corpus 取得）に docs/reports/ 除外（または REQ-053-039 保持契約に基づく対象外分類）を実装する。

## 根拠

- 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「REQ-053-039 が歴史記録（docs/reports/・retired/）を是正対象外と契約するが、traceability check の unknown-req-refs は reports 内の REQ 行 ID を計上し続ける（本 PR 時点で 16件）。checker 側の REQ-053-039 除外実装の候補」
- 備考: 無効分類として case-close 検証差分に記録済み（歴史記録保持契約による是正対象外）
- captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
