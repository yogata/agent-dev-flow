# intake: REQ-030-028 / REQ-030-029 の実装・検証対応欠落（解決済み）

- **発見元**: PR #3747（子 Issue #3736 / OU-007）case-run traceability check
- **内容**: REQ-030-028・REQ-030-029 が Design 対応のみで実装・検証対応を欠く状態が main で継続している旨の発見。sibling #3734（traceability gate 入力検証）が実装対応の付与対象と推測されていた
- **状態**: **解決済み**。PR #3751（#3734、merge commit 29ae287f）で REQ-030-028 の implementation 対応（prepare_definition_pr.ts）と検証を追加、REQ-030-029 の implementation / verification 対応（definition-pr-and-idempotency.md・step4-verbatim-match.test.ts）を追加。case-close の統合後 main traceability check（対象 8 行、pass 11 / fail 0、exit 0）で解消を独立確認済み
- **識別子**: REQ-030-028、REQ-030-029、Case #3729（PR #3747・#3751）
- **capture 由来**: case-close Capture 回収 2026-10-16（記録保存目的。backlog-review で解決済みとして処分可能）
