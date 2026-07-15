# Intake Item: check_integrity.ts による TS-003 検証 (placeholder 除外確認)

## 発生源

- PR: #1525 (Issue #1516 / OU-001, Epic #1515 Wave 1)
- 発生 phase: case-run テスト戦略検証
- capture 分類: intake (具体的作業候補 = 検証実施)

## 問題

TS-003 は check_integrity.ts 実行による `<harness>` placeholder false positive 解消確認を要求。本 case-run では時間制約で未実施。REQ-0144-025 (placeholder 検査対象外) は追加済みだが、IR カタログ側の除外パターン実装の有効性確認が未完。

## 推奨修正対象

別 Issue として、check_integrity.ts を実行し以下を確認:

1. references/<harness>.md の `<harness>` placeholder が false positive として検出されないこと
2. REQ-0144-025 の除外パターンが IR カタログに反映されていること
3. TS-003 pass_criteria「`<harness>` placeholder に起因する NG が 0件」を検証

## 関連

- Issue: #1516 (CLOSED, TS-003 未実施)
- PR: #1525
- REQ: REQ-0144-025
- ADR: ADR-0136
