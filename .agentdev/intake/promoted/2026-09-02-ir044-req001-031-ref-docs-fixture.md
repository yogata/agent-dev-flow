# IR-044 の REQ-001-031 参照と integrity fixture の文書・fixture 連動修正

## 観測内容

IR-044（req-spec-boundary-violation-detection）の description/triage 等に REQ-001-031 への参照が 9箇所ある。文意上は REQ-001-049 が整合候補。scripts/check_integrity.test.ts の fixture（v2:REQ-9009 系）が該当参照と連動するため、文書側修正のみでテストを壊すリスクがある。

参照の付け替えには scripts/**（fixture）の連動修正が必要で、OU-001（docs corpus 参照整合・PR #2525）の対象範囲外だった。

## 影響

IR-044 の参照が現行所有行と不整合のまま残存する（検出器の動作自体には影響しない）。

## 課題（レビューで決めること）

- REQ-001-049 への付け替えの要否（文意照合）
- scripts/check_integrity.test.ts fixture の連動修正の同時実施要否

## 既存要件・契約との関連

- IR-044（docs/designs/integrity/rules/ 配下の個別ルール詳細）、REQ-001-049（文意上の整合候補行）、scripts/check_integrity.test.ts fixture（v2:REQ-9009 系）。

## 根拠

- PR #2525 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2525 ）
