---
name: agentdev-req-structure-diagnostics
description: docs-review コマンドの REQ structure 診断ロジックの知識ベース。USE FOR: REQ参照ID整合性確認、第一参照導線確認、active/retired/世代境界確認、6観点診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）、未処理artifact確認、問題候補出力スキーマ。DO NOT USE FOR: backlog統合手順（agentdev-backlog-integration を参照）、intake pipeline（agentdev-intake-pipeline を参照）、work_type判定（agentdev-workflow-lifecycle を参照）
---

# REQ Structure Diagnostics Knowledge Base

docs-review コマンドの REQ structure 診断知識ベース。REQ参照ID整合性・第一参照導線・active/retired/世代境界・6観点診断・未処理artifact確認・問題候補出力スキーマの判定基準と検出シグナルを提供する。診断専用（read-only）であり、本スキルは判定ロジックの提供のみを行い、ファイル変更や artifact 処理は行わない。

## USE FOR

- REQ参照ID整合性確認（frontmatter `id` 一意性、ファイル名整合、相互参照の存在）
- 第一参照導線確認（DOC-MAP・README・requirements/README 導線）
- active/retired/世代境界確認（retired 専有 ID、二重存在、100s番台境界）
- 6観点診断（SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT）とシグナル閾値
- 未処理 artifact 確認（intake/learning/RU の存在と影響の報告）
- 問題候補出力スキーマ（7フィールド構成）と診断結果の出力構成

## DO NOT USE FOR

- backlog 統合手順: `agentdev-backlog-integration` を参照
- intake pipeline（capture/promote の処理手順）: `agentdev-intake-pipeline` を参照
- work_type 判定・フェーズ定義: `agentdev-workflow-lifecycle` を参照

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| docs-review | docs全体の意味整合性レビューにおける REQ structure 診断ロジックの提供（REQ参照ID整合性・第一参照導線・active/retired境界・6観点診断・未処理artifact確認・問題候補出力スキーマ） |

## references/ 構成一覧

| ファイル | 内容 |
|----------|------|
| `references/req-structure-review.md` | REQ参照ID整合性確認・第一参照導線確認・active/retired/世代境界確認・6観点診断（観点・検出シグナル・シグナル閾値）・未処理artifact確認・診断結果の出力（問題候補出力スキーマ7フィールド） |

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定・フェーズ定義
- **agentdev-spec-compliance**: 乖離検出（REQ本文と実体の間の矛盾の機械的検査）
- **agentdev-doc-map**: DOC-MAP 索引構造・summary/index 文書の分量基準
