# retired REQ 参照の同期是正（DEC-013・DEC-022）

- 出所: inspect-docs 20261008T025952Z F-19・F-20（backlog-auto stage 1）
- 種別: 表現是正（retired 参照の同期）+ 判断基準の確定
- 対象: DEC-013・DEC-022

## F-19: DEC-013 frontmatter 除去に伴う本文・索引説明の未同期

- target: `docs/decisions/DEC-013.md:56`（および :43）、`docs/decisions/README.md:265`
- evidence: delta 窓（aafcfa16 RA-005）で frontmatter related_reqs が `[REQ-028, REQ-010]`→`[REQ-010]` に変更されたが、(1) 本文「関連情報」は「根拠要件: REQ-028（IR 体系の実効性監査と存在条件厳格化）」を retired 表記・retired/ パスなしのまま残留、(2) decisions/README.md:265 説明列も「関連 REQ-028 の後継は本 DEC-013」を REQ 列リンク削除後も残留。他行（DEC-007/017/022/030）は retired REQ を `(retired)` リンク付きで併記する慣行で、DEC-013 行のみ「言及あり・リンクなし」の非対称。
- severity: low / confidence: high（不整合の事実）
- source_of_truth: DEC-013 frontmatter（updated 2026-10-08）、numbering-policy.md:82-88

## F-20: DEC-022 本文言及残存と retired REQ 取り扱いの非対称

- target: `docs/decisions/DEC-022.md:73`（本文「REQ-046/010/045/047/029 の更新」）、`DEC-022.md:7`（frontmatter）
- evidence: 同窓で REQ-045（retired）を frontmatter から除去したが、(1) 本文「結果、影響」に REQ-045 言及が残留、(2) 同じ retired の REQ-046 は frontmatter と索引行に (retired) 併記のまま保持。retired REQ の保持/除去基準が同一 frontmatter 内で不揃い。
- severity: low / confidence: medium
- source_of_truth: retired REQ の related_reqs 保持基準（未文書）

## 処置方針（intake 成果物との統合）

- intake promoted `2026-10-08-retired-req-related-reqs-retention.md`（backlog-review 消費対象）と統合して処理する。同成果物は「frontmatter の resolved 化は済んでおり、残る論点は retired REQ 参照の保持基準（REQ-059 観点）の確定」と主論点を指定し、「判断基準の確定」を主論点、本文・索引の個別修正（F-19/F-20 相当）はその処置に含める主従を指定済み。本成果物はこの主従に従う。
- 判断基準確定後、DEC-013 は :56 を retired/ パス付き「RETIRE 済み」明示へ、README:265 説明列も整序。DEC-022 は REQ-045/REQ-046 の扱いを確定基準へ揃える。
- IR-015 拡張（intake 成果物が保持する論点）との関連も backlog-review での統合時に扱う。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: DEC-013.md:56（retired 表記なし）・frontmatter [REQ-010]・decisions/README.md:265、DEC-022.md:7（REQ-046 残留・REQ-045 除去）・:73（REQ-045 言及残留）を全て実測検証。
- Stream B: intake retired-req 成果物との双方向統合指示と主従指定（intake 側 :27-28）の成立を確認。
