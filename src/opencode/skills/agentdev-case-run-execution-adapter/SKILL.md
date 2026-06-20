---
name: agentdev-case-run-execution-adapter
description: "case-run external execution adapter. USE FOR: connecting case-run issue execution to an external execution harness (CLI subprocess), handling completed/blocked/failed results. DO NOT USE FOR: req-define architecture review, ADR judgment, workflow state management, or Issue completion checkbox evaluation."
---

# case-run External Execution Adapter

case-run が1 Issue 単位の実装作業を実行担当サブエージェント経由で外部実行手段へ接続する際の adapter protocol を定義する知識ベース。ADR-0114 に基づく委譲境界を具現化する。対象を case-run に限定する。

- **参照元**: `case-run`（実行担当サブエージェント起動時）
- **特性**: adapter protocol の宣言的定義のみ提供する。Epic/Wave orchestration・worktree 管理・完了条件チェックボックス評価は本 skill の対象外。

## 実行モデル

```
case-run (orchestration)
  └── ハーネスを CLI subprocess で起動（本 protocol を使用）
        ├── Issue 本文・受け入れ基準読込
        ├── ADR / REQ / SPEC / docs / repository context 再確認
        ├── ハーネスによる実装・検証・PR 作成（CLI subprocess）
        ├── blocker 処理
        └── result を case-run へ返却
```

- **case-run 本体**: 1 Issue 単位でハーネスを CLI subprocess として起動し、result を処理する。実装実行そのものは行わない。`task(subagent_type=...)` は使用しない。
- **実行担当サブエージェント**: 本 protocol に従いハーネス（CLI subprocess）と adapter する。1 Issue あたり1起動。仕様を再解釈・再設計しない adapter である。
- **ハーネス（外部実行手段）**: 実装実行・検証・PR 本文作成を行う。最終結果は **PR URL** で受領する（透明）。plan artifact 等の中間成果物の内部構造には依存しない（REQ-0139-007）。

## 実行担当サブエージェントの責務

実行担当サブエージェントは以下を順に実行する:

1. **Issue 読込**: 対象 Issue 本文・受け入れ基準を読み込む
2. **context 再確認**: ADR / REQ / SPEC / docs / repository context を再確認し、実装が既存の決定事項に矛盾しないことを担保する
3. **ハーネスへの呼出（CLI subprocess）**: 実装実行を委譲する。ハーネスの plan artifact 等の中間成果物は解釈せず、PR URL で最終結果を受領する
4. **blocker 処理**: 回答可能な blocker（ADR/REQ/SPEC/docs/Issue本文で回答できるもの）は自律的にハーネスへ再差し戻しできる
5. **result 返却**: 後述の result 契約に従い case-run へ返却する

## Result 契約（最小契約）

実行担当サブエージェントは以下のいずれか1状態を返す（REQ-0139-008）:

| result | 意味 | 成果物 |
|--------|------|--------|
| `completed(pr)` | 実装完了・PR作成済み | **PR番号**を伴う。case-run の成功成果は PR 作成である |
| `blocked` | 回答可能な blocker に遭遇 | 詳細本文は **Issue コメント** に SSoT として記録される |
| `failed` | repository context で回答不能な blocker | 詳細本文は **Issue コメント** に構造化して記録される |

### SSoT（信頼できる情報源）

| 状態 | SSoT |
|------|------|
| 成功（completed(pr)） | **PR 本文** |
| blocked / failed | **Issue コメント** |

一時会話コンテキスト・ローカル変数・中間ファイルは SSoT としない。

## 責務境界（非対象）

本 protocol は以下を扱わない。各責務主体に委譲する:

| 非対象 | 責務主体 |
|--------|----------|
| workflow state 管理（Issue/PR/worktree） | case-run |
| 複数 Issue / Epic orchestration | case-auto / case-run |
| Issue 完了条件チェックボックスの評価・更新 | case-close |
| 完了条件チェックボックスの最終完了判定 | case-close |
| req-define のアーキテクチャ確認 | `agentdev-architecture-advisory`（oracle） |

実行担当サブエージェント・外部実行手段は Issue 本文の完了条件チェックボックスを更新しない（PR 作成後に case-close が別コンテキストで評価する）。

## worktree 隔離の遵守（禁止事項）

実行担当サブエージェントは worktree root（`.worktrees/{N}-{type}/`）以外のパスでファイル編集を行わない。case-run から引き渡された worktree root（相対パス）配下でのみ作業する。メインリポジトリを汚染しないための構造的保証（REQ-0137 適用範囲対象外「case-run の worktree 隔離フェーズ」の前提）を、実行時にも遵守する。

| 禁止事項 | 違反時の対応 |
|--------|----------|
| worktree root 以外のパス（メインリポジトリルート直下・他 worktree 等）でのファイル編集 | メインリポジトリでの作業を検知した場合は直ちに作業を停止し、`failed` として result を返却する。詳細本文は Issue コメントに SSoT として構造化して記録する |
| メインリポジトリパスを引き渡し・使用すること | case-run は worktree root（相対パス）のみを引き渡す。実行担当サブエージェントは受け取った worktree root 配下でのみ作業する |

**自己検証**: 実装作業開始前に `agentdev-git-worktree` の検証ヘルパー（`references/worktree-operations.md`「worktree 内判定ヘルパー」参照）で現在 worktree 内にいることを自己検証する。メインリポジトリにいると判定された場合は実装を開始せず `failed` として result を返却する。

## Findings / Capture 配置

本筋外の Findings / Capture 候補（intake / learning）は **PR 本文** の `## Findings / Capture候補` セクションに記述する。capture 境界の詳細は `agentdev-workflow-orchestration` を参照。実行担当サブエージェントは `.agentdev/intake/`・`.agentdev/learning/` を直接変更しない。

## 外部成果物の取扱い

ハーネスの結果は **PR URL** で受領する（透明）。plan artifact 等の中間成果物の内部構造には依存しない（REQ-0139-007）。実行担当サブエージェントは中間成果物の内部構造に依存した処理・検証を行わず、result 契約（3状態）のみでハーネスと接合する。AgentDevFlow の永続状態は既存の draft / Issue / PR / REQ / ADR / SPEC に限定し、中間成果物を永続状態として扱わない。

## ハーネス抽象IF

- case-run は AGENTS.md で指定されたハーネス（推奨: oh-my-openagent）を CLI subprocess として起動する。`task(subagent_type=...)` は使用しない。
- ハーネス起動の具体的な実装（CLI コマンド・タイムアウト・フォールバック）は `references/<harness>.md` 参照。oh-my-openagent の場合は `references/oh-my-openagent.md`。
- ハーネス不在時は case-run がエラー停止する（フォールバック経路なし）。
- Issue 本文に req-define 壁打ち合意の実行計画方向性（参考情報）が含まれ得る。ハーネスはこれを参考情報として扱い、束縛されない。

## See Also

- **agentdev-workflow-orchestration**: subagent protocol・capture 境界
- **agentdev-workflow-templates**: PR 本文・コメント SSoT のテンプレート構造
