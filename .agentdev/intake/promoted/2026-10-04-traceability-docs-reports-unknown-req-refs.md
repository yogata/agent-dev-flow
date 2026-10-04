# 採用済み成果物: traceability check の docs/reports unknown-req-refs 16件（checker 除外未実装と歴史記録参照の整理）

## 観測内容（同主題 2 item の統合）

docs/reports/req-053-textlint-*.md（5 ファイル、REQ-053-013〜038 参照 16 件）の Report 文書内要件行参照が、現行 REQ-053 行と不整合である。統合元は次の 2観測:

1. **unknown-req-refs 16件の計上継続**: traceability check（agentdev-traceability scripts/lib/corpus.ts）の走査対象から docs/reports/ が除外されておらず（DEFAULT_EXCLUDE_DIRS は .git/.agentdev/.agentdev-plugin/.worktrees/node_modules のみ）、歴史記録内の REQ 行 ID が unknown-req-refs として計上され続ける。REQ-053-039 は歴史記録（docs/reports/・retired/）を是正対象外と契約するが、checker 側の除外は未実装。
2. **Report 文書内参照の不整合（調査候補）**: 現行 REQ-053.md の行構成（001〜006/008〜012/016/021〜028/031/032/035/036/039/040）に対し、reports 系は 013〜038 帯を多数参照し、現行に行が存在しない参照を含む。docs/reports は確定済み監査記録であるため実行 Case では対応せず、調査候補として回収。

## 影響

traceability check が baseline で 16件の unknown-req-refs を計上し続け、検証差分の判読性を下げる。歴史記録自体は是正対象外契約（REQ-053-039）により文書修正を要しない。

## 課題

traceability check（corpus 取得）に docs/reports/ 除外（または REQ-053-039 保持契約に基づく対象外分類）を実装する対応候補。checker 除外の実装後も残る「Report 文書内参照と現行 REQ 行の対応関係の説明」は、歴史記録の位置づけ（当時の行構成の記録）として扱うか個別に整理するかを判断する。

## 既存要件との関連

- REQ-053-039（歴史記録〔docs/reports/・retired/〕の是正対象外契約）
- agentdev-traceability check（unknown-req-refs 検査）の corpus 仕様
- check_integrity.ts 側の IR-067 は docs/reports/ を免除領域としており、traceability check 側との検査間不整合

## 出処・根拠（統合元 2 item）

- 元 inbox item 1: `.agentdev/intake/inbox/2026-10-04-traceability-check-docs-reports-exclusion-unimplemented.md`（分類採用により削除済み）
  - 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
  - 備考: 無効分類として case-close 検証差分に記録済み（歴史記録保持契約による是正対象外）
  - captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
- 元 inbox item 2: `.agentdev/intake/inbox/2026-10-04-traceability-unknown-req-refs-req053-docs-reports.md`（分類採用により削除済み）
  - 観測元: PR #3451（Case #3445・Epic #3440 Wave 2）本文 Findings / Capture候補 intake セクション（PR #3450/#3452 の case-close 独立再検査でも同一 16 findings を再現確認、base 80c04928 の既知 baseline と一致）
  - 関連 learning: Wave 1（Case #3442・PR #3448）の learning エントリ（`.agentdev/learning/inbox.md`「REQ-053 系 wave レポートの参照が REQ 行の廃止・移管時に追随していない可能性」）が同主題
  - captured_at_commit: a84c13e5b912c015c31e571d768a20de993e16f8
- 現行源検証（intake-promote・ad6e8341・読取のみ・実測）: traceability check（`bun src/check.ts --root <repo-root>`）を実行し unknown-req-refs 16件がすべて docs/reports/ 由来で現行も再現すること、corpus.ts の除外目录に docs/reports が含まれないことを確認
