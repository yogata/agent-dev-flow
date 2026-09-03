# check_integrity 事前存在 NG の残存（Wave 2 解消分を除く）

## 観測

PR #2527 の case-run で check_integrity（--profile source）が本 PR 変更と無関係の事前存在 NG 9件を検出した。うち SkillProjection manifest 不一致 4件と phantom REQ-046-004（DEC-022.md L63）の 5件は Wave 2 の PR #2528 で解消済み。残存は次の 3種:

1. REQ-0108 参照（REQ ファイル不在の行参照）
2. TODO マーカー 2件
3. third-party-sync が system.md に未記載

## 今回扱わない理由

いずれも OU-010（Issue #2513）の対象範囲外の事前存在負債であり、本 PR では対応しない判断（PR #2527 本文に記録済み）。

## 影響

check_integrity の NG 一覧に事前存在負債が残存し、新規違反の見極め時に既知残存との区別が必要。

## レビューで決めること

- REQ-0108 参照の是正（実在行への参照修正または REQ 行の整備）
- TODO マーカー 2件の解消または意図的残存の記録
- third-party-sync の system.md 記載の要否判断

## 根拠

- PR #2527 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2527 ）
- 解消分の確認: case-close の check_integrity マージ前後比較（2026-09-02、Epic #2504 Wave 2）
- 再観測: PR #2535 本文「Findings/ Capture候補」intake（2026-09-02、Epic #2505 Wave 2・Issue #2520 case-close）。同一 3種（REQ-0108 参照、TODO マーカー 2件〔agentdev-issue-tracking/SKILL.md L75・agentdev-workflow-issue/SKILL.md L69〕、third-party-sync の system.md 未記載）を再観測。いずれも diff 外・main と同一であることを `git show main:<file>` 突合で確認済み
- 再観測: PR #2539 本文「Findings/ Capture候補」intake（2026-09-03、Issue #2538 case-close）。expanded-readme-sync（system.md 未登録の third-party-sync）、broken-req-ref（content-corruption-checker.md 内 REQ-0108 旧参照）、index-generation-consistency（req-metrics-measurement-example AUTOGEN 鮮度）の 3種を再観測。いずれも base 既存・本次 diff 外のため未対応
