---
id: learn-20261119-projection-removal-cover-declaration-migration
created_at: 2026-11-19
source: case-close deviation capture (Root Case #4150・Epic 最終受入評価)
status: inbox
---
# 投影撤去で旧投影側の inline ADF-COVERS(verification) 宣言が消滅し、2 Wave 際立ってから Epic 最終受入で完了阻止になった

- 問題事象: Wave-2 の src 正本化で旧投影 .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts が削除され、同ファイルが担っていた ADF-COVERS(verification): REQ-119-004, REQ-119-005, REQ-122-002, REQ-122-004 宣言が移行先へ追記されず消滅した。Epic #4150 の最終受入評価（Epic 相当 QG-4）で REQ-122-002・REQ-122-004 の missing-verification として検出され、完了阻止条件該当で Epic を blocked 停止させた（REQ-119-004・REQ-119-005 も同根欠落）
- 発生局面: case-run Wave-2（Issue 4154・PR 4158・merge commit a574451c5）の実装で発生。検出は Epic 最終受入評価（case-close 相当の別委譲・2026-11-18・main HEAD 6b3a205b6）
- 検知方法: traceability check --req（対象 REQ 行 41 行集合）の missing-verification 機械検出。Wave-1 完了時点では同一行集合で pass 12 / fail 0（#4153 完了記録）だったため、git log -S で宣言除去 commit（a574451c5）を機械特定した
- 根本原因: 投影側ファイルの inline ADF-COVERS 宣言が covers の実体だった箇所に対し、src 正本化（投影撤去・正本側新設）の変更手順が「inline covers 宣言の移行先への追記」を追随対象として扱っていなかった。削除されるファイルが宣言の実体を担う場合、宣言の再配置（正本側テスト資産または sidecar）が同一変更内で必要になるが、Wave-2 の検証差分にこの確認項目が存在しなかった
- 自律対応内容: 実施せず（対応関係の自動追加・修正は契約上禁止・REQ 意味変更禁止のため）。Epic #4150 を blocked で停止し、停止記録（再開条件付き）と本学びを残した
- ユーザー確認有無: なし（機械事実の fail-closed 報告）
- Decision/REQ/spec 影響: 投影撤去を伴う構造変更（src 正本化・配布物撤退等）の検証義務への「inline ADF-COVERS 宣言の移行先追記確認」追加が候補。REQ-122-002・REQ-122-004・REQ-119-004・REQ-119-005 の verification 宣言移行は後続修正 case の対象
- 横展開観点: 投影・配布物のファイルを削除する変更では、削除対象が担う covers・policy・マニフェスト宣言を事前に grep し、再配置先を同一変更内で確定する。traceability check の判定は covers 宣言の実在に依存するため、宣言消滅は実行時の --req 集合に宣言対象行が含まれないと見えない。Wave 単位の scoped check では直前 Wave の成果に依存する行の drift が次の Wave で隠れる
- 再発条件: 投影撤去・ファイル削除を伴う構造変更で、削除対象の inline ADF-COVERS 宣言が移行されない場合。かつ後続 Wave・最終受入の --req 集合が宣言対象行を含む場合（含まなければ欠落は corpus 完全性の診断指標にのみ現れる）
- 予防策候補: case-run の前置 gate に「削除ファイルの inline 宣言の事前 grep と移行先確定」を追加する。各 Wave の scoped check の --req 集合を本 REQ の対象行集合全体とし、Phase をまたぐ行集合の drift を Wave 内で検出できるようにする
- 想定反映先: case-run workflow の前置 gate・traceability sidecar 設計・REQ-122 停止記録の再開条件
- 関連: Case 4150（Epic・blocked・停止記録 2026-11-18）・Issue 4154（Wave-2）・PR 4158・REQ-122-002/004・REQ-119-004/005・Issue 4153 完了記録（Wave-1 時点 pass 12 / fail 0）
- タグ: covers 宣言、投影撤去、src 正本化、verification 欠落、traceability、完了阻止、fail-closed