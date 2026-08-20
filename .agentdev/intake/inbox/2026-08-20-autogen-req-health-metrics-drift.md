# req-health-metrics.md AUTOGEN block の再生成差分（pre-existing drift）

## 観測
Epic 2351 Wave 1 クローズの E5b 前段で `generate_indexes.ts --json --dry-run` を実施した結果、`docs/designs/quality/req-health-metrics.md`（AUTOGEN block: req-metrics-measurement-example）に WOULD UPDATE 差分が検出された。他の AUTOGEN block（IR catalog、Decision README、REQ README、docs/README.md）はすべて最新。

## 今回扱わない理由
当該差分は Wave 1 の変更起因ではない。マージ前 baseline 2791e391（Wave 1 両 worktree の分岐元）の detached worktree で同一の dry-run を実施しても同一の WOULD UPDATE が再現し、Wave 1 の PR は docs/** を変更していない。差分の発生起点は REQ-044 追加（7c1748b1）以降に AUTOGEN block の再生成 commit が行われていないこと（最終再生成は PR 2350 の 5111aac3）。case-close は索引ファイルを直接編集・commit しない契約のため、本クローズでは処理せず記録する。

## 影響
AUTOGEN 再生成差分の検知を行う workflow（case-close Step 3-3 / E5b 前段）が、本差分が残存する限り WOULD UPDATE を報告する。REQ の計測例テーブルが現状（REQ-044 追加後）を反映していない。

## レビューで決めること
- case-run 経由で `generate_indexes.ts` の再生成を commit し、req-health-metrics.md の AUTOGEN block を現状へ更新する（再生成の実 commit は case-run の責務）。
- req-save / design-save 実行時に AUTOGEN 再生成が必要な docs 変更があった場合の起点判定を明示するか。

## 根拠
- case-close E5b 前段 dry-run: WOULD UPDATE docs/designs/quality/req-health-metrics.md（マージ後 main abb13c1d）
- baseline 検証: 2791e391 detached worktree で同一 WOULD UPDATE 再現（Epic 2351 Wave 1 クローズ）
