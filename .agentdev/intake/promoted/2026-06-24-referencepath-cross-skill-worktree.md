# case-run-execution-adapter SKILL.md から git-worktree スキルへの cross-skill 相対パス参照

## 観測内容

本成果物は単一 inbox 項目 `2026-06-22-docs-check-referencepath-cross-skill-worktree-operations.md` を整理する。`/repo/docs-check`（2026-06-22 実行、ルート: intake）が `.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:83` の参照を ReferencePath NG（Category: ReferencePath）として検出した。

該当行:

> **自己検証**: 実装作業開始前に `agentdev-git-worktree` の検証ヘルパー（`references/worktree-operations.md`「worktree 内判定ヘルパー」参照）で現在 worktree 内にいることを自己検証する。

相対パス `references/worktree-operations.md` は現在のスキル（case-run-execution-adapter）には存在せず、`.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` に実在する（grep で確認済み）。`check_integrity.ts` は「use explicit path: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md or move file to current skill」を推奨している。

出典検出レポートは `.agentdev/integrity/reports/2026-06-22-integrity-report.md` ReferencePath セクション、検出元スクリプトは `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`。

## 影響

読者が相対パス `references/worktree-operations.md` を現在のスキル（case-run-execution-adapter）内のファイルと誤認する可能性がある。実際に当該ディレクトリを探してもファイルが存在しないため、参照が解決できずに行き止まりになる。

integrity checker が同一の ReferencePath NG を毎回の docs-check report に出すため、NG ノイズが継続する。Sisyphus-Junior が委譲プロンプトで当該参照を解決しようとした場合、検証ヘルパーが見つからずに failed に陥るリスクを抱える。自己検証ステップは case-run 実行の安全性に寄与するため、参照解決不能は実行時の安全マージン低下にもつながる。

## 課題

`.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:83` の相対パス参照 `references/worktree-operations.md` を、実在先を明示するパス `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` に修正する。1 行修正で完了する。修正後に `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` を実行し、ReferencePath NG が 0 件になることを確認する。

## 既存要件との関連

- ReferencePath 検出（`check_integrity.ts`）: cross-skill の相対パス参照を NG とする検出基準。本件はその典型例。
- `agentdev-case-run-execution-adapter` SKILL.md: worktree 内判定の自己検証を委譲プロンプトに含める設計。参照先は `agentdev-git-worktree` スキルの責務領域。
- `agentdev-git-worktree` スキル `references/worktree-operations.md`: worktree 内判定ヘルパーの実在先。本スキルの責務として保持する。
- 欠落: なし。参照先ファイルは実在し、修正はパス表記の是正のみ。

## 整形の方向性

backlog-review では以下を検討する。

1. **RU 構成**: 単一 RU として処理する。修正範囲が 1 行であり、分割の余地がない。
2. **作業種別**: docs_chore または bugfix。SKILL.md の参照表記是正のため docs_chore が適切。
3. **優先度**: 高。修正量は小さいが、case-run の自己検証ステップの参照解決不能は実行時リスクに直結し、かつ docs-check の NG ノイズを毎回生むため、早期に潰す価値が高い。
4. **代替案の評価**: ファイルを case-run-execution-adapter 側へ複製する案もあるが、worktree 操作は git-worktree スキルの責務であり、複製は責務境界を曖昧にする。明示パスへの修正を採る。
5. **検証**: 修正後に `check_integrity.ts` で ReferencePath NG が 0 件になったことを確認し、併せて委譲プロンプトから当該参照が解決できることを手元で確認する。
