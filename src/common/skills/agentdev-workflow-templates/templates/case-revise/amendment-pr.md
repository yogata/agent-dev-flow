---
name: 設計修正PR Description (case-revise)
about: case-revise が作成する設計修正PR本文テンプレート
---

## 概要
<!-- 【必須】 -->

req-define で再合意済みの Definition 変更を Case #{N} へ反映する設計修正PR。

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
harness 側識別子は取得可能な場合の付加情報に限定し、必須契約としない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない -->
- adf_case: #{N}
- adf_execution_unit: standard
- adf_delegation: N/A
- adf_harness_ref: N/A

## Definition 変更内容
<!-- 【必須】 -->

- 変更対象: {REQ / Decision / Design の識別子と対象箇所}
- 再合意内容の要約: {req-define で再合意した内容}
- 実変更判定: {canonical Definition との差分の要約}

## 影響再評価
<!-- 【必須】 -->

- 影響あり（再評価対象）: {Issue 番号一覧 / 該当なし}
- 影響なし確認済み（完了済み Issue の維持）: {Issue 番号一覧 / 該当なし}

## Findings / Capture候補
<!-- 【必須】 -->

### intake

該当なし

### learning

該当なし
