---
description: 計画立案からコミットまでを一気通貫で実行する（@plan + /start-work + commit統合）
load_skills:
  - req-analysis
  - decision-log
  - deviation-check
  - issue-guide
---

# 実装パイプライン

Issueに対して計画立案から実装・コミットまでを一気通貫で実行する。②構造的実行フェーズ。常にgit worktreeを使用。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 実装済みブランチ、コミット履歴
- `decisions/` 更新（新たな技術判断があれば）
- 乖離検出レポート（乖離があれば）
- GitHub PR（open状態、レビュー待ち）

## Steps

1. Issue本文から要件docと受け入れ基準を抽出 → `req-analysis` のチェックボックス品質基準で検証
2. Worktree作成・ブランチ準備（`feature/issue-N` or `fix/issue-N`）
3. work planを生成（@plan）→ 実行（/start-work）→ TDD実装
4. パターンB（機能追加）の場合、HLD/LLD ドキュメントを生成 → テンプレート: `templates/doc_hld.md`, `templates/doc_lld.md`
5. 実行中に技術判断が発生 → `decision-log` に従って決定エントリ作成
6. 各タスク完了時にIssue本文のチェックボックスを `[ ]` → `[x]` に更新
7. 実装完了後、乖離検出 → `deviation-check` の検出観点に従ってチェック
8. 乖離があれば報告 → `deviation-check` の報告フォーマットに従ってユーザーに提示
9. ローカル検証（型チェック・Lint・ビルド・テスト）→ PR作成
10. 完了報告 → `issue-guide` の完了報告フォーマットで結果出力

## Guardrails

- バイブス禁止（②構造的実行フェーズ — 実装のみ）
- 要件docの受け入れ基準に忠実（スコープ外の変更禁止）
- 決定事項は全て `decision-log` に記録
- 乖離の自動修正禁止（ユーザー決定）
- 全ファイル操作はworktree内で実行
- Issue番号省略は同一セッション内で作成済みの場合のみ
