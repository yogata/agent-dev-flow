# isNegationContext の checkWorkflowStatusProhibition インライン化検討

## 観測

PR #1140 (Issue #1139) で AG-002/013 の IR-044 context exemption 削除を実施した結果、isNegationContext は checkWorkflowStatusProhibition でのみ使用される単独残存状態になった。他の 4 関数（isDelegationContext, isMetaScopeRuleContext, isBehaviorPredicateContext, IR044_STABLE_CONTRACT_PATTERN）は完全削除済み。

isNegationContext のみが残った理由は、AG-002/013 完了条件が「IR-044 からの context exemption 削除」を意図していたためで、checkWorkflowStatusProhibition での使用は別 checker の内部ロジックとして残存。

## 今回扱わない理由

AG-002/013 は IR-044 context exemption の削除をスコープとしており、checkWorkflowStatusProhibition の内部構造リファクタリングは別件。Issue #1139 の完了条件（TS-001〜TS-010）は PR #1140 で満たされた。PR Findings に「将来的に checkWorkflowStatusProhibition もリファクタリング時にインライン化を検討可能」と記録済み。

## 影響

- checkWorkflowStatusProhibition は isNegationContext に依存（呼出 1 箇所想定）
- isNegationContext のみが残存する helper として存在。semantic には「workflow status prohibition」専用文脈での否定文脈判定
- インライン化で checkWorkflowStatusProhibition の可読性向上の余地あり

## レビューで決めること

- インライン化を実施するか、helper として維持するか
- 実施する場合、対象ブランチ、スケジュール
- checkWorkflowStatusProhibition 以外に isNegationContext 互換の否定文脈判定が必要な checker が将来追加される可能性

## 根拠

- PR #1140 `## Findings / Capture候補` の記述
- check_integrity.ts 該当箇所: isNegationContext 定義、checkWorkflowStatusProhibition 呼出
- Epic #1138 Wave 1 クローズ時のキャプチャ回収（capture-boundaries split rule に基づく積み残し候補）
