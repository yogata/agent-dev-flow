---
intake_type: workflow-observation
source_case: "#3085"
source_workflow: case-close
observed_at: 2026-09-24T02:46:00+09:00
status: unclassified
---

# 観測: IR-055 baseline 取り込み後も残存する warning 8件の継続観察（case-close #3085 QG-4 で実観測）

## 観測内容

case-close #3085（PR #3095 squash merge 610fafd5）の QG-4 で post-merge main の IR-055 全体再計測（`check_integrity.ts --profile source --json`）を実施した結果、run3 由来 8件の baseline 登録により delta 0件・新規 violation 0件・ng 0件を確認した一方、**baseline 取り込みの対象外として warning 8件が残存**していることを実観測した。

- 残存内訳: `Decision/accepted-adr-only-citation` ×7、`CanonicalConflict/gh-direct-invocation` ×1
- 計測値: RuntimeReference（IR-055）計 37 = info 36 + ok 1（delta 0 / new violation 0 / profile source）
- 本 Case のスコープは run3 由来 heuristic 検出 8件の baseline 登録であり、上記 warning 8件は対象外（PR 本文 Findings 記録・継続観察として処理）

## 候補改善（要判断）

- warning クラス（baseline 取り込み対象外）が運用回次で蓄積する構造かの確認と、warning 自体の棚卸し周期（baseline ratchet は delta 管理に限定され、絶対数の増加は検知されない）
- `accepted-adr-only-citation` ×7 の個別内容確認（Decision 引用形式の体裁問題か、実体のある参照欠落かの分類）
- `gh-direct-invocation` ×1 の正規経路（agentdev_gh）迂回実態か、検証用の一時実行かの確認

## 関連

- Case #3085 / PR #3095（squash 610fafd5、2026-09-24T02:38:59+09:00 merge）
- SSoT: Issue #3085 コメント #issuecomment-5799978597（case-close 実装記録・QG-4 PASS 根拠）
- 観測実施: case-close 委譲から orchestrator（Sisyphus）への引き継ぎ分として回収（2026-09-24）
