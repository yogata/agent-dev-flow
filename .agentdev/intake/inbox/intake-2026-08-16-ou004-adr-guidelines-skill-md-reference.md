# Intake Item: repo-agentdev-integrity SKILL.md の agentdev-adr-guidelines 参照（OU-004 由来報告）

## 発生源

- PR: #2149 (Issue #2138 / OU-004, Epic #2134 Wave 1)
- 発生 phase: case-run 検証（main 環境・main 相当再構成環境での skills_structure.test.ts 実行）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

`repo-agentdev-integrity/SKILL.md` の See Also・導線が廃止済みスキル `agentdev-adr-guidelines` を参照（L24「DO NOT USE FOR」、L27、L202）。実 main 環境・main 相当再構成環境の双方で `skills_structure.test.ts` の当該 case が失敗する環境非依存の事前発生欠陥（正規スキル名は `agentdev-decision-guidelines`）。本 PR（OU-004）の対象外のため未修正。

同一内容が PR #2146（OU-003）の Findings でも報告済み（intake-2026-08-16-ou003-adr-guidelines-broken-reference.md）。本 item は同一根源の重複報告として記録し、採用時は統合を推奨。

## 推奨対応

OU-002（#2136）または OU-009（#2143）の実装時に参照更新を行う。

## 関連

- Issue: #2138 (CLOSED), Epic: #2134
- PR: #2149 (Findings / Capture候補 セクション intake 1)
- 重複報告: PR #2146 (Findings / Capture候補 セクション intake 2)
