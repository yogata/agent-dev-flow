# agentdev-git-worktree SPEC「提供する判断、操作」への stash 運用手順反映要否

## 観測

PR #2257 により SKILL.md と references/worktree-operations.md へ stash 運用手順（detached worktree による baseline 比較の標準手順、やむ得ない stash 利用時の規則、複数 worktree 環境での往復前確認）が追記された。docs/specs/skills/agentdev-git-worktree.md（status: accepted）の「提供する判断、操作」には同手順が未反映。

## 今回扱わない理由

case-close STEP-3-2 判定で (c) 見送り。Issue #2216 の変更対象成果物は SKILL.md と references に限定されており、SPEC は accepted のため draft → accepted 昇格対象外。

## 影響

SPEC と SKILL/references の間で stash 運用手順の記載粒度に差が生じている（SPEC は判断・操作の列挙、詳細は references 委任の構造）。

## レビューで決めること

- SPEC「提供する判断、操作」へ stash 運用（worktree 検証時の一時退避）の判断・操作を追記するか

## 根拠

- PR 2257 本文「SPEC確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2257）
