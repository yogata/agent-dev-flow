---
description: 計画立案からコミットまでを一気通貫で実行する。3フェーズ構成でべき等性・再開ポイントを提供
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
  - conventional-commits
---

# 実装パイプライン

Issueに対して計画立案から実装・コミットまでを一気通貫で実行する。②構造的実行フェーズ。常にgit worktreeを使用。

3フェーズ構成により、各フェーズは独立して再実行可能（べき等性）。フェーズ間でエラーが発生した場合、Step 0の再開判定から再開できる。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 実装済みブランチ、コミット履歴
- 乖離検出レポート（乖離があれば）
- GitHub PR（open状態、レビュー待ち）

## フェーズ構成

| フェーズ | 名称 | Steps | 再開条件 |
|---|---|---|---|
| Phase A | 準備 | 1-5 | worktree+ブランチが存在しない |
| Phase B | 実装 | 6-7 | work planが未完了 または チェックボックス未完了 |
| Phase C | 提出 | 8-12 | PRが未作成 |

## Steps

### Step 0: フェーズ判定（再開ポイント検出）

再開が必要なフェーズを判定する。既存の成果物を確認し、どこから再開すべきかを決定。

1. **Issue番号解決**:
   - ユーザー入力からIssue番号を取得（指定されている場合はそれを使用）
   - 番号が省略された場合、セッション内会話から直近のIssue番号を検索（`issue-create` の完了報告、直前のIssue参照履歴等から抽出）
   - 複数のIssue番号が存在する場合は直近のものを優先し、ユーザーに確認（例: 「Issue #Nで進めます。よろしいですか？」）
   - 検出できない場合はユーザーに番号の指定を求めて停止
2. **成果物チェック** → 以下の順序で判定:
   - (a) worktreeが存在し、ブランチが切り替わっている → Phase A完了とみなす
   - (b) worktree内にコミットがあり、Issue本文のチェックボックスが全て完了 → Phase B完了とみなす
   - (c) PRが既に存在する（`gh pr list --head <branch>`）→ Phase C完了とみなす
   - (d) 上記のいずれも該当しない → Phase Aから開始
3. **再開ポイントの報告**:
   - 再開が必要なフェーズをユーザーに通知（例: 「Phase B（実装）から再開します」）
   - Phase Aから開始する場合は報告を省略

### Phase A: 準備（Steps 1-5）

**べき等性**: worktreeとブランチが既に存在する場合、Step 5をスキップしてPhase Bへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する。実装がspecsに矛盾しないことを確認する

**Step 3**: `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認する

**Step 4**: Pattern判定 → `issue-guide-phases` の Pattern Registry に従って Pattern A/B を判定し、以降のStepの分岐を決定

**Step 5**: Worktree作成・ブランチ準備 → `git-worktree` スキルに従って実行
- **べき等チェック**: worktreeが既に存在する場合（`git worktree list` で確認）、作成をスキップして既存worktreeを使用
- ブランチも既に存在する場合はcheckoutのみ実行

### Phase B: 実装（Steps 6-7）

**べき等性**: work planが完了済み（全チェックボックス完了）の場合、Phase Cへ移行。部分的に完了している場合は、未完了タスクから再開。

**Step 6**: work planを生成（@plan）→ 実行（/start-work）→ TDD実装
- **再開対応**: `.sisyphus/plans/` に既存のplanファイルがある場合、plan再生成をスキップして未完了タスクから再開
- planファイルがない場合は新規生成

**Step 7**: 各タスク完了時にIssue本文のチェックボックスを `[ ]` → `[x]` に更新
- チェックボックス更新に失敗した場合、エラーメッセージを表示して停止（ユーザーの判断を仰ぐ）
- **継続条件**: 全チェックボックスが完了したことを確認してからPhase Cへ移行

### Phase C: 提出（Steps 8-12）

**べき等性**: PRが既に存在する場合、Steps 8-11をスキップしてStep 12のみ実行（完了報告）。

**Step 8**: 実装完了後、乖離検出 → `deviation-check` の検出観点に従ってチェック
- 乖離検出でエラーが発生した場合、検出済みの結果を保持し、ユーザーに再試行またはスキップの選択を提示

**Step 9**: 乖離があれば報告 → `deviation-check` の報告フォーマットに従ってユーザーに提示
- 乖離がある場合、ユーザーの指示を待機（自動修正禁止）
- ユーザーが「継続」を選択した場合のみ次Stepへ進む

**Step 10**: パターンBの場合、`docs/specs/system.md` または `docs/specs/patterns.md` を更新する。実装によって仕様が変化した部分を反映する。パターンA（バグ修正）の場合はspecs更新をスキップする

**Step 11**: ローカル検証（型チェック・Lint・ビルド・テスト）→ PR作成
- **検証失敗時**: エラー内容を報告し、Phase Bへ戻ることを提案（ユーザー判断）
- 検証成功時のみPR作成 → `gh pr create` を `gh-cli-best-practices` に従って `--body-file` で実行
- **べき等チェック**: PRが既に存在する場合、作成をスキップ

**Step 12**: 完了報告 → `issue-guide-reports` の完了報告フォーマットで結果出力

## エラー処理

エラー発生時の対応を以下に定義する。各フェーズ境界が再開ポイントとなる。

| エラー発生フェーズ | 再開ポイント | 復旧アクション |
|---|---|---|
| Phase A（Step 1-5） | Phase Aの先頭 | Step 0から再判定 |
| Phase B（Step 6-7） | Phase BのStep 6 | planファイルが残っていれば未完了タスクから再開 |
| Phase C（Step 8-12） | Phase CのStep 8 | 乖離検出から再実行 |

**共通ルール**:
- エラー発生時は即座に停止し、エラー内容と再開ポイントを明示的にユーザーに報告する
- ユーザーの指示なしに自動リトライしない
- セッションが途切れた場合、再実行時にStep 0のフェーズ判定が自動的に再開ポイントを特定する

## Guardrails

- バイブス禁止（②構造的実行フェーズ — 実装のみ）
- 要件docの受け入れ基準に忠実（スコープ外の変更禁止）
- 乖離の自動修正禁止（ユーザー決定）
- 全ファイル操作はworktree内で実行
- Issue番号省略は同一セッション内で作成済みの場合のみ
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- 実装結果をspecsに反映すること（パターンBの場合）— Step 10で `system.md` / `patterns.md` を更新
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
- 各フェーズのべき等チェックは必ず実行する（再実行時の重複作業を防ぐ）
- フェーズ境界でエラーが発生した場合、Step 0から再開することで安全に復旧できる
