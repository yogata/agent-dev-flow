# Intake Item: TIM 語彙カタログ SPEC と実装 lib/tim.ts の結合時照合で乖離 — Wave 1 統合是正の要否判断

## 発生源

- PR: #2196 (Issue #2194 / OU-0005, Epic #2189 Wave 1) + case-close Wave 1 結合時照合（2026-08-17）
- 発生 phase: case-run 検証 + case-close SPEC 確定照合
- capture 分類: intake（SPEC・実装整合是正候補）

## 問題

PR #2196 の指摘どおり、Wave 1 結合時照合（main f4240016 時点）で docs/specs/foundations/traceability-model.md のカタログと src/opencode/skills/agentdev-artifact-graph/scripts/lib/tim.ts（PR #2198 由来）に実質的な乖離を確認: (1) 影響方向の値名がカタログは forward/backward/bidirectional/none、実装は forward/reverse/both/none。(2) supersedes はカタログは none（旧成果物凍結）、実装は reverse（先行成果物の変更は後継に影響）。(3) extends はカタログは bidirectional、実装は reverse。(4) カタログは defined_in を depends_on へ集約して標準語彙から廃止、実装は標準5関係型に defined_in を残存（semantics_slot: specify）。(5) カタログ採用語彙（refines/specifies/depends_on/realizes/satisfies/implements/verifies/validates 等13種）と実装の標準5関係型（references, supersedes, defined_in, contains, extends）の語彙体系が未統合。

## 推奨対応

Wave 1 統合是正 Issue でカタログと実装の語彙・影響方向・参加区分を単一の真実へ寄せる。方向性の判断（カタログ基準へ実装を寄せるか、実測に基づきカタログを修正するか）は要件変更・標準語彙選択に該当するため TS-010 on_failure の record-in-findings 扱いとして本 intake に記録し、独断解消しない。PR #2195（#2191）のコンフリクト解消（trace_query/trace_diagnostics 統合）と同一または後続 Issue で処理するのが自然。

## 関連

- Issue: #2194 (CLOSED), #2190 (CLOSED), #2191 (OPEN、コンフリクト解消待ち), Epic: #2189
- PR: #2196 (merged f4240016), #2198 (merged f4ac8d70), #2195 (OPEN/CONFLICTING)
- 照合実施: case-close Wave 1（main f4240016）
