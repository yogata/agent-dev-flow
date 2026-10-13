# REQ-006 の superseded DEC-029 無注記参照是正

- 出所: inspect-docs 20261011T033142Z RQ04（backlog-auto stage 1）
- 種別: 表現是正（superseded Decision 参照の注記）
- 対象: docs/requirements/REQ-006.md:38

## RQ04: superseded Decision への無注記参照

- category: superseded Decision への無注記参照
- target: `docs/requirements/REQ-006.md:38`
- evidence: 「Definition 保存工程（case-ready / case-revise 内部責務。DEC-029）」と記載。同 REQ の他箇所は DEC-033 を参照し、DEC-029 は DEC-033 に supersede されている。
- severity: medium
- confidence: high
- source_of_truth: accepted DEC-033
- recommended_route: 表現是正候補。DEC-033 へ更新するか、DEC-029 が supersede 済みであることを明記する。
- ng_classification: 今回修正対象候補（対象行は今回の delta で変更された）。
- notes: DEC-029 が導入した境界の歴史的引用を意図した可能性はある。

## 処置方針

1. 第1案: REQ-006.md:38 の DEC-029 参照を DEC-033 へ更新する（REQ-006 内の他箇所は DEC-033 参照で統一済みであり、統一漏れの解消）
2. 第2案: DEC-029 が導入した境界の歴史的引用を意図する場合は、supersede 済みである旨の注記を付す

## 処置判断の根拠（inspect-promote 2026-10-13）

- DEC-029 は status: superseded / superseded_by: DEC-033（frontmatter 実確認）
- REQ-006 内の他箇所は DEC-033 参照で統一されており、:38 は統一漏れが濃厚
- どちらの是正案とするかは backlog-review・req-define での確定対象

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: DEC-029.md frontmatter（superseded_by: DEC-033）と REQ-006.md:36-40 の現物実読で superseded 参照を再確認。
- Jev 評価: promote（0.61）で最終判断と一致（観測 20261013T094553Z-2a11 d2）。
