# integrity-contracts.md の移行計画 normative 参照残存（不所存パス参照）

## 観測

docs/designs/integrity/integrity-contracts.md に不所存パスへの参照が残存する。

- L477 付近: 「詳細 normative は移行計画 §7（`.omo/plans/agentdev-migration-2026-08-05.md`）を正とする」
- L550 付近: 「実行結果は `.omo/plans/agentdev-migration-2026-08-05.regression.md` へ記録する」

参照先はいずれも Test-Path False（不所存）。

## 今回扱わない理由

OU-011（Issue #2514・PR #2534）の AG-010 対象パス外のため本バッチでは対応せず。F-25 の是正（README-INSTALL.md 側の同参照除去）のみ実施済み。

## 影響

REQ-057-015（Design は未確定事項・将来計画を保持しない）との緊張が継続する。normative 宣言が不所存文書を指し、参照辿りが失敗する。

## レビューで決めること

- integrity-contracts.md 側の2参照の除去・付け替え先（normative 宣言自体の残置要否を含む）の判断
- REQ-057-015 との緊張解消の方法（Design 側の規約適用か、参照の正当化か）

## 根拠

- PR #2534 本文「Findings/ Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2534）
