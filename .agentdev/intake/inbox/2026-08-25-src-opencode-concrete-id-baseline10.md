# src/opencode 配下 concrete-id 違反 10件（baseline 維持）の配布境界解消

## 観測

配布依存境界 detector（--profile source）で src/opencode/tools、src/opencode/plugins 配下に concrete-id 違反 10件（REQ/DEC ID を含むコメント・README）を検出する。Epic 2436 Wave 1（PR 2440）では新規違反ゼロ・baseline 同数維持（case-run と case-close の最終 gate delta guard で機械確認済み）。

## 今回扱わない理由

既存違反は配布境界の解消案件として別途処理する性質のものであり、当該 Case の完了条件（新規違反ゼロ）の範囲外。delta guard の baseline 運用で管理されている。

## 影響

配布ソース面に producer-internal 参照（REQ ID）が残存し続ける。baseline が維持される限り gate は通過するが、違反数が増減した際の由来分類コストが継続する。

## レビューで決めること

- concrete-id 10件の一括抽象化（コメント・README からの REQ ID 除去）を独立した整備 Case として実施するか
- 実施する場合の優先度と対象範囲（tools のみか plugins を含むか）

## 根拠

- PR 2440 本文「Findings / Capture候補」intake 2件目
- case-close E4-1 最終 gate delta guard 結果（current 11 = baseline 11、新規 0）
