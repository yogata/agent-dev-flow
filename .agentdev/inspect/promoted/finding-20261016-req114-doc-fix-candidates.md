# REQ-114 関連文書修正候補（Design covers 実体 gap と参照要約の不正確性）

- 出所: inspect-docs 20261015T093252Z DS17・DS19・RQ17（backlog-auto stage 1、系統識別 [inspect-docs]）
- 種別: Design/REQ 修正候補（追跡Issue育成・表現是正候補）
- 対象: `docs/designs/skills/agentdev-workflow-backlog-auto.md`、`docs/requirements/REQ-114.md`
- 処置: Case #3725 完了後も未解消の REQ-114 関連 gap を後続検討（backlog-review → req-define）へ渡す。修正方向（Design 本文実体の追加か covers 範囲の縮小か、要約文言の具体化）は本成果物では確定しない

## DS17: REQ-114-013 に対応する Design 本文実体なし

- target: `docs/designs/skills/agentdev-workflow-backlog-auto.md:9`（covers）、本文 112-121
- evidence: covers 行は REQ-114-001〜015 全行を宣言するが、REQ-114-013（全採用形態での共通 E2E 挙動確認）に対応する本文記述がなく、「E2E」「REQ-114-013」の本文出現は 0 件（2026-10-16 grep 実測。covers 行 :9 のみ）。
- severity: low / confidence: medium
- source_of_truth: REQ-114-013
- 現状: 実装・検証側実体（traceability/agentdev-workflow-backlog-auto.yaml:31-36 の applied-projects 3形態 manifest、tests/end-to-end-contract.test.ts）は Case #3725（PR #3727）で成立済み。Design 本文実体は不在のまま
- 後続検討: Design 本文への実体節追加、または covers から REQ-114-013 を外す判断（検証義務行を design covers に含める役割設定の見直しを含む）

## DS19: REQ-114-005/-012/-015 に対応する本文節の不在

- target: `docs/designs/skills/agentdev-workflow-backlog-auto.md:9,116,118`、`docs/designs/commands/backlog-auto.md:10,77`
- evidence: REQ-114-005「再スコープ」の語と REQ-114-012「RU 0 件またはリリース対象となる実変更がない場合はリリースを作成せず報告」の対応記述が本文になし（両語の本文出現 0 件、2026-10-16 grep 実測。skills Design :116「対応表（統合・分割を含む）」が REQ-114-005 の部分受皿）。REQ-114-015 の明示実体もなし（commands:72「所有する実行契約は REQ-114」で間接受けの可能性）。
- severity: low / confidence: medium
- source_of_truth: REQ-114-005/012/015
- 後続検討: 部分実体の追加、または covers 範囲の縮小

## RQ17: REQ-114-014 の括弧内要約が REQ-039-001 原文と不正確

- target: `docs/requirements/REQ-114.md:29` vs `docs/requirements/REQ-039.md:19`
- evidence: REQ-114-014 の括弧内要約「backlog-review は自動的な要件化を行わない」は、原文（「採用済み成果物を分析、統合し、ユーザー承認を経て RU（要件ユニット）を生成すること。プロジェクト知識候補については docs/knowledge/ への知識文書保存（REQ-056）を…」）の言い換えとして不正確（原文は「ユーザー承認を経る」ことの要求であり、知識文書保存という別の正規完了経路も含む）。意味的接続自体は成立。
- severity: low / confidence: medium
- source_of_truth: 現行 REQ-039-001
- 後続検討: 括弧内の原文準拠表現への是正（REQ-114 次回更新時の表現是正候補）

## 処理記録

- 2026-10-16 backlog-auto stage 2 inspect 系統で採用（自律確定）: 検出事項側の事前宣言「DB02・DS17・DS19・RQ17・GR10 は Case #3725 完了時（解消未了なら promote 再分類）」の条件が発火（Case #3725 は GitHub 照会で closed・closedAt 2026-10-16T01:11:40Z を確認）し、gap 未解消（grep 実測・REQ-114.md 不変）のため promote へ再分類。修正方向の決定と正規成果物の変更は含まない
- 分類は Jev 先行評価（観測 20261016T041350Z-3c9e）＋ adversarial-review 2 stream（証拠系・権限系）convergence 後に自律確定（HITL 対象なし。promote は採用の確定のみで、RU 承認は backlog-review の HITL で行われる）
- 関連: intake/inbox の REQ-114 関連 item（2026-10-16-req114-implementation-verification-missing.md）との統合・束化は backlog-review の責務
