# legacy local generation vocabulary が20件残存（IR-057 検出、OU-002 core 滞留語彙除去の残滓）

## 観測内容

case-close Issue #1359 / PR #1360 の TS-001 Verify-2 実施中に観察。IR-057 を `bun run check_integrity.ts --json` で実行したところ、`Legacy local generation vocabulary` 検出が20件残存した。旧SPEC直下パス検出（IR-057 main）とは別の検出カテゴリ。対象は ADR-0126（1件）、ADR-0131（5件）、glossary 等 docs/specs および src/opencode 配下の計9ファイル。

## 影響

- 実動作への影響なし
- IR-057 summary の ng 件数を下げられない（105件の一部）
- 廃止された link mode 由来の語彙（`上書き保護`、`直接生成方式`、`生成フロー`、`再生成`、`transform/generate.md` 等）が現行ドキュメントに残り、読者の誤解を招く可能性

## 課題

- 20件の語彙残存を ADR 歴史経緯（免除対象）と現行ドキュメント（修正対象）に分類する
- ADR-0131 の5件は文脈精査が必要（link mode 廃止の経緯説明としての歴史参照か、誤用か）
- `isIr057HistoricalAdrContext` 判定を精緻化し、歴史経緯コンテキストを自動免除するか、語彙そのものを別表現に置換するかの方針決定

## 既存要件との関連

- ADR-0126: link mode 廃止経緯（歴史経緯記載の可能性あり）
- ADR-0131: link mode 廃止経緯（歴史経緯記載の可能性あり）
- REQ-0141: link mode 移行関連
- IR-057: obsolete-spec-path-after-domain-split ルール
- link mode / 変換プロンプト legacy vocabulary 残存クラスターに属し、backlog-review での統合を推奨

## 観測元

- PR #1360 (Issue #1359 / REQ-0156 APPEND / case-auto Draft 2 OU-003 FINAL)
- case-close Step 10 capture 回収
