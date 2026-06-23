# inspect-skills 検出辞書と agentdev-gh-cli 委譲後の gh 直接記述 0件検証

## 発生源

- Epic: #1093 (Wave 1)
- Issue: #1094 (REQ-0149 agentdev-gh-cli 手続き委譲基盤)
- PR: #1098 (merged, squash f5454154)
- 発生日: 2026-06-23

## 内容

PR #1098 は12ファイル（command 5件 + skill 7件/8ファイル）から `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)` の直接記述を除去し、`agentdev-gh-cli` 手続き呼び出しへ委譲した。委譲後は `agentdev-gh-cli/references/standard-procedures.md`（REQ-0149-003 で許容される既定実装）のみが gh コマンド直接実行を保持する。

`agentdev-inspect-skills` の検出辞書が上記パターンを検出する場合、委譲後の各 command/skill は0件になるはず。検出辞書の実体確認と、本 PR の変更が検出辞書で pass することの検証が未実施。

## 推奨対応先

- `/agentdev/inspect-skills` を本リポジトリ (agent-dev-flow) に対して実行し、`agentdev-gh-cli/references/` 以外で gh 直接記述が0件であることを検証
- 検出辞書が `agentdev-gh-cli/references/standard-procedures.md` を適切に除外（既定実装として許容）しているか確認
- Wave 2 (#1095 ローカル版 agentdev-gh-cli) 実装前に検出辞書の健全性を確定

## 現在の追跡状態

- #1094 Issue 本文: REQ-0149-001/006/007 完了条件 [x] 達成（PR本文の完了条件マッピングで8項目全て ✅）
- テスト戦略「検出辞書（inspect-skills）で12ファイル中の gh 直接記述が0件であることを確認」は個別検証のため本 intake で追跡
