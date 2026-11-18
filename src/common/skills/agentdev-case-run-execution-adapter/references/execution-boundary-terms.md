---
title: external execution boundary と harness execution mechanism の用語境界、外部成果物の取扱い
---

<!-- 親: agentdev-case-run-execution-adapter SKILL.md「実行モデル」節から参照される用語境界の詳細（遅延読み込み）。 -->

# external execution boundary と harness execution mechanism

本 adapter skill は external execution boundary への委譲契約を使用し、harness execution mechanism を ADF 規範所有対象外として扱う。

| 区分 | 内容 | 正規所有者 |
|---|---|---|
| external execution boundary | 外部バックエンド接続（実行担当サブエージェント起動、result 受領、PR URL 受領）。adapter skill 経由の委譲契約、result 4状態契約、worktree 隔離、Findings / Design確定候補の PR 本文引き継ぎを含む | I/O 境界 Design。case-run は I/O 境界 Design へ委譲し、自身は所有しない |
| harness execution mechanism | agent 起動 API、background task、並列実行、context 管理、timeout、retry、queue、heartbeat | harness 責務（ADF 規範所有対象外）。AGENTS.md および `references/harness-delegation.md` に配置 |

harness execution mechanism は本 SKILL の規範対象外とし、`references/harness-delegation.md` へ集約する。

用語の正規定義と所有者は responsibility-boundary-purification Design「case 実行責務の 4 用語と所有者」を SSoT とする。

# 外部成果物の取扱い

外部実行基盤の結果は **PR URL** で受領する（透明）。

plan artifact 等の中間成果物の内部構造には依存しない。

実行担当サブエージェントは中間成果物の内部構造に依存した処理、検証を行わず、result 契約（4状態）のみで接合する。

AgentDevFlow の永続状態は既存の draft/ Issue/ PR/ REQ/ Decision/ Design に限定し、中間成果物を永続状態として扱わない。
