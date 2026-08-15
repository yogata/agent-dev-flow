---
description: inbox 内の intake item をレビュー、分類し、採用 item を backlog-review 向けの採用済み成果物に整形する
---

# Intake 昇格

`.agentdev/intake/inbox/` 内の intake item を直接読み込み、内部 review フェーズで分類したのち、採用 item を `backlog-review` に渡せる採用済み成果物に整形する。

**このコマンドは review、分類、整形を行う。
** GitHub Issue の作成は行わない。
`intake-review` は廃止済みであり、本コマンドが review 機能を吸収している。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-intake-promote`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-intake-promote.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

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
| `採用` | 対応すべきと判断。採用済み成果物に整形。inbox 元ファイルは削除 | `/agentdev/backlog-review` |
| `保留` | 判断を保留。inbox に残す | 再度 `/agentdev/intake-promote` |
| `却下` | 対応不要と判断。inbox 元ファイルは即時削除（reject commit message に却下理由を含める、AG-{NNN}） | - |

## 整形の方向性

採用 item の後続ルートに応じて整形内容が異なる:

| 後続ルート | 条件 | 整形内容 |
|------------|------|----------|
| `backlog-review` | 採用 item 全て | backlog-review が分析しやすい形式に整理（観測内容、影響、課題、既存要件との関連を構造化） |

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-intake-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが6 STEP の control plane として制御構造を所有する。各 STEP は resume point を持ち、durable state（`.agentdev/intake/inbox/` と `.agentdev/intake/promoted/` の実ファイル状態、分類確定状態）から再開点を再構成する（DEC-{N}）。

- **STEP-1** classification — inbox 確認、item 読込、レビュー評価、暫定分類提示
- **STEP-2** review（経路C） — adversarial-review 発動条件判定・review 呼出・accepted finding の暫定分類への反映（skip 条件該当時は省略）
- **STEP-3** HITL — 分類結果のユーザー提示・承認（判断の確定）。分類承認後の自動実行、破壊的変更の明示承認を含む
- **STEP-4** persistence — 採用 item の backlog-review 向け整形・`.agentdev/intake/promoted/` への保存
- **STEP-5** destructive handling — 振り分け（採用 inbox 削除・保留残置・reject 即時削除）、`git pull --ff-only`、commit/push（reject 理由付き commit message を含む）
- **STEP-6** 完了報告 — 分類結果と git 永続化結果の報告

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-intake-promote` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

## エラー処理

主要なエラー処理（git pull --ff-only 失敗時の停止、git push 失敗時の完了扱い禁止等）は `agentdev-intake-pipeline` を参照。構造化エラーメッセージを表示して停止し、自動解消しない。

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
- G08: 分類未確定のままの自動確定、自動進行は行わない（REQ）。ユーザーが「確定」を明示的に指示してから次フェーズに進む。確定後の自動進行は REQ で許容される。

### 破壊的変更制約
- G18: 破壊的変更（inbox 大量削除、重要 item の誤分類是正等）は STEP-3（HITL）承認とは別に明示承認を維持する（REQ）

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
- G17: 採用 item の inbox 元ファイルは成果物保存後に削除する（`.agentdev/intake/archive/promoted/` への移動を廃止）
- G19: reject item の inbox 元ファイルは即時削除する（`.agentdev/intake/archive/rejected/` への移動を廃止）。reject 時の commit message に却下理由を含める（AG-{NNN}、監査証跠の補強）

