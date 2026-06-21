---
updated: 2026-06-21
---

# ワークフロー契約（旧版・縮小済み）

> **縮小済み**: 本 SPEC は AG-012 文書体系再構築により縮小した。個別 command / skill の動作は各 command SPEC（`commands/`）・各 skill SPEC（`skills/`）に移管した。横断契約は `workflows/` 配下の各 SPEC に再構成した。本ファイルは互換性のため残置するが、実質的な内容は以下の新 SPEC 群を参照のこと。

## 移管先

| 旧セクション | 移行先 |
|---|---|
| パイプライン概要・コマンド分類・フェーズ定義・SSoT 遷移・コマンド I/O 契約 | [workflows/workflow-contracts.md](workflows/workflow-contracts.md) |
| 汎用サブエージェント委譲契約・委譲種別・委譲制約 | [workflows/delegation-contracts.md](workflows/delegation-contracts.md) |
| manager-orchestrator と軽量委譲の分離・責務分界表 | [workflows/delegation-contracts.md](workflows/delegation-contracts.md) |
| キャプチャ境界（intake/learning 境界・Split Rule・PR 本文永続チャネル・REQ再構成intake） | [workflows/capture-boundaries.md](workflows/capture-boundaries.md) |
| OU / Epic / Wave / Issue 階層・子Issue 実行状態 enum・Epic 実行モデル・Wave スケジューリング・Epic Wave 実行モデル・Epic Wave クローズモデル・Epic 統率者契約・Epic/Wave 実行モデル | [workflows/epic-wave-model.md](workflows/epic-wave-model.md) |
| バックログドラフトプロトコル・検出事項プロトコル・inspect-promote 自動 promote・REQ ファイル整合性検査・DOC-MAP 影響規則・REQ 再構成検出・artifact_actions ベース工程分岐 | [workflows/backlog-artifact-lifecycle.md](workflows/backlog-artifact-lifecycle.md) |
| case-open 自律構成生成・case-run 委譲仕様・case-close 達成判定・各コマンド I/O 詳細 | 各 command SPEC（`commands/<command>.md`） |
| 実装分類（Pattern Taxonomy）・コマンド ↔ Pattern 対応 | [workflows/workflow-contracts.md](workflows/workflow-contracts.md) |

## 残置項目

本ファイルは以降のセクションを持たない。全実質内容は上記移行先に再構成済みである。`docs/DOC-MAP.md` の参考リンクとしてのみ参照可能。

## See Also

- [workflows/](workflows/) — 横断ワークフロー契約（新版）
- [commands/](commands/) — command SPEC
- [skills/](skills/) — skill SPEC
- AG-012 — 文書体系再構築の合意（旧 workflow-contracts.md 縮小）
