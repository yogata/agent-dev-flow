# 「Amendment PR」単体表記の表記統一対象への採否

## 観測

用語統一 Case #3500（PR #3505、merge commit 9fbbbc4a）の表記揺れ統一では「Definition PR」→「設計PR」、「Definition Amendment PR」→「設計修正PR」、「実装 PR」→「実装PR」の 3 語を置換対象としたが、「Amendment PR」単体表記が case-auto command・docs/designs/workflows/v4-lifecycle-state-machine.md・case-revise 関連 SKILL 等に残存している。「Amendment PR」は「Definition Amendment PR」の略記表現であり、本 Case の置換対象語（完全一致の固定置換）に含まれないため未処置のまま main へ反映された（main HEAD cd14227e 時点）。

## 影響

- 「設計修正PR」へ統一済みの概念を、略記「Amendment PR」で参照する現行文書が存在し、表記統一の網羅性が完全でない
- prh 固定置換辞書は「Definition Amendment PR」の完全形のみ登録のため、略記単体の出現は置換候補として指摘されず、将来の執筆で再び増殖し得る

## レビューで決めること

- 「Amendment PR」単体表記を表記統一対象へ含めるか（「設計修正PR」への置換）、または略記を許容するかの採否判断
- 採用する場合の対象範囲（case-auto command・v4-lifecycle-state-machine.md・case-revise 関連 SKILL 等）と prh 辞書への略記登録の要否

## 根拠

- PR #3505 本文「Findings/ Capture候補」セクションの intake 候補記録（「Amendment PR」単体表記が case-auto command・v4-lifecycle-state-machine.md・case-revise 関連 SKILL 等に残存）
- Case #3500・PR #3505（merge commit 9fbbbc4a）・fix PR #3506（merge commit cd14227e）
- REQ-083-003（現行名称「設計PR」「設計修正PR」の定義行）
