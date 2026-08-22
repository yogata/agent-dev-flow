# lint_skills NG 2件と Epic RD-001 の worktree-operations.md 行数前提の矛盾

## 観測

lint_skills で NG 2件が検出されている。

- worktree-operations.md が 376 行で TOC なし（300 行超の目次規約違反）
- agentdev-traceability SKILL.md description が 631 文字（上限 600 字超過）

さらに Epic #2378 レビュー判断 RD-001 は「worktree-operations.md は現行 253 行で違反解消済み（checked_at_commit 135e5c43）」と記録しているが、Issue #2380 の検証時実測は 375 行であり矛盾している。

なお worktree-operations.md の TOC 欠落は PR #2391（Issue #2381）で目次追加により解消済み（新規違反 0・純減）。agentdev-traceability description の 631 字は未解消のまま残る。

## 今回扱わない理由

配布スキル側の既存違反であり AG-006/OU-004（Issue #2382、Wave 2）の担当範囲。RD-001 の行数前提の再計測も OU-004 実行時に必要であり、case-close では判断しない。

## 影響

RD-001 の evidence 記録（253 行）と実測（375 行超）の不整合が未解明のまま、OU-004 の計画前提が不安定になる。

## レビューで決めること

- worktree-operations.md の行数変動要員の確認（135e5c43 時点からの増分由来）と RD-001 記録の扱い
- agentdev-traceability description の 631 字から 600 字以内への短縮（OU-004 スコープで実施するか）

## 根拠

- PR #2390 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2390 ）
- PR #2391 本文「品質ゲート・lint 結果」（TOC 解消の記録、回収元: https://github.com/yogata/agent-dev-flow/pull/2391 ）
- Epic #2378 レビュー判断 RD-001
