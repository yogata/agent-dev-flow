# ra001 sidecar 追加が traceability duplicate-inconsistencies 8 件を生んだ宣言統合を Wave 2-5 で解消する

## 内容

Case 3533（Wave 2-1 RA-001）の PR が `traceability/ra001-jev-failure-contract.yaml` を新設した結果、同一 artifact パス × implementation 役割の対応宣言が複数情報源へ分割し、traceability check の duplicate-inconsistencies が 8 件計上された（merge HEAD 906b6621 実測・merge 前 main d93c900c は 0 件の本変更起因）。

- 対象 artifact: 6系統 Workflow references 6 ファイル（既存 per-skill sidecar `agentdev-workflow-*.yaml` と ra001 sidecar の分割）+ Tool README 2 ファイル（`japanese-prose-correction.yaml` と ra001 sidecar の分割）
- 検査の意味論: 同一（artifact × role）の reqId 集合が情報源間で一致しない場合に finding（lib/check.ts detectDuplicateInconsistencies）。個々の宣言は真の対応関係であり、情報源分割の整備問題
- Wave 2-5（Issue 3537）の完了条件4が「traceability check（duplicate-inconsistencies、unknown-req-refs、invalid-artifact-paths 0 件）」を明示所有しており、処遇反映に伴う宣言追随と同時に解消する前提の経過状態として Wave 2-1 case-close で既知前置引継ぎ判定済み

## 影響

traceability check が exit 2（fail 計上あり）を継続し、後続 Wave の case-close で毎回由来分類の説明が必要になる。宣言の二重管理が増えるほど同 finding が増殖し得る。

## 提案

Wave 2-5（Issue 3537）の処遇反映時に、同一（artifact × role）の宣言を単一情報源へ統合する（ra001 sidecar の req エントリを既存 per-skill sidecar へマージするか、RA 単位 sidecar への集約方針を確定する）。統合時に reqId 集合の和集合が欠落しないことを coverage 実測で確認する。

## 根拠

Epic #3530 Wave 2-1（Issue 3533）case-close の traceability check 実測（merge HEAD 906b6621・main 対照実行で新規性確定）。対応記録コメント（Issue 3533・検証差分節）と Wave 2-5 完了条件4の契約。

https://github.com/yogata/agent-dev-flow/pull/3542
