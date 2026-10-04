# intake: REQ-095-003 implementation 対応と REQ-018-002 design 対応の sidecar 追随候補

## 内容

traceability sidecar 宣言の未登録（main 同一 commit でも同値の既出 finding）。

1. **REQ-095-003 missing-implementation**: traceability sidecar 宣言が未登録。Definition PR #3428 の新行被覆に伴う sidecar 追随候補。
2. **REQ-018-002 missing-design**: design 対応が未登録。同上。

対応候補: 承認済み対象範囲外のため PR #3436 では未対応。sidecar 追随の追跡 Issue 化候補。

## 根拠

- 観測元: PR #3436（Case #3429・Epic #3425 Wave 1）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「REQ-095-003 の実装対応（traceability sidecar 宣言）と REQ-018-002 の design 対応が未登録である（main 同一 commit でも同値の既出 finding）。Definition PR #3428 の新行被覆に伴う sidecar 追随であり、本 Case の承認済み対象範囲外のため本 PR では対応しない。追跡 Issue 化候補」
- case-close 再検証（2026-10-04・E4-3 棚卸し）: REQ-018 を implementation 宣言する Design 2件は status accepted 済みで冪等除外。draft Design 候補なし
- captured_at_commit: 71e3a3f7a91457c6be3012e31068f3cd0512d3c4
