---
title: agentdev-case-run-execution-adapter SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-case-run-execution-adapter SPEC

## 目的

case-run が Issue 実装を実行担当サブエージェント（Sisyphus-Junior）へ委譲する際のアダプタープロトコルを定義し、実行結果（completed(pr) / blocked / failed）を処理する。実行 command（`/ulw-loop`）は委譲 prompt 内で指定され、`load_skills` には adapter skill を指定する。

## 適用対象

- Issue 単位の実装作業を Sisyphus-Junior に接続し、実行結果を case-run へ返却する時
- ADR-0114 / ADR-0128 に基づく外部実行委譲
- task() 起動失敗・異常終了時の事後処理

## 提供する判断・操作

- task() 委譲プロトコル（`task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])` + 委譲 prompt 内 `/ulw-loop` command）
- result 契約（3状態: completed(pr) / blocked / failed）
- worktree 隔離遵守・自己検証
- task() 起動失敗時の事後処理（worktree `git status` で未コミット変更確認・残留箇所 grep と手動修正）

## 参照する references

- `references/oh-my-openagent.md`

## 現在の動作

- CLI subprocess（bunx 等）は使用せず `task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])` で起動（委譲 prompt 内で `/ulw-loop` command を指定）
- Sisyphus-Junior は oh-my-openagent 提供の OpenCode ネイティブエージェント型
- worktree root 外での作業を禁止
- PR URL を SSoT として返却（REQ-0130-021 廃止に伴い PR URL フォールバック検索不使用）
- 各ツール呼び出しは120秒 timeout で保護
- ulw-loop 監査トレイル（`.omo/ulw-loop/ledger.jsonl`）は worktree 配下に配置

## 対象外

- req-define のアーキテクチャ確認（`agentdev-architecture-advisory` 担当）
- ワークフロー状態管理（`agentdev-workflow-lifecycle` 担当）
- Issue 完了条件チェックボックスの評価・更新（case-close QG-4 責務）

## 検証観点

- worktree 隔離の自己検証
- PR URL の正確性
- result 契約（3状態）の適合性
- task() 起動失敗時の適切な事後処理

## See Also

- [agentdev-workflow-orchestration.md](agentdev-workflow-orchestration.md)
- [agentdev-git-worktree.md](agentdev-git-worktree.md)
- [commands/case-run.md](../commands/case-run.md)
- REQ-0130 — case-run / 実装パイプライン
- REQ-0139 — 外部エージェント統合契約
- ADR-0114 — case-auto 最大自走モード
- ADR-0128 — case-run 外部実行委譲
