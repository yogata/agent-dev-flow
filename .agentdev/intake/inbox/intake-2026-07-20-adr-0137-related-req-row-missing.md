# Intake Item: docs/adr/README.md の「関連 REQ」表に ADR-0137 行が欠落

## 発生源

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1618
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1609（CLOSED, 本 Issue スコープ外として記録）
- 検査ルート: case-close Wave 2（PR #1618 `## Findings / Capture候補` セクションから回収）
- 原因分類: 確認済（第1フェーズ監査「不整合 #2 補足」で「ADR-0138 経由で間接掲載」と扱い、不整合対象外としていたが、他 ADR（ADR-0101〜0136, 0138）はすべて関連 REQ 行を持つため、形式的には欠落）

## 問題

`docs/adr/README.md` の「関連 REQ」表において、ADR-0137 の行が存在しない。他の accepted ADR（ADR-0101〜0136, 0138）はすべて関連 REQ 行を持つが、ADR-0137 のみ欠落している。ADR-0137 は REQ-0114 を UPDATE する決定（同 ADR Consequences セクションに明記）であるため、関連 REQ 行を追加することが自然。

第1フェーズ監査（不整合 #2 補足）では「関連 REQ 表には ADR-0138 経由で間接掲載」と扱い、不整合対象外としていた。しかし他 ADR と形式的一貫性を欠くため、要対応。

本 Issue #1609 の完了条件（F-001/002/005 と U-003/004/005）には含まれないため、Wave 2 #1609 では修正せず、別途 inspect/intake 経由での取り込みを推奨。

## 推奨修正対象

`docs/adr/README.md` の「関連 REQ」表へ ADR-0137 行を追加。関連 REQ は REQ-0114（同 ADR Consequences セクション明記）。SC-002（`docs/specs/integrity/index-auto-generation.md`）が accepted のため、索引自動生成パイプラインでカバーすべき対象としても位置付けられる（手動修正と GENERATE 化の両面から検討）。

## 関連

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1618
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1609
- 対象ファイル: `docs/adr/README.md`
- 関連 ADR: ADR-0137（case-run を構成工程委譲から除外しインライン実行を標準動作化）
- 関連 REQ: REQ-0114（case-run 責務分離）
- 関連 SPEC: SC-002（`docs/specs/integrity/index-auto-generation.md`、索引類自動生成）
- 関連 intake: `intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md`（第1フェーズ監査の F-001/002/005 系統）
- Epic: #1601 Wave 3 (#1611 で U-001〜U-015 横断解消時に発見されれば取り込み対象、あるいは別途 inspect 起票)
