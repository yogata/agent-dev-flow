# 採用済み intake: 既存 fail を前提とする子 Issue の着手時再計測前置の運用候補

## 観測内容

Issue #3741 の起票源 learning 記録は Case #3674 時点（baseline f6a842da）の計測に基づいていたが、追跡Issue #3702 / PR #3720（462074e9）での修復後にその前提は陳腐化していた（発見元: PR #3750、子 Issue #3741 / OU-005 / DEL-3741-2 回収検証）。

既存 fail を前提とする子 Issue は、着手時に現行 main での再計測を前置すると、起票前提の陳腐化を着手前に検知できるという運用改善候補。

## 影響

- 起票前提の陳腐化に気づかないまま子 Issue が着手されると、既に解消済みの問題への無効作業や、誤った前提での実装・検証が発生する
- 委譲プロンプトの前提記述が古い計測に基づく場合、実行担当サブエージェントの判断を歪める

## 課題

- 反映先の特定と反映（候補）:
  - case-run 委譲プロンプトへ「既存 fail を前提とする子 Issue は着手時に現行 main で再計測を前置する」条項を追加
  - learning-capture 条項へ「計測前提を含む記録は採番時点の baseline を明記する」運用を追加
- どちらに反映するか、または両方に反映するかは backlog-review 以降の分析で確定する

## 既存要件との関連

- case-run 委譲契約は `docs/designs/foundations/v4-delegation-contracts.md`、learning-capture は `agentdev-learning-capture` の管理領域
- 発見元: PR #3750（merge commit 8c3e1d56）、Case #3729 / Epic #3732
- 関連識別子: Issue #3702、PR #3720（462074e9）、Case #3674（baseline f6a842da）
- capture 由来: case-close Capture 回収 2026-10-16（PR 本文 intake セクション）

## 分類根拠（intake-promote 分類時の記録）

- 陳腐化前提の実測に基づく運用改善候補であり、反映先（case-run 委譲プロンプト / learning-capture 条項）が具体的なため採用。learning 該当なし
- adversarial-review: learning 境界の疑念は learning 分岐判定の表適用により不成立と確認（具体的修正対象あり）。learning inbox との重複も機械確認済みでなし
