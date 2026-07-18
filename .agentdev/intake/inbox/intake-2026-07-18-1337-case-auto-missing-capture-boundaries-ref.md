# Intake Item: case-auto.md が 'capture-boundaries' 参照を欠く（CaptureBoundary NG）

## 発生源

- 発生 phase: /repo/docs-check 実行（2026-07-18 04:35）
- capture 分類: intake（具体的作業候補 = capture-boundaries 参照の追加）
- 報告 route: req-define（intake item としては取り扱う。route は参考記録）

## 問題

`check_integrity.ts` の CaptureBoundary 検査（command-capture-duty）が `src/opencode/commands/agentdev/case-auto.md` を NG として検出した。case-auto.md は他の agentdev command と同様に PR 作成・Issue クローズを伴う command であるにもかかわらず、`capture-boundaries`（`docs/specs/workflows/capture-boundaries.md`）への参照を欠いている。

`docs/specs/workflows/capture-boundaries.md` は REQ-0105 で定めるキャプチャ境界 SPEC であり、成果物・PR・Issue を伴う command は例外なく当該 SPEC への参照を本文に含むことが期待されている。case-open/case-run/case-close 等の姉妹 command は参照を含むが、case-auto のみ参照漏れとなっている。

原因分類: 確認済（case-auto 新設時の参照追加漏れ。REQ-0105 のキャプチャ境界参照要件が case-auto にも及ぶことの見落とし）。

## 推奨修正対象

`src/opencode/commands/agentdev/case-auto.md` に `capture-boundaries` への参照を追加する。具体的位置は case-auto の手順構造に合わせて決定する（例: ガードレールセクションまたは完了報告手順の参照枠）。他の agentdev command の記載様式に合わせる。

完了条件は `check_integrity.ts` の CaptureBoundary 検査が case-auto.md について OK になること。

## 関連

- 発見元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report.md` CaptureBoundary セクション（非永続・commit対象外）
- SPEC: `docs/specs/workflows/capture-boundaries.md`（キャプチャ境界 SPEC）
- 要件: REQ-0105（Intake / Learning / Backlog lifecycle、キャプチャ境界）
- 参照原型: `src/opencode/commands/agentdev/case-open.md`, `case-run.md`, `case-close.md` の capture-boundaries 参照記述
