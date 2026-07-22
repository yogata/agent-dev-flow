# case-auto.md に capture-boundaries 参照が欠落

## 観測内容

`src/opencode/commands/agentdev/case-auto.md` が `capture-boundaries` 参照を持たない。CaptureBoundary 検査（command-capture-duty、check_integrity.ts）は、各 agentdev command が capture 責務記述として `capture-boundaries` への言及を含むことを期待している。case-auto で検出1件（参照なし）。

## 影響

- 検査スクリプトが case-auto を capture 責務不在と判定する可能性がある。
- ただし case-auto は統合委譲起点であり、capture 責務を個別に持たない設計である可能性がある（要確認）。この場合、参照欠落は不具合ではなく設計上の期待値と整合しない検査側の問題となる。

## 課題

case-auto の設計意図を要件レベルで確認した上で、以下いずれかを実施する必要がある。本件は command のガイドライン（責務境界）の改訂に関わり、要件定義レベルの判断を含むため req-define route としている。

1. **参照追加**: case-auto.md に `capture-boundaries` への参照を追加する（他の委譲起点 command と同じパターン）
2. **検査例外規則の追加**: case-auto は統合委譲起点であり capture 責務を個別に持たない設計である場合、CaptureBoundary 検査に例外規則を追加する
3. **設計見直し**: case-auto が capture 責務を持つべきか否かを要件レベルで見直す

## 既存要件との関連

- REQ-0105（Intake / Learning / Backlog lifecycle、capture 責務）
- ADR-0127（委譲契約）
- ADR-0137（case-run インライン実行）

## 想定反映先

- `src/opencode/commands/agentdev/case-auto.md`（選択肢1採用時）
- CaptureBoundary 検査実装（`check_integrity.ts`、選択肢2採用時）
- REQ-0105 関連 SPEC / ADR（選択肢3採用時、要件レベル見直し）

## 優先度

medium（設計意図の確認が前提、機能阻害なし、検査ノイズの継続）

## 関連

- 検出元: docs-check 実行日時 2026-07-18、検査スクリプト check_integrity.ts（CaptureBoundary / command-capture-duty）
- 検査ルート: req-define
- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（CaptureBoundary セクション）
- 対象ファイル: `src/opencode/commands/agentdev/case-auto.md`
- 原因分類: 仮説（case-auto の設計上 capture-boundaries を持たない可能性も要確認）
