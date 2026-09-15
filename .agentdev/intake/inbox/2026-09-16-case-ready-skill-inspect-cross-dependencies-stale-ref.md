# agentdev-workflow-case-ready/SKILL.md の inspect_cross_dependencies.ts 参照残骸

## 内容

`src/opencode/skills/agentdev-workflow-case-ready/SKILL.md` の `scripts/src/inspect_cross_dependencies.ts` 参照は agentdev-workflow-case-open への移設残骸であり、実在しないパスへの参照として full-audit（IR-062 reference-path-existence）で検出される。Case #2825（RU-0005）では対象範囲外のため ng-baseline 正規管理下に置かれた（reason に修復候補として明記）。

## 提案

参照残骸の除去または正しい参照先（agentdev-workflow-case-open 側の実在スクリプト）への修正。単独の小規模修復 Case として処理可能。

## 根拠

- 観測元: PR #2875 本文 Findings（Case #2825。ng-baseline ReferencePath 1 bucket として正規管理登録）
- 観測時 commit: PR #2875 head 6896c392
- baseline: `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` ReferencePath bucket（provenance: legacy、reason: 実欠陥候補・別途修復候補）

## 分類

- 分類: intake（具体的修正対象あり: SKILL.md の参照記述修正）
- 変更種別: docs（配布物 SKILL.md の参照修復）
- 優先度: 低（ng-baseline 正規管理下で既知欠陥として追跡中。小規模修正）
