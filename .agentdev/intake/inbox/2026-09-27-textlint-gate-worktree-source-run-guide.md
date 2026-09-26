# intake: worktree での textlint gate 実行は source 側実行を案内する文書整備候補

- 観測日: 2026-09-27
- 観測元: Case #3162 case-close STEP-6 Capture 回収（PR #3165 本文 Findings / Capture候補）
- 種別: 文書整備候補（環境固有事象の追認）

## 候補: worktree の textlint 最終検査実行手順として source 側実行の案内を整備

- **実観測事実**: case-run の worktree 環境（.worktrees/3162-case）で textlint 最終検査が `.opencode/plugins/agentdev-textlint-guard/gate.ts` の junction 未伝播により起動できず、`src/opencode/plugins/agentdev-textlint-guard/gate.ts`（source 側）での実行が必要だった
- **問題構造**: worktree では `.opencode` 配下の junction（plugins・skills の agentdev-*）が非伝播のため、配布側パス指定の gate 実行が失敗する。既知の worktree 構造的制約（junction 非伝播）と同系統の環境差
- **検討対象**: worktree での gate.ts 実行手順として source 側（src/opencode/plugins 配下）実行を案内する文書の整備
- **関連**: Case #3162、PR #3165、src/opencode/plugins/agentdev-textlint-guard（junction 元）と .opencode/plugins/agentdev-textlint-guard（配布側）、agentdev-git-worktree worktree 構造的制約
