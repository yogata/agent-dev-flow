# intake: check_templates.ts の --dry-run 系テスト3件が worktree 配置で環境依存失敗

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2114 Findings / Capture候補（OU-002 実装時の検証作業）

## 問題事象

`check_templates.ts` の --dry-run 系テスト3件が base ブランチから失敗している（環境依存の模様。worktree 配置の templates 参照解決）。repo-integrity test suite の base 由来失敗（PR 2114 時点で 1875 pass / 4 fail のうち3件）に相当する。

## 影響

- worktree 環境で test suite を実行する driver / case-run が、新規失敗と base 由来失敗の判別を都度手作業で行う必要がある
- 既存 learning entry「Windows + 標準ジャンクション環境 worktree で check_templates.ts worktree 固有 false positive」と同一の環境依存族で、テスト側の安定化（パス解決の worktree 耐性）が未対応のまま残る

## 発生局面

実装（repo-integrity test suite 実行、worktree 上）

## 検知方法

`bun test` における check_templates --dry-run 系3件の失敗（base ブランチでも再現）。

## 想定される対応方向

- worktree 配置でも templates 参照が解決されるようパス解決を修正する、または環境差を吸収する test 設計への変更
- 対応要否・優先度は backlog-review で判断する。OU-007（cleanup）/ OU-008a（再検証）での処理候補

## 関連

- Epic: #2099
- Issue: 2102（OU-002）, PR: 2114
- 対象: `check_templates.ts` の --dry-run 系テスト3件
- 関連 learning: `.agentdev/learning/inbox.md`「Windows + ジャンクション環境 worktree で check_templates.ts worktree 固有 false positive」（現象の知見側。本 item は対応候補の intake 側）

## 出典引用

PR 2114 本文 `## Findings / Capture候補` intake 節より:

> `check_templates.ts` の --dry-run 系テスト3件が base から失敗（環境依存の模様。worktree 配置の templates 参照解決）。分類: intake

## タグ

#intake #check-templates #dry-run #worktree #env-dependent-failure #epic-2099
