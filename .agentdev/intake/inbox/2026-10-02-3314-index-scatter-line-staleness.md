# intake: generate_indexes.ts が docs/README.md の REQ 件数散言行を更新せず REQ 新設時に req-range-staleness が再発する（Case #3314 case-open STEP-4 由来）

- 観測元: Case #3314（case-open STEP-4）・PR #3315
- 記録日: 2026-10-02

## 発見事象

- generate_indexes.ts の索引再生成は docs/README.md の AUTOGEN ブロック（readme-req-summary-count）を自動更新するが、非 AUTOGEN の散言行「現行要件はN件である。」は更新対象外。REQ-099 新設時、AUTOGEN count 61 へ更新済みにもかかわらず散言行が 60 のまま残り、check_integrity req-range-staleness が新規 NG として検出された（本 Case の Definition PR で手動修正済み）
- REQ-098 新設（PR #3312、2026-10-02）でも同様の手動更新（59→60）が必要だった。REQ 新設 Case で2回連続の再発
- learning entry を `.agentdev/learning/inbox.md`（2026-10-02 case-open Case #3314 分）へ並行記録済み（Split Rule による分割保存）

## 修正対象候補

- generate_indexes.ts の更新範囲へ docs/README.md 散言行の REQ 件数記述の自動更新を追加する、または req-range-staleness 検出時の案内文へ散言行の更新指示を明記する
- 併せて index-auto-generation.md（索引類自動生成 Design）の対象範囲定義との整合を確認する
