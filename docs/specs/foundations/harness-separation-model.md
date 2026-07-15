---
title: harness 分離モデル
status: draft
created: 2026-07-12
updated: 2026-07-15
---

# harness 分離モデル

## 目的

AgentDevFlow 配布物と harness 実行制御の責務分離モデルを定義する。配布物の大多数を
harness 非依存とし、harness 依存の具体を限定された場所へ集約する。

## 分離原則

### 配布物側（業務ワークフロー契約）

配布物の大多数（SKILL.md 本体、command .md 本体、docs/REQ、docs/ADR、docs/SPEC、
docs/guides、README、DOC-MAP）は業務ワークフロー契約のみで完結する:

- 工程の進行条件、停止条件
- 永続成果物（REQ/ADR/SPEC/Issue/PR/`.agentdev/`）
- Quality Gate
- 実行結果契約

### harness 側（実行制御）

実行エージェント選定、起動方法、実行制御パラメータは harness の責務として配置する:

- プロジェクトルート `AGENTS.md`: harness 選定、エージェント型指定
- 各 skill の `references/<topic>.md`: skill 固有の実行制御具体（エージェント型名、起動
  方法、timeout、並列度、再試行等）

## 参照実装

`agentdev-case-run-execution-adapter` skill が本モデルの参照実装である:

- `SKILL.md`: 業務ワークフロー契約（result 4状態契約、test-fix ループ、worktree 隔離、
  Findings 配置等）
- `references/harness-delegation.md`: harness 固有の実行制御具体

他 skill も同一モデルへ整理する（agentdev-architecture-advisory は
references/architecture-review-delegation.md を新設し同モデルへ移行）。

## 適用基準

配布物から harness 固有の記述を分離する基準:

| 配布物側に残す | harness 側へ分離 |
|---|---|
| サブエージェントへの委譲ステップ（業務ワークフロー契約） | サブエージェントの具体名、起動方法 |
| result 契約、ラベル構造、分類権限 | timeout、並列度、再試行等の実行制御パラメータ |
| 進行条件、停止条件、永続成果物、QG | ハーネス起動失敗の解析・救済手順 |

## 配布 docs の制約

配布 docs（REQ/ADR/SPEC/guides/README/DOC-MAP）は runtime workspace ディレクトリ
（`.sisyphus/` 等）の管理を扱わず、業務ワークフロー契約のみを記述する。runtime workspace
管理は harness 側の責務とする。

## 具象参照抽象化

配布物からプロジェクト固有要素を除去する具体的手法を定める。ADR-0136 の適用詳細。

### 除去対象パターン

| 対象 | パターン例 | 除去方針 |
|---|---|---|
| トレーサビリティ注記（HTMLコメント） | `<!-- REQ-0162-002 -->` | 削除。本文意に影響しない |
| トレーサビリティ注記（インライン） | 「REQ-0162-002 に基づき」 | 文脈を保持したまま識別子を除去。「本要件に基づき」等へ |
| docs 内部パス | `docs/specs/foundations/document-model.md` | 削除。または抽象表現「文書粒度 SPEC」等へ |
| 実行制御パラメータ | 「最大5件」「120秒 timeout」「retry 5回」 | references/<topic>.md へ集約 |

### トレーサビリティ担保

除去された識別子のトレーサビリティは以下で担保する:
- git 履歴（コミットメッセージ、diff）
- 原本側 docs/（REQ、ADR、IR カタログ）

### baseline 既知違反

src/opencode/ 配下の既知違反（baseline 11件）は段階解消の対象とし、
一括除去の完了条件から除外する。

## 関連

- REQ-0162（配布物ハーネス境界浄化）
- ADR-0136（配布物ハーネス境界浄化）
