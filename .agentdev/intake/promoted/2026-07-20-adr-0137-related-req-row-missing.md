# docs/adr/README.md の「関連 REQ」表に ADR-0137 行が欠落

## 観測内容

- 由来 PR #1618、由来 Issue #1609（CLOSED、本 Issue スコープ外として記録）。検査ルートは case-close Wave 2（PR #1618 `## Findings / Capture候補` セクションから回収）。
- `docs/adr/README.md` の「関連 REQ」表において ADR-0137 の行が存在しない。他の accepted ADR（ADR-0101〜0136, 0138）はすべて関連 REQ 行を持つが、ADR-0137 のみ欠落。
- ADR-0137 は REQ-0114 を UPDATE する決定（同 ADR Consequences セクションに明記）。第1フェーズ監査（不整合 #2 補足）では「関連 REQ 表には ADR-0138 経由で間接掲載」と扱い不整合対象外としたが、他 ADR と形式的一貫性を欠く。
- 本 Issue #1609 の完了条件（F-001/002/005 と U-003/004/005）には含まれないため Wave 2 #1609 では修正せず、別途 inspect/intake 経由での取り込みを推奨。

## 影響

低。機能破壊はないが、README の網羅性・形式的一貫性が損なわれ、今後の監査で再検出され続ける。発生頻度は ADR 追加時に潜在化する構造的问题。

## 課題

ADR-0137 行の欠落による形式的不整合が未解消。他 ADR はすべて関連 REQ 行を持つ基準に対する唯一の例外となっている。

## 既存要件・仕様との関連

- ADR-0137: case-run を構成工程委譲から除外しインライン実行を標準動作化（欠落対象の ADR）。
- REQ-0114: case-run 責務分離（ADR-0137 が UPDATE する関連 REQ）。
- SC-002（`docs/specs/integrity/index-auto-generation.md`）: 索引類自動生成。accepted のため、本件は GENERATE 化対象としても位置付けられる。
- 関連 intake: `intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md`（第1フェーズ監査 F-001/002/005 系統）。

## 対応方針の方向性

- `docs/adr/README.md` の「関連 REQ」表へ ADR-0137 行を追加。関連 REQ は REQ-0114。
- SC-002 が accepted のため、手動修正で即時解消する経路と、索引自動生成パイプラインでカバーする経路の両面から検討。
