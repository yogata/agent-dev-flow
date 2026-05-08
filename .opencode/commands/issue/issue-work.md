---
description: 計画立案からコミットまでを一気通貫で実行する（@plan + /start-work + commit統合）
agent: sisyphus
load_skills:
  - req-analysis
  - deviation-check
  - issue-guide-phases
  - issue-guide-reports
  - issue-guide-review
  - git-worktree
  - req-file-manager
  - adr-file-manager
---

# 実装パイプライン

Issueに対して計画立案から実装・コミットまでを一気通貫で実行する。②構造的実行フェーズ。常にgit worktreeを使用。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 実装済みブランチ、コミット履歴
- 乖離検出レポート（乖離があれば）
- GitHub PR（open状態、レビュー待ち）

## Steps

1. Issue番号解決:
   - ユーザー入力からIssue番号を取得（指定されている場合はそれを使用）
   - 番号が省略された場合、セッション内会話から直近のIssue番号を検索（`issue-create` の完了報告、直前のIssue参照履歴等から抽出）
   - 複数のIssue番号が存在する場合は直近のものを優先し、ユーザーに確認（例: 「Issue #Nで進めます。よろしいですか？」）
   - 検出できない場合はユーザーに番号の指定を求めて停止
2. Issue本文から要件docと受け入れ基準を抽出 → `req-analysis` のチェックボックス品質基準で検証
3. `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する。実装がspecsに矛盾しないことを確認する
4. `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認する
5. Worktree作成・ブランチ準備 → `git-worktree` スキルに従って実行
6. work planを生成（@plan）→ 実行（/start-work）→ TDD実装
7. 各タスク完了時にIssue本文のチェックボックスを `[ ]` → `[x]` に更新
8. 実装完了後、乖離検出 → `deviation-check` の検出観点に従ってチェック
9. 乖離があれば報告 → `deviation-check` の報告フォーマットに従ってユーザーに提示
10. パターンBの場合、`docs/specs/system.md` または `docs/specs/patterns.md` を更新する。実装によって仕様が変化した部分を反映する。パターンA（バグ修正）の場合はspecs更新をスキップする
11. ローカル検証（型チェック・Lint・ビルド・テスト）→ PR作成
12. 完了報告 → `issue-guide-reports` の完了報告フォーマットで結果出力

## Guardrails

- バイブス禁止（②構造的実行フェーズ — 実装のみ）
- 要件docの受け入れ基準に忠実（スコープ外の変更禁止）
- 乖離の自動修正禁止（ユーザー決定）
- 全ファイル操作はworktree内で実行
- Issue番号省略は同一セッション内で作成済みの場合のみ
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- 実装結果をspecsに反映すること（パターンBの場合）— Step 10で `system.md` / `patterns.md` を更新
