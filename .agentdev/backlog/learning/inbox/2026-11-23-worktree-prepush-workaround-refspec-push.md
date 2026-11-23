---
id: 2026-11-23-worktree-prepush-workaround-refspec-push
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4209・#4210・#4211 本文 Findings の回収)
status: unreviewed
---

# worktree pre-push 対処経路のバリエーション（refspec push・生成投影複製・junction 一時復元）

- **問題事象**: worktree からの git push が pre-push ゲートの `.opencode` copy 投影（agentdev-project-extensions 参照等）が worktree 内に存在しないため Step 1/2 が完走しない。既存 entry `2026-11-21-worktree-prepush-junction-unpropagation` の制約と同根。
- **発生局面**: REQ-125 Wave-1 の 4 子 Issue 実装（PR #4209・#4210・#4211・2026-11-22〜23）
- **検知方法**: pre-push ゲートの Module not found / import 解決失敗
- **新規対処経路（今回観測の 3 バリエーション）**: (1) フック迂回を行わずメインリポジトリ側から明示 refspec push で REPO_ROOT をメインに解決させる（PR #4209・Step 2 は構造的に完走しない前提でメイン側実行）(2) main root の生成投影を worktree へ複製してから worktree 内で完走させる（PR #4210）(3) worktree 内へ junction を一時作成 → push 成功後に junction エントリのみ削除（PR #4211・既存 entry の手動 junction 作成と同系）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の対処経路の観測であり、正規成果物への変更なし）
- **横展開観点**: 3 バリエーションはいずれも フック迂回を伴わない正規経路であり、worktree-operations.md の junction 判定規約補記（OU-009・REQ-124-009）との統合・手順化判断は promote 段階で行う対象
- **再発条件**: worktree から直接 git push を実行した場合に毎回再発（構造的制約）
- **予防策候補**: worktree-operations.md への対処経路 3 種の記載追補、または push は必ずメインリポジトリ側から行う運用規律の明文化
- **想定反映先**: worktree-operations.md、worktree 構造的制約 Knowledge
- **関連**: `.agentdev/learning/inbox/2026-11-21-worktree-prepush-junction-unpropagation.md`（同根制約の初回観測）、`.agentdev/learning/inbox/2026-11-23-worktree-machine-step-gate-zod-resolution.md`（隣接課題・scripts node_modules）、`.agentdev/intake/inbox/2026-11-23-worktree-dependency-setup-normalization.md`（正規手段への統合課題）
- **タグ**: `#worktree` `#pre-push` `#junction` `#push`
