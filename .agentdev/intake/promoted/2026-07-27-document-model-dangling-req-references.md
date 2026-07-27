# document-model.md の REQ-001-056/058 参照不整合

## 観測内容

`docs/specs/foundations/document-model.md` の L27 と L139 には、未割当だった REQ-001-058 と REQ-001-056 への参照が以前から存在した。
commit `ed9ceb56` で REQ-001-056 から REQ-001-060 が別の意味を持つ要件として追加されたため、dangling 参照が文意不一致の参照として顕在化した。
L27 の文は REQ-001-058 の「意味変更6件」と一致せず、L139 の retire 判定基準は REQ-001-056 の「accepted ADR の意味的不変」と一致しない。

## 影響

参照 ID に実体があるため機械的な存在確認では検出しにくく、読者が誤った要件を正規根拠として解釈する可能性がある。

## 課題

二つの文に対応する正しい REQ ID が未確定である。

## 既存要件、仕様との関連

- `docs/specs/foundations/document-model.md` L27、L139
- REQ-001-056
- REQ-001-058
- commit `ed9ceb56`
- PR #1819、Issue #1816、Epic #1812

## 対応方向

L27 は REQ-001-001 周辺、L139 は REQ-001-053 周辺を候補として正規要件を確認し、参照を修正する。
候補は未確定であるため、文意確認を経て変更する。

## 発生源

PR #1819 の Findings / Capture候補。
