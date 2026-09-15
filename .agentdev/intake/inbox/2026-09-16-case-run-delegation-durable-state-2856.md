# case-run 委譲結果受領の durable state 検証（ケース #2856 での result 併存実測）

## 内容

Case #2856（PR #2880）で、委譲実行の durable state 検証が本格稼働した。実行担当サブエージェントからの result 報告は worktree commit（2833系）とブランチ chore/issue-2856 に永続化されており、result 報告の喪失・欠落が発生しても commit hash・worktree パスから検証可能な状態が実証された。これは REQ-021-026/027（QG-4 横断 durable state 前提）の要件化に先立つ実運用上の実測事例となる。

## 提案

本実測事例を REQ-021-026/027 の運用注記（QG-4 reference 等）への反映候補として活用する。委譲結果の受領時に worktree commit hash・ブランチ名の記録を case-close 対応記録へ含める運用を標準化する。

## 根拠

- 観測元: PR #2880 本文（Case #2856 case-run / case-close 対応記録。対応表で worktree commit・ブランチが記録済み）
- 観測時 commit: PR #2880 head
- 関連: REQ-021-026/027（本 PR で行追加済み）

## 分類

- 分類: learning より intake（運用明記の継続検討）
- 変更種別: docs（QG-4 reference への実測例追記候補）
- 優先度: 低（要件化自体は完了済み。運用例の補強候補）
