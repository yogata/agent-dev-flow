---
name: issue-workflow
description: issue-req、issue-create、issue-work、issue-update、issue-closeコマンドから明示的に呼び出される。パターン判定、状態判定、完了報告生成、次のステップ提案、エラーハンドリングを担当。
---

# Issue Workflow スキル

issue-\*コマンド群から呼び出され、状態管理と報告を一元管理する。

## 基本原則

- **SSoT（フェーズ依存）**:
  - `issue-req`: ユーザー入力、要望ドキュメント、エラーログ
  - `issue-create` 以降: GitHub Issue/PR
- **ローカル状態を持たない**: 並列実行対応のため、状態はGitHub側で管理
- **明示呼び出し**: 各コマンドから `@issue-workflow` として参照される

---

## 1. パターン判定

ラベルからパターン（A/B）を判定する。

### 判定基準

- `bug`, `critical` → パターンA（小）: バグ修正・軽微変更、docs/更新なし
- `feature`, `enhancement` → パターンB（中）: 新機能追加、docs/更新あり

---

## 2. 状態判定

`gh issue` から現在のフェーズを推論する。

### フェーズ定義

- `none`: Issue存在しない → 未作成
- `created`: Issue open, PRなし, コメント少 → 作成直後
- `review`: Issue open, PR open → レビュー待ち
- `ready_to_close`: Issue open, PR merged → クローズ可能
- `done`: Issue closed → 完了

---

## 3. 完了報告生成

コマンド完了時に統一フォーマットで報告を生成する。

### 報告フォーマット

#### issue-req 完了時

```
✅ パターン{X}（{規模}）と判定しました。
  Issue状態: {フェーズ}
  次のステップ: /issue-create
```

#### issue-create 完了時

```
✅ Issue #{N} を作成しました（パターン{X}）。
  {パターンBの場合: docs/にIssue番号を紐付けました。}
  次のステップ: /issue-work {N}
```

#### issue-work 完了時

```
✅ PRを作成しました: {PR_URL}
  Issue: #{N}（パターン{X}）
  現在の状態: review（レビュー待ち）

  レビュー結果:
  - OK → /issue-close {N}
  - NG（仕様バグ）→ /issue-update {N} → /issue-work {N}
  - NG（実装バグ）→ /issue-update {N} --comment → /issue-work {N}
```

#### issue-update 完了時

```
✅ Issue #{N} を更新しました。
  次のステップ: /issue-work {N}
```

または

```
✅ Issue #{N} にコメントを追加しました。
  次のステップ: /issue-work {N}
```

#### issue-close 完了時

```
🎉 フロー完了しました。
  - クローズ: Issue #{N}
  - マージ: PR #{PR_N}
  - 削除: worktree `.worktrees/{N}-{type}`, ブランチ `{type}/issue-{N}`
  {パターンBの場合: - docs/コミット済み}
```

---

## 4. エラーハンドリング

全コマンド共通のエラー対処を定義する。

### エラーコード一覧

- `GH_AUTH_ERROR`: gh認証エラー → `gh auth login` 手順を案内
- `GH_NOT_FOUND`: Issue/PR存在しない → 対象が存在することを確認
- `PERMISSION_DENIED`: 権限エラー → リポジトリ権限を確認
- `ISSUE_NUMBER_REQUIRED`: Issue番号が必要 → 明示的な番号指定または `/issue-create` 実行を促す
- `WORKTREE_CREATE_FAILED`: worktree作成失敗 → 既存worktree削除またはパス確認
- `WORKTREE_EXISTS`: 同一worktree存在 → 既存削除またはスキップの選択肢提示
- `BRANCH_NAME_CONFLICT`: ブランチ名競合 → 既存ブランチ削除またはスキップ
- `PARALLEL_PARTIAL_FAILURE`: 並列一部失敗 → 成功分維持、失敗分の詳細報告
- `PR_CREATE_FAILED`: PR作成失敗 → コミット保持、手動PR作成手順を案内
- `PR_MERGE_CONFLICT`: マージコンフリクト → 手動解決手順を案内
- `VALIDATION_FAILED`: 検証失敗 → エラー内容を報告、修正手順を案内

### 使用方法

コマンドでエラーが発生した場合、以下の形式で呼び出す：

```
@issue-workflow スキルの「エラーハンドリング」を実行してください。
エラーコード: {ERROR_CODE}
コンテキスト: {追加情報（Issue番号、エラーメッセージ等）}
```

### エラー出力フォーマット

```
❌ エラーが発生しました: {エラー名}

  原因: {原因の説明}

  対処方法:
  1. {手順1}
  2. {手順2}
  ...
```

---

## 5. ラベル選定

パターンと種別から適切なラベルを決定する。

### ラベルマッピング

- バグ修正 → `bug`
- バグ修正（緊急）→ `bug`, `critical`
- 機能追加 → `enhancement`, `feature`
- 機能追加（要検討）→ `enhancement`, `feature`, `needs-discussion`

---

## 呼び出し例

### コマンドからの呼び出し

```markdown
## 完了時

`@issue-workflow` スキルの「完了報告生成」と「次のステップ提案」を実行してください。
現在のコンテキスト:

- コマンド: issue-work
- Issue番号: {N}
- PR番号: {PR_N}
- パターン: {A/B}
```

### エラー時の呼び出し

```markdown
`@issue-workflow` スキルの「エラーハンドリング」を実行してください。
エラーコード: WORKTREE_CREATE_FAILED
コンテキスト: Issue #101, パス .worktrees/101-feature
```
