# IR-055 baseline 残置の内訳確定（strict 5件・heuristic 65件）と exempt 仕様判断への入力

## 観測

Issue 2237（OU-0016）の棚卸し完了時点で、IR-055 in-scope の baseline-known 残置は70件であり、内訳が確定した。

- strict 5件: command-authoring SKILL.md の実行時パス規約 4件 + workflow-orchestration SKILL.md のジャンクション制約説明 1件（いずれも「禁止対象・制約対象そのものの説明」としての `src/opencode/` 言及）
- heuristic 65件: docs/specs/ 63件 + docs/guides/ 2件（原本 SSoT へのパス参照）

減少15件（85件→70件）は OU-0016 の表現再設計と正確に対応した。

## 今回扱わない理由

strict 5件・heuristic 65件とも意図的残置として根拠記録済み（PR 2280 本文「意図的残置（根拠）」節）。heuristic 65件の段階解消（未解決参照のは正 vs baseline 管理継続）は既存 intake item（ir055-baseline-known-33-ou0016-prereq）のレビュー事項として持ち越されており、本 item はその判断入力として機能する。

## 影響

baseline-known 残置70件の性質が確定したことにより、既存 item のレビュー（段階解消の要否・対象範囲）が内訳ベースで進められる。strict 5件は「単純な未解決参照ではなく規約説明」という意味的差異があり、一律是正対象に含めない判断材料となる。

## レビューで決めること

- heuristic 65件（SSoT ポインタ）の段階解消を進めるか、baseline 管理を継続するか
- strict 5件を意図的残置（exempt 相当）として扱うか

## 根拠

- PR 2280 本文「Findings / Capture候補」4件目・「SPEC確定候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2280）
- 既存 item: .agentdev/intake/inbox/2026-08-19-ir055-baseline-known-33-ou0016-prereq.md
