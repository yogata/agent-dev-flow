---
id: learn-20261119-req-verification-column-retired-ir-refs
created_at: 2026-11-19
source: case-run deviation capture (Root Case #4150・PR #4161)
status: inbox
---
# REQ 本文の検証列が廃止 IR を参照したまま保持され、REQ 現行化が後続要求候補として残った

- 問題事象: REQ-117・REQ-119 本文の検証列が廃止 IR（IR-072/IR-073）を参照している。REQ 意味変更禁止のため本 Wave では保持し、後続要求候補として Findings へ分類した
- 発生局面: case-run（Issue 4156・Case 4150 Wave-4・PR 4161・TS-014）
- 検知方法: AG-014 対象全域の grep 分類
- 根本原因: REQ の検証列は REQ 本文の一部であり、検証列の現行 IR 参照への更新は REQ 意味変更に該当するため、IR 現行化の Wave 内では現行化できなかった
- 自律対応内容: 保持して Findings へ記録（REQ 現行化の後続要求候補として分類・今回の対応はしない）
- ユーザー確認有無: なし（保持判断は REQ 意味変更禁止の契約からの導出）
- Decision/REQ/spec 影響: REQ-117・REQ-119 の現行化（検証列の現行 IR 参照への更新）が後続要求候補。REQ 現行化まで参照切れが残る状態を明示的に記録
- 横展開観点: IR 廃止を含む変更では、依存する REQ 検証列の現行化を後続要求として明示的に起票する。保持のままだと参照切れが REQ 意味変更の契約と矛盾せず恒久化する
- 再発条件: IR 廃止を含む変更で、REQ 本文の検証列が廃止 IR を参照している場合
- 予防策候補: IR 廃止の実施時に「REQ 検証列参照の追随」を後続要求候補として Findings 記録する前置を設ける
- 想定反映先: REQ-117・REQ-119 の現行化（後続要求候補）
- 関連: Case 4150、Issue 4156、PR 4161（Findings F5）
- タグ: REQ 現行化、検証列、廃止 IR、後続要求候補
