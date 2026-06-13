# Vocabulary Registry

AgentDevFlow 管理下の文書で使用する正規語彙と旧語彙の対照表。integrity-check は本レジストリに基づき旧語彙の残存を検出する。

## 目的

- Wave 1-2 で修正した不整合の再発を防止する
- 新規文書作成時に正規語彙を参照可能にする
- integrity-check の旧語彙検出の根拠を一元管理する

## 除外コンテキスト

以下の文脈では旧語彙の言及が許容される（検出対象外）:

- `docs/requirements/retired/` 配下の retired REQ
- `docs/requirements/mapping-table.md` の移行表
- `docs/adr/` 内の ADR 履歴記述（廃止経緯の説明を含む）
- code block（` ``` ` で囲まれた領域）内の例示
- 検出ルール自体の記述（正規表現パターンの説明等）
- integrity-check テスト fixture

## コマンド名

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `/case-open` | `/agentdev/case-open` | bare slash form（REQ-0108-016, ADR-0005） |
| `/case-run` | `/agentdev/case-run` | bare slash form |
| `/case-close` | `/agentdev/case-close` | bare slash form |
| `/case-update` | `/agentdev/case-update` | bare slash form |
| `/req-define` | `/agentdev/req-define` | bare slash form |
| `/req-save` | `/agentdev/req-save` | bare slash form |
| `/integrity-check` | `/repo/docs-check` | bare slash form（repo-local command, not agentdev） |
| `/repo/integrity-check` | `/repo/docs-check` | renamed（REQ-0115-001, REQ-0115-039） |
| `/repo/semantic-integrity-review` | （廃止、docs-review に統合） | 未実装コマンド（REQ-0115 適用範囲外） |
| `/agentdev/req-restructure-review` | `/agentdev/docs-review` | 統合予定、Wave2で処理（REQ-0115-016） |
| `/intake-capture` | `/agentdev/intake-capture` | bare slash form |
| `/intake-promote` | `/agentdev/intake-promote` | bare slash form（intake-review は廃止、機能は intake-promote に統合） |
| `/backlog-review` | `/agentdev/backlog-review` | bare slash form |
| `/backlog-save` | `/agentdev/backlog-review` | 廃止（REQ-0105-034/058: RU 生成は backlog-review に統合） |
| `/learning-promote` | `/agentdev/learning-promote` | bare slash form（learning-refine は廃止、機能は learning-promote に統合） |
| `/req-restructure-review` | `/agentdev/req-restructure-review` | bare slash form |
| `issue-req` | （廃止） | 旧 bare command → `/agentdev/req-save` |
| `issue-work` | （廃止） | 旧 bare command → `/agentdev/case-run` |
| `issue-close` | （廃止） | 旧 bare command → `/agentdev/case-close` |
| `issue-create` | （廃止） | 旧 bare command → `/agentdev/case-open` |
| `issue-update` | （廃止） | 旧 bare command → `/agentdev/case-update` |
| `issue-save-req` | （廃止） | 旧 bare command → `/agentdev/req-save` |
| `issue-backlog-create` | （廃止） | 旧 bare command → `/agentdev/backlog-save` |
| `tips-elevate` | （廃止） | 旧 bare command → `/agentdev/learning-promote` |
| `tips-refactor` | （廃止） | 旧 bare command → `/agentdev/req-restructure-review` |

## コマンドパス

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `.opencode/commands/issue/` | `.opencode/commands/agentdev/` | 旧 command path（ADR-0005） |
| `.opencode/commands/tips/` | `.opencode/commands/agentdev/` | 旧 command path |
| `commands/issue/` | `commands/agentdev/` | 旧 relative path |
| `commands/tips/` | `commands/agentdev/` | 旧 relative path |

## スキル名

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `issue-lifecycle` | `agentdev-workflow-lifecycle` | 旧 skill name |
| `issue-template-manager` | `agentdev-workflow-templates` | 旧 skill name |
| `tips-pipeline-orchestration` | `agentdev-workflow-orchestration` | 旧 skill name |
| `issue-completion-reporting` | `agentdev-workflow-reporting` | 廃止済み skill（REQ-0108-126） |
| `issue-post-review-routing` | `agentdev-workflow-routing` | 旧 skill name |
| `issue-work-orchestration` | `agentdev-workflow-orchestration` | 旧 skill name |

## 語彙ポリシー（REQ-0102-024〜028, REQ-0115-044）

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| 旧規範語キーワード | 必達要件記述 | REQ 要件行は語彙の有無ではなく検証可能性で判定する（REQ-0102-024） |
| 旧推奨キーワード | 必達要件記述または推奨表現 | 必達要件として再定義できる場合のみ要件行に残す（REQ-0102-025） |
| 旧任意キーワード | 許可表現（「〜してよい」） | 許容仕様・設計余地・将来候補として扱う（REQ-0102-026） |
| 旧必須キーワード | 必達要件記述 | 検証可能な自然文として記述する（REQ-0102-027） |
| 括弧付き旧 marker | （不要、自然文で記述） | 旧 marker を除去し、必達要件または許可表現として記述する（REQ-0102-028） |
| 旧語彙ルール | 必達要件 | SPEC は新規要件ではなく現在仕様・契約記述に限定する（REQ-0102-024） |

除外: integrity rule 定義内の検出パターン説明、retired 文書、negative example、vocabulary-registry.md 自体

## 廃止済み概念

| 旧語彙 | 現行状態 | 備考 |
|--------|----------|------|
| `req-backlog` | 廃止（REQ-0105-038） | backlog-review フローに統合 |
| `docs/tips/` | 廃止 | docs/ に統合済み |
| `reference/` | `references/` | canonical は複数形（REQ-0103-013, REQ-0108-039） |
| `tips プール` | `learning プール` | learning セクションに統合 |
| `refactor時prune` | `promote時prune` | learning-promote コマンド（refine は promote 内部フェーズに統合） |
| `elevate時prune` | `promote時prune` | learning-promote コマンド |
| `refine時prune` | `promote時prune` | learning-refine は廃止、prune は learning-promote 内部で実行 |

## 完了報告フィールド

| フィールド名 | 備考 |
|-------------|------|
| `完了コマンド` | 必須（REQ-0107） |
| `対象` | 必須 |
| `結果` | 必須 |
| `検証結果` | 必須 |
| `git 永続化` | 必須 |
| `次のコマンド` | 必須 |

旧フィールド名 `次のステップ` は使用禁止（`次のコマンド` が正規）。

## REQ 範囲表記

| 正規値 | 備考 |
|--------|------|
| `REQ-0101` 〜 `REQ-0119` | 2026-06-12 時点の active REQ 範囲（19件） |

AGENTS.md、system.md、ガイド内の REQ 範囲表記は実際の active REQ ファイル数と一致させること。

## 旧分類用語

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `retained` | `migrated` / `retired-no-successor` / `historical-only` | 旧 REQ 分類（mapping-table.md の status） |
| `partially superseded` | `migrated` | mapping-table.md の正規 status |
| `superseded` | `migrated` / `retired-no-successor` | 旧分類 |

## Capture 語彙

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `Intake候補` | `Capture候補` | PR template セクション名変更（REQ-0105-077） |
| `Findings / Intake候補` | `Findings / Capture候補` | PR セクション見出し（REQ-0105-077） |

## メンテナンス

- 新規語彙の追加・旧語彙の変更は integrity-check の検出パターンと同期すること
- REQ-0108-055 に基づき、検査ルール変更時は regression fixture を追加すること
- 本レジストリは `.agentdev/` 配下に配置し、canonical domain state として扱う
