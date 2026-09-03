# check_integrity 事前存在 NG の残存（Wave 2 解消分を除く 3種）

## 観測内容

PR #2527 の case-run で check_integrity（--profile source）が本 PR 変更と無関係の事前存在 NG 9件を検出した。うち SkillProjection manifest 不一致 4件と phantom REQ-046-004（DEC-022.md L63）の 5件は Wave 2 の PR #2528 で解消済み。残存は次の 3種:

1. REQ-0108 参照（REQ ファイル不在の行参照。content-corruption-checker.md 内の旧参照）
2. TODO マーカー 2件（agentdev-issue-tracking/SKILL.md L75・agentdev-workflow-issue/SKILL.md L69）
3. third-party-sync が system.md に未記載（expanded-readme-sync 検出）

いずれも OU-010（Issue #2513）の対象範囲外の事前存在負債であり、本 PR では対応しない判断（PR #2527 本文に記録済み）。

再観測（同一 3種が diff 外・main と同一であることを `git show main:<file>` 突合で確認済み）:
- PR #2535（2026-09-02、Epic #2505 Wave 2・Issue #2520 case-close）
- PR #2539（2026-09-03、Issue #2538 case-close）: expanded-readme-sync（system.md 未登録の third-party-sync）、broken-req-ref（content-corruption-checker.md 内 REQ-0108 旧参照）、index-generation-consistency（req-metrics-measurement-example AUTOGEN 鮮度）の 3種を再観測

2026-09-03 現行確認: system.md に third-party-sync の記載なし（git grep 不検出）を確認済み。

## 影響

check_integrity の NG 一覧に事前存在負債が残存し、新規違反の見極め時に既知残存との区別が必要。

## 課題（レビューで決めること）

- REQ-0108 参照の是正（実在行への参照修正または REQ 行の整備）
- TODO マーカー 2件の解消または意図的残存の記録
- third-party-sync の system.md 記載の要否判断

## 既存要件・契約との関連

- check_integrity 検出基盤（content-corruption-checker、expanded-readme-sync、index-generation-consistency）、system.md のコマンド構成記載、AUTOGEN 鮮度 gate。
- 関連 item: origin/main 起点の unmanaged NG 20件（2026-08-24、解消済み分を含む先行インベントリ。本 item は残存 3種に絞った後続観測）。

## 根拠

- PR #2527 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2527 ）
- 解消分の確認: case-close の check_integrity マージ前後比較（2026-09-02、Epic #2504 Wave 2）
- 再観測: PR #2535・PR #2539 本文「Findings/ Capture候補」intake
- 2026-09-03 機械確認: docs/designs/foundations/system.md の third-party-sync 記載不検出
