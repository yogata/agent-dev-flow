# check_integrity.ts が typecheck 対象外で既存 type error 3 件が存在する

## 観測

check_integrity.ts は tsconfig.distribution-boundary.json の typecheck 対象外であり、既存の type error 3 件（L5448 JunctionIntegrity category、L7601 NgBaselineEntry missing fields、L8691 CliOptions unresolved）が存在する。PR #2265 の変更 hunk 外であり、bun 直実行構成のため実行時影響はない。

## 今回扱わない理由

本 Issue（#2210）は IR-055 狭域化の checker 実装準拠がスコープ。typecheck 対象の拡張は別課題として検討候補に留める。

## 影響

check_integrity.ts の型 regression が typecheck で検出されず、テスト（check_integrity.test.ts）での実行時検出に依存する。

## レビューで決めること

- check_integrity.ts（および同格の checker スクリプト群）を typecheck 対象へ含めるか
- 含める場合、既存 type error 3 件の解消を前置要件とするか

## 根拠

- PR 2265 本文「Findings / Capture候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2265）
