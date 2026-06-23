# NG: agentdev-case-run-execution-adapter SKILL.md の worktree-operations.md 参照が cross-skill 相対パス

## 発生源

- コマンド: /repo/docs-check（2026-06-22 実行）
- 検出カテゴリ: ReferencePath（IR-xxx, NG）
- ルート: intake

## 内容

`.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:83` が `agentdev-git-worktree` スキル内のファイルを相対パス `references/worktree-operations.md` で参照している。このパスは現在のスキル（case-run-execution-adapter）には存在せず、`agentdev-git-worktree` スキルに存在する。

該当行:

> **自己検証**: 実装作業開始前に `agentdev-git-worktree` の検証ヘルパー（`references/worktree-operations.md`「worktree 内判定ヘルパー」参照）で現在 worktree 内にいることを自己検証する。

`check_integrity.ts` の推奨: `use explicit path: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md or move file to current skill`

## 影響

- 読者が相対パス `references/worktree-operations.md` を現在のスキル内のファイルと誤認する可能性
- integrity checker が NG を継続検出（同一 finding が毎回 report に現れる）
- Sisyphus-Junior が委譲プロンプトで当該参照を解決できない場合、検証ヘルパーが見つからず failed に陥るリスク

## 推奨対応先

- 該当行の参照を明示パス `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` へ修正、またはファイル配置設計を見直して必要部分を case-run-execution-adapter 側へ複製
- 修正後、`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` で ReferencePath NG が 0 件になることを確認

## 原因分類

- 確認済: 当該ファイルは `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` に実在（grep で確認）
- 仮説: 筆者が同一スキル内の参照と誤認、または明示パス表記を省略した

## 根拠

- 検出レポート: `.agentdev/integrity/reports/2026-06-22-integrity-report.md` ReferencePath セクション
- 検出元スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- 実在先: `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md`
