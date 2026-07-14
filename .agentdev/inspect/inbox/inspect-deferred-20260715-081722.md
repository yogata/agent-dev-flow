---
title: inspect-docs 検出事項 defer（要再検証・修正方向未確定）
source_finding: inspect-docs-finding-20260715-081722.md
classified_at: 2026-07-15
classification: defer
defer_reason: 採否、範囲、または修正方向が未確定。intake 送付候補。
---

# inspect-docs 検出事項 defer 成果物

## F-05: MOVE — REQ-0130-035 スクリプト詳細の要件行残留

- **対象**: docs/requirements/REQ-0130.md L45（要件行 REQ-0130-035）
- **根拠**: `check_changed_docs.ts --workflow case-run` の具体的スクリプト名・フラグが要件行に残留。file pattern 残留 + 実装パラメータ残留のシグナル。
- **確信度**: medium
- **推奨アクション**: MOVE または no-action
- **defer 理由**: 安定契約例外（接続契約・安全境界としてのCLI引数）に該当する可能性があり、採否が未確定。REQ-define での壁打ちが必要。
- **後続 route**: intake 送付候補（`2026-07-15-req-0130-035-spec-detail-leak.md` が既存 inbox に存在する可能性あり）

## F-08: 要ヒューマンレビュー — extension must_not と command Step 11 の矛盾

- **対象**: .agentdev/extensions/commands/inspect-docs.yaml must_not, inspect-docs command Step 11
- **根拠**: extension の must_not: 「実装本文（src/opencode/**）は読まない」。command Step 11: 「配布物（src/opencode/commands/agentdev/, src/opencode/skills/agentdev-*/）について配布物整合性検査」。直接矛盾。
- **確信度**: medium
- **推奨アクション**: UPDATE
- **defer 理由**: 矛盾は明確だが、修正方向（must_not を範囲限定するか、Step 11 を変更するか）が未確定。設計判断が必要。
- **後続 route**: intake 送付候補
