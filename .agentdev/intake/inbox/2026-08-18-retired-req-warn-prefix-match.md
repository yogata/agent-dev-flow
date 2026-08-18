# 非監査系 SPEC の retired-req warning 残存（階層 ID 前置一致に由来する誤検出）

## 観測
監査記録・baseline 以外の SPEC ファイル（document-model、integrity-contracts、integrity-rule-catalog、rule-ownership、IR-044/055/062、req-impact-map、agentdev-doc-diagnostics、checker-execution-contracts 等）に retired-req warning 11件が残存する。大半は階層 ID（REQ-028-0XX 等）の前置一致に由来する誤検出。

## 今回扱わない理由
AG-014 確定内容（既存 checker のマッチ実装の一括変更は要求しない）により Issue #2209 の対象外。checker 実装修正は Issue #2206（NG baseline）、 checker 準拠更新は Issue #2210 の隣接スコープ。

## 影響
check_integrity の warning が恒常的に出続ける（誤検出のため実害なし）。SPEC「階層 ID 検索の3点設計」の前置一致除外の適用候補。

## レビューで決めること
- retired 参照系検出への階層 ID 前置一致除外（3点設計準拠）を適用するか。適用する場合の対象 checker とテスト整備。

## 根拠
- PR 2255 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2255）
