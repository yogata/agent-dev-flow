---
name: agentdev-intake-pipeline
description: intake-from-github（GitHub残課題抽出）と intake-promote（review、分類、振り分け）の知識ベース。USE FOR: GitHub intake抽出ロジック（期間解釈、データ取得、構造検出、LLM解析、item生成）、intake-promote時のreview、分類、整形、振り分け基準、Inbox確認、Review観点、採用/保留/却下の分類判定、promoted/ への保存、Git永続化手順。DO NOT USE FOR: Issue作成（`agentdev-issue-management`）、RU生成（`agentdev-backlog-integration`）、REQ構造診断（`agentdev-req-structure-diagnostics`）、work_type判定（`agentdev-workflow-lifecycle`）
---

# Intake パイプライン知識ベース

intake-from-github と intake-promote コマンドの知識ベース。

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-intake-pipeline` SPEC](../../../../docs/specs/skills/agentdev-intake-pipeline.md) である。
本 SKILL.md は実行入口であり、SPEC を SSoT として DERIVE する。機能節の記述は SPEC と整合し、SKILL.md 固有の運用ビュー、参照資料、トリガーを補完する。SPEC と重複する場合、SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## USE FOR

- GitHub intake抽出ロジック: 期間解釈、データ取得、構造検出、LLM全文解析、intake item生成
- intake-promote時のreview、分類、整形、振り分け基準
- Inbox確認、Review観点、採用/保留/却下の分類判定
- promoted/ への保存、Git永続化手順

## DO NOT USE FOR

- Issue作成: `agentdev-issue-management` を参照
- RU生成: `agentdev-backlog-integration` を参照
- REQ構造診断: `agentdev-req-structure-diagnostics` を参照
- work_type判定: `agentdev-workflow-lifecycle` を参照

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| `/agentdev/intake-from-github` | クローズ済み Issue/PR から残課題を抽出し inbox item を生成する |
| `/agentdev/intake-promote` | inbox item を review、分類、整形、振り分けし promoted/ に保存する |

## references/ 構成一覧

| ファイル | 内容 |
|----------|------|
| `references/intake-extraction.md` | GitHub残課題抽出ロジック: 期間解釈、データ取得、構造検出、LLM全文解析、intake item生成 |
| `references/intake-promotion.md` | intake-promote詳細手順: Inbox確認、Review観点、分類提示、ユーザー確認、採用item整形、保存と振り分け、Git永続化 |

## See Also

- **agentdev-workflow-lifecycle**: work_type判定基準、フェーズ定義
- **agentdev-backlog-integration**: 採用済み成果物から RU への変換
