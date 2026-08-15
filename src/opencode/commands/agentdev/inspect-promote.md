---
description: 検出事項を分類、採用し、採用済み成果物として .agentdev/inspect/promoted/ へ出力する。--auto で高確信度の検出事項を .agentdev/intake/promoted/ へ自動投入する
---

# inspect-promote

`.agentdev/inspect/inbox/` の検出事項を分類（promote/ defer/ reject）し、採用した検出事項を `.agentdev/inspect/promoted/` へ保存し、却下した検出事項は即時削除する（`archive/rejected/` 廃止）。
明示的な `--auto` opt-in 時は、高確信度の検出事項を HITL を経ずに `.agentdev/intake/promoted/` へ自動投入し、intake/backlog パイプラインへ流入させる。

## 入力

- `.agentdev/inspect/inbox/*.md`（検出事項ファイル群）
- `--auto`（省略可能）: 高確信度検出事項の自動 promote を有効化する明示 opt-in。省略時は従来の手動分類フローのみ

## 出力

- `.agentdev/inspect/promoted/*.md`（手動 promote 採用済み、RU 化対象）
- reject 検出事項は即時削除（`archive/rejected/` 廃止）。reject 時の commit message に却下理由を含める（AG-{NNN}、監査証跡の補強）
- `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時の自動 promote 成果物。backlog-review へ流入）
- `.agentdev/inspect/promoted/auto-promote-log.md`（`--auto` 実行ログ。append-only）
- セッション内完了報告

## 自動 promote 対象カテゴリ

`--auto` で自動 promote される高確信度カテゴリ、投入先、実行ログ、誤検知 revoke 手順の詳細は workflow-contracts SPEC（extension 経由で解決）の「inspect-promote 自動 promote」セクションに原本を置く。
本コマンドはカテゴリ定義を重複保持しない。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-inspect-promote`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-promote.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルは finding disposition（分類・採用・保留・却下）を独立 resume point とする8 STEP の control plane を所有する。durable state（`.agentdev/inspect/inbox/`、`.agentdev/inspect/promoted/`、`.agentdev/intake/promoted/`、auto-promote-log）から会話記憶に依存せず再開できる。

- **STEP-1** 実行前同期 — `git pull --ff-only`（失敗時は git-error-messages template で停止）
- **STEP-2** inbox スキャン — `.agentdev/inspect/inbox/*.md` 読込（空時は「対象なし」で終了）
- **STEP-3** 検出事項分類（暫定分類） — promote/ defer/ reject 判定と根拠の確定（finding disposition 入口 resume point）
- **STEP-4** 自動 promote（`--auto` opt-in 時のみ、fast path） — 高確信度検出事項を `.agentdev/intake/promoted/` へ投入、auto-promote-log 記録
- **STEP-5** adversarial-review（経路B） — 挿入境界（暫定分類後・HITL 前）での発動条件判定と review 呼出、結果反映、unresolved 停止
- **STEP-6** HITL 確定（手動分類対象） — 分類結果を提示し、ユーザー承認を得る
- **STEP-7** 処理実行（promote / reject / defer） — promoted/ 保存 + inbox 削除、即時削除（却下理由を commit message に含める）、inbox 残置（出口 resume point）
- **STEP-8** 完了報告・永続化 — 判定結果と後続 route の報告、`.agentdev/` 変更の commit/push

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-inspect-promote` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

**共通ルール**（全 STEP 適用、詳細は workflow skill 参照）: エラー処理（inbox 空時は「対象なし」終了、読込失敗時はスキップ警告、全件 defer 時は残置報告、push 失敗時は停止）

## ガードレール

- G01: ユーザーの明示的な承認なしに採用済み成果物を生成しない（`--auto` による自動 promote 対象を除く）
- G02: promote された検出事項のみを `.agentdev/inspect/promoted/` へ保存する
- G03: reject された検出事項は即時削除される（`archive/rejected/` への移動は廃止）。即時削除以外の取扱を禁止する
- G04: defer された検出事項は `.agentdev/inspect/inbox/` に残す
- G05: docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める
- G06: `--auto` は明示 opt-in の場合のみ有効。省略時は自動 promote を一切行わない
- G07: `--auto` は自動 promote 対象カテゴリ（workflow-contracts SPEC 参照、extension 経由）に合致する高確信度検出事項のみを投入し、意味判断、曖昧な分類、ADR 要否判断を含む検出事項は手動分類へ回す
- G08: `--auto` 実行の都度、投入対象、根拠を `.agentdev/inspect/promoted/auto-promote-log.md` に記録する。誤検知 revoke 手順は同 SPEC 参照


