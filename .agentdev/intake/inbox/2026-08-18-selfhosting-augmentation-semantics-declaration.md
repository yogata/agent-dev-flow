# self-hosting augmentation の delegates_to / governs への semantics 宣言追加の検討

## 観測
self-hosting augmentation（.agentdev/artifact-graph.yaml）の delegates_to / governs は semantics 宣言を持たず、高位問い合わせへ不参加のまま（低位問い合わせのみ利用可能）。PR 2253（Issue 2203、OU-0001）で参加区分の導出規則（意味スロットと変更影響方向からの導出、REQ-012-022）が確定したため、semantics 宣言の追加を検討できる。

## 今回扱わない理由
当該 Issue のスコープ外（.agentdev/ は case-run 編集対象外）のため、PR 2253 では候補として記録するに留めた。

## 影響
delegates_to / governs が高位問い合わせ（impact / dependency / implementation）の探索経路に参加せず、これらの関係を経由した影響・依存分析が行えない。グラフの内容自体には影響しない。

## レビューで決めること
- semantics 宣言を追加するか。追加する場合のスロット割当（PR 本文の案: delegates_to は意味スロット depend、governs はスロットなし・impact 参加）を採用するか。

## 根拠
- PR 2253 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2253）
- 導出規則の確定記録: docs/specs/foundations/traceability-model.md「拡張関係型の意味定義様式」