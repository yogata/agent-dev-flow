---
title: v3 -> v4 Concept / Artifact Crosswalk
status: draft
created: 2026-09-18
updated: 2026-09-19
---

# v3 -> v4 Concept / Artifact Crosswalk

位置づけ: 本 Design は v3 成果物の v4 での処遇の正規記録先である。処遇の完全一覧は
references/crosswalk-inventory.md が所有し、本 Design は分類 schema、処遇実行原則、
段階割当規則、集約サマリを所有する。実際の置換・廃止の実行は後続 v4 Implementation
Sequence（v4-migration-and-release.md）の各段階で行う。

## 分類 schema（3 列）

処遇は次の 3 列で記録する。

- 意味処遇: keep（v4 でも保持する）/ redefine（v4 で意味を再定義する）/ supersede
  （後継が確定した置換）/ retire（後継なしの廃止）
- 帰属: Runtime / Standard Operating Model / semantic Skill / deterministic code/tool /
  Adapter / Project Extension / Project Model / ―（概念・複合）
- 実行段階: 後続 v4 Implementation Sequence の段階番号（1〜17）。keep は ―

従来の 9 分類軸は、意味処遇・帰属・機構置換の 3 次元を単一列へ混在させた表現であり、
本 schema へ再編成した。機構置換（旧第 9 軸）は意味処遇 supersede と置換先の備考で
表現する。単一成果物が複数帰属を持つ場合は帰属列に列挙する。

## 処遇実行原則

- RETIRE / supersede の実行は、当該 v4 置換の実装が着地する段階で行う。第3段は全処遇の
  記録（planned）のみとし、RETIRE 実行を行わない
- 処遇は暫定（planned）として記録し、担当段階の要件確定時に confirmed、処遇実行完了時に
  executed へ遷移させる（living tracking）
- 各段階の case-close は自段の担当行を confirmed 以上へ遷移させる。ドメイン一括行は
  個別判断が必要になった時点で個別行へ展開してよい
- 第13段（full validation）で全行が executed であることを検証する

## 段階割当規則

- 実行段階は v4-migration-and-release.md「後続 v4 Implementation Sequence」の段階番号
  （1: Foundation、2: Runtime/lifecycle/state、3: REQ/Decision/Design implementation、
  4: req-define/case-auto UX、5: work_type/scale/Epic/Wave、6: Quality、7: Traceability、
  8: Skill restructuring、9: Loop、10: Extensions、11: adapters、12: migration
  implementation、13: full validation、14: v4.0.0-rc.1、15: self-hosting + pilot、
  16: RC fixes、17: v4.0.0）に準拠する。crosswalk 独自の段階番号を持たない

## 集約サマリ

- REQ（現行 53）: keep 23 / redefine 30 / 新設 1（REQ-088、第3段実行）。retired 12 件は
  retired を維持する（識別子再利用禁止）
- Decision（v3 側 30、DEC-018 欠番）: keep 20 / redefine 2（DEC-010、DEC-012）/
  supersede 5（DEC-002、DEC-015、DEC-017、DEC-029、DEC-030）/ 既に superseded 済み 2
  （DEC-005、DEC-007）
- Design（v3 側 accepted）: ドメイン別の内訳は inventory を正とする。状态系 9 件と
  traceability-model、quality-gates が supersede、検証基盤系は keep 中心
- 実装資産: scripts/** は第8段、traceability/** は第7段、.agentdev/ 状態領域は第9段、
  配布物・プロジェクションは第12段

件数の正確な値は references/crosswalk-inventory.md を正とする。
