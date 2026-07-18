# Intake Item: case-auto.md に capture-boundaries 参照が欠落

## 発生源

- docs-check 実行日時: 2026-07-18
- 検査スクリプト: check_integrity.ts (CaptureBoundary / command-capture-duty)
- 検査ルート: req-define
- 原因分類: 仮説（case-auto の設計上 capture-boundaries を持たない可能性も要確認）

## 問題

`src/opencode/commands/agentdev/case-auto.md` が `capture-boundaries` 参照を持たない。CaptureBoundary 検査（command-capture-duty）は、各 agentdev command が capture 責務記述として `capture-boundaries` への言及を含むことを期待している。

検出1件:

- ファイル: `src/opencode/commands/agent-dev-flow/src/opencode/commands/agentdev/case-auto.md`
- 期待: capture-boundaries 参照を含むこと
- 実態: 参照なし

## 推奨修正対象

case-auto の設計意図を確認の上、以下いずれかを実施する。

1. **参照追加**: case-auto.md に `capture-boundaries` への参照を追加する（他の委譲起点 command と同じパターン）。
2. **検査例外規則の追加**: case-auto は統合委譲起点であり capture 責務を個別に持たない設計である場合、CaptureBoundary 検査に例外規則を追加する。
3. **設計見直し**: case-auto が capture 責務を持つべきか否かを要件レベルで見直す。

route を req-define にした理由: 本件は command のガイドライン（責務境界）の改訂に関わり、要件定義レベルの判断が含まれるため。req-define で要件を整理してから req-save / spec-save へ進むことが想定される。

昇格先候補: intake-promote で採否判断。req-define への引き継ぎを前提とするため、本 item を起点として REQ 改訂または SPEC 改訂を検討する。

## 関連

- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（CaptureBoundary セクション）
- 対象ファイル: `src/opencode/commands/agentdev/case-auto.md`
- 関連 REQ: REQ-0105（Intake / Learning / Backlog lifecycle、capture 責務）
- 関連 ADR: case-auto の統合委譲設計に関わる ADR 群（ADR-0127 委譲契約、ADR-0137 case-run インライン実行 等）
