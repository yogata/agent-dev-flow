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

バグ修正、保守作業、ドキュメント作業のように要件docに `artifact_actions` がない場合がある。
この場合は `req-save` / `design-save` をスキップする。
`/agentdev/req-define` の直後に `/agentdev/case-open` へ進む。

```
/agentdev/req-define    # 再現手順・修正方針を整理する
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 修正を実装する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

## 各コマンドの概要

各コマンドの入出力の詳細は [コマンドリファレンス](../../src/opencode/commands/agentdev/README.md) を参照する。
工程分岐（req-save / design-save の要否）の詳細は [コマンド選択](command-selection.md) の補足を参照する。

最大自走モード。`/agentdev/req-define` 完了後の後続工程を一括実行する場合は `/agentdev/case-auto` を使う（明示指定時のみ）。
