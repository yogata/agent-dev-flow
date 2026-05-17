## issue-next レビューNG時推論ルール

`issue-next` コマンドは、レビュー結果から適切な次アクションを推論する。

| 条件 | 推論結果 |
| ---- | -------- |
| レビュー結果に「仕様バグ」が含まれる | `/issue/issue-update {N} --req --review-ng` → `/issue/issue-work {N}` |
| レビュー結果に「実装バグ」が含まれる | `/issue/issue-update {N} --comment --review-ng` → `/issue/issue-work {N}` |
| レビュー結果に「スコープ外逸脱」が含まれる | `/issue/issue-update {N} --req --review-ng` → 不要実装削除 → `/issue/issue-work {N}` |
| レビュー結果がOK | `/issue/issue-close {N}` |

## Epic関連の推論ルール

### Epicラベルの判定基準

| ラベル/本文 | 判定 | 説明 |
| ---------- | ---- | ---- |
| `epic` ラベルが付いている | Epic Issue | 親Issueとして機能し、複数の子Issueを持つ |
| 本文に `Parent: #{N}` が含まれる | Child Issue | 親Epic Issue #N の子Issue |

### Epic Issue作成後の推論ルール

`issue-create` でEpic Issueを作成した直後の推論ルール。

| 条件 | 推論結果 |
| ---- | -------- |
| Issueに `epic` ラベルがある AND 子Issue番号が存在する | `/issue/issue-work {child1} {child2} ...` （全ての子Issueを並列実行） |

### 子Issueクローズ後の推論ルール

`issue-close` で子Issueをクローズした直後の推論ルール。

| 条件 | 推論結果 |
| ---- | -------- |
| 子Issueクローズ後、親Epicに未クローズの子が残っている | `/issue/issue-work {next_child}` （次の未クローズ子Issueを実行）または待機 |
| 子Issueクローズ後、親Epicの全ての子がクローズ済み | `/issue/issue-close {epic_number}` （Epic自動クローズ）