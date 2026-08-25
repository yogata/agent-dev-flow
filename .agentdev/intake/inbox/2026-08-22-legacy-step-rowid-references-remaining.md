# 旧 Step 参照・旧行 ID 参照の残存（Issue #2385 対象外ファイル群）

## 観測

Issue #2385（OU-007、PR #2396）の対象外として残存する旧構造参照の棚卸し（発見元: PR #2396 の検証 grep、REQ-046-006 の全面適用は別 chore）:

- 旧 Step 番号参照: docs/designs/quality/quality-gates.md（L44/45/72/93/130/145）、docs/designs/quality/req-health-metrics.md（L12/75/150）、docs/designs/skills/ の architecture-advisory・backlog-integration・decision-guidelines・intake-pipeline・issue-management・learning-pipeline・quality-gates・req-analysis 各 Design、docs/designs/workflows/backlog-artifact-lifecycle.md・capture-boundaries.md、docs/guides/req-case-flow.md・troubleshooting.md、src/opencode/skills/ 配下の各 skill・references（architecture-advisory・backlog-integration・intake-pipeline・issue-management・learning-pipeline・req-analysis・req-file-manager テンプレート・workflow-lifecycle 等）、src/opencode/commands/agentdev/case-auto.md:12（「Step 1〜8」）、docs/decisions/DEC-010.md:42（「Step 5-6」）

## 今回扱わない理由

Issue #2385 の承認済み対象範囲（(a)〜(g) の指定ファイル群）外であり、REQ-046-006 の全面適用は段階的な別 chore として整理するため（PR #2396 Findings 記録のとおり）。

## 影響

旧 command 番号参照が現行 STEP ラベル構成と不整合のまま残存し、参照追跡時のノイズになる。

## レビューで決めること

- 段階的正規化 chore の実施単位（quality/skills Design 群、guides、配布 skill 群、command 定義の順序・分割）
- 正規の5箇所（Issue #2238 対象）の現行維持確認

## 根拠

- PR #2396 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2396 ）
