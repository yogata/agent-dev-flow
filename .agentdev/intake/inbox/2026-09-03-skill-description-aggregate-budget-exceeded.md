# SKILL.md description 集合予算の超過（lint_skills、傾向管理）

## 観測

2026-09-03 の docs-check（lint_skills）で、SKILL.md description の集合予算が [WARNING]（AG-005、RU-0018 層1、傾向管理）として検出された:

- 合計 18263 文字 / 51 ファイル（平均 358.1）> 予算 350 × 51 = 17850

超過幅は 413 文字（予算比 +2.3%）と小さいが、個別ファイルではなく集合平均での超過であり、説明文の肥大傾向を示す。

原因分類: **確認済**（機械計測値）/ 超過に至った個別の追記経路は**不明**（直近の description 追加・拡張のうちどれが寄与したかは未特定）

## 影響

- レベル1の傾向管理閾値の超過が継続すると、agentic 起動時の description 読込負荷が増大し、個別閾値（600/1024）超過への予兆となる

## レビューで決めること

- 説明文圧縮の対象候補（長大 description 上位ファイル）の選定と圧縮案件の要否
- 閾値 350 の再設定の要否（スキル数増加に伴う集合予算の妥当性見直し）

## 根拠

- lint_skills 実行結果（2026-09-03、`bun run .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts`、EXIT=1）
- AG-005（RU-0018 / Issue #2179）: description 集合予算 warn の層1機械検査
