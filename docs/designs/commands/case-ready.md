---
title: case-ready Design
status: accepted
created: 2026-09-14
updated: "2026-09-19"
---

<!-- ADF-COVERS(design): REQ-021-024 -->
<!-- ADF-COVERS(design): REQ-061-023, REQ-061-029, REQ-061-030, REQ-061-033, REQ-061-034, REQ-061-035 -->

# case-ready Command Design

位置づけ変更（v4、DEC-033）: 本 Design が定義する case-ready は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。本 Design は内部 lifecycle 段階の契約として継続して正規文書である（処遇の正本: v3-v4-crosswalk references/crosswalk-inventory.md）。
## 目的

case-ready の公開契約（入出力、副作用、安全性、承認境界、停止条件、順序契約）を定義する。case-ready は Definition の受入と実行準備完了への状態遷移を所有する主フローコマンドである（REQ-061）。

## 公開 interface

- 入力: Root Case（Issue 番号または URL）、関連する req_draft（存在する場合）、Definition PR（存在する場合）
- 出力: ready 状態の Root Case、確定済み execution contract、実行構造（Standard は Root Case 単一 execution unit、Epic は Child Issue と Wave / 依存構造）
- 副作用: Definition PR の merge、REQ / Decision / Design の保存（Capability Skill 委譲）、Decision の accepted 遷移、Child Issue / Wave の作成、draft / RU の削除、Root Case の ready 遷移

## 内部構成

- Definition 受入: Definition PR の忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査、merge 前の Draft 状態確認（pr_read の isDraft、REQ-061-032）。新しい意味判断が不要な場合は追加承認なしで自動確定・merge。新しい Decision、意味変更、対象範囲拡大、意味的不整合の解消が必要な場合は停止し HITL とする
- 保存実体: REQ / Decision / Design の保存は req-file-manager、decision-file-manager、design-file-manager、artifact-validation へ委譲する。case-ready 自身は保存手続きを実装しない。REQ の保存では Design 対応が未成立の要件行が残っても保存を失敗させない（Design 対応の成立判定は ready 遷移ゲートの責務）
- canonical 再取得: merge 後に canonical Definition を再取得し、traceability check を機械実行する（REQ-061-023）。check は inline declaration と top-level `traceability/` 配下の sidecar を同じ論理的な対応関係へ正規化した対応関係全体を検査対象とする。missing-design を検出した場合は case-open への差し戻し経路を扱う
- Design 対応ゲート: 対象 Definition の要件行ごとに Design 対応が 1 件以上存在することを ready 遷移の必要条件とする（missing-design 残存時は ready へ遷移させない）。verification policy（`traceability/policy.yaml`）との整合も同一の check で検証し、verification policy の不正を検出した場合は ready へ遷移させない
- 検証対応の作成責務: required 行の verification 対応の作成・更新は case-run が担い、missing-verification を含む対応完全性の最終検査は case-close の QG-4 が担う（REQ-021-015、REQ-021-018）。case-ready の ready 遷移条件に verification 対応の完全性を含めない。policy の既定値は required であり、optional は policy の明示指定のみで成立する。新規要件行を含む Definition は、その行の verification 対応が case-run で作成される前の状態で ready を通過できる
- 実行構造確定: 連結成分、3軸判断、単独根の Standard 化、上限遵守、構成検証、Wave ファイル重複前置検出（詳細は本 Design「v3 epic-wave-model Design からの吸収」節）
- 横断依存検査: canonical Definition と未クローズ Case 群の同一パス重複・共有領域（トレーサビリティポリシー、sidecar 等）への登録重複需要の検出（警告+HITL 3選択肢、警告は ready 遷移判定を変更しない。REQ-061-029〜031）
- クリーンアップ: 成功後に draft / RU を削除する（blocked / failed / 中断時は保持）

## 停止条件

- 対象 Definition PR が GitHub Draft PR（isDraft: true）の場合（pr_merge を実行せず blocked で停止。draft 解除の自動実行や正規 Tool 外の操作による復旧は行わない。REQ-061-032）
- Definition PR の CI / 品質検査失敗（ready 不遷移、既存 PR 保持で再実行可能）
- 新しい意味判断が必要（HITL）
- canonical Definition の要件行に Design 対応が 0 件の行が残る場合（missing-design 検出、ready 不遷移、case-open への差し戻し）
- `traceability/policy.yaml` の不正を check が検出した場合（ready 不遷移。required 行の verification 対応欠落（missing-verification）は case-close の QG-4 最終完全性検査の対象であり、ready 不遷移条件に含めない）
- 構成検証の上限超過または構成不備
- proposed Decision の受理が一意に確定できない（proposed のまま ready 不遷移）

## 冪等性

再実行時は merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分のみ処理する。merge は巻き戻さない。

## 対応記録

- 2026-09-15: status を draft から accepted へ昇格（REQ-032-025 の評価契約に従う棚卸し評価の結果）。昇格根拠: REQ-061 対応 Case #2809（closed）・PR #2817（merged）における実装・検証との整合確認に基づく昇格であること、および見送り記録が存在しないことを確認済み（RU-0015、Case #2848）。

## v3 epic-wave-model Design からの吸収

v3 epic-wave-model Design が所有していた case-ready 構成判断基準、Wave 構成ルール、execution_unit 構成の依存ヒントと Wave 構成の重複前置検出契約（REQ-061-019、REQ-031-027、REQ-035-012）、前工程完了度3段階分類（REQ-003-011、REQ-003-012）は本 Design の規定へ吸収された。旧 Design は第5段で supersede とされ（物理削除は docs-chore OU-003）、対応関係の正本は v3-v4-crosswalk references/crosswalk-inventory.md が追跡する。

- Wave 構成ルール: 必須依存で結合した連結成分を Epic 候補とし、技術的依存（L0-L3）は Wave 構成のための情報として連結成分計算から外す。Wave は Epic 内の依存関係と並列実行可能性を表す実行スケジューリング単位であり、Epic Issue 本文から読み取る内部構造である（REQ-035-006）。機械的判定手順は workflows/references/execution-unit-construction.md
- 重複前置検出契約: 同一 Wave 内の子 Issue 間の変更対象ファイル重複の前置検出とその判断記録（Wave 分離・変更対象分割・重複許容）を Wave 構成の必須判断とし、重複許容時は衝突解消の担当とマージ順序を事前記録する（REQ-061-019、REQ-031-027、REQ-035-012。実行側の唯一の正規所有者表明は case-run Design 吸収節）
- 前工程完了度 3 分類: 子 Issue 本文の「前工程完了度」属性の分類定義（REQ-003-011）と subagent の振る舞い指針（REQ-003-012）を本 Design が所有する
