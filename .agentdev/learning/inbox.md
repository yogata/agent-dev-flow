# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-18: REQ 行追加時の Design 宣言追随確認漏れ（REQ-021-026 遵守漏れ）

- **問題事象**: case-open が REQ 行追加 (REQ-061-034/035, REQ-021-029) と REQ-057-018 行更新を伴う Definition PR (#2955) を作成した際、対象 Design ヘッダの ADF-COVERS(design) 宣言の追随を行わなかった。case-ready STEP-2 の traceability check で missing-design 4 行が検出され、ready へ遷移せず case-open へ差し戻し (Root Case #2954 停止報告 comment)。
- **発生局面**: case-open STEP-4 (Definition PR 作成)。REQ-021-026 (Design 保存内部責務における既存対応宣言ブロックの更新要否確認) の確認対象から Design ヘッダ宣言が漏れた。
- **検知方法**: case-ready STEP-2 の traceability check 機械実行 (`bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --req ...`)。case-open 時点では宣言追随の機械確認を実施していなかった。
- **根本原因**: REQ 行追加を伴う Definition Package 生成時、ACT-DESIGN-* の本文追記と REQ テーブル行の変更のみを確認し、変更対象 Design ヘッダの宣言ブロック更新要否 (REQ-021-026) を確認手順に組み込んでいなかった。
- **自律対応内容**: 差し戻し経路で追修正 Definition PR (#2956) を作成し、3 Design の宣言追随 (case-ready.md / req-define.md の宣言行追記、checker-execution-contracts.md へ ADF-COVERS(design): REQ-057-018 新設) を適用。check.ts で missing-design 0 件を機械確認済み。
- **ユーザー確認の有無**: なし (宣言追随のみの機械的修正、case-auto 委譲内で完結)
- **Decision/REQ/spec影響**: なし (REQ-021-026 の遵守手順の明確化のみ。新規 Decision / REQ 変更なし)
- **横展開観点**: REQ 行追加 (append) と既存行更新 (update) のいずれの場合も、変更対象 Design ヘッダの ADF-COVERS 宣言の追随要否確認を Definition PR 作成の完了条件に含めるべき。「行更新と直結する Design の design 宣言不在」という事前存在欠陥 (REQ-057-018 事例) も同確認で検出可能。
- **再発条件**: REQ 行の追加・更新を伴う Definition 変更で、該当 Design の宣言ブロック確認を省略した場合に再発する。
- **予防策候補**: case-open の Definition PR 作成手順に「draft artifact_actions が REQ 行変更を含む場合、変更対象 Design ヘッダの宣言ブロック更新要否を REQ-021-026 として確認し、check.ts 機械実行 (missing-design 0 件) を PR 作成前の機械ゲートとして実施する」ことを追加。
- **想定反映先**: case-open workflow skill (`references/root-case-and-definition-package.md` または `references/definition-pr-and-idempotency.md`)、learning-promote の評価対象。
- **関連**: Case #2954、PR #2955 (merge 済み)、PR #2956 (追修正)、case-ready 停止報告 comment (issuecomment-5723763427)、REQ-021-026、REQ-061-033
- **タグ**: #case-open #definition-pr #traceability #宣言追随 #REQ-021-026 #missing-design

---
