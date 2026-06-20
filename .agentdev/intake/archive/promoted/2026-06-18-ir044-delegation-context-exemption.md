# IR-044 の false positive 抑制に「委譲/集約/切り出し/存在要件」文脈 exemption 拡張が有効

## 観測

Issue #903 (RU-5) で IR-044（REQ/SPEC 境界違反検出）を既存 active REQ に稼働したところ、15 件中 9 件が false positive だった。これらは SPEC 詳細ではなく「委譲先/集約先/切り出し状況の検証要件」「routing 要件の経路分類名」などで SPEC キーワード（fixture/checker 等）が現れる文脈。現行の IR-044 は否定文脈（`isNegationContext`）の exemption のみを持ち、委譲文脈の exemption がないためこれらが warning 残留している。

## 影響

- IR-044 の warning が true positive と false positive で混在し、Delta/Impact/Full Audit gate の結果判読性が下がる
- REQ-0136-017 の cleanup 運用で毎回 9 件の既知 false positive を目視除外する手間が発生する

## レビューで決めること

- IR-044 (`check_integrity.ts` の `req-spec-boundary-violation`) に「委譲/集約/切り出し/存在すること」文脈の exemption（既存 `isNegationContext` と同列の `isDelegationContext` 等）を追加するか
- exemption 対象キーワードの精緻化（誤って true positive を免除しない閾値設計）

## 根拠

- PR #916: https://github.com/yogata/agent-dev-flow/pull/916 (Findings / Capture候補 + cleanup plan exempt 9件)
- Issue #903: https://github.com/yogata/agent-dev-flow/issues/903
- クリーンアップplan: `.agentdev/drafts/req-spec-cleanup-plan.md`（exempt 9件の残留根拠）
- 関連: REQ-0136-006 (IR-044), `check_integrity.ts` (`isNegationContext` 実装)
