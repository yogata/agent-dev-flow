---
title: harness 分離モデル
status: accepted
created: 2026-07-12
updated: 2026-07-19
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

### case-auto の Phase 分離と bg task 管理（REQ-0114-102〜107、ADR-0138）

case-auto の Phase 分離、Phase 2 の固定並列数（値5）、bg task の状態管理、破棄検知時の状態別回復（commit 済み PR 未作成、未コミット変更残存の区別）を AgentDevFlow 側の所有リストへ追加する。これらは業務ワークフロー契約の一部であり、後続工程が依存する安全境界と回復契約として配布物で共有する。

bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析を harness 側の所有リストに残す。Phase 1 と Phase 3 の直列集約ポイントは main push、capture、commit を並列実行区間の外で処理する AgentDevFlow 側の契約とし、bg task API 経由の実行制御は harness 側の責務として維持する。

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

#### 件数定義

baseline 件数は下記2軸で明記する:

- ファイル単位: 違反を含む配布 command/skill ファイル数（重複排除）
- マッチ単位: 違反パターンにマッチした総件数（重複含む）

TS-001/002 の機械化判定はマッチ単位を採用し、grep 結果との1:1照合を可能にする。
ファイル単位は進捗報告用の補助値とし、判定の主評価値とはしない。

#### baseline リスト（11件）

下記11件を baseline 既知違反として登録する。各行は「ファイルパス:行番号:違反内容:検出ルール」形式。
抽出元は `check_integrity.ts --json` の warning level（11件）。ファイル単位の件数は6件。

1. `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`:110:gh CLI 直接呼出し（`gh pr view`）:IR-053 (gh-direct-invocation)
2. `src/opencode/commands/agentdev/req-save.md`:262:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
3. `src/opencode/commands/agentdev/req-save.md`:272:`docs/specs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
4. `src/opencode/commands/agentdev/req-save.md`:272:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
5. `src/opencode/commands/agentdev/spec-save.md`:226:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
6. `src/opencode/commands/agentdev/spec-save.md`:236:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
7. `src/opencode/commands/agentdev/spec-save.md`:240:`docs/specs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
8. `src/opencode/commands/agentdev/spec-save.md`:253:`docs/specs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
9. `src/opencode/commands/agentdev/spec-save.md`:253:`docs/specs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
10. `src/opencode/skills/agentdev-inspect-skills/SKILL.md`:63:`docs/specs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
11. `src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md`:55:`docs/specs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)

baseline リストは delta 検出で新規違反と区別するための与件であり、baseline 自体の解消は
RU-0007（REQ-0162-002 完遂）で段階的に実施する。

## 関連

- REQ-0162（配布物ハーネス境界浄化）
- ADR-0136（配布物ハーネス境界浄化）

