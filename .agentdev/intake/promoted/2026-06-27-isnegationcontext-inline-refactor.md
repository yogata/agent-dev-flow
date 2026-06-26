# isNegationContext の checkWorkflowStatusProhibition インライン化検討

## 発生源

- Issue: #1139
- PR: #1140 (merged)
- Epic: #1138 Wave 1 close
- 発生日: 2026-06-25

## 観測内容

PR #1140（AG-002/013 の IR-044 context exemption 削除）の結果、isNegationContext は checkWorkflowStatusProhibition でのみ使用される単独残存状態になった。他の 4 関数（isDelegationContext, isMetaScopeRuleContext, isBehaviorPredicateContext, IR044_STABLE_CONTRACT_PATTERN）は完全削除済み。

isNegationContext のみ残った理由は、AG-002/013 完了条件が「IR-044 からの context exemption 削除」を意図していたため。checkWorkflowStatusProhibition での使用は別 checker の内部ロジックとして残存。

## 影響

- checkWorkflowStatusProhibition は isNegationContext に依存（呼出 1 箇所想定）
- isNegationContext のみが残存 helper として存在（semantic には workflow status prohibition 専用文脈での否定文脈判定）
- インライン化で checkWorkflowStatusProhibition の可読性向上の余地あり

## 課題

- インライン化を実施するか、helper として維持するか
- checkWorkflowStatusProhibition 以外に isNegationContext 互換の否定文脈判定が必要な checker が将来追加される可能性

## 既存要件との関連

- `check_integrity.ts`: isNegationContext 定義、checkWorkflowStatusProhibition 呼出
- IR-044 context exemption（AG-002/013 で削除済み）

## 対応方針候補

- 純リファクタ（機能影響なし）。インライン化するか helper 維持するかを判断。優先度最低
