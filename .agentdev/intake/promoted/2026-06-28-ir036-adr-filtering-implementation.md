## 観測内容
PR #1108（close 3 docs-check/command-format design gaps）で、IR-036 の検出能力（status ベース ADR フィルタリング）が `check_integrity.ts` の `checkAcceptedAdrOnlyCitation` に既存することを確認した。ただし IR-036 自体のカタログ登録と実装は未実装（`baseline_status: new`）である。REQ-0144/0145 が check_integrity.ts 本体機能変更を対象外とするため、IR-036 の実装追加は別 Issue とした。

## 影響
IR-036 のカタログ登録と実装が未完了。検出能力自体は既存だが、IR-036 としての追跡・管理が不完全。

## 課題
IR-036 を integrity-rule-catalog.md に登録し、`baseline_status` を適切に更新して実装完了状態にする。

## 既存要件との関連
- IR-036
- REQ-0144
- REQ-0145
