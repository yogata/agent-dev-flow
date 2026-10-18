# req_draft の artifact_actions oldText に行特定書式が混在し DefinitionEdit 完全一致契約と合わない

- 出所: Case #3782（PR #3783）case-open STEP-3 適用直前照合（artifact_actions 適用前検証）
- 種別: draft 組立契約の整合改善候補
- 事実: RU-0232 由来の REQ-100 編集5（REQ-100-006 行の確定構造対応化）の oldText が行頭表記「| REQ-100-006 | 」を含む形で draft に記録され、現行コーパスでは出現 0 件だった。組立検査 AE-13 の expected_old_count: 1 は行頭表記を含まない部分文面に対する実測であり、REQ-100.md は組立検査以降未変更（最終変更 commit ccebe72f、2026-10-11）のため機械的に確定した。case-open 側は部分文面への機械的転記（合意文言の保持・既存他文の保持・一意出現の実測）で解決した
- 提案: req_draft の artifact_actions oldText の転記規約（行特定のための行頭表記と置換対象部分文面の区別）を定義し、DefinitionEdit 完全一致契約への転記時に行特定装飾を除去する規約を req-define 組立手順または assembly_evidence 検査へ追加する
- 対象: req_draft テンプレート（draft-data 契約）、req-define 組立手順、assemble-draft-section 関連検査