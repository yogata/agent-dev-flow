# 旧 REQ-006 行 ID 参照の残存（command Design 群）と再配線方針の残り適用

## 観測

PR #2396 が確定した再配線方針（現行 ID 振替を正とし、機械振替後の行内容検証・意味再同定を必須とする。3系統統一決定、REQ-046-010）の適用が残る対象: docs/designs/commands/case-open.md（25件）・case-run.md（23件）・case-auto.md（34件）・case-close.md（12件）ほか、design-save.md（2件、F-04 の旧番号帯 REQ-0136-029 を含む）・req-save.md（2件）・capture-boundaries.md（6件）・workflow-contracts.md（3件）・delegation-contracts.md（4件）・DEC-008（4件）等（`git grep -E "REQ-006-0" -- docs` = 20ファイル）。機械基準となる要件分割セグメント対応（case-open 系 001〜021 → REQ-030、case-run 系 022〜038 → REQ-031、case-close 系 039〜059 → REQ-032、case-auto 系 065〜094 → REQ-034、Epic/Wave 系 095〜104 → REQ-035）は PR #2396「Design確定候補」の対応則記録（REQ-046-010、commit 9653d8d1 削除行と現行 REQ-030〜035 の突合で確認済み）を利用できる。F-04 design-save.md:165 の振替先は REQ-002-035（方針確定済み・未適用）。

## 今回扱わない理由

design-save.md は Issue #2385 の変更対象成果物外であり、command Design 群の一括再配線は別 chore として実施するため（PR #2396 の再配線方針決定記録のとおり、方針確定のみ本 PR で実施）。

## 影響

旧 REQ-006 行 ID 参照が残存する限り、IR-067 baseline（ReqCitation 318件）の実修復が進まない。

## レビューで決めること

- 再配線 chore の実施単位と順序（command Design 4件を一括か分割か。F-04 design-save.md:165 の REQ-002-035 振替を先行するか）
- 機械振替（セグメント対応）の適用範囲と、意味再同定が必要な案件の洗い出し方法

## 根拠

- PR #2396 本文「Findings / Capture候補」および「再配線方針決定記録」「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2396 ）
