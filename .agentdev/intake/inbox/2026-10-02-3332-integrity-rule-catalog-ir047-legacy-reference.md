# intake: integrity-rule-catalog.md の IR-047 参照の陳腐化（Case #3316 Epic Wave 3 Issue #3324 検出分）

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3324 case-close（PR #3332・TS-011 残存検索の Findings 記録）
- 記録日: 2026-10-02

## 発見事象

1. **REQ-099 スコープ外の陳腐化**: `docs/designs/integrity/integrity-rule-catalog.md` の IR-047 参照は REQ-051 で Decision 移行済み旧 IR の遺物である
2. PR #3332 では REQ-099 スコープ外のため修正せず Findings 記録として分類

## 修正対象候補

- integrity-rule-catalog.md の IR-047 参照の除去または Decision 移行先への参照更新（単純な記述修正。docs 系の小規模対応）
