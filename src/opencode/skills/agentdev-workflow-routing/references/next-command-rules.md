## レビューNG時推論ルール

レビュー結果から適切な次アクションを推論する。

| 条件 | 推論結果 |
| ---- | -------- |
| レビュー結果に「仕様バグ」が含まれる | `/agentdev/case-auto` による再開（内部 lifecycle 経路: case-revise → case-ready → case-run） |
| レビュー結果に「実装バグ」が含まれる | `/agentdev/case-auto` による再開（内部 lifecycle 段階 case-run、Root Case の resume_command。レビューNGコメントは Issue コメントへ記録） |
| レビュー結果に「スコープ外逸脱」が含まれる | `/agentdev/case-auto` による再開（内部 lifecycle 経路: case-revise → case-ready → 不要実装削除 → case-run） |
| レビュー結果がOK | `/agentdev/case-auto` 内部 lifecycle 段階 case-close |

## Epic関連の推論ルール

### Epicラベルの判定基準

| ラベル/本文 | 判定 | 説明 |
| ---------- | ---- | ---- |
| `epic` ラベルが付いている | Epic Issue | 親Issueとして機能し、複数の子Issueを持つ |
| 本文に `Parent: #{N}` が含まれる | Child Issue | 親Epic Issue #N の子Issue |

### Epic Issue作成後の推論ルール

`case-open` でEpic Issueを作成した直後の推論ルール。

| 条件 | 推論結果 |
| ---- | -------- |
| Issueに `epic` ラベルがある AND 子Issue番号が存在する | `/agentdev/case-auto` 内部 lifecycle 段階 case-run による全ての子Issueの並列実行 |

### 子Issueクローズ後の推論ルール

`case-close` で子Issueをクローズした直後の推論ルール。

| 条件 | 推論結果 |
| ---- | -------- |
| 子Issueクローズ後、親Epicに未クローズの子が残っている | `/agentdev/case-auto` 内部 lifecycle 段階 case-run で次の未クローズ子Issueを実行、または待機 |
| 子Issueクローズ後、親Epicの全ての子がクローズ済み | `/agentdev/case-auto` 内部 lifecycle 段階 case-close（Epic自動クローズ） |
