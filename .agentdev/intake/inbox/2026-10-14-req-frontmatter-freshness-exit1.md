# REQ frontmatter 鮮度検査の exit 1 常態化を解消する

## 観測

2026-10-14、Case #3718 の check_integrity 単独実行で、`req-updated-freshness` strict 10 件・`req-range-staleness` heuristic 1 件が pre-existing として観測され、check_integrity の exit 1 が常態化している。REQ frontmatter の `updated` 鮮度が日ズレ進行で strict 違反に達しており、REQ 操作を伴わない Case では解消経路が存在しない。

## 今回扱わない理由

REQ 操作は本件（#3718）の実行契約で禁止（REQ 操作なし）。鮮度更新は REQ frontmatter への正当な操作を伴うため後続対応。

## 影響

check_integrity の exit 1 が常態化し、自 Case 起因の違反との分類確認を毎回実施する必要がある。exit code による機械合否判定が実質的に使えない状態が続く。

## レビューで決めること

- strict 10 件の REQ frontmatter updated 更新の可否と実施単位（個別 Case か docs 現行化バッチか）
- req-range-staleness heuristic 1 件の処遇
- 鮮度検査の運用設計（REQ 操作なし Case での検査位置づけ）の見直し要否

## 根拠（任意）

- 観測元: Case #3718 / PR #3720 本文「検証記録」check_integrity 単独実行行（2026-10-14）
- 証拠: check_integrity 実行退避（worktree 相対 `.agentdev/tmp/ir055-fix.*`。exit 1 は pre-existing 鮮度検査由来、bun test 失敗とは無関係と PR 本文に記録済み）
