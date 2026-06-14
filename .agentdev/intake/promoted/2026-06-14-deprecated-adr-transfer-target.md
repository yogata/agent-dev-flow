# deprecated化ADRの移管先確定・個別反映が未実施

## 観測

Issue #653（ADR責務境界不整合の是正）で、技術判断を含まない6件のADR（ADR-0003/0010/0012/0021/0022/0023）を deprecated 化した。各ADR本文には誤分類理由と移管先候補が追記されたが、移管先となるREQ群への個別内容反映は未実施。「別Issue対象」として明示的に先送りされている。

### 対象ADR

| ADR | 移管先候補 |
|-----|-----------|
| ADR-0003 | REQ-0102 等 |
| ADR-0010 | REQ-0103 等 |
| ADR-0012 | REQ-0104 等 |
| ADR-0021 | REQ-0105 等 |
| ADR-0022 | REQ-0108 等 |
| ADR-0023 | REQ-0108 等 |

## 影響

- deprecated ADR に記載された仕様内容が現行REQ群に反映されていない
- ADR README の Status View では deprecated 扱いだが、対応するREQ要件行が存在しない場合、仕様カバレッジにギャップが生じうる
- deprecated ADR を参照する後続作業が移管先不明で停滞する可能性

## 課題

6件の deprecated ADR の内容を確認し、移管先REQ（REQ-0102/0103/0104/0105/0108等）に個別に反映する。各ADRの移管先候補は既にADR本文に追記されているため、それに従う。

## 既存要件との関連

- REQ-0112-031〜037: ADR再編成方針（Layer A）
- REQ-0112-038〜043: 禁止ゲート（Layer B）
- AGENTS.md「信頼できる情報源の優先順位」: ADR > SPEC > ガイド

## 対応方針

1. 各 deprecated ADR の本文（誤分類理由・移管先候補）を確認
2. 移管先REQに該当内容が既に存在するか確認（重複回避）
3. 未反映の内容を移管先REQに要件行として追加、または既存要件のUpdate Notesに反映
4. 全反映後、deprecated ADR から移管先REQへの参照リンクを整備

## 根拠

- 元item: `.agentdev/intake/inbox/2026-06-14-deprecated-adr-transfer-target.md`
- 観測元: Issue #653 comment[1]「残課題」セクション
- 元テキスト: 「deprecated化ADRの移管先確定（REQ-0102/0103/0104/0105/0108等への個別反映）は別Issue対象」
