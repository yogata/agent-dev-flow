# クイックスタート

要件定義からマージまでの標準フロー。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/case-open     # Case Issue と Definition Package の作成
/agentdev/case-ready    # Definition Package と実行構造の確定
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 実装して PR を作成する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

`case-ready` は要件doc（draft）の `artifact_actions` の有無にかかわらず Definition を確定する。

## REQ/Decision・Design の保存対象がない場合

バグ修正、保守作業、ドキュメント作業のように要件docに `artifact_actions` がない場合がある。
この場合も `case-ready` をスキップしない。
`/agentdev/req-define` の直後に `/agentdev/case-open` へ進む。

```
/agentdev/req-define    # 再現手順・修正方針を整理する
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 修正を実装する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

## 各コマンドの概要

各コマンドの入出力の詳細は [コマンドリファレンス](../../src/opencode/commands/agentdev/README.md) を参照する。
Definition 確定の詳細は [コマンド選択](command-selection.md) の補足を参照する。

最大自走モード。`/agentdev/req-define` 完了後の後続工程を一括実行する場合は `/agentdev/case-auto` を使う（明示指定時のみ）。
