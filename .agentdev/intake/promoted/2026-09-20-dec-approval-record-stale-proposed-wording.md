# DEC 承認記録節の受理後陳腐化記述（DEC-031〜039 の残り 8 件の現状整合化候補）

## 観測

`docs/decisions/DEC-031.md`・`DEC-032.md`・`DEC-033.md`・`DEC-034.md`・`DEC-035.md`・`DEC-037.md`・`DEC-038.md`・`DEC-039.md` の各「承認記録」節第 1 文が「本 Decision は proposed のままで維持する（REQ-030-005）。accepted への状態遷移は case-ready の Decision 受理評価が実行する。」のまま残存しており、frontmatter status（全件 accepted、第3段受理 commit 0d991aa6 で一括受理）と矛盾する。

2026-09-20 時点の現行 main（87d7c6a8）で 8 ファイルの残存を確認済み。行番号は第13段監査報告と一致する:

- DEC-031: L36 / DEC-032: L39 / DEC-033: L37 / DEC-034: L41 / DEC-035: L30 / DEC-037: L38 / DEC-038: L54 / DEC-039: L61
- DEC-036 は第13段（Case #3036・Definition PR #3037 ACT-DEC-001）で同一形式記述の現状整合化を完了済みであり、対象外。

## 影響

- 深刻度低（動作影響なし）。Decision の状態契約は frontmatter status が正であり、承認記録節の旧記述は意味の誤解を招く残留である。
- 第3段受理時に status のみ遷移し本文承認記録節が proposed 前提のまま残置された同一原因（PC-001）由来。DEC-036 のみが修正済みの部分解決状態が続く限り、同一不整合の一部のみ整合化された一貫性欠如が継続する。

## レビューで決めること

- 8 件へ DEC-036 と同一様式の現状整合化（各 1 行の文言置換: 「本 Decision の受理は v4.0.0-rc.1 cutover 前の第3段（REQ/Decision/Design implementation）で実施済みであり、現行 status は accepted である。accepted への状態遷移は case-ready の Decision 受理評価（REQ-030-005）が実施した。」への置換。決定本文・frontmatter は不変）の実施。
- 再発防止候補の採用要否: (a) 受理評価時に承認記録節の現状整合を含める運用、(b) 承認記録を frontmatter status 参照形式へ変更する Design 変更。採用判断は backlog-review 以降の正規経路が所有する。

## 根拠

- 第13段 full validation Case #3036 の case-run 網羅監査（2026-09-20、監査レポート `docs/reports/integrity/audits/req-045-consistency-audit-20260920.md` §6 F-001・問題クラス PC-001）。
- 発見時 canonical commit: cbb3a637（v4-dev）。現行 main（87d7c6a8、2026-09-20 grep 検証）でも同一状態。

## intake-promote 確定注記（2026-09-20、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用」で自律確定した。主要根拠: 現行 main で 8 ファイルの陳腐化記述が grep により現存確認でき（行番号も監査報告と一致）、DEC-036 で同一様式の現状整合化前例（ACT-DEC-001）が確立しているため、ユーザー承認済み処分方針「v4 で有効 → promote」の適用が自明であるため（HITL 不要）。文言置換の実行は backlog-review 以降の正規経路（RU 化 → Case 実行）で行われ、本 workflow では実行しない。
