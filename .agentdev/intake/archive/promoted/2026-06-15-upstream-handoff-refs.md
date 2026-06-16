# upstream-handoff.md に固定 REQ 参照が残存

## 観測

`src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md` に、配布対象 skill reference で禁止されている固定 REQ 参照が残存している:

- REQ-0104-021

これは「固定 REQ-NNNN 参照」禁止パターン（REQ-0103-079 違反）。

## 今回扱わない理由

Issue #801 は SKILL.md から宣言されている reference 13件を対象とした。`agentdev-workflow-lifecycle/references/upstream-handoff.md` はその13件に含まれないため、Issue #801 の対象外。

## 影響

consumer project 配布時、REQ-0104-021 への解決不能参照が残る可能性がある。Issue #801 で是正した13件と同種の違反パターン。

## レビューで決めること

- 是正観点を Issue #801 と同一（固定ID → `{REQ-ID}` プレースホルダーまたは自然文）とするか
- 対象範囲・優前度

## 根拠

- 発見元: Issue #801 の Step 8 grep検証（PR #802 の Findings / Capture候補セクションに記録）
- 関連: PR #802, Issue #801
