---
id: intake-20260908-req-011-bare-id-missing-implementation-2694
title: 親要件ID REQ-011 の bare ID 参照が実装宣言を持たず、traceability check の missing-implementation として報告される
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2694（Issue #2688・Epic #2686 Wave 2・OU-004 Local 版等価実装）
- 発見経路: case-run トレーサビリティ check → case-close トレーサビリティ独立再検査（main dad9a860 上で再確認）

## 内容
- トレーサビリティ check で、親要件 ID `REQ-011` の bare ID 参照（子行番号を伴わない親要件自体への参照）に実装宣言（ADF-COVERS(implementation)）がなく、missing-implementation として報告される。
- 親要件行自体は複数の Design 実装に横断して被覆されるため、単一の実装宣言を置くことが不自然なケース。bare ID 参照の扱い（親要件行を計上対象から除外する、または参照側の表記を是正する）の判断が必要。
- 本 PR の変更対象外であり、対象行（REQ-011-024 / 025 / 026 / 027 / 030）の欠落ではない。

## 対応候補
- agentdev-traceability の親要件 bare ID 参照の扱いを Design/実装側で明示化する（後続判断）。
