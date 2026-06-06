# 8件の pre-existing reference-path NG 未対応

command 定義内の bare `references/` パス8件が、template パス正規化対応（#576）では pre-existing として扱われ、別 Issue での対応とされたまま未解決。これらの bare 参照は integrity-check で検出されるが、修正が行われていない。

## 根拠

- Issue #576: maintenance: Command / Skill 外部ファイル参照の存在検査と template パス正規化
  - 残課題「8件の pre-existing reference-path NG（command 定義内の bare `references/` パス）は別 Issue で対応」と記録
  - テスト結果「8件の既存 NG（bare `references/` paths from commands）は pre-existing であり本変更の対象外」と記録
