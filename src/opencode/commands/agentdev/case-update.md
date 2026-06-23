---
description: 既存Caseの本文更新、コメント追加、またはREQファイル更新を行う
agent: sisyphus
---

# Case更新

既存Caseの本文更新、コメント追加、またはREQファイル更新を行う。
主にレビューNG時の対応に使用。

## 入力

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body`/ `--comment`/ `--req`/ `--review-ng`）

## 出力

- 更新されたIssue本文 または 追加されたコメント または 更新されたREQファイル または レビューNGコメント

## 手順

### Step 1: Issue番号解決

詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは候補番号抽出のみを返し、親エージェントが確認、停止を判断する

### Step 2: 現在のIssue状態を取得

`agentdev-workflow-lifecycle` で現在フェーズを判定

### Step 3: 更新内容に応じて分岐

- **`--body`**: Issue作成時に使用されたテンプレートに従って更新する。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは本文案と必須セクション検査のみを返し、親エージェントが `gh issue edit` を行う
- **`--comment`**: 更新コメントを追加する。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントはコメント案と必須セクション検査のみを返し、親エージェントが投稿する
- **`--req`**: REQファイル更新を行う。case-update --req は直接 commit+push を行う（req-save への委譲は行わない）。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは関連REQ候補、APPEND/UPDATE候補、根拠のみを返し、親エージェントがファイル更新とcommit/pushを行う
- **`--review-ng`**: レビューNG時の専用フローを実行する。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは乖離タイプ候補、推奨アクション、更新漏れ候補のみを返し、親エージェントがコメント投稿とREQ更新判断を行う

### Step 4: 完了報告

完了報告templateに従って出力。更新種別に応じた種別を選択:
- --body → .opencode/commands/agentdev/templates/case-update/body.md
- --comment → .opencode/commands/agentdev/templates/case-update/comment.md
- --req → .opencode/commands/agentdev/templates/case-update/req.md（変数: {APPEND/UPDATE}, {REQ番号}, {セクション名}）
- --review-ng → .opencode/commands/agentdev/templates/case-update/review-ng.md（変数: {乖離タイプ}, {REQ番号}, {推奨アクション}）
- 更新種別の推論: ユーザー入力、直前のレビュー結果、対象Issue/REQ、会話文脈から推論。推論不能時のみユーザーに指定を求めて停止

## APPEND vs UPDATE 判定基準

| 判定 | 条件 | 例 |
|------|------|----|
| APPEND | 要件テーブルへの行追加、適用範囲の拡張 | 受け入れ基準の追加、新規要件の追加 |
| UPDATE | 既存セクションの内容修正 | テキスト置換、要件の文言修正、適用範囲の変更 |

## ガードレール

### フェーズ制約
- G01: フェーズは変更なし（現在のフェーズを維持）
- G02: CI/CD修正、自律修正ループは case-update の管轄外とする（case-run の責務）。case-update はREQ更新、レビューNG時のコメント追加、Issue本文更新のみを責務とする

### 実行制約
- G03: Issue番号の解決に `gh issue list`/ `gh issue status` 等、gh/gitコマンドでopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能

### 品質ゲート
- G04: SSoTの整合性を維持（Issue本文と要件docの不整合を防ぐ）
- G05: `--review-ng` 時は必ず QG-3（`agentdev-quality-gates`）の乖離検出結果を引用すること
- G06: `--body` 更新時はIssue作成時と同じテンプレート構造を維持すること。【必須】セクションが欠落しないよう確認すること
- G07: コメント/レビューNGコメントのテンプレート【必須】セクションが全て含まれていることを確認してから投稿すること

### 委譲、参照制約
- G08: `agentdev-gh-cli` に従って `--body-file` を使用すること（`--body` 直接指定は禁止）
- G09: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G10: work_type分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G11: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す


