---
title: ADF v4 Traceability モデル（Change / Evidence 中心）
status: accepted
created: 2026-09-18
updated: 2026-09-19
---

# ADF v4 Traceability モデル（Change / Evidence 中心）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 4 問いへの回答能力

Traceability の主目的は次の 4 問いに答えられることである。

- この要求は何によって設計・実装されているか
- 今回の Change はどの要求・判断・設計へ影響したか
- acceptance・requirement を何の Evidence で満たしたか
- 変更時に再検証すべき関連範囲は何か

全 artifact の恒久的完全グラフ維持だけを目的としない。

## 永続情報と導出可能情報の分離

v4 の意味モデルから永続すべき関係（Change の Evidence・impact、要求実現関係）と導出可能な関係を分離する基準。現行 sidecar/policy/checker 形式を前提とせず、DEC-030 機構のうち拡張して搬送する範囲と再導出する範囲の判定。

- Case/Change の Evidence と impact を第一級とする
- DEC-030 の sidecar/policy/producer-consumer 機構は、永続情報として価値がある範囲で拡張して搬送する（機構の廃止ではなく、中心の移動と必要永続情報/導出可能情報の分離）

## global completeness の位置づけ

完全グラフ維持を目的としない運用、診断・影響分析の必要性から completeness を再設計する方針。
