# intake: verify-only closure 前提の委譲コンテキスト要約が実現面の実施状態を正しく反映しない事象の再発予防

- 観測日: 2026-09-30
- 観測元: case-close #3252 Capture 回収（PR #3267 本文 Findings。case-run DEL-CASE3252-RUN-1 で検出）
- 種別: 変更候補（再発予防・運用改善）

## 内容

- Case #3252 の case-run 委譲時、structured_context（委譲 prompt）の「実装状態: 実装済み・main merge 済み（…retired REQ-013 dangling 参照への移管註追記）」記述が不正確で、RA-001 は Definition PR #3255 に含まれず case-run 未実施だった（Issue 本文 SSoT「RA-001 は case-run 担当で PR 外」が正）。
- 結果として case-run は verify-only closure 前提で受領したが、TS-001 初回検証で移管註不在（RA-001 未適用）を検出し fix-and-reverify（PR #3267）で解消した。実害は自動回復されたが、委譲コンテキストの要約が実現面の実施状態を誤記すると、verify-only closure の誤発動リスク（PR なしクローズによる未実装完了扱い）が生じ得る。
- 期待する状態: 上位工程（case-auto orchestration・委譲 prompt 生成側）が structured_context の「実装状態」要約を Issue 本文 SSoT・git log 実測と突合してから委譲する。突合せず会話記憶から要約を生成しない。

## 再導出手段

- Case #3252（DEL-CASE3252-RUN-1）の Issue 本文 Execution Contract・PR #3267 本文「Findings / Capture候補」(intake) 項目を参照。
- 対応候補先: case-auto orchestration の委譲 prompt 生成規約（case-run 委譲 structured_context の runtime-only 判断禁止原則との整合）、agentdev-workflow-orchestration の capture/委譲境界参照。
