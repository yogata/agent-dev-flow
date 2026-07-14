# 配布物参照境界: 新規 concrete reference（具体ID・具体パス）の abstract 化（IR-055 delta）

## 観測内容

配布 command/skill 本文（`.opencode/` 配下）に、新規の具体ID（REQ-0162-002/003/004, ADR-0136）および具体 docs パス（docs/specs/, docs/guides/）参照が残留。

具体ID参照対象（RuntimeReference NG 19件）:
- `.opencode/commands/agentdev/case-run.md:211, :237` → REQ-0162-002/003/004
- `.opencode/commands/agentdev/case-auto.md`（delta）
- `.opencode/skills/agentdev-architecture-advisory/references/architecture-review-delegation.md:4, :8` → ADR-0136
- `.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:31, :66, :130` → REQ-0162 系
- `.opencode/skills/agentdev-architecture-advisory/references/harness-delegation.md:6, :48` → REQ-0162 系

docs パス参照対象（RuntimeReference WARNING 9件 + concrete-path 2件）:
- `.opencode/commands/agentdev/req-save.md:262, :272` → docs/specs/
- `.opencode/commands/agentdev/spec-save.md:226, :236, :240, :253` → docs/specs/
- `.opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md:55` → docs/guides/
- `.opencode/commands/agentdev/case-close.md:149` → docs/specs/integrity/integrity-contracts.md
- `.opencode/commands/agentdev/case-run.md:155` → docs/specs/integrity/integrity-contracts.md

## 影響

- 配布物の移植性、consumer 環境での参照解決失敗リスク
- 設計原則 G05（配布 command/skill 本文にプロジェクト固有の具体参照を持たせない）への違反
- baseline 既知違反（11件）は既存段階解消計画の対象であり、本 item は delta（新規）を対象とする

## 課題

配布 command/skill 本文に具体ID（REQ-NNNN, ADR-NNNN）と具体パス（docs/specs/, docs/guides/）が残留。G05 は abstract 化（AGENTS.md / references/&lt;harness&gt;.md / project extensions 経由）を要求。

## 既存要件との関連

- agentdev-project-extensions G05（配布物参照境界違反の禁止）
- IR-055（配布物参照境界）
- REQ-0162-002/003/004, ADR-0136（参照先の REQ/ADR）

## 対応方針の方向性

具体参照を abstract 化する。各対象ファイルについて適切な手法を選択:
1. AGENTS.md 経由: プロジェクト共通の参照先（REQ/ADR の範囲、docs のトップパス等）の間接化
2. references/&lt;harness&gt;.md 経由: harness 固有の参照先の間接化
3. project extensions 経由: `.agentdev/extensions/` の context/rules で提供

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts RuntimeReference strict/heuristic + check_distribution_boundary.ts concrete-id/concrete-path）
- 設計原則: agentdev-project-extensions G05、IR-055
- 検出規模: NG 19件 + WARNING 9件（delta）+ concrete-path 2件
- baseline 既知違反（INFO 降格、11件）は対象外、既存段階解消計画の対象
