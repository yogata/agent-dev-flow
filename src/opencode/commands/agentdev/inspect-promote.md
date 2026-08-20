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

`--auto` で自動 promote される高確信度カテゴリ、投入先、実行ログ、誤検知 revoke 手順の詳細は workflow-contracts Design（extension 経由で解決）の「inspect-promote 自動 promote」セクションに原本を置く。
本コマンドはカテゴリ定義を重複保持しない。

## 自律確定と HITL フォールバック

分類・検証と必要な経路B review を経て、取得可能な根拠から promote / defer / reject を一意に確定できる検出事項は、ユーザー承認なしで確定する。ユーザー判断が必要な検出事項のみ HITL 対象とする。
同一実行内に両者が混在する場合、未決項目に依存しない項目を先行確定し、ユーザー判断が必要な検出事項のみを提示する。
自律確定可否の詳細判定表は workflow-contracts Design（extension 経由で解決）の「promote系判断確定とHITL境界」セクションに原本を置き、本コマンドは判定表を重複保持しない。
自律確定した検出事項の判定結果、主要根拠、HITL不要と判断した理由は完了報告で報告する（新規永続成果物を必須としない）。

`--auto` fast path（高確信度カテゴリの事前定義による早期処理、明示 opt-in）と通常経路の自律確定（レビュー・検証を経た最終確認省略）は別概念である。通常の実行によって `--auto` を暗黙的に有効化しない。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-inspect-promote`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-promote.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
同スキルは finding disposition（分類・採用・保留・却下）を独立 resume point とする8 STEP の control plane を所有する。
durable state（`.agentdev/inspect/inbox/`、`.agentdev/inspect/promoted/`、`.agentdev/intake/promoted/`、auto-promote-log）から会話記憶に依存せず再開できる。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 実行前同期 | コマンド起動 | inbox/ promoted/ の同期状態 | durable state との同期が済んでいること（inbox 空時は「対象なし」終了） |
| STEP-2 inbox スキャン | 同期済み | 検出事項リスト | 読込失敗時はスキップ警告で継続していること |
| STEP-3 検出事項分類（暫定分類） | スキャン済み | 暫定分類（promote/ defer/ reject） | 分類根拠が各検出事項に付いていること |
| STEP-4 自動 promote（`--auto` opt-in 時のみ、fast path） | `--auto` 明示指定 | `.agentdev/intake/promoted/inspect-auto-*.md`・auto-promote-log 記録 | 自動 promote 対象カテゴリ（workflow-contracts Design 参照）合致のみであること |
| STEP-5 adversarial-review（経路B） | review 挿入境界到達（default-on、skip 条件該当時は省略） | review 結果と反映後の分類案 | accepted finding が分類案へ反映されていること |
| STEP-6 確定（自律確定判定と HITL 確定） | 分類案確定 | 確定済み分類（自律確定分とユーザー確定分） | 横断契約Design 詳細判定表に従い自律確定可能な検出事項が承認なしで確定され、ユーザー判断が必要な検出事項のみ提示されていること |
| STEP-7 処理実行（promote / reject / defer） | 確定済み | promoted/ 保存・reject 即時削除・defer 残置 | 処理結果が分類確定内容と一致していること（全件 defer 時は残置報告） |
| STEP-8 完了報告・永続化 | 処理実行済み | 完了報告・git 永続化 | push 失敗時は停止していること |

同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

**共通ルール**（全 STEP 適用）: エラー処理（inbox 空時は「対象なし」終了、読込失敗時はスキップ警告、全件 defer 時は残置報告、push 失敗時は停止）

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- reject された検出事項は即時削除し、reject 時の commit message に却下理由を含める（`archive/rejected/` への移動は廃止）
- defer された検出事項は `.agentdev/inspect/inbox/` に残置する
- docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める
- `--auto` は自動 promote 対象カテゴリ（workflow-contracts Design 参照、extension 経由）に合致する高確信度検出事項のみを投入し、意味判断、曖昧な分類、ADR 要否判断を含む検出事項は手動分類へ回す
- `--auto` 実行の都度、投入対象、根拠を `.agentdev/inspect/promoted/auto-promote-log.md` に記録する（誤検知 revoke 手順は同 Design 参照）

## ガードレール

硬い境界（承認境界・state 破壊等の否定規則）に限定する:

- G01: ユーザーの明示的な承認なしに採用済み成果物を生成しない（`--auto` による自動 promote 対象、および詳細判定表（workflow-contracts Design 参照、extension 経由）に従い自律確定した検出事項を除く）
- G02: promote された検出事項のみを `.agentdev/inspect/promoted/` へ保存する
- G06: `--auto` は明示 opt-in の場合のみ有効。省略時は自動 promote を一切行わない


