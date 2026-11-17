# intake: case-4126 REQ draft 対象行と現行実態の差異（REQ-094・REQ-051-009・REQ-034-014）

- **発見元**: case-4126（Case: 実験前提の3原則を恒久運用原則へ採用しレガシー移行資産を一括整理する）case-open STEP-3 対象行実測。draft: .agentdev/drafts/req-draft-experimental-cleanup.md（ACT-REQ-017・ACT-REQ-006・ACT-REQ-018）
- **内容**: req-draft-experimental-cleanup.md の3つの artifact_action が指定する修正対象行が、現行 REQ 本文に実在しないことを実測で確認した。REQ-094（ACT-REQ-017 相当）: 「廃止語彙検出（obsolete-vocabulary-map）と語彙レジストリによる恒常機械検出を前提とする部分」の明示参照が REQ-094 本文に0件で行修正の適用対象なし。REQ-051-009（ACT-REQ-006）: baseline への言及が行本文に0件で修正不要。REQ-034-014（ACT-REQ-018）: 削除対象 blocked 記録への依存言及が行本文に0件で整合確認のみで修正不要。3行は本 Case の Definition 変更から除外し、修正せず現行文言のまま維持した
- **分類**: intake 候補（draft と現行実態の差異確認。req-define 側の draft 再合意・対象行再特定の判断材料）
- **影響**: REQ-121 廃止・REQ-010 行削除等の他の artifact_action は適用済み（PR #4127）。3行の処置は現行文言維持であり、baseline 撤廃後の実態と矛盾しないことを coverage・check 実測で確認済み
- **再評価条件**: REQ-094 に obsolete-vocabulary-map・語彙レジストリ恒常検出への依存言及が新設された場合、または draft の該当 action が再合意された場合
- **関連**: Issue #4126・PR #4127・case-4126 完了報告（Capture結果）
