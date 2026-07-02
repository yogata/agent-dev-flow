# local-generation.md の ADR-0131 link mode 語彙 word 修正

## 観測内容

PR #1195 は4ファイルを ADR-0131 link mode 語彙へ是正したが、`local-generation.md` は「既に ADR-0131 link mode 語彙で是正済み」として是正対象外とした。SPEC 整合性の観点から「別 Issue で local-generation.md のみ word 修正を検討可能」と残置した。同 PR の QG-3 報告でも是正対象外として再確認している。

## 影響

- 実動作への影響なし
- SPEC として現行語彙へ未是正の箇所が残存する

## 課題

- `local-generation.md` のうち履歴参照として保持すべき箇所と、現行 SPEC として是正すべき箇所の境界設定
- 当該ファイルが意図的な履歴ドキュメントか、現行 SPEC かの位置付け確認（REQ-0112-053「superseded 履歴参照は許容」の適用可否）
- 「word 修正」の具体的内容（用語置換か、構造見直しか）

## 既存要件との関連

- ADR-0126: link mode 廃止経緯
- ADR-0131: link mode 語彙への移行
- REQ-0112-053: superseded 履歴参照許容
- 本 item は `2026-06-29-issue1341-local-generation-spec-legacy-vocab.md` と同じファイルの同一問題を指す（近接重複、統合推奨）
- link mode / 変換プロンプト legacy vocabulary 残存クラスターに属し、backlog-review での統合を推奨

## 観測元

- PR #1195
- Issue #1193
