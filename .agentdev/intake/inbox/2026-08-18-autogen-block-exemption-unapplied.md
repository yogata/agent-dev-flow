# AUTOGEN ブロック単位の retired 参照免除の未適用（行領域判定の必要性）

## 観測
checker 実行契約 SPEC「検出対象除外規定」には AUTOGEN ブロック単位の免除が規定されているが、本実装（PR 2255）はファイル種別ベース（監査記録・baseline 配下、frontmatter 信号キー）のみ実装した。AUTOGEN ブロック内参照は行領域判定を要するため未適用であり、rule-ownership.md の AUTOGEN ブロック内参照に由来する警告が残存する。

## 今回扱わない理由
行領域判定の実装を要し、Issue #2209 の完了条件（node_modules 除外・retired-req 免除のファイル種別ベース実装）の範囲外。PR #2255 の Findings に記録のみ実施。

## 影響
AUTOGEN ブロック内の機械生成行に由来する retired 参照警告が残存する（誤検出側のノイズ）。

## レビューで決めること
- AUTOGEN ブロック行領域の判定実装（ブロックマーカー解析）を追加し、免除対象へ組み込むか。

## 根拠
- PR 2255 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2255）
