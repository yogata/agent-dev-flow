# 委譲 prompt のトレーサビリティ check 記載パスに実体がなく正規実体は src/common/skills/agentdev-traceability/scripts/src/check.ts

## 観測内容

- Case #3994（PR #3998 本文 Findings/intake 候補）で記録。委譲 prompt のトレーサビリティ check 記載パス（`.opencode/skills/repo-agentdev-integrity/scripts/check_traceability.ts`）には実体がなく、正規実体は `src/common/skills/agentdev-traceability/scripts/src/check.ts` である。
- case-run DEL-3994-1 は fail-open の代替探索で正規実体を使用して traceability check（`--req REQ-009-054`・11 pass / 0 fail）を成立させた（実行記録は PR #3998 本文検証差分セクションのトレーサビリティ行）。PR #3998 では委譲 prompt 側を修正していない。

## 影響

- 委譲 prompt の記載パスが実体不在のため、委譲先の checker 実行が常に代替探索に依存する（fail-open 経路が恒常化し、正規経路の機械工程としての確定性が低下する）。

## 課題

- 委譲 prompt テンプレート（機械工程・checker 実行の指定箇所）の記載パス是正、または checker 指定の実在確認前置の追加の要否を判断・実施する。traceability checker の正規実体パスは `agentdev-traceability` の「実行方法」契約を参照先とする。

## 既存要件との関連

- Case #3994・PR #3998 本文 Findings/intake 候補
- src/common/skills/agentdev-traceability/scripts/src/check.ts（正規実体）・agentdev-traceability（実行方法契約）
