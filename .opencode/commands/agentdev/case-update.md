---
description: 既存Caseの本文更新、コメント追加、またはREQファイル更新を行う
agent: sisyphus
---

# Case更新

既存Caseの本文更新、コメント追加、またはREQファイル更新を行う。主にレビューNG時の対応に使用。

## Input

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body` / `--comment` / `--req` / `--review-ng`）

## Output

- 更新されたIssue本文 または 追加されたコメント または 更新されたREQファイル または レビューNGコメント

## Steps

1. Issue番号解決:
   - ユーザー入力からIssue番号を取得（指定されている場合はそれを使用）
   - 番号が省略された場合、セッション内会話から直近のIssue番号を検索（直前のIssue参照履歴等から抽出）
   - 複数のIssue番号が存在する場合は直近のものを優先し、ユーザーに確認（例: 「Issue #Nを更新します。よろしいですか？」）
   - 検出できない場合はユーザーに番号の指定を求めて停止
2. 現在のIssue状態を取得 → `agentdev-workflow-lifecycle` のフェーズ体系で現在フェーズを判定
3. 更新内容に応じて分岐:
    - **`--body`**: Issue作成時に使用されたテンプレート（`issue_desc_bug.md` / `issue_desc_feature.md` / `issue_desc_epic.md` / `issue_desc_child.md`）に従って更新。該当テンプレートの【必須】セクションが全て本文に含まれること → `gh issue edit`
   - **`--comment`**: テンプレート `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_update.md` を Read tool で読み込み → `gh issue comment`
     - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てコメント本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
    - **`--req`**: REQファイル更新（詳細フロー以下）。case-update --req は直接 commit+push を行う（req-save への委譲は行わない）:
      1. Issue番号から関連REQファイルを特定（Issue本文のREQ番号参照 or `docs/requirements/` から該当ファイル検索）
        2. 更新タイプの判定（APPEND vs UPDATE）:
           - **APPEND**: 要件テーブルへの行追加、適用範囲の拡張
           - **UPDATE**: 既存セクション（目的/要件/適用範囲）の内容修正
        3. frontmatter `updated` フィールドを現在日時に更新
        4. ファイル書き出し → `gh issue edit` でIssue本文の該当箇所も同期
        5. **commit / push**: REQファイルおよび影響を受ける docs ファイル（`docs/requirements/README.md`, `docs/README.md`）を commit + push する（SHALL）
    - **`--review-ng`**: レビューNG時の専用フロー（入力条件: `agentdev-spec-compliance` の乖離報告とユーザー承認済み判断が存在すること）:
      1. `agentdev-spec-compliance` の乖離報告をパース（影響度・対象・内容・推奨アクション・理由を抽出）
      2. 乖離タイプに基づく自動分岐:
         - `spec-bug`（仕様バグ）→ REQ UPDATE + レビューNGコメント投稿
         - `impl-bug`（実装バグ）→ レビューNGコメント投稿のみ（REQ変更不要）
         - `scope-creep`（スコープ外逸脱）→ REQ UPDATE（スコープ明確化）+ レビューNGコメント投稿
         - テスト不足・品質基準未達 → レビューNGコメント投稿のみ
      3. テンプレート `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md` を Read tool で読み込み・適用
         **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てコメント本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
      4. agentdev-spec-compliance結果をテンプレートの「Deviation Check 結果」セクションに展開
      5. NG理由分類のチェックボックスを自動選択
      6. `agentdev-gh-cli` に従い `--body-file` 経由でコメント投稿
4. 完了報告 → `agentdev-workflow-reporting` の完了報告variantに従って出力。更新種別に応じたvariantを選択:
   - --body → completion-reports/case-update/body.md
   - --comment → completion-reports/case-update/comment.md
   - --req → completion-reports/case-update/req.md（変数: {APPEND/UPDATE}, {REQ番号}, {セクション名}）
   - --review-ng → completion-reports/case-update/review-ng.md（変数: {乖離タイプ}, {REQ番号}, {推奨アクション}）
   - 更新種別の推論: ユーザー入力、直前のレビュー結果、対象Issue/REQ、会話文脈から推論（REQ-0107-037）。推論不能時のみユーザーに指定を求めて停止（REQ-0107-038）

## APPEND vs UPDATE 判定基準

| 判定 | 条件 | 例 |
|------|------|----|
| APPEND | 要件テーブルへの行追加、適用範囲の拡張 | 受け入れ基準の追加、新規要件の追加 |
| UPDATE | 既存セクションの内容修正 | テキスト置換、要件の文言修正、適用範囲の変更 |

## Guardrails

### フェーズ制約
- G01: フェーズは変更なし（現在のフェーズを維持）
- G02: CI/CD修正・自律修正ループは case-update の管轄外とする（case-run の責務）。case-update はREQ更新・レビューNG時のコメント追加・Issue本文更新のみを責務とする

### 実行制約
- G03: Issue番号の解決に `gh issue list` / `gh issue status` 等、gh/gitコマンドでopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能

### 品質ゲート
- G04: SSoTの整合性を維持（Issue本文と要件docの不整合を防ぐ）
- G05: `--review-ng` 時は必ず agentdev-spec-compliance 結果を引用すること
- G06: `--body` 更新時はIssue作成時と同じテンプレート構造を維持すること。【必須】セクションが欠落しないよう確認すること
- G07: コメント/レビューNGコメントのテンプレート【必須】セクションが全て含まれていることを確認してから投稿すること

### 委譲・参照制約
- G08: `agentdev-gh-cli` に従って `--body-file` を使用すること（`--body` 直接指定は禁止）
- G09: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G10: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

### 出力制約
- G11: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
