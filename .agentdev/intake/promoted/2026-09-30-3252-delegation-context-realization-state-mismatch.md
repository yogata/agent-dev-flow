# intake: verify-only closure 前提の委譲コンテキスト要約が実現面の実施状態を正しく反映しない事象の再発予防

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

- Case #3252 の case-run 委譲時、structured_context（委譲 prompt）の「実装状態: 実装済み・main merge 済み（…retired REQ-013 dangling 参照への移管註追記）」記述が不正確で、RA-001 は Definition PR #3255 に含まれず case-run 未実施だった（Issue 本文 SSoT「RA-001 は case-run 担当で PR 外」が正）
- 結果として case-run は verify-only closure 前提で受領したが、TS-001 初回検証で移管註不在（RA-001 未適用）を検出し fix-and-reverify（PR #3267）で解消した

## 影響・課題

- 実害は自動回復されたが、委譲コンテキストの要約が実現面の実施状態を誤記すると、verify-only closure の誤発動リスク（PR なしクローズによる未実装完了扱い）が生じ得る
- 会話記憶からの要約生成は実施状態の正確性を保証しない

## 既存要件・成果物との関連

- case-auto orchestration の委譲 prompt 生成規約
- agentdev-workflow-orchestration の runtime-only 判断禁止原則・capture/委譲境界

## 対応候補

- 上位工程（case-auto orchestration・委譲 prompt 生成側）が structured_context の「実装状態」要約を Issue 本文 SSoT・git log 実測と突合してから委譲する規約化
- 突合せず会話記憶から要約を生成しない原則の明文化

## 元 item

- 観測日: 2026-09-30
- 観測元: case-close #3252 Capture 回収（PR #3267 本文 Findings。case-run DEL-CASE3252-RUN-1 で検出）
- 再導出手段: Case #3252（DEL-CASE3252-RUN-1）の Issue 本文 Execution Contract・PR #3267 本文「Findings / Capture候補」(intake) 項目を参照
- 関連: learning 側に「委譲前に RA 単位の実施状態を実測確認」の予防知見（2026-09-30 #3252 エントリ）が対になっていた（Split Rule 分割。learning 側は intake 回収済みとして duplicate 処理）
