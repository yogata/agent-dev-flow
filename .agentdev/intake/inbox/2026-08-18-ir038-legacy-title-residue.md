# IR-038 旧称（ADR index consistency）の残存

## 観測
docs/specs/integrity/index-auto-generation.md「関連情報」節の検査契約列挙に「IR-038（ADR index consistency）」とあるが、IR-038 rule は既に title「Decision-index-consistency」へ改題済み（検査対象も docs/decisions/README.md）。rule ファイル名 IR-038-adr-index-consistency.md の旧称残存も同様。

## 今回扱わない理由
Issue #2208 の完了条件（decision-* block 移行・残余整理・SPEC 例示整合）の範囲外の微小な事実ズレ。PR #2251 の Findings に記録のみ実施。

## 影響
表示上の旧称混在であり、検査動作への影響なし。

## レビューで決めること
- SPEC 本文の表記を「Decision-index-consistency」へ合わせる修正と、rule ファイル名変更（リンク更新含む）を実施するか。

## 根拠
- PR 2251 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2251）
