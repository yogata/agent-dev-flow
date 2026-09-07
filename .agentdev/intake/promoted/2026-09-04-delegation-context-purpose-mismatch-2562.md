# delegation structured_context.purpose と Issue 本文の不一致

## 観測内容
PR #2581（Issue #2562）で、委譲 context の purpose が別課題（Issue 監査値の計測基準）を記載し、Issue 本文の knowledge frontmatter checker 実装目的と一致しなかった。

## 影響
実行側が SSoT 再構成を行わなければ、別課題の目的を実行する危険がある。今回は Issue 本文を採用したため実害はなかった。

## 課題
purpose を Issue 本文概要または正規 REQ から抽出する制約と、一致検査を委譲 prompt 生成へ追加する。Issue 番号対応不一致の item と統合可否も検討する。

## 既存要件・正規成果物との関連
Issue #2562、PR #2581（fff6c98b）、agentdev-workflow-case-run の委譲 context 契約、REQ-056-010。
