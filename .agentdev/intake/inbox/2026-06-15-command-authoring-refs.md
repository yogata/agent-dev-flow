# command-authoring-standards.md に固定 REQ/ADR 参照が残存

## 観測

`src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md` に、配布対象 skill reference で禁止されている固定 REQ/ADR 参照が残存している:

- REQ-0119-005 / REQ-0119-006
- REQ-0111-004
- ADR-0112 §4 / §5 / §6

これは「固定 REQ-NNNN / ADR-NNNN 参照」禁止パターン（REQ-0103-079 違反）。

## 今回扱わない理由

Issue #801 は SKILL.md から宣言されている reference 13件を対象とした。`agentdev-command-authoring/references/command-authoring-standards.md` はその13件に含まれないため、Issue #801 の対象外。

## 影響

consumer project 配布時、存在しない/変更される可能性のある REQ/ADR への解決不能参照が残り、参照整合性が崩れる可能性がある。Issue #801 で是正した13件と同種の違反パターン。

## レビューで決めること

- 是正観点を Issue #801 と同一（固定ID → `{REQ-ID}` / `{ADR-ID}` プレースホルダーまたは自然文）とするか
- 対象範囲・優先度

## 根拠

- 発見元: Issue #801 の Step 8 grep検証（PR #802 の Findings / Capture候補セクションに記録）
- 関連: PR #802, Issue #801
