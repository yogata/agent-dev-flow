---
name: agentdev-execution-backend
description: "External execution backend driver adapter protocol. USE FOR: driver subagent delegation boundary, OMO result handling (completed/blocked/failed), Issue comment SSoT for blockers. DO NOT USE FOR: workflow state management, Epic orchestration, Issue completion criteria evaluation."
---

# Execution Backend Driver Adapter Protocol

case-run が実装実行を外部実行バックエンド（OMO 等）へ委譲する際の driver subagent adapter protocol を定義する知識ベース。ADR-0114 に基づく委譲境界を具現化する。

- **参照元**: `case-run`（driver 起動時）
- **特性**: adapter protocol の宣言的定義のみ提供する。Epic/Wave orchestration・worktree 管理・完了条件チェックボックス評価は本 skill の対象外。

## 委譲モデル

```
case-run (orchestration)
  └── driver subagent (本 protocol を使用)
        ├── repository context 再確認
        ├── 外部実行バックエンドへ委譲
        └── result を case-run へ返却
```

- **case-run 本体**: 1 Issue 単位で driver subagent を起動し、driver result を処理する。実装実行そのものは行わない。
- **driver subagent**: 本 protocol に従い外部実行バックエンドと adapter する。1 Issue あたり1 driver。
- **外部実行バックエンド**: 実装実行・検証・PR 本文作成を行う。agentdev 側からは**不透明な外部成果物**として扱い、内部 plan artifact の構造・意味には依存しない。

## Driver 責務

driver subagent は以下を順に実行する:

1. **Issue 読込**: 対象 Issue 本文・受け入れ基準を読み込む
2. **context 再確認**: ADR / REQ / SPEC / docs / repository context を再確認し、実装が既存の決定事項に矛盾しないことを担保する
3. **外部実行バックエンドへの委譲**: 実装実行を委譲する。外部 plan artifact は解釈せずそのまま取り回す
4. **REJECT / ITERATE / blocker の処理**: 外部実行バックエンドからの差し戻しを処理する。回答可能な blocker（ADR/REQ/SPEC/docs/Issue本文で回答できるもの）は自律的に外部実行バックエンドへ再差し戻しできる
5. **result 返却**: 後述の result 契約に従い case-run へ返却する

driver は実装実行の主体ではなく adapter である。driver 自身が仕様を再解釈・再設計しない。

## Driver Result 契約（最小契約）

driver は以下のいずれか1状態を返す:

| result | 意味 | 成果物 |
|--------|------|--------|
| `completed(pr)` | 実装完了・PR作成済み | **PR番号**を伴う。case-run の成功成果は PR 作成である |
| `blocked` | 回答可能な blocker に遭遇 | 詳細本文は **Issue コメント** に SSoT として記録される |
| `failed` | repository context で回答不能な blocker | 詳細本文は **Issue コメント** に構造化して記録される |

### SSoT（信頼できる情報源）

| 状態 | SSoT |
|------|------|
| 成功（completed） | **PR 本文** |
| blocked / failed | **Issue コメント** |

driver は成功時 PR 番号を返し、blocked / failed 時は Issue コメントに blocker 詳細を構造化して記録する。一時会話コンテキスト・ローカル変数・中間ファイルは SSoT としない。

## 責務境界（非対象）

本 protocol は以下を扱わない。各責務主体に委譲する:

| 非対象 | 責務主体 |
|--------|----------|
| workflow state 管理（Issue/PR/worktree） | case-run |
| 複数 Issue / Epic orchestration | case-run / case-auto |
| Wave scheduling | case-run Epic Orchestrator |
| Issue 完了条件チェックボックスの評価・更新 | case-close |
| 完了条件チェックボックスの最終完了判定 | case-close |

driver subagent・外部実行バックエンドは Issue 本文の完了条件チェックボックスを更新しない（PR 作成後に case-close が別コンテキストで評価する）。

## Findings / Capture 配置

本筋外の Findings / Capture 候補（intake / learning）は **PR 本文** の `## Findings / Capture候補` セクションに記述する。capture 境界の詳細は `agentdev-workflow-orchestration` を参照。driver は `.agentdev/intake/`・`.agentdev/learning/` を直接変更しない。

## 外部 plan artifact の不透明性

外部実行バックエンドの plan artifact は agentdev の管理対象外である。driver は plan artifact の内部構造に依存した処理・検証を行わず、result 契約（3状態）のみで外部バックエンドと接合する。

## See Also

- **agentdev-workflow-orchestration**: Wave scheduling・subagent protocol・capture 境界
- **agentdev-workflow-templates**: PR 本文・コメント SSoT のテンプレート構造
