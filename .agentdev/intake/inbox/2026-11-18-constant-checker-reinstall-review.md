# intake: 恒常 checker 消滅行（区分C 13行）の恒常 checker 再設置要否検討

- **発見元**: Epic #4138 Wave-1 子 Issue #4143（OU-004）case-run。PR #4148 本文 Findings/ Capture候補
- **内容**: traceability/policy.yaml の verification optional（区分C 追加ブロック）に登録した 13行（REQ-010-085・REQ-032-045・REQ-113-001/002・REQ-117-001/002/003/004/007/008/012/014/015）は、恒常 checker（docs-check・check_content_corruption・check_integrity IR・lint_skills・case_run_scripts_typecheck）が 2026-11-11 checker 簡素化（Wave-1・#4136）で削除済みであることに起因する暫定対応。恒常 checker 再設置の要否と、OU-002 確定後の inline 宣言移管の可否を後続別要求として検討する候補
- **分類**: intake 候補（恒常 checker 再設置と宣言運用の検討候補。REQ/Checker 変更を伴うため本 Epic 範囲外）
- **影響**: 区分C 13行の検証対応は policy optional 登録（理由付き）で可視化されているが、恒常 checker による自動検証は不在のまま
- **再評価条件**: traceability policy の区分C 運用を見直す Definition 変更 Case（req-define）の実行時
- **関連**: Issue #4143・PR #4148・Epic #4138・traceability/policy.yaml・Issue #4136（checker 簡素化）
