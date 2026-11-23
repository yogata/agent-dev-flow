---
id: 2026-11-23-worktree-dependency-setup-normalization
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4208・#4210 本文 Findings の回収)
status: unreviewed
---

# worktree 依存整備の正規手段への統合候補

- **課題**: worktree 実行時の依存整備対象が個別 ad-hoc で行われており、正規手順として未整備。対象は (1) `.opencode/skills/` の agentdev-* junction（worktree SoT 参照で複製・PR #4208）(2) scripts 配下 per-dir node_modules（既存 learning 11-23 entry）(3) textlint plugin vendor の再生成（PR #4208・#4209）(4) agentdev-project-extensions の zod（PR #4210 は main root 生成投影を複製して解消）
- **整合確認の観点（PR #4208 intake）**: worktree 実行時の依存整備対象ディレクトリ集合に `agentdev-workflow-case-run/scripts` と `agentdev-gh/local`（REQ-117-007・REQ-113-002 skip 案内の正規整備手段）が QG-4 の依存パッケージ前置と整合しているかの確認が未実施
- **物理ブロックの観点（PR #4210 intake）**: worktree で `.opencode` 生成投影（.gitignore 管理外・junction 未伝播）が欠落すると pre-push Step2 の cli.ts が相対 import 解決に失敗して push が物理ブロックされる。正規整備手段への反映が未実施
- **期待する処分**: worktree 依存整備の正規手順（worktree-operations.md または scripts README の実行契約節）への統合・手順化の判断
- **出典**: PR #4208（case #4204・REQ-125-001）、PR #4210（case #4207・REQ-125-006/007）
- **関連 learning**: `.agentdev/learning/inbox/2026-11-23-worktree-prepush-workaround-refspec-push.md`、`.agentdev/learning/inbox/2026-11-23-textlint-vendor-worktree-unpropagation.md`、`.agentdev/learning/inbox/2026-11-23-worktree-machine-step-gate-zod-resolution.md`
