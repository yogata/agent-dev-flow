---
id: 2026-11-27-home-node-modules-becomes-bun-resolution-boundary
created_at: 2026-11-27T23:58:00+09:00
source: case-close (Wave 1 #4229 の実行・最終受入 capture)
status: unreviewed
---

# home 直下の node_modules が bun の解決境界になると worktree 側の zod が未解決になり試験群が一括失敗する

- **問題事象**: Wave 1 の初回委譲（DEL-4229-1）の初期 bun test で integrity 試験群が一括失敗した（PR #4231 本文の検証差分「初回 11 失敗（zod 環境要因・DEL-4229-1 で解消）」）。worktree に node_modules がない状態では、bun の探索が worktree の外（home 直下）の node_modules に到達し、zod の解決が worktree 側へ届かない
- **発生局面**: case-run の worktree での bun test 開始時
- **検知方法**: bun test の一括失敗（zod の import エラー）。worktree ルートへの node_modules/zod 配置で解消したこと
- **根本原因**: bun の解決根の探索が worktree の外（home 側）で終端し、worktree 依存が不在になる配置
- **自律対応内容**: 親が zod の退避コピー（C:/Users/ogatay/AppData/Local/Temp/opencode/zod-backup/node_modules）を worktree ルートの node_modules へ実ディレクトリとして配置し、以後の失敗を解消した。以後の委譲（DEL-4230-1）には probe と依存状態の記録を義務付けた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree で bun を動かす前に、bun がどの木を読むかを最小の probe で確認する（glob は node_modules を列挙しないため fs/lstat で確認する）
- **再発条件**: worktree に node_modules を置かずに bun test を実行し、home 直下に node_modules が存在する環境
- **予防策候補**: STEP-S3 の worktree 作成手順に依存実体の配置と probe を必須の段として置く
- **想定反映先**: agentdev-workflow-case-run の references/single.md（STEP-S3）
- **関連**: .agentdev/backlog/learning/inbox/2026-11-23-worktree-machine-step-gate-zod-resolution.md、.agentdev/backlog/learning/inbox/2026-11-25-worktree-env-setup-before-buntest.md、Issue #4229
- **タグ**: `#worktree` `#zod` `#bun-test`
