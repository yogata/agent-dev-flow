# クイックスタート

機能追加の最小フロー。5コマンドで要件定義からマージまで完了する。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/req-save      # REQ/ADR ファイルとして保存する
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 実装して PR を作成する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

## バグ修正・軽作業の場合

バグ修正・保守作業・ドキュメント作業は `req-save` をスキップし、`req-define` の直後に `case-open` に進む。

```
/agentdev/req-define    # 再現手順・修正方針を整理する
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 修正を実装する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

## 各コマンドの概要

| コマンド | やること | 入力 | 出力 |
|----------|---------|------|------|
| `req-define` | AI と対話して要件を整理 | セッション会話 / RU | 要件doc（draft） |
| `req-save` | REQ/ADR ファイルを docs/ に保存 | 要件doc（feature のみ） | REQ/ADR ファイル |
| `case-open` | GitHub Issue を作成 | REQ ファイル / 要件doc | Issue |
| `case-run` | 実装して PR を作成 | Issue | 実装済みブランチ + PR |
| `case-close` | PR をマージして Issue をクローズ | PR | マージ済み + クローズ済み |
