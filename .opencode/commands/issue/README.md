---
description: issue コマンドセットの使用ガイド
---

# issue コマンド使用ガイド

機能追加とバグ修正を統一された `issue` コマンドセットでサポートします。

## コマンド一覧

| コマンド | 役割 |
|---|---|
| `/issue-req` | 要件定義 |
| `/issue-create` | Issue登録 |
| `/issue-work` | 実装パイプライン |
| `/issue-update` | Issue更新 |
| `/issue-close` | 完了処理 |
| `/issue-next` | 自動判定・次コマンド実行 |

## 基本フロー

```
/issue-req → /issue-create → /issue-work → /issue-close
```

**文脈による自動切り替え**:

- 機能追加: `/issue-req` で要件定義
- バグ修正: `/issue-req` で問題分析

---

## 詳細

- **フェーズ遷移・SSoT**: `@issue-workflow` スキルの「フェーズ定義」を参照
- **パターン判定（A/B）**: `@issue-workflow` スキルの「パターン判定」を参照
- **SDD連携**: `@issue-workflow` スキルの「SDD連携」を参照（パターンBのみ）
- **完了検証**: `@issue-workflow` スキルの「検証原則」を参照
- **エラーハンドリング**: `@issue-workflow` スキルの「エラーハンドリング」を参照

---

## 各コマンドの詳細

- `/issue-req` — [issue-req.md](./issue-req.md)
- `/issue-create` — [issue-create.md](./issue-create.md)
- `/issue-work` — [issue-work.md](./issue-work.md)
- `/issue-update` — [issue-update.md](./issue-update.md)
- `/issue-close` — [issue-close.md](./issue-close.md)
- `/issue-next` — [issue-next.md](./issue-next.md)

---

## テンプレート

各コマンドで使用するテンプレートは `templates/` ディレクトリに配置されています。
詳細は `@issue-workflow` スキルを参照してください。

---

## 使用例

### パターンA（小規模・バグ修正）

```
/issue-req
> ログイン時にエラーが出る
/issue-create
/issue-work 123
/issue-close 123
```

### パターンB（中規模・新機能）

```
/issue-req
> ユーザー管理機能を作りたい
/issue-create
/issue-work 124
/issue-close 124
```
