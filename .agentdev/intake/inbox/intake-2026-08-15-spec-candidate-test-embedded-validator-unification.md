# intake: SPEC確定候補（見送り）— テスト内蔵 command validator を配布 checker 規則へ単一化する契約

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- Issue: #2108（OU-008a 全受け入れ条件再検証）
- 取得元: PR #2118 本文「## SPEC確定候補」
- 処置記録: case-close Step 3-2 SPEC 確定フロー処置パターン (c) 見送り（候補を Findings / Capture候補に準じて記録し後続へ委ねる）。本 remediation は D+ 方式（既存 REQ UPDATE のみ）で完了間近（OU-008b cutover 残）のため、新規 SPEC 契約の確定は本 Issue のスコープ外と判断した

## 問題事象

テスト内蔵 command validator（`validateCommand`）と配布 checker（`check_command_format.ts` / `command-format-rules.yaml`）が同種の整合性検証を二重実装している状態に契約上の規定がない。単一実装原則（整合性検査の規則は配布 checker 側に一元化する）が明文化されていないため、構造変更時にテスト側だけが陳腐化する事象（OU-008a v1 fail 24 件）が再発しうる。

## 影響

- Command 構造の変更規則が二重管理され、片方だけが更新される状態を契約レベルで防止できない
- integrity ドメインまたは authoring/command-file-format の検査契約に「整合性検査の単一実装」原則が存在しない

## 発生局面

検証（OU-008a v1 差し戻し分析、SPEC確定候補として起案）

## 検知方法

OU-008a v1 の TS-005 における非対称な失敗（配布 checker ok=true のままテスト内蔵 validator のみ旧構造を要求し 24 fail）。

## 想定される対応方向

- integrity ドメインまたは authoring/command-file-format の検査契約として「テストは配布 checker の規則を参照し、独立実装の validator を持たない」単一化契約を確定する
- 実装側の単一化タスク（intake-2026-08-15-validatecommand-dual-management-unification.md）と一体で req-define / spec-save 経由の要件化を検討する
- 採否は backlog-review 以降の判断

## 関連

- Epic: #2099, Issue: #2108（OU-008a）, PR: #2118
- 実装側 intake: intake-2026-08-15-validatecommand-dual-management-unification.md
- 対象: `commands_error_cases.test.ts`、`check_command_format.ts`、`command-format-rules.yaml`

## 出典引用

PR #2118 本文「## SPEC確定候補」より:

> テスト内蔵 command validator（validateCommand）を配布 checker（check_command_format.ts / command-format-rules.yaml）の規則から単一化する契約。整合性検査の単一実装化（integrity ドメインまたは authoring/command-file-format の検査契約側）として確定候補

## タグ

#intake #spec-candidate #validator-unification #single-implementation #command-format-rules #epic-2099
