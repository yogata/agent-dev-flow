# docs-check 安定 NG 2 件の恒久解消未達

## 観察

以下の docs-check NG 2 件は、2026-06-24 〜 2026-06-27 の複数 PR で「既存 NG」「本 PR 前後で不変」「本スコープ外」と報告され続け、未解決のまま残置されている。PR #1147（Issue #1145「docs-check 安定 NG 解消」）で NG 4 件中 2 件のみ解消され、本 2 件は残置された。

- **F-1 req-range-staleness**: `docs/guides/project-docs-and-specs.md` の REQ 範囲表記が陳腐化している。PR #1134 は当該ファイルを「REQ-0030〜0051 まで拡張すること。intake 候補」と明示的に記録した。
- **F-2 command-capture-duty**: `src/opencode/commands/agentdev/case-close.md` に「回収・保存」duty keyword が不在。docs-check が case-close command の capture duty を検出できない。

## 修正されなかった理由

各 PR のスコープ（test strategy 実装、SPEC 昇格、link mode 移行等）と無関係な pre-existing NG であるため。各 PR は `on_failure: record-in-findings` で Findings 記録のみ行い、本 PR では修正しない運用をとった。結果として 7 日間で 5 PR 以上が同様の記録を繰り返している。

## 課題

- F-1: `docs/guides/project-docs-and-specs.md` の REQ 範囲表記を実態（REQ-0030〜0051）へ拡張するか、あるいは範囲記述そのものを廃止するか
- F-2: `case-close.md` の capture duty keyword を追加するか、あるいは検出ルール `command-capture-duty` 側の許容 keyword を拡張するか
- 両者とも独立した小修正 Issue として扱うか、関連する command/SPEC 整備にまとめるか

## 根拠

- PR #1134（Issue #1130）Findings: 「F-1: req-range-staleness (既存NG、スコープ外)」「REQ range を REQ-0030〜0051 まで拡張すること。intake 候補。」
- PR #1137（Issue #1133）Findings: 「既存 NG 2 件（req-range-staleness、command-capture-duty）は本 PR 前後で不変」「後続 intake 候補として記録する」
- PR #1147（Issue #1145）: docs-check 安定 NG 4 件の解消を実施したが、本 2 件は別課題として残置
- PR #1159（Issue #1155）Findings: 「既存NG（req-range-staleness, スコープ外）」
- PR #1125（Issue #1116）Findings: 「docs-check の 2 ng / 5 warning はすべて本 Issue 対象外の既存検出事項」

## 観測元

- PR #1125, #1134, #1137, #1147, #1159
- Issue #1116, #1130, #1133, #1145, #1155
