---
description: inbox 内の intake item をレビュー、分類し、採用 item を backlog-review 向けの採用済み成果物に整形する
---

# Intake 昇格

`.agentdev/intake/inbox/` 内の intake item を直接読み込み、内部 review フェーズで分類したのち、採用 item を `backlog-review` に渡せる採用済み成果物に整形する。

**このコマンドは review、分類、整形を行う。** GitHub Issue の作成は行わない。
`intake-review` は廃止済みであり、本コマンドが review 機能を吸収している。

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

本コマンドは workflow 実装本体を `agentdev-workflow-intake-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

## 自律確定と HITL 境界

- 取得可能な根拠から採用・保留・却下を一意に確定できる item はユーザー承認なしで確定する（自律確定）。ユーザー判断が必要な item のみを HITL 対象とする
- 自律確定可否の詳細判定表（自律確定可能要件、HITL移送条件、判定と運用の共通規則）は workflow-contracts Design（extension 経由で解決）「promote系判断確定とHITL境界」節が集約所有し、本コマンド定義と Workflow Skill は同一内容を重複保持しない
- 判定位置（classification → review → HITL → persistence の各工程での扱い）は `agentdev-workflow-intake-promote` スキルが所有する
- 同一実行内に自律確定可能 item とユーザー判断必要 item が混在する場合、未決項目に依存しない item を先行確定する（部分自律確定）
- 処理対象が空の場合は HITL を発生させず正常な「対象なし」として完了する
- 破壊的変更の明示承認は自律確定によって迂回しない（`POL-destructive-change-explicit-approval`）

## エラー処理

主要なエラー処理（git pull --ff-only 失敗時の停止、git push 失敗時の完了扱い禁止等）は `agentdev-intake-pipeline` を参照。
構造化エラーメッセージを表示して停止し、自動解消しない。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- review・分類・整形を担い、GitHub Issue の作成は backlog-review/case-open が担当する。backlog-review は次ステップの提示までとし自動起動は行わない
- 採用 item の後続ルートは backlog-review のみとする（learning pipeline の入力は生成しない。learning item の保存・分類・昇華は本コマンドの対象外）
- review、整形はユーザーとの対話を通じて行う。整形は元 item の内容の意味を保持した整理・構造化にとどめる
- 取得可能な根拠から採用・保留・却下を一意に確定できる item はユーザー承認なしで確定する（自律確定）。ユーザー判断が必要な item のみを HITL 対象とし、破壊的変更の明示承認は維持する（詳細判定表は workflow-contracts Design 参照）
- 整形結果は軽量な成果物として扱う（workflow 管理成果物として扱わない）。frontmatter（route/status 等）、重複排除キー、後続成果物参照は含めない
- intake 成果物の参照先は inbox/ と promoted/ に限る（accepted/ は廃止済み）
- 採用 item の inbox 元ファイルは成果物保存後に削除する（.agentdev/intake/archive/promoted/ への移動は廃止）。reject item の inbox 元ファイルは即時削除し、reject 時の commit message に却下理由を含める（AG-{NNN}、監査証跡の補強）

## ガードレール

否定規則は承認境界・state 破壊等の硬い境界に限定する:

- GitHub Issue の作成は行わない（backlog-review/case-open が担当）
- ユーザー判断が必要な item について、明示的な承認なしに採用済み成果物を生成しない（根拠から一意に確定できる item の自律確定による生成を除く。詳細判定表は workflow-contracts Design 参照）（`POL-promoted-artifact-requires-approval`）
- 分類未確定のままの自動確定、自動進行は行わない（REQ）。ユーザー判断必要 item はユーザーが「確定」を明示的に指示してから次フェーズに進む。根拠から一意に確定できる item の自律確定と、確定後の自動進行は REQ で許容される
- 元 item の本文に整形結果を書き込まない
- 保存先は .agentdev/intake/promoted/ 直下のみ（フラット構造）
- 破壊的変更（inbox 大量削除、重要 item の誤分類是正等）は HITL 承認とは別に明示承認を維持する（REQ）（`POL-destructive-change-explicit-approval`）
