---
title: "IR-074: ir-rule-classification-traceability（IR 分類と実装・試験パスの機械対応）"
status: accepted
created: 2026-11-13
updated: 2026-11-13
detection_method_class: machine-check
implementation_path: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
verification_path: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
---

# IR-074: ir-rule-classification-traceability（IR 分類と実装・試験パスの機械対応）

| Field | Value |
|-------|-------|
| rule_id | IR-074 |
| description | integrity 規則文書（rules/IR-NNN-*.md）の機械検査／文章のみ分類（frontmatter detection_method_class）の全件確定検査と、機械検査規則の実装（implementation_path）・試験（verification_path）パスの機械対応検査。分類未確定を 0 件に固定し、機械検査規則のパス実在と checker 出力識別子（REQ-047-011）との一致を機械検査する（integrity-rule-catalog「機械検査／文章のみ分類と実装・試験パスの記載形式」節、REQ-047-011〜013、B3-1） |
| severity | strict |
| category | integrity-rule-gap |
| detection_method | check_integrity.ts（checkIrRuleClassification）による rules/IR-*.md 全件 frontmatter 走査。(1) detection_method_class の値妥当性（machine-check / prose-only）、(2) machine-check 規則の implementation_path・verification_path の宣言必須とパス実在（repo root 相対）、(3) implementation_path の checker ソース内 IR ID 参照存在（checker 出力 annotateIrIds 付与識別子との静的一致確認。宣言的データ語彙 yaml は IR ID 参照を要求しない）、(4) prose-only 規則はパス記載を要求しない |
| affected_artifacts | [docs/designs/integrity/rules/IR-*.md] |
| related_req | [REQ-047-011, REQ-047-012, REQ-047-013] |
| related_design | [integrity-rule-catalog.md, checker-execution-contracts.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 低。frontmatter キー値の機械判定のみ。implementation_path に記載できない宣言的データ語彙（yaml 検出語彙）の exemption は REQ-047-012「機械可読な定義の実行時消費」の理解に基づく |
| regression_test | check_integrity.test.ts describe "IR-074 ir-rule-classification-traceability"。fixture ルールファイルで分類未確定・パス欠落・パス不在・IR ID 参照不在を検出し、machine-check/prose-only の正常例で合格することを検証する |
| finding_route | intake |
| triage_action | 分類未確定検出時は当該 IR の detection_method_class を確定する。パス不在検出時は implementation_path/verification_path を現行パスへ更新する。IR ID 参照不在検出時は checker 出力への annotateIrIds 付与を実装する |
| last_verified | 2026-11-13 |

## 分類・パスの機械検査可能な記載形式（REQ-047-012）

- IR 文書の frontmatter に `detection_method_class`（machine-check / prose-only）を保持する
- machine-check 分類の IR 文書の frontmatter に `implementation_path`（checker ソースの repo root 相対パス）と `verification_path`（試験資産の repo root 相対パス）を保持する
- prose-only 分類の IR 文書はパス記載を要求しない
- 実装パスに宣言的データ語彙（yaml）を記載する場合（検出語自体をデータとして保持し実行時の強制箇所が消費する形態。IR-060 の prh 語彙等）、当該 IR ID の checker 出力識別子との静的一致確認は要求しない
