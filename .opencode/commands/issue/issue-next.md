---
description: 次のコマンドを推論・実行する。セッションコンテキストのみ使用（gh/gitコマンド禁止）。
---

# issue-next

セッションコンテキストから現在のフェーズを推論し、適切な issue-* コマンドを選択・実行する。

---

## 入力（SSoT）

- **セッションコンテキスト** — 会話履歴、Git状態、temp/*.md 有無、GitHub Issue/PR 状態

## 出力（SSoT）

- **適切な issue-* コマンドの実行** — 判定結果に基づくコマンド実行

## 完了後のフェーズ

実行されたコマンドに依存

---

## 前提

`issue-guide` スキルを実行し、フェーズ判定基準を参照してください。

## 手順

### 1. セッションコンテキスト収集

以下の情報を収集する:

- **セッション会話** — 要件定義フェーズの判定
- **Issue番号** — セッションコンテキストから取得
- **SSoT遷移** — `issue-guide` スキルの「フェーズ判定基準」を参照

### 2. フェーズ推論

`issue-guide` スキルの「フェーズ判定基準」を参照し、以下の優先順位で推論:

1. **done** — Issue closed
2. **review** — Issue open + PR open
3. **in_progress** — worktree存在 + 作業ブランチ
4. **created** — Issue open + worktreeなし + PRなし
5. **analyzed** — `temp/*.md` 存在 + Issueなし
6. **requirement** — 上記以外 + ユーザー要望あり
7. **unknown** — 判定不能

**ガードレール**: フェーズ推論不可時はエラー停止し、ユーザーに確認を要求。

### 3. Issue番号特定

以下の優先順位でIssue番号を特定:

1. 明示的な引数
2. セッションコンテキスト
3. **【禁止事項】** `.worktrees`、`git branch`、`gh issue list` 等からの推測は禁止

**ガードレール**: セッションコンテキストにIssue番号がない場合はエラー停止。

### 4. コマンド選択・実行

推論結果に基づき、適切なコマンドを実行:

- **requirement** → `/issue/issue-req`
- **analyzed** → `/issue/issue-create`
- **created** → `/issue/issue-work {N}`
- **in_progress** → `/issue/issue-work {N}`（継続）
- **review** → 待機 または レビュー結果に応じて判断
- **done** → 完了報告のみ
- **unknown** → ユーザーに確認

### 5. 結果報告

以下の形式で報告:

```yaml
---
workflow-state:
  phase: {フェーズ名}
  ssot: {現在のSSoT}
  issue: {Issue番号 または null}
  pr: {PR番号 または null}
---

## 判定結果

{現在の状態の要約}

## 次のアクション

`/{コマンド} {引数}`

{理由}
```

---

## ガードレール

- **セッションコンテキストのみ使用**: `gh`、`git` コマンドは使用禁止
  - **例外**: Issue番号特定不能時のみ `gh issue list --state open` を許可
    - **目的**: ユーザーへの情報提供のみ
    - **禁止**: 取得したIssue番号での自動ワークフロー実行
- **フェーズ推論不可時はエラー**: 明確な推論ができない場合は停止し、ユーザーに確認を要求

---

## エラーハンドリング

- **フェーズ判定不能** — ユーザーに現在の状態を確認
- **Issue番号特定不能** — open状態のIssue一覧を表示:
  ```bash
  gh issue list --state open --limit 10 --json number,title,labels --jq '.[] | "| \(.number) | \(.title) | \(.labels | map(.name) | join(", ")) |"'
  ```
  出力形式:
  ```
  | Number | Title | Labels |
  |--------|-------|--------|
  | 15     | fix: ... | enhancement, documentation |
  | 16     | feat: ... | enhancement |
  ```
  ユーザーにIssue番号の指定を促す
- **複数のPR存在** — どちらを対象にするか確認
- **コンテキスト不足** — ユーザーに追加情報を要求

---

## 完了時

実行したコマンドの完了報告に従う。
