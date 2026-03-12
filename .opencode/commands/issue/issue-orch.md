---
description: 開発ワークフローの指揮者。コンテキストから現在のフェーズを推論し、適切なコマンドを選択・実行する。
---

# ワークフロー指揮者（Orchestrator）

コンテキストを分析し、現在のフェーズに応じた issue-\* コマンドを自動選択・実行します。

---

## 役割

このコマンドは `@issue-workflow` スキルを参照し、コンテキストに基づいて適切な issue-* コマンドを選択・実行する。

---

## 引数

- `<Issue番号>` — 省略時は自動推論
- `--dry-run` — 判定結果のみ表示（コマンド実行なし）
- `--phase=<フェーズ名>` — フェーズを強制指定

---

## 手順

### 1. コンテキスト収集

以下の情報を収集する:

- **セッション会話** — メモリ内 — 要件定義フェーズの判定
- **Git状態** — `git branch --show-current`, `git worktree list` — 作業中ブランチの検出
- **temp/状態** — `ls temp/*.md` — 分析完了の検出
- **GitHub状態** — `gh issue list`, `gh pr list` — Issue/PRの状態確認

### 2. フェーズ推論

`@issue-workflow` スキルの「フェーズ判定基準」を参照し、以下の優先順位で推論:

1. **done** — Issue closed
2. **ready_to_close** — Issue open + PR merged
3. **review** — Issue open + PR open
4. **in_progress** — worktree存在 + 作業ブランチ
5. **created** — Issue open + worktreeなし + PRなし
6. **analyzed** — `temp/*.md` 存在 + Issueなし
7. **requirement** — 上記以外 + ユーザー要望あり
8. **unknown** — 判定不能

### 3. Issue番号特定

以下の優先順位でIssue番号を特定:

1. 明示的な引数
2. セッションコンテキスト
3. ブランチ名（`feature/issue-42` → 42）
4. worktreeパス（`.worktrees/42-feature` → 42）
5. `temp/*.md` の内容
6. 直近の `gh issue list --limit 1`

### 4. コマンド選択・実行

推論結果に基づき、適切なコマンドを実行:

- **requirement** → `/issue-req`
- **analyzed** → `/issue-create`
- **created** → `/issue-work {N}`
- **in_progress** → `/issue-work {N}`（継続）
- **review** → 待機 または レビュー結果に応じて判断
- **ready_to_close** → `/issue-close {N}`
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

## エラー・フォールバック

- **フェーズ判定不能** — ユーザーに現在の状態を確認
- **Issue番号特定不能** — 候補を提示して選択
- **複数のPR存在** — どちらを対象にするか確認
- **コンテキスト不足** — ユーザーに追加情報を要求

---

## 使用例

```bash
# 単純実行（コンテキストから自動判定）
/issue-orch

# Issue番号指定
/issue-orch 42

# 判定結果のみ表示
/issue-orch --dry-run

# フェーズ強制指定
/issue-orch --phase=review
```

---

## 完了時

実行したコマンドの完了報告に従う。
