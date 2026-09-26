#### DS-04: harness-separation-model.md の DEC-002 引用が兄弟 4 ファイルと異なり後継注記を欠く
- **category**: superseded Decision 引用の注記不一致（check_integrity WARNING 7件の意味検証結果）
- **target**: docs/designs/foundations/harness-separation-model.md:150
- **evidence**: 「DEC-002（OpenCode ソース・プロジェクション分離）: 本 Design の harness 非依存原則を原本とプロジェクションの分離によって物理層で担保する。」と現在形で記述し superseded/後継注記がない。vocabulary-registry.md:28、document-model.md:375、runtime-package-boundary.md:271、workflow-skill-model.md:102 はすべて「この原則は DEC-002 由来、現行の責務体制は DEC-036」と明記
- **severity**: low / **confidence**: high
- **source_of_truth**: DEC-036（本文 :109/:115 は DEC-036 を権威として認識済み）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: check_integrity の accepted-adr-only-citation WARNING 7件のうち 6件（上記兄弟4件＋v3-v4-crosswalk.md:53-54 の DEC-005/007）は「由来＋現行権威明記」または移行記録として正当と判定。本件のみ修正価値あり

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: 併合 promote（ユーザー承認 Q4）。2026-09-25 F-07 と統合（F-07 defer は本 promote で解消）。修正方向: #3122 注記式（兄弟4ファイルと同一様式）への統一
- 後続: backlog-review による RU 化

## 併合元 (2026-09-25 F-07)

### F-07: harness-separation-model.md の superseded DEC-002 引用が縮約注記式未修正

- id: F-07
- category: 横断契約矛盾（superseded 引用）
- target: docs/designs/foundations/harness-separation-model.md:150
- evidence: 「DEC-002（OpenCode ソース・プロジェクション分離）: 本 Design の harness 非依存原則を原本とプロジェクションの分離によって物理層で担保する。」— superseded 済み（DEC-036 が後継）の DEC-002 を「関連」節で現行根拠のように記述。同種引用は Case #3122（コミット 47918c05）で 4 ファイルが「〜由来、現行の責務体制は DEC-036」の縮約注記式へ修正済みだが本ファイルのみ旧式のまま残存
- severity: medium
- confidence: medium（「関連」節は交叉参照リストとの解釈も可能。ただし #3122 修正方針との一貫性が崩れている）
- source_of_truth: 承認済み Decision の現行 status（superseded チェーン）を正として判定
- recommended_route: intake（#3122 と同一の縮約注記式への修正）
- ng_classification: pre-existing
- notes: check_integrity の accepted-adr-only-citation WARNING 7 件のうち、現行候補と確定したのは本 1 件（v3-v4-crosswalk の DEC-002/005/007 は履歴文脈で対象外、他 4 件は #3122 修正済み）
