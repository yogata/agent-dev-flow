---
description: inbox 内の intake item をレビュー、分類し、採用 item を backlog-review 向けの採用済み成果物に整形する
agent: sisyphus
---

# Intake 昇格

`.agentdev/intake/inbox/` 内の intake item を直接読み込み、内部 review フェーズで分類したのち、採用 item を `backlog-review` に渡せる採用済み成果物に整形する。

**このコマンドは review、分類、整形を行う。** GitHub Issue の作成は行わない。`intake-review` は廃止済みであり、本コマンドが review 機能を吸収している。

## 入力

- intake item 群（`.agentdev/intake/inbox/` 内の Markdown ファイル）
- ユーザーによる追加コンテキスト、分類修正指示（対話的に）

## 出力

- 採用 item の採用済み成果物（`backlog-review` 用）
- 整形済み item は `.agentdev/intake/promoted/*.md` に保存（フラット構造）
- 分類結果レポート（採用/ 保留/ 却下）

## 分類値

intake-promote の内部 review フェーズにおける分類値は以下の 3 値とする:

| 分類 | 意味 | 後続 |
|------|------|------|
| `採用` | 対応すべきと判断。採用済み成果物に整形 | `/agentdev/backlog-review` |
| `保留` | 判断を保留。inbox に残す | 再度 `/agentdev/intake-promote` |
| `却下` | 対応不要と判断 | `.agentdev/intake/archive/rejected/` |

## 整形の方向性

採用 item の後続ルートに応じて整形内容が異なる:

| 後続ルート | 条件 | 整形内容 |
|------------|------|----------|
| `backlog-review` | 採用 item 全て | backlog-review が分析しやすい形式に整理（観測内容、影響、課題、既存要件との関連を構造化） |

## 手順

### Step 1: inbox の確認

`.agentdev/intake/inbox/` 内の intake item を一覧表示する。詳細は `agentdev-intake-pipeline` を参照

### Step 2: item の読み込み

各 intake item を読み込み、内容を把握する。委譲接続点: サブエージェントは読解メモ、分類候補、根拠、capture候補のみを返し、親エージェントが分類提示と保存判断を行う

### Step 3: レビュー、評価

各 item を評価する。詳細は `agentdev-intake-pipeline` を参照。委譲接続点: サブエージェントは採用/ 保留/ 却下の候補と根拠を pass/warn/fail/partial で返し、親エージェントが最終分類を決める

### Step 4: 分類の提示

各 item の評価結果を分類（採用/ 保留/ 却下）と共に提示する。見出しは `## Findings / Capture候補` とする。詳細は `agentdev-intake-pipeline` を参照

### Step 5: ユーザー確認

評価、分類結果をユーザーに提示し、明示的な承認を得る（判断の確定、REQ-0147-003）。詳細は `agentdev-intake-pipeline` を参照。委譲接続点: 親エージェントのみが承認確認と次フェーズ進行判断を行う

**分類承認後の自動実行（REQ-0147-008）**: Step 5 で分類が確定（採用/保留/却下のいずれか）した場合、Step 6〜10（採用 item 整形 / promoted 保存 / archive 移動 / git pull / commit-push）は追加確認なしで自動実行する。分類未確定、修正中の場合は進まない。

### Step 6: 採用 item の整形

採用と判定された item を backlog-review 向けに整形する。詳細は `agentdev-intake-pipeline` を参照。委譲接続点: サブエージェントは整形案のみを返し、親エージェントが保存対象本文を確定する

### Step 7: 保存

`.agentdev/intake/promoted/` に保存する。詳細は `agentdev-intake-pipeline` を参照。委譲接続点: 親エージェントのみが保存する

### Step 8: 振り分け

確定した分類に基づいて item を振り分ける。詳細は `agentdev-intake-pipeline` を参照。委譲接続点: 親エージェントのみが移動を行う

### Step 9: 実行前同期（git pull）

`git pull --ff-only` を実行する。失敗時の扱いは `agentdev-intake-pipeline` を参照。委譲接続点: 親エージェントのみが git 操作を行う

### Step 10: .agentdev/intake 変更の commit と push

`.agentdev/intake/` 配下の変更のみを commit/push する（分類承認後の自動実行、REQ-0147-008）。詳細は `agentdev-intake-pipeline` を参照。委譲接続点: 親エージェントのみが commit/push を行う

### Step 11: 完了報告

完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/intake-promote/standard.md。分類結果（採用、保留、却下の件数、一覧）と git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含める

## エラー処理

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## ガードレール

### 責務境界
- G01: GitHub Issue の作成を行わない（`backlog-review`/ `case-open` が担当）
- G02: intake item の元の内容を改変しない（整理、構造化のみ）
- G03: `backlog-review` を自動起動しない（次ステップの提示のみ）
- G04: learning pipeline の入力を生成しない。採用 item の後続ルートは `backlog-review` のみ
- G05: learning item の保存、分類、昇華を担当しない

### HITL 制約
- G06: ユーザーの明示的な承認なしに採用済み成果物を生成してはならない
- G07: 分類結果は必ずユーザーに提示し、確認、修正の機会を与えること
- G08: 分類未確定のままの自動確定、自動進行は行わない（REQ-0147-003）。ユーザーが「確定」を明示的に指示してから次フェーズに進む。確定後の自動進行は REQ-0147-008 で許容される。

### 破壊的変更制約
- G18: 破壊的変更（inbox 大量削除、重要 item の誤分類是正等）は Step 5 承認とは別に明示承認を維持する（REQ-0147-005）

### 形式制約
- G09: workflow 管理成果物として扱わない
- G10: 整形結果に frontmatter（route/status 等）を含めてはならない
- G11: 整形結果に重複排除キー、後続成果物参照を含めない
- G12: 元 item の本文に整形結果を書き込まない

### accepted/ 廃止
- G13: `.agentdev/intake/accepted/` を参照、使用してはならない
- G14: `accepted/` への移動、読み込み、存在確認を行わない

### 実行制約
- G15: review、整形はユーザーとの対話を通じて行う
- G16: 保存先は `.agentdev/intake/promoted/` 直下のみ（フラット構造）
- G17: 採用 item の inbox 元ファイルは成果物保存後に `.agentdev/intake/archive/promoted/` に移動する

