# クイックスタート

要件定義からマージまでの標準フロー。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/req-save      # REQ/Decision ファイルとして保存する（REQ/Decision 対象 artifact_actions がある場合）
/agentdev/design-save   # Design を docs/designs/ に保存する（Design 対象 artifact_actions がある場合）
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 実装して PR を作成する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

`req-save` / `design-save` は要件doc（draft）の `artifact_actions` に該当対象がある場合のみ実行する。

## REQ/Decision・Design の保存対象がない場合

バグ修正、保守作業、ドキュメント作業のように要件docに `artifact_actions` がない場合は `req-save` / `design-save` をスキップし、`/agentdev/req-define` の直後に `/agentdev/case-open` に進む。

```
/agentdev/req-define    # 再現手順・修正方針を整理する
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 修正を実装する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

## 各コマンドの概要

| コマンド | やること | 入力 | 出力 |
|----------|---------|------|------|
| `/agentdev/req-define` | AI と対話して要件を整理 | セッション会話 / RU | 要件doc（draft） |
| `/agentdev/req-save` | REQ/Decision ファイルを docs/ に保存 | 要件doc（REQ/Decision 対象 artifact_actions がある場合） | REQ/Decision ファイル |
| `/agentdev/design-save` | Design ファイルを docs/designs/ に保存 | 要件doc（Design 対象 artifact_actions がある場合） | Design ファイル |
| `/agentdev/case-open` | GitHub Issue を作成 | REQ ファイル / 要件doc | Issue |
| `/agentdev/case-run` | 実装して PR を作成 | Issue | 実装済みブランチ + PR |
| `/agentdev/case-close` | PR をマージして Issue をクローズ | PR | マージ済み + クローズ済み |

最大自走モード。`/agentdev/req-define` 完了後の後続工程を一括実行する場合は `/agentdev/case-auto` を使う（明示指定時のみ）。
