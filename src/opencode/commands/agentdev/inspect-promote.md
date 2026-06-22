---
description: 検出事項を分類・採用し、採用済み成果物として .agentdev/inspect/promoted/ へ出力する。--auto で高確信度の検出事項を .agentdev/intake/promoted/ へ自動投入する
agent: sisyphus
---

# inspect-promote

`.agentdev/inspect/inbox/` の検出事項を分類（promote/ defer/ reject）し、採用した検出事項を `.agentdev/inspect/promoted/` へ、却下した検出事項を `.agentdev/inspect/archive/rejected/` へ移動する。明示的な `--auto` opt-in 時は、高確信度の検出事項を HITL を経ずに `.agentdev/intake/promoted/` へ自動投入し、intake/backlog パイプラインへ流入させる。

## 入力

- `.agentdev/inspect/inbox/*.md`（検出事項ファイル群）
- `--auto`（省略可能）: 高確信度検出事項の自動 promote を有効化する明示 opt-in。省略時は従来の手動分類フローのみ

## 出力

- `.agentdev/inspect/promoted/*.md`（手動 promote 採用済み・RU 化対象）
- `.agentdev/inspect/archive/rejected/*.md`（却下済み）
- `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時の自動 promote 成果物。backlog-review へ流入）
- `.agentdev/inspect/promoted/auto-promote-log.md`（`--auto` 実行ログ。append-only）
- セッション内完了報告

## 自動 promote 対象カテゴリ

`--auto` で自動 promote される高確信度カテゴリ・投入先・実行ログ・誤検知 revoke 手順の詳細は `docs/specs/workflow-contracts.md` の「inspect-promote 自動 promote」セクションに原本を置く。本コマンドはカテゴリ定義を重複保持しない。

## 手順

### Step 1: 実行前同期（git pull --ff-only）

 - `git pull --ff-only` を実行
 - **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）
### Step 2: inbox スキャン

`.agentdev/inspect/inbox/*.md` を読み込む。空の場合は「対象なし」と報告して終了
### Step 3: 検出事項分類

各検出事項について以下を評価し、promote/ defer/ reject を判定する:
 - 明確な不整合 → promote（RU 化対象）
 - 不整合かどうか・採否・範囲・優先度・正とする情報源が未確定 → defer（intake 送付候補）
 - 誤検知・対応不要 → reject
 - 具体的修正対象を持たない再発防止知見 → defer（learning 送付候補）
### Step 4: 自動 promote（`--auto` opt-in 時のみ）

`--auto` が指定された場合、分類結果のうち `docs/specs/workflow-contracts.md` の自動 promote 対象カテゴリに合致し、かつ安定契約例外および否定文脈を満たさない高確信度検出事項を HITL 承認なしで `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md` へ投入する。各投入を `.agentdev/inspect/promoted/auto-promote-log.md` に追記する（対象検出事項・カテゴリ・投入先ファイル・根拠）。`--auto` 未指定時は本 step をスキップし、自動投入を行わない
### Step 5: HITL 確定（手動分類対象）

自動 promote 対象外の検出事項はユーザーの明示的な承認なしに採用済み成果物を生成しない。分類結果を提示し、承認を得る
### Step 6: promote 処理

承認された promote 対象検出事項を `.agentdev/inspect/promoted/` へ保存。元の inbox file は削除
### Step 7: reject 処理

承認された reject 対象検出事項を `.agentdev/inspect/archive/rejected/` へ移動
### Step 8: defer 処理

defer となった検出事項は `.agentdev/inspect/inbox/` に残置。intake/ learning 送付の推奨を報告
### Step 9: 完了報告

promote/ defer/ reject/ auto-promote の判定結果と後続 route を提示。`--auto` 実行時は投入件数・投入先一覧・ログパスを含める
### Step 10: .agentdev/ 変更の commit と push

 - `git diff --name-only` で `.agentdev/inspect/` および `.agentdev/intake/` 配下の変更を確認（auto-promote の intake/promoted/ 投入・promoted/rejected への移動・inbox 削除・auto-promote-log 更新を含む）
 - **変更なし時**: commit/push せず「変更なし」と報告
 - **変更あり時**:
 1. `git add` は `.agentdev/inspect/` と `.agentdev/intake/` のみ対象
 2. commit message: `chore(agentdev): promote inspect findings`
 3. `git push` 実行
 4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（完了扱いにしない）

## ガードレール

- G01: ユーザーの明示的な承認なしに採用済み成果物を生成しない（`--auto` による自動 promote 対象を除く）
- G02: promote された検出事項のみを `.agentdev/inspect/promoted/` へ保存する
- G03: reject された検出事項は `.agentdev/inspect/archive/rejected/` へ移動する
- G04: defer された検出事項は `.agentdev/inspect/inbox/` に残す
- G05: docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める
- G06: `--auto` は明示 opt-in の場合のみ有効。省略時は自動 promote を一切行わない
- G07: `--auto` は自動 promote 対象カテゴリ（`docs/specs/workflow-contracts.md` 参照）に合致する高確信度検出事項のみを投入し、意味判断・曖昧な分類・ADR 要否判断を含む検出事項は手動分類へ回す
- G08: `--auto` 実行の都度、投入対象・根拠を `.agentdev/inspect/promoted/auto-promote-log.md` に記録する。誤検知 revoke 手順は同 SPEC 参照

## エラー処理

| エラー | 対処 |
|--------|------|
| inbox が空 | 「対象なし」と報告して終了 |
| 検出事項ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| ユーザーが全件 defer | inbox に全件残置し、報告 |


