# gh-cli WRITE 一時ファイル配置先と case-run 委譲 MUST NOT の衝突明確化

## 観測内容

agentdev-gh-cli の WRITE 標準手続きは一時ファイル配置先を `.agentdev/tmp/`（workspace-local）に定めている。一方、case-run の実行担当サブエージェント委譲プロンプトの MUST NOT は `.agentdev/**` 全域を触らないと定義しており、両者が衝突している。OU-003 の委譲では MUST NOT を優先し、一時ファイルをリポジトリ外の TEMP に配置して運用した。

## 影響

- 実行担当サブエージェントが WRITE 標準手続きに従えず、手続き文書間で判断が分かれる
- `.agentdev/tmp/` 配置の設計意図（worktree 削除時に一時ファイルが確実に破棄され、VERIFY・事後調査が同一 workspace 内で完結する）が委譲場面で失われる

## 課題

agentdev-gh-cli 標準手続き（`.agentdev/tmp/` 配置）と case-run 委譲 MUST NOT（`.agentdev/**` 全域）のいずれかの側を明確化する。例: MUST NOT の対象範囲を worktree 隔離境界に合わせて調整、または WRITE 標準手続きに委譲時の代替配置先を追記。

## 既存要件・成果物との関連

- Issue: #2130（OU-003）
- PR: #2132
- 対象: agentdev-gh-cli WRITE 標準手続き（references/standard-procedures.md）、case-run 委譲プロンプト定義

## 出典

- 発生日: 2026-08-15
- 取得元: case-close Capture 回収（PR #2132 本文 `## Findings / Capture候補` intake セクション）
- 元 item: intake-2026-08-15-ghcli-write-tempdir-vs-case-run-mustnot-conflict.md
