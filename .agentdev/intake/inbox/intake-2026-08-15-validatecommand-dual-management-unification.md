# intake: commands_error_cases.test.ts 内蔵 validateCommand が配布 checker と二重管理になっている（単一化候補）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- Issue: #2108（OU-008a 全受け入れ条件再検証）
- 取得元: PR #2118 本文「## Findings / Capture候補」>「### intake」

## 問題事象

`commands_error_cases.test.ts` 内蔵の `validateCommand`（L106-134）が、配布 checker（`check_command_format.ts`）と同種の検証を独立実装しており二重管理になっている。旧 fat-command モデルの期待値（steps 必須等）を含むため、thin Command モデルへの移行時に配布 checker 側は追従してもテスト内蔵側が陳腐化する（OU-008a v1 で REQ-0030-011 由来 8 Command × 3 テストファイル = 24 fail の陳腐化期待値として顕在化）。

## 影響

- 配布 checker とテスト内蔵 validator の判定基準が独立に変化し、片方だけが新しい構造に追従する状態が発生する（今回の v1 fail 24 件の直接原因）
- Command 構造変更（thin 化等）のたびに二重の期待値更新が必要になり、更新漏れが fail として現れる

## 発生局面

検証（OU-008a TS-005 full integrity suite 実行、v1 差し戻し分析）

## 検知方法

`bun test ./.opencode/skills/repo-agentdev-integrity/` における REQ-0030-011「passes full validation」系テストの失敗。配布 checker（check_command_format.ts）は ok=true のまま、テスト内蔵 validateCommand のみ旧構造を要求する非対称な失敗として観測。

## 想定される対応方向

- (a) テスト内蔵 `validateCommand` を廃止し、配布 checker の規則（`command-format-rules.yaml`）から期待値を単一化する
- (b) `validateCommand` を checker 規則の読み込み側に切り替える（単一実装の参照）
- (a)/(b) の選定と対象スコープは backlog-review で判断する。後述の SPEC確定候補（intake-2026-08-15-spec-candidate-test-embedded-validator-unification.md）と合わせた契約レベルの整理候補

## 関連

- Epic: #2099, Issue: #2108（OU-008a）, PR: #2118（fix: 当該テスト期待値の thin Command モデル更新）
- 対象: `commands_error_cases.test.ts` 内蔵 `validateCommand`、`check_command_format.ts`、`command-format-rules.yaml`
- 併記 learning: pre-existing 判定基準（remediation baseline 基準）、構造変更 PR の契約テスト期待値更新（PR #2118 Findings learning 節）
- SPEC確定候補（見送り intake 化）: intake-2026-08-15-spec-candidate-test-embedded-validator-unification.md

## 出典引用

PR #2118 本文「## Findings / Capture候補」>「### intake」より:

> 発見元: 本 PR の TS-005 検証。内容: `commands_error_cases.test.ts` 内蔵 `validateCommand`（L106-134）が配布 checker（check_command_format.ts）と同種の検証を独立実装しており二重管理になっている（steps 必須など旧モデルの期待値を含む）。配布 checker の規則（command-format-rules.yaml）から単一化すべき。分類: intake

## タグ

#intake #validatecommand #dual-management #check-command-format #stale-test-expectation #epic-2099
