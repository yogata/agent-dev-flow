# worktree 環境の前置不足による suite 失敗の予防（per-skill node_modules・vendor・plugins 投影）

## 内容

Root Case #4117 の実行（case-run・case-close 両工程）で実観測された環境前置の改善候補。

1. per-skill node_modules（junction 構成）と gitignored 生成物（`src/opencode/plugins/agentdev-textlint-guard/vendor/`）は worktree へ伝播しない。分割 ②（`bun test ./src/`）が 79 fail となった（case-run で bun install ＋ `bun run build:engine` で解消）
2. `.opencode/plugins` の投影（link profile 構成）も伝播しないため手動構成が必要だった（junction 先は worktree 内 `src/opencode/plugins`）
3. `bun install`＋`bun run build:engine`＋self-sync（`.opencode/plugins` 投影）を worktree 作成時の標準前置（環境セットアップ手順または機械工程の前置検査）へ組み込む候補

## 根拠

- 観測元: Root Case #4117（PR #4120 Findings / Capture 候補・case-close 実行環境構成）
- 証跡: PR #4120 本文（分割 ② 初回 79 fail→解消の検証差分）・close 機械工程入力の environmentLabel（junction 未伝播・手動構成・case-run install 済みの記録）
- 関連 learning: 「scripts/self-sync.ps1 は third-party Skill の未配置を ERROR にする」（network 前提の分離候補）
