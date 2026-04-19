---
description: issue コマンドセットの使用ガイド
---

# issue コマンド使用ガイド

機能追加とバグ修正を統一された `issue` コマンドセットでサポートします。

## コマンド一覧

| コマンド | 役割 |
|---|---|
| `/issue/issue-req` | 要件定義 |
| `/issue/issue-create` | Issue登録 |
| `/issue/issue-work` | 実装パイプライン |
| `/issue/issue-update` | Issue更新 |
| `/issue/issue-close` | 完了処理 |
| `/issue/issue-next` | 自動判定・次コマンド実行 |

## 基本フロー

```
/issue/issue-req → /issue/issue-create → /issue/issue-work → /issue/issue-close
```

**文脈による自動切り替え**:

- 機能追加: `/issue/issue-req` で要件定義
- バグ修正: `/issue/issue-req` で問題分析

---

## 詳細

- **フェーズ遷移・SSoT**: `issue-guide` スキルの「フェーズ定義」を参照
- **パターン判定（A/B）**: `issue-guide` スキルの「パターン判定」を参照
- **SDD連携**: `issue-guide` スキルの「SDD連携」を参照（パターンBのみ）
- **完了検証**: `issue-guide` スキルの「検証原則」を参照
- **エラーハンドリング**: `issue-guide` スキルの「エラーハンドリング」を参照

---

## 各コマンドの詳細

- `/issue/issue-req` — [issue-req.md](./issue-req.md)
- `/issue/issue-create` — [issue-create.md](./issue-create.md)
- `/issue/issue-work` — [issue-work.md](./issue-work.md)
- `/issue/issue-update` — [issue-update.md](./issue-update.md)
- `/issue/issue-close` — [issue-close.md](./issue-close.md)
- `/issue/issue-next` — [issue-next.md](./issue-next.md)

---

## テンプレート

各コマンドで使用するテンプレートは `templates/` ディレクトリに配置されています。
詳細は `issue-guide` スキルを参照してください。

---

## 使用例

### パターンA（小規模・バグ修正）

```
/issue/issue-req
> ログイン時にエラーが出る
/issue/issue-create
/issue/issue-work 123
/issue/issue-close 123
```

### パターンB（中規模・新機能）

```
/issue/issue-req
> ユーザー管理機能を作りたい
/issue/issue-create
/issue/issue-work 124
/issue/issue-close 124
```
