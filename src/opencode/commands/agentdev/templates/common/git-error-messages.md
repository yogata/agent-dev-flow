# Git エラーメッセージテンプレート（共通）

複数コマンドで使用する Git 同期・Push エラーの構造化メッセージ形式。

## Git 同期エラー（pull --ff-only 失敗）

```
## Git 同期エラー

**エラー種別**: pull --ff-only 失敗
**停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
**対象ブランチ**: {current_branch}
**ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
**raw git output**:
{git_error_output}
```

## Git Push エラー

```
## Git Push エラー

**エラー種別**: push 失敗
**停止理由**: リモートへのプッシュに失敗
**対象ブランチ**: {current_branch}
**変更ファイル**: {changed_files}
**ユーザーアクション**: 手動で `git push` を実行してください
**raw git output**:
{git_error_output}
```

## 使用方法

各コマンドは上記形式をインラインで保持せず、本テンプレートを参照して同一形式でエラーを表示すること（準拠）。

