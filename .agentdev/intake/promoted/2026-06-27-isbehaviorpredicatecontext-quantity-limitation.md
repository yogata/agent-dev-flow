# isBehaviorPredicateContext が件数・内容規定を検出しない既知制限（IR-044 exemption）

## 発生源

- Issue: #1111
- PR: #1121 (merged, squash 4eb008b6)
- 発生日: 2026-06-24

## 観測内容

`check_integrity.ts` の `isBehaviorPredicateContext`（REQ-0108-259 実装）は存在・状態述語と drift 対象種別修飾語（fixture / variant / provider / baseline / drift）の厳密 AND で免除を判定する。SPEC カタログ IR-044 exemption 境界ケース（行 962）は「種別修飾語に加えて件数・内容を規定する記述が含まれる場合は免除しない」と定めるが、実装は件数・内容規定を明示的に検出しない。

具体例: 「fixture 仕組みが存在する（3件以上）」のような件数規定を含む行は SPEC 上は免除対象外だが、現行実装では免除される。

## 影響

件数・内容規定を含む振る舞い要件行が誤って免除されるリスクがある。ただし現在の REQ 群では該当偽陰性は観測されていない。優先度は低い。

## 課題

- 件数・内容規定を検出するガード句を `isBehaviorPredicateContext` に追加するか
- 追加する場合、検出パターンの候補（「N件以上」「N以上」「N件」「内容:」等）を SPEC へ列挙するか
- 偽陰性が実運用で観測されるまで見送るか

## 既存要件との関連

- REQ-0108-259（isBehaviorPredicateContext 実装）
- IR-044 exemption 境界ケース（`docs/specs/integrity/integrity-rule-catalog.md` 行 962）
- `check_integrity.ts:3689-3698`（将来 SPEC が predicate を正式化する場合の正規定義）
- 関連: `isMetaScopeRuleContext` regex 正規化候補（PR #1121 SPEC確定候補 #1）

## 対応方針候補

- 偽陰性観測まで見送る、または予防的にガード句を追加して SPEC へ検出パターンを列挙する
