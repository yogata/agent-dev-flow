# intake: SPEC確定候補（見送り）—「full integrity suite pass」受入れ基準の明文化

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- Issue: #2108（OU-008a 全受け入れ条件再検証）
- 取得元: PR #2118 本文「## SPEC確定候補」
- 処置記録: case-close Step 3-2 SPEC 確定フロー処置パターン (c) 見送り（候補を Findings / Capture候補に準じて記録し後続へ委ねる）。本 remediation は D+ 方式で完了間近（OU-008b cutover 残）のため、品質ゲート側への新規受入れ基準の確定は本 Issue のスコープ外と判断した

## 問題事象

「full integrity suite pass」の受入れ基準が明文化されていない。OU-008a の AC-17 判定は「bun test 全 green」基準で実施したが、実際には既知 intake 済み欠陥（ADR README 由来 1 件）と環境依存欠陥（junction 未伝播 worktree の check_templates 系 3 件）が残存し、v1 §4 の再実行基準（「remediation 由因 fail 0、残る既知: ADR README 1 件 + junction 3 件」）として運用で補完した。さらに case-close 独立再検証では main repo 環境固有の fail（git 管理外 node_modules 由来の TS-009、junction 環境でしか走査されない stale See Also 参照）が現れ、検証環境により fail 構成が変動することも判明した。基準自体の明文化なくしては再検証時の判定揺れを防げない。

## 影響

- 「全 green」「由来別除外」のいずれを基準とするかが検証実施者の判断に委ねられ、AC 判定の再現性が下がる
- 除外運用（既知 intake 済み・環境依存）の証跡形式が定まらず、false-positive completion と実欠陥の見分けが審査側で困難

## 発生局面

検証（OU-008a AC-17 判定、v1→fix→v2、case-close 独立再検証）

## 検知方法

v1 の AC-17 fail（remediation 由来 24 件を含む 29 fail）と v2 pass（4 fail 全件非 remediation 由来）が同一「bun test」で判定され、由來分類の基準が v1 §4 の暫定再実行基準に依存した。main repo 再実行では fail 構成がさらに変化（3 fail、全件非 remediation 由来）。

## 想定される対応方向

- bun test 全 green 基準に加え、既知 intake 済み項目・環境依存項目の除外基準とその証跡形式（全件列挙 + 由来根拠 + 関連 intake リンク）を品質ゲート側（QG-4 / case-close SPEC または integrity 契約）に確定する
- あわせて検証環境（worktree / main、junction 伝播、node_modules 有無）の記録要件を含める候補
- 採否は backlog-review 以降の判断

## 関連

- Epic: #2099, Issue: #2108（OU-008a）, PR: #2118
- v1 報告: issuecomment-5299652896 §2・§4 / v2 報告: issuecomment-5299817790 §2
- 既知欠陥の intake: intake-2026-08-15-commands-e2e-adr-readme-stale-expectation.md、intake-2026-08-15-check-templates-dryrun-worktree-failures.md
- 関連 learning（PR #2118 学び + case-close 学び検知分）: learning inbox の「full integrity suite の fail 構成は検証環境で変化する」エントリ

## 出典引用

PR #2118 本文「## SPEC確定候補」より:

> 「full integrity suite pass」の受入れ基準の明文化: bun test 全 green 基準に加え、既知 intake 済み項目・環境依存項目の除外基準とその証跡形式を品質ゲート側に確定する候補。本 Issue の AC-17 判定は「bun test 全 green」基準で実施したが、基準自体の明文化により再検証時の判定揺れを防げる

## タグ

#intake #spec-candidate #acceptance-criteria #full-integrity-suite #quality-gate #environment-dependent-failure #epic-2099
