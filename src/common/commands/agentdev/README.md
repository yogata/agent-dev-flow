---
description: agentdev コマンドリファレンス
---

# agentdev コマンドリファレンス

AgentDevFlow の各コマンドの入力、出力、次アクションを一覧化する。

公開コマンドは要求入口、標準実行コマンド、工程駆動実行、構成移行のいずれかに分類する。
要求入口は req-define（手動要求入口）と backlog-auto（要求蓄積入口）の2つであり、両経路の実行は case-auto へ合流する。
case-open、case-ready、case-run、case-close、case-revise は公開コマンドではなく内部 lifecycle 段階であり、case-auto が駆動する。
intake・learning・inspect 系の処理（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）も公開コマンドではなく、backlog-auto が Workflow Skill（`agentdev-workflow-inspect-docs`、`agentdev-workflow-learning-promote`、`agentdev-workflow-intake-promote`、`agentdev-workflow-inspect-promote`、`agentdev-workflow-backlog-review`）として駆動する内部 workflow である。intake item の作成は会話経由で intake pipeline 能力（`agentdev-intake-pipeline`）が担う。
REQ/Decision/Design の保存は内部 lifecycle の case-ready（初回確定時）と case-revise（再合意済み Definition 変更の反映時）の内部責務として実行する。
標準経路は req-define 完了後の case-auto 起動である。
工程駆動実行は、テーマ初回形成、テーマ更新、正規成果物への反映、独立レビューの4操作と利用者判断による工程遷移からなる経路であり、変更駆動経路の標準経路と別経路として併存する。各操作の公開コマンドは下表のとおりである。後継経路の実現・採用まで現行の変更駆動経路が正であり、変更駆動の実行に工程駆動の操作や遷移を前置しない。各操作は単独で起動でき、他の工程操作や遷移操作を前置しない。

## コマンド一覧

| Command | Primary Input | Primary Output | Next |
|---------|--------------|----------------|------|
| `/agentdev/req-define` | 手動要求入口: 自然言語による機能要求、bug report、エラー・ログ・障害事象、外部課題、設計・調査メモ、診断由来 finding、セッション会話/ RU | 要件doc（draft） | `/agentdev/case-auto` |
| `/agentdev/case-auto` | 標準実行コマンド: 要件doc（引数なし時は drafts 全件処理）/ Issue番号、URL | マージ済み + クローズ済み（内部 lifecycle case-open〜case-close 自走、例外経路 case-revise→case-ready 解決） | 完了 |
| `/agentdev/phase-tasks-create` | 工程駆動実行: 自然言語による形成指示（工程目的、対象範囲、既知制約） | テーマ初回形成の結果（テーマ識別と一覧、参考候補と既知の必須事項の区別。上流不存在時は目的・制約とテーマの対応の明示） | 継続利用（テーマ更新、独立レビュー、工程遷移） |
| `/agentdev/phase-tasks-update` | 工程駆動実行: 自然言語による更新指示（追加・具体化・分割・統合・廃止） | テーマ更新の結果（変更理由、旧新対応、未決事項の引継ぎ結果） | 継続利用（テーマ形成、独立レビュー、工程遷移） |
| `/agentdev/phase-artifacts-update` | 工程駆動実行: 自然言語による反映指示と反映する内容（戻り入力〔貼付または指定ファイル〕または直接採用する内容） | 反映の結果（反映した項目と反映先、衝突・未確認・保存失敗の区別、記録の保存先〔外部戻り入力存在時は受領記録、直接採用時は採否記録〕） | 継続利用（テーマ更新、独立レビュー、工程遷移） |
| `/agentdev/phase-review` | 工程駆動実行: 自然言語によるレビュー・全体像の指示 | 4区分（確定違反・証拠不足・推測・未採用改善候補）に分けた所見と工程全体像（セッション内テキスト出力。保存しない） | 継続利用（テーマ更新、成果物反映、工程遷移） |
| `/agentdev/phase-transition` | 工程駆動実行: 自然言語による遷移の指示 | 遷移の記録結果（記録先、後続工程の解決結果、前工程の過去工程化の伝達） | 継続利用または次工程の `/agentdev/phase-tasks-create`（遷移後の初回形成は遷移の成立と独立） |
| `/agentdev/backlog-auto` | 要求蓄積入口: なし（durable state から解決） | 検出事項、採用済み成果物、`RU-*.md`（backlog整理サイクル一巡）、一気通貫の実行結果報告（全体完了判定結果、リリース結果または保留理由） | RU がある場合: `/agentdev/req-define` → `/agentdev/case-auto` が一気通貫実行として自動接続される（利用者判断境界は維持。手動の `/agentdev/req-define` 起動も従来どおり利用可能） |
| `/agentdev/migrate` | 構成移行: 移行の指示（省略時は install.ps1 -Check の検知結果から解決） | 移行の結果（適用した差分仕様、旧新対応、引き継いだ情報とその内容・処理状態、決定論的検証の結果） | 完了（install.ps1 -Check の合格を確認） |

## 各コマンドの定義ファイル

- [req-define.md](./req-define.md)
- [case-auto.md](./case-auto.md)
- [backlog-auto.md](./backlog-auto.md)
- [phase-tasks-create.md](./phase-tasks-create.md)
- [phase-tasks-update.md](./phase-tasks-update.md)
- [phase-artifacts-update.md](./phase-artifacts-update.md)
- [phase-review.md](./phase-review.md)
- [phase-transition.md](./phase-transition.md)
- [migrate.md](./migrate.md)

## 廃止コマンドの移行案内

旧コマンドは v4 で公開コマンドから廃止され、alias は残さない。内部 lifecycle 段階として case-auto が駆動する。

- `/agentdev/case-open` → `/agentdev/case-auto`（内部 lifecycle の case-open 段階が駆動）
- `/agentdev/case-ready` → `/agentdev/case-auto`（内部 lifecycle の case-ready 段階が駆動）
- `/agentdev/case-revise` → req-define で再合意後の `/agentdev/case-auto`（例外経路 case-revise → case-ready を解決）
- `/agentdev/case-run` → `/agentdev/case-auto`（内部 lifecycle の case-run 段階が駆動）
- `/agentdev/case-close` → `/agentdev/case-auto`（内部 lifecycle の case-close 段階が駆動）

