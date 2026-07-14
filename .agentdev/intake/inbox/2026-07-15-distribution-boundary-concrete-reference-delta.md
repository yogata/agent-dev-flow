# 配布物参照境界: 新規 concrete reference（具体ID・具体パス）の abstract 化（IR-055 delta）

## 概要

配布 command/skill 本文（`.opencode/` 配下）に、新規の具体ID（REQ-0162-002/003/004, ADR-0136）および具体 docs パス（docs/specs/, docs/guides/）の参照が残留している。G05「配布 command/skill 本文にプロジェクト固有文書の具体参照（具体ID、具体パス、固定URL）を持たせない。プロジェクト固有参照は extension 経由でのみ与える」への違反。check_integrity.ts RuntimeReference 検査（strict NG 19件 + heuristic WARNING 9件）および check_distribution_boundary.ts（concrete-id + concrete-path failure）で検出。

## 詳細

### 具体ID参照 違反対象（RuntimeReference NG 19件）

- `.opencode/commands/agentdev/case-run.md:211, :237` → REQ-0162-002/003/004
- `.opencode/commands/agentdev/case-auto.md`（delta）
- `.opencode/skills/agentdev-architecture-advisory/references/architecture-review-delegation.md:4, :8` → ADR-0136
- `.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:31, :66, :130` → REQ-0162 系
- `.opencode/skills/agentdev-architecture-advisory/references/harness-delegation.md:6, :48` → REQ-0162 系

### docs パス参照 違反対象（RuntimeReference WARNING 9件 + concrete-path 2件）

- `.opencode/commands/agentdev/req-save.md:262, :272` → docs/specs/
- `.opencode/commands/agentdev/spec-save.md:226, :236, :240, :253` → docs/specs/
- `.opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md:55` → docs/guides/
- `.opencode/commands/agentdev/case-close.md:149` → docs/specs/integrity/integrity-contracts.md
- `.opencode/commands/agentdev/case-run.md:155` → docs/specs/integrity/integrity-contracts.md

### baseline 既知違反（INFO 降格、本 item 対象外）

check_distribution_boundary.ts の concrete-id failure 36件のうち、delta（新規）以外の baseline-known 11件は check_integrity.ts の INFO 降格対象（REQ-0108-224）。これらは既存の段階解消計画の対象であり、本 item では重複生成しない。

## 候補となる対応

具体参照を abstract 化する。以下のいずれかの方法で:

1. **AGENTS.md 経由**: プロジェクト共通の参照先（REQ/ADR の範囲、docs のトップパス等）を AGENTS.md の間接参照に切り替え
2. **references/&lt;harness&gt;.md 経由**: harness 固有の参照先を references ファイルの間接参照に切り替え
3. **project extensions 経由**: `.agentdev/extensions/` の context/rules でプロジェクト固有情報を与える

各対象ファイルについて適切な abstract 化手法を選択し適用する。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts RuntimeReference strict/heuristic + check_distribution_boundary.ts concrete-id/concrete-path）
- 設計原則: agentdev-project-extensions G05、IR-055（配布物参照境界）
- 検出規模: NG 19件 + WARNING 9件（delta）+ concrete-path 2件
- 原因分類: 確認済み（abstract 化の設計は存在するが、具体参照の残留）
- route: intake（配布物参照境界違反）。req-define 並行（個別ファイルの是正に設計判断が必要）
