---
id: 2026-11-23-textlint-vendor-worktree-unpropagation
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4208・#4209 本文 Findings の回収)
status: unreviewed
---

# textlint plugin vendor の worktree 未伝播が bun test ./src/ の環境起因 fail の主因になる

- **問題事象**: worktree 内では `src/opencode/plugins/agentdev-textlint-guard/` 配下の生成物（`vendor/textlint-engine.bundle.json` 約 1508 KB・`vendor/kuromoji-dict/` 辞書 12 ファイル）が git 非管理のため伝播せず、`bun test ./src/` が textlint-guard 関連 79 件（PR #4209）を筆頭とする環境起因 fail を出す。
- **発生局面**: REQ-125 Wave-1 の worktree 内テスト実行（PR #4208・#4209・2026-11-22〜23）
- **検知方法**: bun test ./src/ の fail 一覧（textlint-guard スイートが集中）
- **根本原因**: vendor は git 管理対象外の生成物（版固定情報 package.json + bun.lock のみを管理）であり、worktree には node_modules 同様に伝播しない。README「開発者セットアップ」の手順（bun install && bun run build:engine）は main root 前提で記載されており、worktree 実行時の前置整備としては未記載。
- **自律対応内容**: plugin package 配下での再生成（bun install && bun run build:engine・ネットワーク取得あり）を worktree 内で実施し、fail を解消。PR #4208 では vendor bundle + 辞書 12 ファイルの再生成を確認。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree で bun test ./src/ を実行する前提整備は (1) textlint vendor 再生成 (2) scripts per-dir node_modules（既存 entry 11-23）(3) .opencode/skills junction（既存 entry 11-21）の 3 点に分かれており、1 つの前置手順として統合されるのが自然
- **再発条件**: worktree 内で textlint-guard 依存テストを vendor 未生成のまま実行した場合に再発
- **予防策候補**: worktree 前置整備手順への統合（intake `2026-11-23-worktree-dependency-setup-normalization` と同じ統合先）
- **想定反映先**: worktree-operations.md または plugin README の導入形態別手順
- **関連**: `.agentdev/learning/inbox/2026-11-23-worktree-prepush-workaround-refspec-push.md`、`.agentdev/intake/inbox/2026-11-23-worktree-dependency-setup-normalization.md`
- **タグ**: `#worktree` `#textlint` `#vendor` `#bun-test`
