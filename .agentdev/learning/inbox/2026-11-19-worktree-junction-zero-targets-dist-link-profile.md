---
id: learn-20261119-worktree-junction-zero-targets-dist-link-profile
created_at: 2026-11-19
source: case-close capture (Case #4162 case-run SSoT 機械検査実績)
status: inbox
---
# worktree の .opencode ジャンクション未伝播と配布依存境界 link profile の zero-targets 挙動の実績値

- 問題事象: worktree（.worktrees/4162-feature）で配布依存境界 link profile を worktree 指定で実行すると、.opencode/skills agentdev-* のジャンクション未伝播により scan 対象 0 件（zero-targets）で fail-closed（exit 1）となる。zero-targets が exit 1 として現れる挙動の実績値を観測した
- 発生局面: case-run 委譲 DEL-4162-1 の機械検査（Case #4162・SSoT コメント issuecomment-7002740674 の終了コード一覧）
- 検知方法: 配布依存境界 gate の終了コード一覧で dist_link=1（worktree 指定）と dist_link_host=0（host root 指定）の差分を観測
- 根本原因: worktree に .opencode/skills agentdev-* の junction は伝播せず（git 非追跡のため clone/worktree checkout に含まれない）、link profile の scan 対象が 0 件に解決される構造的制約（agentdev-git-worktree worktree 構造的制約・checker-execution-contracts「link profile 実効実行要件」）。checker 側の zero-targets fail-closed が正規の防衛動作として機能している
- 実績値: dist_link（worktree 指定・zero-targets）= exit 1 不採用・dist_link_host（host root C:/Users/ogatay/work/agent-dev-flow 指定・scanned 513）= exit 0 採用・failures 0 件・source profile（worktree 指定・scanned 512）= exit 0 採用。実行環境: Windows_NT 10.0.26300 x64・bun 1.3.6・pwsh 7.6.10・検証対象 HEAD 31121a12a
- 自律対応内容: 同一 OID による内容等価の根拠の下で link profile を host root 指定で実行し（exit 0・採用値）、worktree 実行は無効分類として実行記録に残した（scan 対象 0 件の実行を clean 扱いにしない）
- ユーザー確認有無: なし（checker-execution-contracts Design の正規実行形態の適用）
- Decision/REQ/spec 影響: なし（既存 Design の正規実行形態の実績観測であり規定変更なし）
- 横展開観点: worktree での checker 実行は main root 実体からの --root worktree 指定（読取系）を標準とし、link profile のように main root 実行条件を持つ検査は worktree で実行しても無効分類として記録し main root で再実行する。zero-targets の exit 1 は誤検知ではなく防衛動作であることを検証記録の環境ラベルに明記する
- 再発条件: worktree で link profile を worktree root 指定で実行する場合（junction 未伝播の worktree では毎回 zero-targets になる）
- 予防策候補: 機械検査の実行手順テンプレートに「link profile は main root 指定」と「worktree 実行の zero-targets は無効分類」の前置を組み込む。終了コード単独で受入を判定せず scanned 件数と unchecked_reasons を必ず確認する
- 想定反映先: checker-execution-contracts Design「link profile 実効実行要件」節の実績値補強（正規文書変更なし・実績観測としての記録）
- 関連: Case #4162、issuecomment-7002740674、DEC-014（配布依存境界の多層 enforcement）、agentdev-git-worktree worktree 構造的制約
- タグ: worktree、ジャンクション未伝播、zero-targets、配布依存境界、link profile、実績値
