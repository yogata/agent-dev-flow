# inspect-skills SKILL.md 59行目の unclassified-entry（IR-053 言及）の扱い統一

## 観測

配布依存境界 gate（source profile）が inspect-skills SKILL.md 59 行目の IR-053 への言及を unclassified-entry として検出し続けている。本変更以前から存在する既存分であり、Epic #2465 Wave2-a の OU-005（PR #2475）では対象範囲外として記録のみ実施した。配布物での IR 参照表記の扱い（抽象化表記への統一要否）は別途判断が必要。

## 今回扱わない理由

既存分の是正は OU-005（Issue #2470）の対象範囲外。表記統一の要否は配布依存境界 Design 側の判断事項であり、本 Case での判断材料がない。

## 影響

配布依存境界 gate の findings が baseline として 1 件常時残留する（変更起因の増分ではないため gate 判定には影響しない）。

## レビューで決めること

- 配布物内の IR 参照表記を抽象化表記（IR 番号の直接言及の除去・間接参照化）へ統一するかどうか
- 統一する場合の配布依存境界 gate の unclassified-entry 検出の扱い（baseline 管理か除外規則か）

## 根拠

- PR #2475 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2475 ）
