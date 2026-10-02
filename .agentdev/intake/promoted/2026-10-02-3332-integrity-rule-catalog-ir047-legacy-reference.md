# intake: integrity-rule-catalog.md の IR-047 参照の陳腐化

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

- `docs/designs/integrity/integrity-rule-catalog.md` の IR-047 参照は REQ-051 で Decision 移行済み旧 IR の遺物である
- PR #3332 では REQ-099 スコープ外のため修正せず Findings 記録として分類

## 影響・課題

- 廃止済み IR への言及が integrity ルール体系の正典（catalog）に残存し、参照整合性を損なう

## 既存要件・成果物との関連

- docs/designs/integrity/integrity-rule-catalog.md
- REQ-051（IR-047 の Decision 移行元）

## 対応候補

- integrity-rule-catalog.md の IR-047 参照の除去または Decision 移行先への参照更新（単純な記述修正。docs 系の小規模対応）

## 元 item

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3324 case-close（PR #3332・TS-011 残存検索の Findings 記録）
- 記録日: 2026-10-02
