# checker stdout の cp932 再解釈による JSON パース破綻

## 観測内容
PR #2582（Issue #2561）で、Windows + bun 環境の PowerShell パイプ経由で checker stdout が cp932 再解釈され、JSON パースが失敗する事象が確認された。spawnSync の `encoding: utf8` で回避できる。

## 影響
検査結果の機械処理が環境依存で失敗し、検証結果を取得できない。

## 課題
既存の stdout ロス知識文書へ、stdout ロスと encoding 変換の区別、spawnSync(encoding: utf8)、chcp 65001 の回避策を追記する。必要なら機械比較手順にも注意を追加する。

## 既存要件・正規成果物との関連
Issue #2561、PR #2582（468b6687）、`docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md`。learning 側の近縁成果物とは反映先が異なる。
