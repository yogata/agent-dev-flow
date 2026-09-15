---
title: case-ready Design
status: accepted
created: 2026-09-14
updated: "2026-09-14"
---

# case-ready Command Design

## 目的

case-ready の公開契約（入出力、副作用、安全性、承認境界、停止条件、順序契約）を定義する。case-ready は Definition の受入と実行準備完了への状態遷移を所有する主フローコマンドである（REQ-061）。

## 公開 interface

- 入力: Root Case（Issue 番号または URL）、関連する req_draft（存在する場合）、Draft Definition PR（存在する場合）
- 出力: ready 状態の Root Case、確定済み execution contract、実行構造（Standard は Root Case 単一 execution unit、Epic は Child Issue と Wave / 依存構造）
- 副作用: Definition PR の merge、REQ / Decision / Design の保存（Capability Skill 委譲）、Decision の accepted 遷移、Child Issue / Wave の作成、draft / RU の削除、Root Case の ready 遷移

## 内部構成

- Definition 受入: Draft Definition PR の忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査。新しい意味判断が不要な場合は追加承認なしで自動確定・merge。新しい Decision、意味変更、対象範囲拡大、意味的不整合の解消が必要な場合は停止し HITL とする
- 保存実体: REQ / Decision / Design の保存は req-file-manager、decision-file-manager、design-file-manager、artifact-validation へ委譲する。case-ready 自身は保存手続きを実装しない
- canonical 再取得: merge 後に canonical Definition を再取得し、以降の処理基準とする
- 実行構造確定: 連結成分、3軸判断、単独根の Standard 化、上限遵守、構成検証、Wave ファイル重複前置検出（詳細は epic-wave-model Design）
- 検証対応要否ゲート: 未分類行残存時は ready へ遷移させない
- クリーンアップ: 成功後に draft / RU を削除する（blocked / failed / 中断時は保持）

## 停止条件

- Definition PR の CI / 品質検査失敗（ready 不遷移、既存 PR 保持で再実行可能）
- 新しい意味判断が必要（HITL）
- 構成検証の上限超過または構成不備
- proposed Decision の受理が一意に確定できない（proposed のまま ready 不遷移）

## 冪等性

再実行時は merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分のみ処理する。merge は巻き戻さない。

## 対応記録

- 2026-09-15: status を draft から accepted へ昇格（REQ-032-025 の評価契約に従う棚卸し評価の結果）。昇格根拠: REQ-061 対応 Case #2809（closed）・PR #2817（merged）における実装・検証との整合確認に基づく昇格であること、および見送り記録が存在しないことを確認済み（RU-0015、Case #2848）。
