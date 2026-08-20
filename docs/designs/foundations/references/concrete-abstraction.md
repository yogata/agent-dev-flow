---
title: 具象参照抽象化 詳細（harness 分離モデル references）
status: accepted
created: 2026-07-12
updated: 2026-07-25
---

# 具象参照抽象化 詳細

本資料は `docs/designs/foundations/harness-separation-model.md` の「具象参照抽象化」節から分離した実装詳細を所有する。
方針、原則は親 Design を正とし、本資料は除去対象パターン、検出ルール、baseline 一覧などの運用詳細を集約する。

## 除去対象パターン

| 対象 | パターン例 | 除去方針 |
|---|---|---|
| トレーサビリティ注記（HTMLコメント） | `<!-- REQ-002-002 -->` | 削除。本文意に影響しない |
| トレーサビリティ注記（インライン） | 「REQ-002-002 に基づき」 | 文脈を保持したまま識別子を除去。「本要件に基づき」等へ |
| docs 内部パス | `docs/designs/foundations/document-model.md` | 削除。または抽象表現「文書粒度 Design」等へ |
| 実行制御パラメータ | 「最大5件」「120秒 timeout」「retry 5回」 | `references/<topic>.md` へ集約 |

## トレーサビリティ担保

除去された識別子のトレーサビリティは次で担保する。

- git 履歴（コミットメッセージ、diff）
- 原本側 docs/（REQ、Decision、IR カタログ）

## baseline 既知違反

`src/opencode/` 配下の既知違反（baseline 11件）は段階解消の対象とし、一括除去の完了条件から除外する。
baseline は delta 検出で新規違反と区別するための与件であり、baseline 自体の解消は段階的に実施する。

### 件数定義

baseline 件数は次の2軸で明記する。

- ファイル単位: 違反を含む配布 command/skill ファイル数（重複排除）
- マッチ単位: 違反パターンにマッチした総件数（重複含む）

機械化判定はマッチ単位を採用し、grep 結果との1:1照合を可能にする。
ファイル単位は進捗報告用の補助値とし、判定の主評価値とはしない。

### baseline リスト（11件）

下記11件を baseline 既知違反として登録する。
各行は「ファイルパス:行番号:違反内容:検出ルール」形式である。
抽出元は integrity 検査の warning level（11件）、ファイル単位の件数は6件である。

1. `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`:110:gh CLI 直接呼出し（`gh pr view`）:IR-053 (gh-direct-invocation)
2. `src/opencode/commands/agentdev/req-save.md`:262:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
3. `src/opencode/commands/agentdev/req-save.md`:272:`docs/designs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
4. `src/opencode/commands/agentdev/req-save.md`:272:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
5. `src/opencode/commands/agentdev/design-save.md`:226:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
6. `src/opencode/commands/agentdev/design-save.md`:236:`docs/guides/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
7. `src/opencode/commands/agentdev/design-save.md`:240:`docs/designs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
8. `src/opencode/commands/agentdev/design-save.md`:253:`docs/designs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
9. `src/opencode/commands/agentdev/design-save.md`:253:`docs/designs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
10. `src/opencode/skills/agentdev-inspect-skills/SKILL.md`:63:`docs/designs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)
11. `src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md`:55:`docs/designs/` 参照:IR-055 (runtime-unresolved-reference, heuristic)

## 関連

- 親 Design: [../harness-separation-model.md](../harness-separation-model.md)
- 関連 Decision（v2）: v2:ADR-0136（配布物の harness 実行制御分離）
- 関連 REQ（v2）: v2:REQ-0162（配布物の harness 実行制御分離）
