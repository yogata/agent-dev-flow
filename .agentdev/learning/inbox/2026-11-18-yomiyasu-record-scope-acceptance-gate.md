---
id: learn-20261118-yomiyasu-record-scope-acceptance-gate
created_at: 2026-11-18
source: case-run deviation capture (Root Case #4150)
status: inbox
---
# case-open が yomiyasu 適用記録を PR 本文のみに限定して記録し case-ready の acceptance_gates で merge 抑止を生んだ

- 問題事象: case-open が作成した設計PR の yomiyasu 適用記録の対象が「PR 本文」に限定されており、docs/** の日本語文章変更（REQ/Decision/Design 等の変更文章）への適用記録が PR 上に存在しなかった。case-ready の acceptance_gates gate 3（「当該変更文章への yomiyasu 適用記録が PR 上に存在すること」）がこれを欠落として検出し、設計PR の merge を抑止した
- 発生局面: case-ready STEP-1 の merge 前置確認（acceptance_gates 前置確認、Case #4150、PR #4152）
- 検知方法: case-ready extension（.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml）の acceptance_gates gate 3 と PR 検証欄記録の対象欄突合。docs/** 変更の該当性は pr_changed_files で機械確認した
- 根本原因: case-open STEP-4 の記録義務（references/definition-pr-and-idempotency.md「docs 配下の日本語変更を対象とした yomiyasu 適用記録を PR 本文（検証欄等）または PR コメントへ記録」）の対象読みを PR 本文に狭めた（記録の対象欄に docs/** 変更ファイル一覧を含めなかった）
- 自律対応内容: merge を抑止し、CI 失敗と同一経路（PR 保持・修復後の case-ready 再実行）で停止した。STEP-2 以降は未実施、draft は保持
- ユーザー確認有無: なし（fail-closed 契約の機械的適用。acceptance_gates 欠落を warning 化して merge を継続する経路は存在しない）
- Decision/REQ/spec 影響: REQ-098-002（case-ready の merge 前適用確認）、agentdev-workflow-case-open references/definition-pr-and-idempotency.md、agentdev-workflow-case-ready extension acceptance_gates
- 横展開観点: 記録義務を持つ工程では、記録の対象欄を上位の記録対象要件（docs/** 変更文章等）と突合してから投稿する。対象欄を書込対象の一部（PR 本文等）に限定した記録は上位要件の検出条件を満たさない
- 再発条件: docs/** の日本語変更を含む設計PR を case-open が作成し、yomiyasu 適用記録の対象を PR 本文のみに限定する場合
- 予防策候補: case-open reference の記録義務へ「対象欄に docs/** 変更ファイル一覧を含める」例示を明記し、記録様式の最小要件を具体化する
- 想定反映先: agentdev-workflow-case-open references/definition-pr-and-idempotency.md（PR 作成直後の yomiyasu 適用記録手順）
- 関連: Case #4150、PR #4152
- タグ: yomiyasu、acceptance_gates、merge 抑止、記録漏れ
