# Intake Item: repo-agentdev-integrity SKILL.md の agentdev-adr-guidelines 参照残留（skills_structure 失敗）

## 発生源

- PR: #2146 (Issue #2137 / OU-003, Epic #2134 Wave 1)
- 発生 phase: case-run 検証（main baseline での skills_structure.test.ts 実行）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

`skills_structure.test.ts`「See Also reference "agentdev-adr-guidelines" points to existing skill directory」が main（projection モード）のみ失敗する。`.opencode/skills/repo-agentdev-integrity/SKILL.md`（24、27、202行目）が DEC-009 AG-013 で改名済みの `agentdev-adr-guidelines`（現 `agentdev-decision-guidelines`）を参照残留しているため。worktree は src fallback で repo-agentdev-integrity が列挙対象外になるため pass する。既存 broken reference 一掃（OU-002 #2136）または陳腐化参照是正（OU-009 #2143）の管轄と推定。

同一 Wave の PR #2149（OU-004）の Findings でも同一根源（L24/L27/L202、実 main 環境・main 相当再構成環境の双方で失敗する環境非依存の事前発生欠陥）が報告されている（intake-2026-08-16-ou004-adr-guidelines-skill-md-reference.md）。

## 推奨対応

OU-002（#2136）または OU-009（#2143）の実装時に `agentdev-adr-guidelines` → `agentdev-decision-guidelines` への参照更新を行う。

## 関連

- Issue: #2137 (OPEN、PR #2146 は Level 1 コンフリクトで case-auto エスカレーション中), Epic: #2134
- PR: #2146 (Findings / Capture候補 セクション intake 2)
- 重複報告: PR #2149 (Findings / Capture候補 セクション intake 1)
