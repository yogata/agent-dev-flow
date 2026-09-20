# DEC 承認記録節の受理後陳腐化記述（DEC-031〜039 の残り 8 件）

## 対象

`docs/decisions/DEC-031.md`・`DEC-032.md`・`DEC-033.md`・`DEC-034.md`・`DEC-035.md`・`DEC-037.md`・`DEC-038.md`・`DEC-039.md` の各「承認記録」節第 1 文。

## 観測された不整合

上記 8 Decision の frontmatter status はすべて accepted である（第3段受理 commit 0d991aa6 で一括受理）が、「承認記録」節第 1 文は「本 Decision は proposed のままで維持する（REQ-030-005）。accepted への状態遷移は case-ready の Decision 受理評価が実行する。」のまま残置しており、現状（受理済み）と矛盾する。第13段（Case #3036）で DEC-036 の同一形式記述を現状整合化した（Definition PR #3037・ACT-DEC-001）が、他 8 件は同段の合意範囲外として本起票に分離された。

## 発見経路と証跡

- 第13段 case-open（Definition PR #3037 Findings・2026-09-20）で「proposed のままで維持する」旨の記述が DEC-031〜039 の 9 ファイルに存在することが観測され、要件doc AG-004 の intake 起票分離に従い case-run の網羅監査（TS-006・REQ-045 10 観点）での正式起票とされた。
- 第13段 case-run 監査（req-045-consistency-audit-20260920.md §6 F-001・PC-001 問題クラス）で 8 件の所在を確定: DEC-031: L36・DEC-032: L39・DEC-033: L37・DEC-034: L41・DEC-035: L30・DEC-037: L38・DEC-038: L54・DEC-039: L61。

## 影響候補

- 深刻度低（動作影響なし）。Decision の状態契約は frontmatter status が正であり、承認記録節の旧記述は意味の誤解を招く残留。
- 第3段受理時に status のみ遷移し本文承認記録節が proposed 前提のまま残置された同一原因由来（PC-001）。

## 提案（修正候補）

- DEC-036 と同一様式の現状整合化（各 1 行の文言更新: 「本 Decision の受理は v4.0.0-rc.1 cutover 前の第3段（REQ/Decision/Design implementation）で実施済みであり、現行 status は accepted である。accepted への状態遷移は case-ready の Decision 受理評価（REQ-030-005）が実施した。」への置換・決定本文・frontmatter 不変）。
- 再発防止候補: 受理評価時に承認記録節の現状整合を含める運用、または承認記録を frontmatter status 参照形式へ変更する Design 変更（採用判断は intake-promote が所有）。

## 出典

- 第13段 full validation Case #3036 の case-run 網羅監査（2026-09-20・監査レポート docs/reports/integrity/audits/req-045-consistency-audit-20260920.md）
- 発見時の canonical 基準 commit: cbb3a637（v4-dev）
