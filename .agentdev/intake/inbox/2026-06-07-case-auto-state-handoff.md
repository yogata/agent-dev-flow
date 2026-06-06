# case-auto 工程間状態引き継ぎ不足（RU削除・learning capture 未実施）

case-auto が case-open/case-close 相当処理を実行する際、工程間の状態引き継ぎが不足しており、3つの処理が漏れている。また REQ-0114 への要件追加（13要件）と workflow-contracts.md の修正も完了条件に含まれているが未チェックのままクローズされている。

- case-open 相当処理での RU 削除が未実施
- case-close 相当処理での learning capture が未実施
- case-close 相当処理での Post-run intake capture が未実施
- workflow-contracts.md の case-auto intake 欄が `—` のまま（実際の処理と矛盾）
- REQ-0114.md に REQ-0114-023〜035 の 13 要件行が APPEND されていない可能性

## 根拠

- Issue #593: fix: case-auto 工程間状態引き継ぎ・capture 完了条件補強
  - 完了条件4項目・テスト戦略2項目が未チェック
  - Issue 本文で3つの未実施処理（RU削除・learning capture・Post-run intake capture）を明記
  - workflow-contracts.md の case-auto intake 欄が実際と矛盾している
