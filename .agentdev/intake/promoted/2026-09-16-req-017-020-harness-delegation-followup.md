# harness-delegation.md への REQ-017-020 追随反映候補

## 観測
配布物 references（harness-delegation.md「structured_context の SSoT 抽出と突合検査」節）は REQ-017-019 のみを再述し、REQ-017-020（正典導出補助情報の機械突合・実行側正典優先）は未反映。原本仕様ポインタ型のため現時点で矛盾はない（docs-only スコープによる意図的省略、PR #2889 context mining レーン発見）。

## 今回扱わない理由
REQ-017-020 の対象範囲（REQ 行 + delegation-contracts.md Design 節）に配布物 references の更新は含まれず、Issue #2884 の execution contract 上の対象外。配布物への波及は本 Case では判断しない。

## 影響
REQ-017-020 が委譲契約の消費者全体へ完全に到達するためには、harness 側 references への追随反映が将来必要になる可能性がある。未反映のままでも原本ポインタ型のため機能欠落は生じない。

## レビューで決めること
harness-delegation.md「structured_context の SSoT 抽出と突合検査」節への REQ-017-020 適用形（正典導出補助情報の機械突合・実行側正典優先）の追随反映要否。反映時は verification-scope-catalog.md の REQ-017-020 行検証基準（「委譲契約 Design との整合確認」）への配布物 references 追加をセットで行うこと。

## 根拠（任意）
Issue #2884 / PR #2889 の Findings 記録（case-run DEL-2884-1、context mining レーン）。REQ-017-020 行（docs/requirements/REQ-017.md）。

## intake-promote 確定注記（2026-09-18、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用」で自律確定した（観測正確: harness-delegation.md の当該節は REQ-017-019 のみ再述、意図的省略・現時点の機能欠落なし・矛盾なし）。

- 本 item は「将来の追随反映候補」の性質を持つ（原本ポインタ型のため未反映でも機能欠落なし）。backlog-review で保留（育成対象）と判定される可能性が高いことを明示しておく。反映要否の判断は backlog-review の正規 HITL に属する。
