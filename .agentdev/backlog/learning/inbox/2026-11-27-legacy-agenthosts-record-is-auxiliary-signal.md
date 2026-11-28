---
id: 2026-11-27-legacy-agenthosts-record-is-auxiliary-signal
created_at: 2026-11-27T23:58:00+09:00
source: case-close (Wave 1 #4229 の実行・最終受入 capture)
status: unreviewed
---

# 旧形式記録（agentHosts 配列）を確定記録として扱うと記録されていない側の配置が除去される（補助信号への格下げで解消）

- **問題事象**: agentHosts 配列だけの旧 install-state 記録（selectedAgents なし）と OpenCode・Senpi の配置が存在する既存導入で、選択を省略した更新が exit 0 で完了し、OpenCode・Senpi 側の管理対象 junction を除去して記録を codex のみに書き換えた（第 2 回最終受入の反例 (j)、重大）。agentHosts=[] の場合は exit 1 となり挙動が一貫していなかった
- **発生局面**: 導入スクリプト（scripts/consumer/install-sync-common.ps1 の Resolve-AgentSelectionSet）の旧記録互換処理
- **検知方法**: case-close 第 2 回の反例 (j)（selection-probe-legacy の再現）
- **根本原因**: 旧形式（agentHosts 配列）を両側の選択が確定した記録と同格に扱い、OpenCode/Senpi 側の選択が記録にないことを「選択なし」と解釈した
- **自律対応内容**: 修正委譲 DEL-4229-2 で旧記録を Codex/Antigravity 側だけの補助信号（recordOpenKnown=false）とし、OpenCode/Senpi 側は所有権確認可能な配置から判定した。回帰試験「a legacy record holding only agentHosts keeps the OpenCode/Senpi selection that placements confirm」で固定
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（DEC-070 の「所有を確認できる配置から選択を判定」の実装修正）
- **横展開観点**: 旧形式の記録を読む互換処理では、「記録されていない側」を消去ではなく所有確認からの検出対象にする
- **再発条件**: 片側だけの旧形式を確定記録として扱う互換処理を書くとき
- **予防策候補**: 互換読み取りの契約試験に「旧形式＋もう一方の配置存在」の組合せを含める
- **想定反映先**: scripts/self/release/scripts-behavior.test.ts（回帰試験を追加済み。今後の互換処理設計の参照）
- **関連**: Issue #4229、PR #4231、DEC-070、findings-r3.md の (j)
- **タグ**: `#install` `#legacy-record` `#compatibility`
