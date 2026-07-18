# Intake Item: references/<harness>.md プレースホルダー参照が ReferencePath 検査で NG 再検出（11件）

## 発生源

- 発生 phase: /repo/docs-check 実行（2026-07-18 04:35）
- capture 分類: intake（具体的作業候補 = checker 除外パターンの実装完了確認または文書表記変更）

## 問題

`check_integrity.ts` の ReferencePath 検査が、配布 Command/Skill 本文中の抽象参照表記 `references/<harness>.md` をリテラルパスと解釈して NG（reference-path-existence）を11件検出している。`<harness>` は ADR-0136 / REQ-0162-002 で定める harness 実行制御分離におけるパラメータプレースホルダーであり、実ファイル名ではない。REQ-0144-025 によって除外パターンを追加済みだが、下記11件すべてが依然 NG として報告され、除外が機能していない。

検出対象（11件、全て route: intake）:

- `src/opencode/commands/agentdev/case-auto.md:65, 97, 138`
- `src/opencode/commands/agentdev/case-run.md:141, 213`
- `src/opencode/skills/agentdev-architecture-advisory/SKILL.md:76`
- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:29, 31, 130, 132, 159`

いずれも「起動手段は AGENTS.md / references/<harness>.md 参照（REQ-0162-002）」など、harness 固有ファイルを抽象参照する意図的な記述である。

原因分類: 確認済（REQ-0144-025 で追加されたはずの除外パターンが実チェッカーに反映されていない、またはパターンが `<harness>` 構文を網羅していない）。

## 推奨修正対象

以下のいずれか単独、または組み合わせで対応する。採否は intake-promote / backlog-review で確定する。

1. `check_integrity.ts` の ReferencePath 検査において `references/<harness>.md` のような `<placeholder>` 構文を除外対象に追加する。REQ-0144-025 の実装完了確認。
2. 除外が困難な場合は、配布物側の表記を「`agentdev-project-extensions` skill 経由で参照」等の抽象参照に変更し、リテラルパスを除去する。

いずれの方向でも `references/<harness>.md` を NG から除去することを完了条件とする。

## 関連

- 発見元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report.md` ReferencePath セクション（非永続・commit対象外）
- 要件: REQ-0144-025（placeholder 検査対象外）、REQ-0162-002（harness 実行制御分離）
- ADR: ADR-0136（harness 実行制御分離）
- 既存 intake item: `intake-2026-07-15-1516-check-integrity-ts003.md`（TS-003 検証として本件の未完了作業を指摘。本 item は同作業が未完了のまま再検出された事象を新証拠として記録）
