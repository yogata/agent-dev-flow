---
name: issue-workflow
description: 開発ワークフローの知識ベース。フェーズ定義、SSoT遷移、パターン判定基準、コマンド関連を提供。issue-*コマンドおよびissue-nextから参照される。
---

# Issue Workflow スキル

開発ワークフローの**知識ベース**として機能する。

- **コマンド（手順）**は具体的な実行ステップ
- **このスキル（知識）**はコンテキスト強化・判断基準・関連情報

---

## 全体像

```
┌─────────────────────────────────────────────────────────────┐
│  issue-next（指揮者）                                         │
│  - コンテキスト収集・フェーズ推論                              │
│  - 適切なコマンド選択・実行                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 参照
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  このスキル（知識）                                           │
│  - フェーズ定義・SSoT定義                                     │
│  - パターン判定基準                                           │
│  - コマンド関連図                                             │
│  - エラーコード・ラベルマッピング                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 参照
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  issue-* コマンド（手順）                                     │
│  issue-req → issue-create → issue-work → issue-close        │
│  （issue-update は随時）                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 基本原則

- **SSoT（Single Source of Truth）**: フェーズごとに信頼できる情報源が異なる
- **ローカル状態を持たない**: 並列実行対応のため、状態は外部で管理
- **宣言的定義**: 判断ロジックは含まず、基準・定義のみを提供

---

## 1. パターン判定

ラベルからパターン（A/B）を判定する。

### 判定基準

- `bug`, `critical` → パターンA（小）: バグ修正・軽微変更、docs/更新なし
- `feature`, `enhancement` → パターンB（中）: 新機能追加、docs/更新あり

---

## 2. フェーズ定義

開発ワークフローの6つのフェーズを定義する。

### フェーズ一覧

| フェーズ | 状態 | SSoT | 次のアクション |
|---|---|---|---|
| `requirement` | 要件定義中 | セッション会話、エラーログ | `/issue-req` |
| `analyzed` | 分析完了・Issue未作成 | `temp/*.md` | `/issue-create` |
| `created` | Issue作成済み・作業前 | GitHub Issue | `/issue-work {N}` |
| `in_progress` | 実装中 | GitHub Issue + worktree | `/issue-work {N}` 継続 |
| `review` | PR作成済み・レビュー中 | GitHub PR | レビュー結果待ち |
| `done` | 完了 | なし | - |

### SSoT遷移ルール

```
requirement          SSoT: セッション会話
    │
    │ /issue-req 完了
    ▼
analyzed             SSoT: temp/bug_analysis.md または temp/feature_technical.md
    │
    │ /issue-create 完了（temp/*削除）
    ▼
created              SSoT: GitHub Issue
    │
    │ /issue-work 開始
    ▼
in_progress          SSoT: GitHub Issue + worktree + ブランチ
    │
    │ 全チェックボックス完了 + PR作成
    ▼
review               SSoT: GitHub PR
    │
    │ PR merged + /issue-close 完了
    ▼
done                 SSoT: なし（完了）
```

### フェーズ判定基準（指揮者用）

指揮者（issue-next）は以下の優先順位でフェーズを推論する：

1. **done**: Issue closed
2. **review**: Issue open + PR open
3. **in_progress**: worktree存在 + 作業ブランチ（`feature/issue-*` または `bugfix/issue-*`）
4. **created**: Issue open + worktreeなし + PRなし
5. **analyzed**: `temp/bug_analysis.md` または `temp/feature_technical.md` 存在 + Issueなし
6. **requirement**: 上記以外 + ユーザー要望あり
7. **unknown**: 上記に該当しない — エラーまたは手動判定

---

## 3. コマンド関連図

### コマンド一覧

| コマンド | 役割 | 入力SSoT | 出力SSoT | 完了後フェーズ |
|---|---|---|---|---|
| `/issue-req` | 要件定義・分析 | セッション会話 | `temp/*.md` | `analyzed` |
| `/issue-create` | Issue作成 | `temp/*.md` | GitHub Issue | `created` |
| `/issue-work` | 実装・PR作成 | GitHub Issue | GitHub PR + worktree + ブランチ | `review` |
| `/issue-update` | Issue更新 | GitHub Issue | GitHub Issue | 変更なし |
| `/issue-close` | 完了処理 | GitHub Issue + GitHub PR (open) | なし | `done` |
| `/issue-next` | 指揮者（自動判定） | 複数 | 適切なコマンド実行 | - |

### コマンドフロー

```
                    ┌─────────────────┐
                    │  /issue-req     │
                    │  (要件定義)      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ /issue-create   │
                    │ (Issue作成)      │
                    └────────┬────────┘
                             │
                             ▼
┌──────────┐        ┌─────────────────┐        ┌──────────┐
│ /issue-  │ ◄────  │  /issue-work    │  ────► │ /issue-  │
│ update   │        │  (実装・PR作成)  │        │ update   │
└──────────┘        └────────┬────────┘        └──────────┘
        │                    │                    │
        │     NG             │                   NG
        └────────────────────┤                    │
                             ▼                    │
                    ┌─────────────────┐           │
                    │   レビュー       │ ◄─────────┘
                    └────────┬────────┘
                             │ OK
                             ▼
                    ┌─────────────────┐
                    │  /issue-close   │
                    │  (完了処理)      │
                    └────────┬────────┘
                             │
                             ▼
                          完了
```

### /issue-next の自動判定

```
/issue-next 実行
       │
       ▼
 ┌─────────────────────────┐
 │  コンテキスト収集         │
 │  - セッション会話         │
 │  - Git状態               │
 │  - temp/*.md 有無        │
 │  - GitHub Issue/PR      │
 └───────────┬─────────────┘
             │
             ▼
 ┌─────────────────────────┐
 │  フェーズ推論             │
 │  （このスキルの判定基準    │
 │   を参照）               │
 └───────────┬─────────────┘
             │
             ▼
 ┌─────────────────────────┐
 │  適切なコマンド実行       │
 │  requirement → /issue-req │
 │  analyzed → /issue-create │
 │  created → /issue-work    │
 │  ...                     │
 └─────────────────────────┘
```

---

## 4. 完了報告生成

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
  - Planファイルアーカイブ完了
  {パターンBの場合: - docs/コミット済み}
```

---

## 5. エラーハンドリング

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
- `CHECKBOX_INCOMPLETE`: チェックボックス未完了 → 未完了タスクを報告、完了後に再実行

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

## 6. ラベル選定

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
