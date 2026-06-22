# case-run.md の references 参照の checker 誤判定（記述方法改良候補）

## 観測

PR #1010 (Issue #1000 / Epic #990 Wave 5 OU-010) の Stream C 横断検査で、`reference-path-existence` ルールが `src/opencode/commands/agentdev/case-run.md` の記述「`references/worktree-operations.md`」を 1 件 NG として報告した。当該記述は agentdev-git-worktree スキル内の `references/` ファイルを指すコンテキスト依存参照だが、checker が case-run.md のファイル位置からの相対パスと解釈して「実在しない」と誤判定した。

## 影響

- `/repo/docs-check` が意図的ではない文脈（スキル内 reference への言及）で偽陽性 NG を出し続ける。
- QG-3/QG-4 判定時にエージェントが手動で「pre-existing で Stream B 由来ではない」と分類する手間が毎回発生する。
- コマンドファイル内でスキル references を言及する記述方法（`references/foo.md` ベタ書き vs `skill-name/references/foo.md` 完全修飾 vs 自然文「references 配下の foo.md」）の指針がないため、将来の類似記述で再発する可能性がある。

## レビューで決めること

- (a) checker 側でコンテキスト考慮（スキル名が文脈にある場合はそのスキルの references/ を検索）する改良、(b) 記述側で完全修飾（`agentdev-git-worktree/references/worktree-operations.md`）に変更、(c) 自然文表現（「`agentdev-git-worktree` スキルの `references/` 配下」）に変更、のいずれで対応するか。
- `docs/specs/skills/agentdev-git-worktree.md` 等のスキル SPEC でファイル参照を記述する際の表記ルールを定めるか。
- 同様の「コンテキスト依存参照の checker 誤判定」パターンが他のコマンド・スキルファイルで潜在していないか横展開確認するか。

## 根拠

- PR #1010: https://github.com/yogata/agent-dev-flow/pull/1010 (Issue #1000 / Epic #990 Wave 5 OU-010 Stream C)
- Issue #1000: https://github.com/yogata/agent-dev-flow/issues/1000
- 対象箇所: `src/opencode/commands/agentdev/case-run.md`（agentdev-git-worktree スキル参照セクション）
- Epic #990: https://github.com/yogata/agent-dev-flow/issues/990
