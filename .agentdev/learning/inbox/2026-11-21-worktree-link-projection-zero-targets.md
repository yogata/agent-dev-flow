---
id: learn-20261121-worktree-link-projection-zero-targets
created_at: 2026-11-21
source: case-run capture (PR #4173・Wave-1 #4169・Root Case #4167)
status: inbox
---

# worktree では .opencode 投影 junction が link profile の掃査対象に伝播せず checker link profile が必ず zero-targets になる

- 問題事象: worktree（.worktrees/4169-maintenance）内で配布依存境界 checker の link profile を実行すると、.opencode 投影 junction が掃査対象に伝播せず zero-targets（scanned 0 相当）となり、checker 実行記録の必須行をそのまま満たせない
- 発生局面: case-run（PR #4173・Wave-1 #4169）checker 実行記録（配布依存境界）link profile
- 検知方法: checker 報告 JSON の scanned 件数が baseline（main root 実体・scanned 471）と不一致で zero-targets と判明
- 根本原因: worktree に投影供給される .opencode 配下は junction（シンボリックリンク相当）であり、checker の link profile 掃査は junction の target 実体を worktree root 基準で解決できない（伝播しない）。実行環境の構造的制約であり、checker・変更対象の不具合ではない
- 自律対応内容: 検査弱化ではなく代替実行として、main root 実体から同一 CLI を --root main root で読取専用実行し（status 0 / failures 0 / scanned 471）、証跡 JSON を .agentdev/integrity/reports/ へ環境ラベル記録つきで退避した。変更面（trusted-distribution-gate 配下）が link 掃査領域に非不明であることを記録し source profile が変更面の検証を担うことも併記
- ユーザー確認有無: なし（環境制約の記録と代替実行の実施のみ）
- 横展開観点: worktree で link profile を要する checker・検証を実行する場合、zero-targets は必然であることを前提に、main root 実体での代替実行と環境ラベルの記録を実務上の標準手順とすべき。baseline 作成時（親 Case 側）と同一制約
- 再発条件: worktree 内で link profile（.opencode 実体掃査系）の checker・検証を実行する場合
 - 予防策候補: (a) worktree 実行系コマンドの検証計画に「link 系は main root 代替実行」を事前に組み込む、(b) checker 側で junction を検出した際の zero-targets 警告と main root 誘導を報告へ含める
 - 想定反映先: case-run（checker 実行記録の代替実行手順）、checker 実行記録の様式（環境ラベル記録欄）
 - 関連: Case #4167、PR #4173（検証差分セクション link profile 行）、distgate-link-4169-phase1.json（証跡退避済み）
 - タグ: worktree、junction、link profile、zero-targets、代替実行
