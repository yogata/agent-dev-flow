# isBehaviorPredicateContext が件数・内容規定を検出しない既知制限（IR-044 exemption）

## 発生源

- Issue: #1111
- PR: #1121 (merged, squash 4eb008b6)
- 発生日: 2026-06-24

## 観測

`check_integrity.ts` の `isBehaviorPredicateContext`（REQ-0108-259 実装）は存在・状態述語と drift 対象種別修飾語（fixture / variant / provider / baseline / drift）の厳密 AND で免除を判定する。SPEC カタログ（`docs/specs/integrity-rule-catalog.md` IR-044 exemption 境界ケース、行 962）は「種別修飾語に加えて件数・内容を規定する記述が含まれる場合は免除しない」と定めるが、実装はこの件数・内容規定を明示的に検出しない。

具体例: 「fixture 仕組みが存在する（3件以上）」のような件数規定を含む行は SPEC 上は免除対象外だが、現行実装では免除される。

## 今回扱わない理由

現状の偽陰性報告は無く、SPEC 境界ケースの機械的検出は後続リファインメント対象。本 Issue（#1111）は偽陽性 2 件（REQ-0101-067, REQ-0144-009）の免除をスコープとし、件数検出ガードは別作業とした。

## 影響

件数・内容規定を含む振る舞い要件行が誤って免除されるリスクがある。ただし現在の REQ 群では該当偽陰性は観測されていない。

## レビューで決めること

- 件数・内容規定を検出するガード句を `isBehaviorPredicateContext` に追加するか
- 追加する場合、検出パターンの候補（「N件以上」「N以上」「N件」「内容:」等）を SPEC へ列挙するか
- 偽陰性が実運用で観測されるまで見送るか

## 関連

- `isMetaScopeRuleContext` regex 正規化候補（PR #1121 SPEC確定候補 #1、reference note）：将来 SPEC が predicate を正式化する場合、`check_integrity.ts:3689-3698` が正規定義。本 intake と併せて評価可能。
- 5 pre-existing test failures（PR #1121 Findings #2）：既存 intake `2026-06-24-issue1109-check-integrity-test-preexisting-5fail.md` と重複するため本 intake では再記録しない。

## 根拠

PR #1121 本文「SPEC確定候補」セクション #2（`isBehaviorPredicateContext` quantity/content limitation）。Step 3-2 (c) 見送りにより Findings/Capture候補 として記録。
