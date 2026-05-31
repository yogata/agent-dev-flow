# learning-refine の archive.md 参照が実際のファイル構成（archive/active.md）と不一致

## 観測

learning-refine のコマンド定義および agentdev-learning-pipeline スキルでは、archive のパスを `.agentdev/learning/archive.md`（フラットファイル）として記述している。しかし実際のファイル構成は `.agentdev/learning/archive/active.md`（ディレクトリ内のファイル）となっている。

learning-refine の実行時、inbox.md の内容を archive に追記する処理でパスが不一致となる可能性がある。今回の実行ではディレクトリ構成を正しく解釈して archive/active.md に追記したが、コマンド定義上のパス表記は修正されていない。

## 影響

- learning-refine コマンド定義内の `archive.md` 参照が実態と乖離している
- agentdev-learning-pipeline スキルの Artifact Lifecycle セクションも `archive.md` を参照
- 今後の実行でパス解釈の揺れがバグを引き起こす可能性

## レビューで決めること

- コマンド定義・スキルの参照パスを `archive/active.md` に統一するか、`archive.md`（フラットファイル）に構成を戻すか
- README.md のディレクトリ構成記載（`archive/active.md`）を正とするか
