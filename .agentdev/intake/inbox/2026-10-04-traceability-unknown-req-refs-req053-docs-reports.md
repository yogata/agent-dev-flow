# intake: traceability check の unknown-req-refs が docs/reports/req-053-textlint-*.md で fail 継続（調査候補）

## 内容

docs/reports/req-053-textlint-*.md（5 ファイル、REQ-053-013〜038 参照 16 件）の Report 文書内要件行参照が、現行 REQ-053 行と不整合の可能性がある。docs/reports は確定済み監査記録であるため実行 Case では対応せず、調査候補として回収する。backlog-review での分類判断用。

Epic #3440 Wave 2 の case-close 独立再検査（3 PR 分の traceability check）でも同一 16 findings を確認しており、base 80c04928 の既知 baseline と完全一致する（pre-existing・対象範囲外として記録済み）。Wave 1（Case #3442・PR #3448）でも同主題の learning エントリ（`.agentdev/learning/inbox.md`「REQ-053 系 wave レポートの参照が REQ 行の廃止・移管時に追随していない可能性」）が存在する。なお PR #3452 の learning 申告には「REQ-053 系の解消は対象範囲外のため追跡 Issue 起票等の判断は case-close に委ねる」とあるが、本 capture では追跡 Issue 起票判断を行わず intake-promote / backlog-review 経路に委譲する。

## 根拠

- 観測元: PR #3451（Case #3445・Epic #3440 Wave 2）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「traceability check の `unknown-req-refs` が docs/reports/req-053-textlint-*.md（5 ファイル、REQ-053-013〜038 参照 16 件）で fail 状態にある（base 既出）。Report 文書内の要件行参照が現行 REQ-053 行と不整合の可能性。docs/reports は確定済み監査記録のため本実行では対応せず、調査候補として記録」
- 補足: PR #3450 / #3452 の case-close 独立再検査でも同一 16 findings を再現確認（base baseline と一致）
- captured_at_commit: a84c13e5b912c015c31e571d768a20de993e16f8
