---
description: inbox 内の intake item をレビュー、分類し、採用 item を backlog-review 向けの採用済み成果物に整形する
---

# Intake 昇格

`.agentdev/intake/inbox/` 内の intake item を直接読み込み、内部 review フェーズで分類したのち、採用 item を `backlog-review` に渡せる採用済み成果物に整形する。

**このコマンドは review、分類、整形を行う。
** GitHub Issue の作成は行わない。
`intake-review` は廃止済みであり、本コマンドが review 機能を吸収している。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/intake-promote.yaml`）を読み込む（ADR）。

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
| `却下` | 対応不要と判断。inbox 元ファイルは即時削除（reject commit message に却下理由を含める、AG-006） | - |

## 整形の方向性

採用 item の後続ルートに応じて整形内容が異なる:

| 後続ルート | 条件 | 整形内容 |
|------------|------|----------|
| `backlog-review` | 採用 item 全て | backlog-review が分析しやすい形式に整理（観測内容、影響、課題、既存要件との関連を構造化） |

## 手順

### Step 1: inbox の確認

`.agentdev/intake/inbox/` 内の intake item を一覧表示する。詳細は `agentdev-intake-pipeline` を参照

### Step 2: item の読み込み

各 intake item を読み込み、内容を把握する。委譲接続点の詳細は `agentdev-intake-pipeline` を参照

### Step 3: レビュー、評価

各 item を評価する。詳細、委譲接続点は `agentdev-intake-pipeline` を参照

### Step 4: 分類の提示

各 item の評価結果を分類（採用/ 保留/ 却下）と共に提示する。
見出しは `## Findings / Capture候補` とする。
詳細は `agentdev-intake-pipeline` を参照

### Step 4a: 発動条件判定（経路C、任意）

暫定分類生成後、ユーザ提示前に adversarial-review を発動するかを判定する（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。本 Step は review 呼出（Step 4b）と分離された発動条件判定 Step であり、review 呼出そのものは行わない。

判定基準:

- default-on（原則実行、REQ-{NNNN}-{NNN}）: 暫定分類の意味的決定が存在する場合に発動する。ユーザー明示指定は通常発動の必須条件ではない
- skip 条件（REQ-{NNNN}-{NNN}）: inbox 項目が1件のみで暫定分類が自明（単一区分、意味的決定なし）、または inbox 空（Step 2 で終了）の場合、省略して従来フローを継続できる。skip 判断のためだけの新規 HITL、承認点は追加しない
- ユーザー明示指定時: skip 条件の該当にかかわらず必ず「発動」とする（REQ-{NNNN}-{NNN}）。明示指定は起動時引数、対話中の指示、extension（`.agentdev/extensions/commands/intake-promote.yaml`）の `rules` により表明される

判定結果が「非発動」の場合は Step 4b をスキップし、Step 4 の暫定分類をそのまま Step 5 へ渡し従来フローを維持する（REQ-{NNNN}-{NNN}）。既存の HITL（G06, G07, G08）、自動実行ルール（REQ-{NNNN}-{NNN}）、破壊的変更制約（G18）は変更しない。

詳細な候補判断基準は `agentdev-intake-pipeline` を参照。

### Step 4b: adversarial-review 呼出（経路C、任意）

Step 4a で「発動」と判定された場合に限り adversarial-review を呼び出す（REQ-{NNNN}-{NNN}）。本 Step は発動条件判定（Step 4a）と分離された review 呼出 Step であり、発動条件の再判定は行わない。

review 対象は Step 4 で生成された暫定分類（各 item の採用/保留/却下、変更種別、根拠）とする。呼出タイミングは Step 5「ユーザー確認」開始前、結果反映先は intake-promote 本体とする（詳細は `agentdev-intake-pipeline` 参照）。

- accepted finding を得た場合: 呼出元（intake-promote 本体）が暫定分類へ finding を反映し、反映後の分類を Step 5 へ渡す（REQ-{NNNN}-{NNN}）。adversarial-review 自身は反映を行わない
- unresolved な本質的争点が残る場合: Step 5 のユーザー確認で既存 HITL 経由で扱い、後続の保存、inbox 削除等の不可逆処理へは進まない（REQ-{NNNN}-{NNN}）
- 呼出失敗時（スキル不在、起動異常、timeout 等）: silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-{NNNN}-{NNN}）

共通契約（任意性、副作用禁止、accepted finding 反映責務、再 review 条件、停止条件、呼出失敗時取扱い）の正規所有者は adversarial-review SPEC「adversarial-review caller integration 共通契約」節（REQ-{NNNN}）であり、本 command 定義は再定義しない。

### Step 5: ユーザー確認

評価、分類結果をユーザーに提示し、明示的な承認を得る（判断の確定、REQ）。
詳細は `agentdev-intake-pipeline` を参照。
委譲接続点: 親エージェントのみが承認確認と次フェーズ進行判断を行う

**分類承認後の自動実行（REQ）**: Step 5 で分類が確定（採用/保留/却下のいずれか）した場合、Step 6〜10（採用 item 整形 / promoted 保存 / inbox 削除 / git pull / commit-push）は追加確認なしで自動実行する。
分類未確定、修正中の場合は進まない。

### Step 6: 採用 item の整形

採用と判定された item を backlog-review 向けに整形する。
詳細は `agentdev-intake-pipeline` を参照。
委譲接続点: サブエージェントは整形案のみを返し、親エージェントが保存対象本文を確定する

### Step 7: 保存

`.agentdev/intake/promoted/` に保存する。
詳細は `agentdev-intake-pipeline` を参照。
委譲接続点: 親エージェントのみが保存する

### Step 8: 振り分け

確定した分類に基づいて item を振り分ける。
詳細は `agentdev-intake-pipeline` を参照。
委譲接続点: 親エージェントのみが移動を行う

### Step 9: 実行前同期（git pull）

`git pull --ff-only` を実行する。失敗時の扱い、親エージェントのみが git 操作を行う点は `agentdev-intake-pipeline` を参照

### Step 10: .agentdev/intake 変更の commit と push

`.agentdev/intake/` 配下の変更のみを commit/push する（分類承認後の自動実行、REQ）。詳細、親エージェントのみが commit/push を行う点は `agentdev-intake-pipeline` を参照


### Step 11: 完了報告


完了報告templateに従って出力。
template: .opencode/commands/agentdev/templates/intake-promote/standard.md。
分類結果（採用、保留、却下の件数、一覧）と git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含める

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
- G18: 破壊的変更（inbox 大量削除、重要 item の誤分類是正等）は Step 5 承認とは別に明示承認を維持する（REQ）

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
- G19: reject item の inbox 元ファイルは即時削除する（`.agentdev/intake/archive/rejected/` への移動を廃止）。reject 時の commit message に却下理由を含める（AG-006、監査証跠の補強）

