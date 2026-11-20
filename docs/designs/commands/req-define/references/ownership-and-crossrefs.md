---
title: 所有関係と委譲、参照する横断 Design
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# 所有関係と委譲、参照する横断 Design

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（共通原本 `src/common/commands/agentdev/req-define.md`。実行時投影先は `.opencode/commands/agentdev/`）はその実行時投影である（DEC-010、配備形態は DEC-049）。
- workflow 実装本体（STEP 構成、resume protocol、reference 構成）は Workflow Skill（`agentdev-workflow-req-define`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 Design

- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（フェーズ定義、SSoT 遷移）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（extraction / classification 委譲）
- [workflows/collaboration-loop.md](../workflows/collaboration-loop.md)（ループ統合: RU または明示入力ファイル経由の入力経路。v3 ライフサイクル Design からの吸収記録〔artifact_actions ベース工程分岐の帰属〕）
- [quality-gate-model.md](../quality/quality-gate-model.md)（QG-1）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（draft body 品質検査）
