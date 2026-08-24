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

分類・検証と必要な adversarial-review を経て、取得可能な根拠から promote / defer / reject を一意に確定できる検出事項は、ユーザー承認なしで確定する。ユーザー判断が必要な検出事項のみ HITL 対象とする。
同一実行内に両者が混在する場合、未決項目に依存しない項目を先行確定し、ユーザー判断が必要な検出事項のみを提示する。
自律確定可否の詳細判定表は workflow-contracts Design（extension 経由で解決）の「promote系判断確定とHITL境界」セクションに原本を置き、本コマンドは判定表を重複保持しない。
自律確定した検出事項の判定結果、主要根拠、HITL不要と判断した理由は完了報告で報告する（新規永続成果物を必須としない）。

`--auto` fast path（高確信度カテゴリの事前定義による早期処理、明示 opt-in）と通常経路の自律確定（レビュー・検証を経た最終確認省略）は別概念である。通常の実行によって `--auto` を暗黙的に有効化しない。

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。
エラー処理（inbox 空時は「対象なし」終了、読込失敗時はスキップ警告、全件 defer 時は残置報告、push 失敗時は停止）

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


