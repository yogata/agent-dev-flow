# REQ-0145-001 監査残課題: 既存 REQ の SPEC 詳細移行（true positive）

## 発生源

- Epic: #1028 (Wave 2)
- Issue: #1032 (REQ-0145 docs-check/integrity 検出設計改善)
- PR: #1036 (merged, squash 244ea3b4)
- 発生日: 2026-06-22

## 内容

REQ-0145-001 監査（8 REQs: REQ-0101/0104/0108/0114/0124/0126/0131/0136）の結果、以下は true positive として残る:

- REQ-0114-082: Step 1/8 等 Step 番号の要件行混入
- REQ-0144-008/009: fixture 名の要件行混入
- REQ-0101-067/068/069: stable contract exception として適切（false positive）
- REQ-0108-259: delegation context として適切（false positive）

true positive（REQ-0114-082, REQ-0144-008/009 等）は #1032 の対象外（「既存 REQ の個別 SPEC 詳細移行作業（case-run で対応）」）として明記されており、別途整備 Issue が必要。

## 推奨対応先

別途整備 Issue。各 true positive の件数:
- Step 番号混入（REQ-0114-082 等）
- fixture 名混入（REQ-0144-008/009 等）

これらを一括で「既存 REQ SPEC 詳細移行」Issue として切り出すことが望ましい。

## 現在の追跡状態

- docs-check Warning: 12 → 4（PR #1036 適用後）。残り4件は本 intake の対象 true positive。
- Epic #1028 は全 Wave 完了でクローズ済み。本残課題は Epic 完了条件の対象外（「既存 REQ の個別 SPEC 詳細移行作業」は case-run で対応と明記）。
