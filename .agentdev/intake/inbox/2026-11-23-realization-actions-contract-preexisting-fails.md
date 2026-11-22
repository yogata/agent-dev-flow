---
id: 2026-11-23-realization-actions-contract-preexisting-fails
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4208・#4211 本文 Findings の回収)
status: unreviewed
---

# realization-actions-contract.test.ts の 3 fail は base 既知欠陥（別課題化候補）

- **課題**: `realization-actions-contract.test.ts` の 3 fail は base `1e6947a4e` から存在する既知欠陥であり、無関連変更でも再現する。PR #4208 では「`docs/requirements/retired/REQ-033.md` が両 root で不在・git 未追跡」、PR #4211 では「対象ファイルが HEAD・main・worktree のいずれにも存在しない構造的既存（無条件 read）」として立証された。`bun test ./scripts/` 実行時に継続的に現れるノイズとなっている。
- **期待する処分**: 別課題化（追跡 Issue 起票または RU 化）の判断。修正により bun test ./scripts/ が緑化し、fail 起源分類のノイズが減る
- **出典**: PR #4208（case #4204）、PR #4211（case #4206）の検証差分
- **実証根拠**: git diff base -- docs/ scripts/ が空（base と同一内容）で実証・単独実行 13 pass / 3 fail
