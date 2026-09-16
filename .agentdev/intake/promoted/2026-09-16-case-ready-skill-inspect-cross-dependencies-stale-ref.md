# agentdev-workflow-case-ready/SKILL.md の inspect_cross_dependencies.ts 参照残骸

## 観測内容

`src/opencode/skills/agentdev-workflow-case-ready/SKILL.md` の `scripts/src/inspect_cross_dependencies.ts` 参照は agentdev-workflow-case-open への移設残骸であり、実在しないパスへの参照として full-audit（IR-062 reference-path-existence）で検出される。Case #2825（RU-0005）では対象範囲外のため ng-baseline 正規管理下に置かれた（reason に修復候補として明記）。

2026-09-16 時点の再実査: full-audit は当該参照を `[baseline-known] Referenced path does not exist in current skill but found in agentdev-workflow-case-open: scripts/src/inspect_cross_dependencies.ts (NG baseline, not yet cleaned) ... route: intake` として継続検出（SKILL.md L88）。実ファイルは case-open 側（`src/opencode/skills/agentdev-workflow-case-open/scripts/src/`、`.opencode/skills/agentdev-workflow-case-open/scripts/src/`）に存在する。

## 影響

- 配布物 SKILL.md の参照として解決不能パスが残存し、ng-baseline による正規管理が続く（既知欠陥の未解消）

## 課題（対応候補と判断材料）

- 参照の明示パス化（`.opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts` または相対表現の修正）または参照記述の修正
- 修正時に ng-baseline の ReferencePath bucket（provenance: legacy）から当該エントリを除去する
- 単独の小規模修復 Case として処理可能

## 既存要件との関連

- IR-062（reference-path-existence）/ full-audit の baseline 正規管理
- agentdev-workflow-case-open（横断依存検査エンジンの現所有 skill）

## 根拠

- 観測元: PR #2875 本文 Findings（Case #2825。ng-baseline ReferencePath 1 bucket として正規管理登録）
- 観測時 commit: PR #2875 head 6896c392
- baseline: `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` ReferencePath bucket（provenance: legacy、reason: 実欠陥候補・別途修復候補）
- 2026-09-16 再検証: full-audit による継続検出を確認（route: intake）
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 現行 full-audit 出力で確認済み）
