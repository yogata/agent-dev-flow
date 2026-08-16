# Intake Item: retired-req-primary-ref の監査記録・AUTOGEN に対する免除規定の欠落

## 発生源

- PR: #2172 (Issue #2163 / OU-006, Epic #2162 Wave 1)
- 発生 phase: case-run 検証（check_integrity 実行）
- capture 分類: intake（検出規則の改善候補）

## 問題

`retired-req-primary-ref`（LifecycleBoundary warning）は行単位の退職語彙ヒューリスティック（RETIREMENT_CONTEXT_RE）で判定されるため、監査記録（docmap-reference-audit.md 等）の「根拠 REQ」としての言及を履歴文脈と識別できない。規則5（監査記録・baseline は履歴文脈注記付き維持優先）で維持した参照が warning として検出され続ける。

## 推奨対応

監査記録・AUTOGEN に対する免除規定の検討を checker-execution-contracts SPEC（検出対象除外規定）へ提案する。要件化の際は RETIREMENT_CONTEXT_RE の拡充か、ファイル種別（audits/、baselines/、AUTOGEN ブロック）ベースの免除判定のいずれかを比較検討する。

## 関連

- Issue: #2163 (CLOSED), Epic: #2162
- PR: #2172 (Findings / Capture候補 セクション intake 1件目)
- 規則5 の出所: AG-007（RU-0017 合意、Epic #2162 提案内容）
