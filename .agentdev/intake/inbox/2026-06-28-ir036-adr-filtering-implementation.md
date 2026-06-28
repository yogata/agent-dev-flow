# IR-036 status-based ADR filtering の check_integrity.ts 実装

## 観測

PR #1108（close 3 docs-check/command-format design gaps）で、IR-036 の検出能力（status ベース ADR フィルタリング）が `check_integrity.ts` の `checkAcceptedAdrOnlyCitation` に既存することを確認した。ただし IR-036 自体のカタログ登録と実装は未実装（`baseline_status: new`）であり、REQ-0144/0145 が check_integrity.ts 本体機能変更を対象外とするため別 Issue とした。

## 根拠

PR #1108:

> 検出能力（status ベース ADR フィルタリング）は `check_integrity.ts` の `checkAcceptedAdrOnlyCitation` に既存。IR-036 自体は未実装（`baseline_status: new`、REQ-0144/0145 が check_integrity.ts 本体機能変更を対象外とするため、実装追加は別 Issue）。
