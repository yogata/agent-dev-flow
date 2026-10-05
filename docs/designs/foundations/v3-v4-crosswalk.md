---
title: v3 -> v4 Concept / Artifact Crosswalk
status: accepted
created: 2026-09-18
updated: 2026-10-01
---

# v3 -> v4 Concept / Artifact Crosswalk

位置づけ: 本 Design は v3 成果物の v4 での処遇の正規記録先である。処遇の完全一覧は
references/crosswalk-inventory.md が所有し、本 Design は分類スキーマ、処遇実行原則、
段階割当規則、集約サマリを所有する。処遇未完了エントリ（living tracking 対象）は処遇記録として保持し、削除しない。
他 Design による本 crosswalk の参照は、(a) 処遇未完了エントリの処遇記録としての参照と
(b) 現行契約の正規所有を本 crosswalk に求める参照に分類する。(b) の参照は現在の正規所有者へ付け替え、
(a) は処遇が完了するまで本 crosswalk を参照先として維持する。

## 分類スキーマ（3 列）

処遇は次の 3 列で記録する。

- 意味処遇: keep（v4 でも保持する）/ redefine（v4 で意味を再定義する）/ supersede
  （後継が確定した置換）/ retire（後継なしの廃止）
- 帰属: Runtime / Standard Operating Model / semantic Skill / deterministic code/tool /
  Adapter / Project Extension / Project Model / ―（概念・複合）
- 実行段階: v4 実装 Sequence の段階番号。keep は ―

従来の 9 分類軸は、意味処遇・帰属・機構置換の 3 次元を単一列へ混在させた表現であり、
本スキーマへ再編成した。機構置換（旧第 9 軸）は意味処遇 supersede と置換先の備考で
表現する。単一成果物が複数帰属を持つ場合は帰属列に列挙する。

## 処遇実行原則

- RETIRE / supersede の実行は、当該 v4 置換の実装が着地する段階で行う
- 処遇は暫定（planned）として記録し、担当段階の要件確定時に confirmed、処遇実行完了時に
  executed へ遷移させる（living tracking）
- 各段階の case-close は自段の担当行を confirmed 以上へ遷移させる。ドメイン一括行は
  個別判断が必要になった時点で個別行へ展開してよい

## 段階割当規則

- 実行段階は v4 実装 Sequence の段階番号に準拠する。crosswalk 独自の段階番号を持たない。
  段階番号一覧と AgentDevFlow 本体再編（自己適用）の段階進行記録は判断記録（DEC-034）と
  Git 履歴へ委ねる。処遇未完了エントリの割当済み段階番号は処遇記録として保持する

## 集約サマリ

- REQ（移行判定時点 53。移行後の現行件数は docs/requirements/README.md の集計を参照）: keep 23 / redefine 30 / 新設 1（REQ-088、第3段実行）。移行判定時点の retired 12 件は retired を維持する（識別子再利用禁止。移行後の廃止状況は docs/requirements/README.md を参照）
- Decision（v3 側 30、DEC-018 欠番）: keep 20 / redefine 2（DEC-010、DEC-012）/ supersede 5（DEC-002、DEC-015、DEC-017、DEC-029、DEC-030）/ 既に superseded 済み 2（DEC-005、DEC-007）
- Design（v3 側 accepted）: ドメイン別の内訳は inventory を正とする。状態系 9 件と traceability-model、quality-gates が supersede、検証基盤系は keep 中心
- 実装資産: scripts/** は第8段、traceability/** は第7段、.agentdev/ 状態領域は第9段、配布物・プロジェクションは第12段

件数は v3→v4 移行判定時点の確定値であり、処遇記録として保持する。
正確な内訳は references/crosswalk-inventory.md を正とする。
