# checkExtensions integration テストの worktree 環境失敗（ジャンクション未伝播）

## 観測

checkExtensions integration テスト（`check_extensions.test.ts` "classifies the real skill tree deterministically"）は worktree 環境で失敗する。worktree では `.opencode/skills/agentdev-*` がジャンクション未伝播により空ディレクトリになることが原因。

base commit 175a2047 のクリーン状態でも `git stash` による切り分けで再現し、当該 PR の変更は無関係。full suite baseline に暗黙に含まれる環境依存 fail。

## 今回扱わない理由

Epic #2223（EU-E）Wave 1 の各 Issue スコープ外の環境依存既存失敗。PR #2263・PR #2266 の Findings に記録のみ実施。

## 影響

worktree で full integrity suite を実行するたびに本 fail が混入し、新規変更の成否判定にノイズを生む（PR #2266 では事前存在 fail 3件の1つとして計上）。

## レビューで決めること

- test fallback 契約（`agentdev-git-worktree-test-fallback` SPEC）との整合確認。実ツリー分類系 integration テストの worktree での扱い（skip・fallback・hermetic 化のいずれを正とするか）

## 根拠

- PR 2263 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2263）
- PR 2266 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2266）
