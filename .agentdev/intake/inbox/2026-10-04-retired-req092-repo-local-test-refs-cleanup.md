# intake: 廃止済み REQ-092 を参照する repo-local テストの追随クリーンアップ候補

## 内容

repo-local テスト（.opencode/skills/repo-agentdev-integrity/scripts/ 配下）が廃止済み REQ-092-001〜REQ-092-005 を参照しており、traceability check の unknown-req-refs の一部を構成している。

対応候補: REQ 廃止後の repo-local 参照追随クリーンアップ。REQ-092 の廃止完結（Epic #3425 後続 Wave・横断追随）との整合確認を含む候補。

## 根拠

- 観測元: PR #3436（Case #3429・Epic #3425 Wave 1）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「repo-local テストが廃止済み REQ-092-001 から REQ-092-005 を参照しており（traceability check の unknown-req-refs の一部）、REQ 廃止後の repo-local 参照追随クリーンアップの候補」
- 備考: 同テストの誤仕様固定 assertion 自体は PR #3436 で現行契約へ修正済み（5 pass / 0 fail）。本候補は REQ ID 参照の追随クリーンアップ
- captured_at_commit: 71e3a3f7a91457c6be3012e31068f3cd0512d3c4
