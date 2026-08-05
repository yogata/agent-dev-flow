# 変更前 Integrity Checker 検査結果サマリー（WP-0 §4.1-2）

- 取得日時: 2026-08-06 (worktree feature/issue-1925, baseline origin/main = 8f6558de)
- 取得コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json --root .`
- exit code: 1（検出あり）
- 元 JSON: `.omo/plans/agentdev-migration-2026-08-05.integrity-before.json`
- 以下本文は check_integrity.ts が自動生成した Markdown report（`.agentdev/integrity/reports/2026-08-05-integrity-report.md`）の複製

## 集計結果（summary）

| level | 件数 |
|---|---|
| ok | 196 |
| ng | 79 |
| warning | 31 |
| info | 147（baseline demoted 含む） |

## スキャン対象（scanned）

| 種別 | 件数 |
|---|---|
| REQ | 11 |
| ADR | 6 |
| Skill | 1（repo-agentdev-integrity のみ。agentdev-* は worktree で junction 未再作成のため src/opencode/ から別途計上） |
| Command | 16 |
| Guides | 12 |
| Specs | 149 |
| RetiredREQ | 0 |
| DocMap | 1 |
| Report | 0 |
| Runtime | 2 |

## NG カテゴリ別件数

| category | 件数 |
|---|---|
| RuntimeReference（IR-055） | 59 |
| Command（command-inventory: Missing frontmatter fields: agent） | 16 |
| IndexGenerationConsistency（IR-061 AUTOGEN 不一致） | 3 |
| LifecycleBoundary（REQ-009 workflow status 記述） | 1 |

## warning カテゴリ別件数

| category | 件数 |
|---|---|
| RuntimeReference（IR-055 heuristic: docs/specs/, docs/guides/ 等） | 24 |
| ADR（ADR README 索引・status 表記） | 7 |

## IR-055（RuntimeReference）個別一覧

RuntimeReference の NG 59件 + warning 24件 = 計83件。主な検出対象:

- `src/opencode/commands/agentdev/backlog-review.md`（11件: REQ-008, docs/specs/）
- `src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md`（11件: REQ-0164, REQ-001, docs/specs/）
- `src/opencode/commands/agentdev/req-define.md`（6件: REQ-008, docs/specs/）
- `src/opencode/commands/agentdev/inspect-docs.md`（5件: ADR-002, src/opencode/, docs/specs/, docs/guides/）
- `src/opencode/commands/agentdev/inspect-skills.md`（5件: ADR-002, src/opencode/, docs/specs/, docs/guides/）
- `src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md`（5件: REQ-005, REQ-0138-009, REQ-0104-034）
- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`（4件: REQ-011, REQ-002）
- `src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md`（4件: REQ-005）
- `src/opencode/commands/agentdev/case-open.md`（2件: src/opencode/）
- `src/opencode/commands/agentdev/case-run.md`（2件: src/opencode/）
- `src/opencode/skills/agentdev-adr-guidelines/SKILL.md`（2件: ADR-001）
- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`（2件: REQ-006）
- ほか agentdev-deep-review, agentdev-req-analysis, agentdev-workflow-templates の各 reference/template（warning 中心）

全件の file/line/evidence は `.omo/plans/agentdev-migration-2026-08-05.integrity-before.json` の `results[].category == "RuntimeReference"` を参照。

## IR-059（legacy namespace residual）個別一覧

検出件数: **0件**（本検査では IR-059 に該当する finding なし。ir-059-baseline.json は存在するが、現行ソースに一致する新規違反なし）

## source/projection 整合性

- check: `source-projection-sync`
- level: **info**
- message: "Skipped inside git worktree (junctions not recreated)"
- 備考: worktree 環境では `.opencode/` junction が未再作成のため当該チェックは skip される。WP-6 統合検証（メインリポジトリ、非 worktree）で再評価する。

## index 整合性（IR-061, index-generation-consistency）

検出件数: **3件（全て NG）**

| file | line | 内容 |
|---|---|---|
| `docs/DOC-MAP.md` | 22 | docmap-inventory AUTOGEN block 不一致（SPEC 148→149） |
| `docs/specs/quality/req-health-metrics.md` | 90 | req-metrics-measurement-example 不一致（REQ-006: 104→109） |
| `docs/specs/quality/spec-health-metrics.md` | 75 | spec-metrics-measurement-example 不一致（foundations/document-model.md: 633→637、行数 150→151） |

修復コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`（WP-6 で実行）

## NG baseline 適用結果（trailing log より）

```
[integrity] NG baseline applied: 4 baseline-known (demoted to info), 0 approved additions (provenance-tracked, demoted to info), 110 new unmanaged NG (delta, exit code driver).
```

- baseline-known（既知・info 降格）: 4件
- approved additions（承認済み追加・info 降格）: 0件
- new unmanaged NG（新規未管理・exit code 駆動）: 110件（厳密集計で NG 79 + warning 31 = 110）

## LifecycleBoundary NG

- `docs/requirements/REQ-009.md:48` — Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC（1件）

---

# 以下、check_integrity.ts 自動生成 Markdown report 本文

# check_integrity.ts Report

- **実行日時**: 2026-08-05 17:20
- **スキャン対象**: REQ 11件、ADR 6件、Skill 1件、Command 16件、Guides 12件、Specs 149件、RetiredREQ 0件、DocMap 1件、Report 0件、Runtime 2件

## サマリ

| レベル | 件数 |
|--------|------|
| OK | 196 |
| NG | 79 |
| Warning | 31 |
| Info | 147 |

## ルーティングサマリ

| 検査カテゴリ | OK | NG | Warning | Route |
|-------------|-----|-----|---------|-------|
| REQ | 23 | 0 | 0 | - |
| ADR | 2 | 0 | 7 | intake |
| Skill | 1 | 0 | 0 | - |
| Command | 4 | 16 | 0 | intake |
| Namespace | 4 | 0 | 0 | - |
| Specs | 88 | 0 | 0 | - |
| CompletionReport | 3 | 0 | 0 | - |
| VariantReport | 1 | 0 | 0 | - |
| LinkIntegrity | 0 | 0 | 0 | intake |
| CanonicalBoundary | 1 | 0 | 0 | - |
| LifecycleBoundary | 1 | 1 | 0 | intake |
| Inventory | 6 | 0 | 0 | - |
| Implementation Pattern | 0 | 0 | 0 | - |
| Canonical | 7 | 0 | 0 | - |
| ReferencePath | 35 | 0 | 0 | - |
| integrity-rule-gap | 2 | 0 | 0 | - |
| JunctionIntegrity | 2 | 0 | 0 | - |
| DocumentDrift | 4 | 0 | 0 | - |
| ScanScope | 3 | 0 | 0 | - |
| CaptureBoundary | 5 | 0 | 0 | - |
| DocsCheck | 1 | 0 | 0 | - |
| CanonicalConflict | 2 | 0 | 0 | intake |
| ExecutionSubject | 1 | 0 | 0 | - |
| RuntimeReference | 0 | 59 | 24 | intake |
| IndexGenerationConsistency | 0 | 3 | 0 | intake |

## 詳細

### REQ
- **[INFO]** retired-frontmatter: No retired directory found

### Skill
- **[INFO]** skill-prefix: repo-agentdev-integrity: does not follow agentdev- prefix convention

### Command
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/backlog-review.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/case-auto.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/case-close.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/case-open.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/case-run.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/case-update.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/inspect-docs.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/inspect-promote.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/inspect-skills.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/intake-capture.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/intake-from-github.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/intake-promote.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/learning-promote.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/req-define.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/req-save.md) → route: intake
- **[NG]** command-inventory: Missing frontmatter fields: agent (src/opencode/commands/agentdev/spec-save.md) → route: intake

### LinkIntegrity
- **[INFO]** broken-file-link: [baseline-known] Link target does not exist: ../../src/opencode/skills/agentdev-quality-gates/SKILL.md (NG baseline, not yet cleaned) (docs/specs/quality/quality-gates.md) → route: intake
  - evidence: `../../src/opencode/skills/agentdev-quality-gates/SKILL.md`
  - expected: `file must exist`

### Inventory
- **[INFO]** req-retired-index: No retired directory found
- **[INFO]** source-projection-sync: Skipped inside git worktree (junctions not recreated)

### Implementation Pattern
- **[INFO]** command-map-consistency: [recommendation: no-action] No command patterns parsed from command-map.md

### LifecycleBoundary
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-009.md:48) → route: intake
  - evidence: `| REQ-009-028 | ローカルCaseファイルの status は open、running、blocked、review、closed、cancelled のいずれかとし、closed と cancelled を終端状態とすること（詳細遷移表は SPEC） |`
  - expected: `REQ/SPEC must not define workflow status state management`

### ADR
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/authoring/command-file-format.md (docs/specs/authoring/command-file-format.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/commands/case-close.md (docs/specs/commands/case-close.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/commands/inspect-extensions.md (docs/specs/commands/inspect-extensions.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/foundations/project-extensions.md (docs/specs/foundations/project-extensions.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/README.md (docs/specs/README.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/skills/agentdev-project-extensions.md (docs/specs/skills/agentdev-project-extensions.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-005 (status: superseded) cited in docs/specs/skills/agentdev-skill-authoring.md (docs/specs/skills/agentdev-skill-authoring.md) → route: intake
  - evidence: `ADR-005`
  - expected: `only accepted ADRs should be cited as current basis`

### CanonicalConflict
- **[INFO]** gh-direct-invocation: [baseline-known] Direct gh CLI invocation 'gh pr view' detected — route via agentdev-gh-cli delegation (IR-053, v2:REQ-0152-001) (NG baseline, not yet cleaned) (src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md:110) → route: intake
  - evidence: `gh pr view`
  - expected: `delegate gh CLI access through agentdev-gh-cli procedures (v2:REQ-0149)`

### RuntimeReference
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/README.md:15) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:70) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:70) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:72) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:73) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:74) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:75) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:76) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:77) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:78) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:80) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:132) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/backlog-review.md:132) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:61) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:72) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:73) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:74) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:75) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:83) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:112) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:197) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:307) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-auto.md:367) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: /repo/ reference '/repo/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-close.md:143) → route: intake
  - evidence: `/repo/`
  - expected: `distribution files must not contain /repo/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-close.md:155) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-005' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:36) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-005' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:36) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/case-open.md:38) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/case-open.md:39) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:99) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:246) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:280) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:280) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:286) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-open.md:286) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-run.md:41) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-006' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-run.md:41) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-005' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-run.md:68) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-005' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-run.md:68) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/case-run.md:69) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/case-run.md:70) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-008' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-run.md:172) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-008' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/case-run.md:172) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/inspect-docs.md:31) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/inspect-docs.md:31) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/inspect-docs.md:36) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:36) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:36) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/guides/ reference 'docs/guides/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/inspect-docs.md:37) → route: intake
  - evidence: `docs/guides/`
  - expected: `distribution files should avoid docs/guides/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:38) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:38) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: ADR-NNNN reference 'ADR-002' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:39) → route: intake
  - evidence: `ADR-002`
  - expected: `distribution files must not contain ADR-NNNN references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:40) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:40) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:58) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/guides/ reference 'docs/guides/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:58) → route: intake
  - evidence: `docs/guides/`
  - expected: `distribution files should avoid docs/guides/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:88) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-docs.md:88) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/inspect-skills.md:33) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/inspect-skills.md:33) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:38) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:38) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:38) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/guides/ reference 'docs/guides/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:39) → route: intake
  - evidence: `docs/guides/`
  - expected: `distribution files should avoid docs/guides/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:40) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:40) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: ADR-NNNN reference 'ADR-002' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:41) → route: intake
  - evidence: `ADR-002`
  - expected: `distribution files must not contain ADR-NNNN references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:42) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:42) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:66) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: src/opencode/ reference 'src/opencode/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/inspect-skills.md:66) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-008' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/req-define.md:35) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:35) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-008' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/req-define.md:37) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:38) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:39) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:40) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:42) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:66) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-008' detected (IR-055 delta from baseline) (src/opencode/commands/agentdev/req-define.md:66) → route: intake
  - evidence: `REQ-008`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/req-save.md:113) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: /repo/ reference '/repo/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/req-save.md:168) → route: intake
  - evidence: `/repo/`
  - expected: `distribution files must not contain /repo/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:7) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:18) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:44) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:123) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:125) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:144) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: /repo/ reference '/repo/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:151) → route: intake
  - evidence: `/repo/`
  - expected: `distribution files must not contain /repo/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:192) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:197) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:261) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/commands/agentdev/spec-save.md:261) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-001' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-adr-file-manager/SKILL.md:318) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: ADR-NNNN reference 'ADR-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-adr-guidelines/SKILL.md:124) → route: intake
  - evidence: `ADR-001`
  - expected: `distribution files must not contain ADR-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: ADR-NNNN reference 'ADR-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-adr-guidelines/SKILL.md:126) → route: intake
  - evidence: `ADR-001`
  - expected: `distribution files must not contain ADR-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-backlog-integration/SKILL.md:21) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:38) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:38) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:38) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:40) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:40) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:46) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:46) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:46) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-011' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:47) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: [baseline-known] New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (NG baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:50) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: REQ-NNNN reference 'REQ-002' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:184) → route: intake
  - evidence: `REQ-002`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-011' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:186) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-002' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:186) → route: intake
  - evidence: `REQ-002`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-011' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:213) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-011' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:213) → route: intake
  - evidence: `REQ-011`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/SKILL.md:21) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/SKILL.md:106) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/SKILL.md:112) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/SKILL.md:122) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/SKILL.md:135) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md:270) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md:361) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md:364) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-deep-review/SKILL.md:16) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-deep-review/references/deep-review-protocol.md:3) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-map/SKILL.md:21) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-map/SKILL.md:32) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-map/SKILL.md:90) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/SKILL.md:3) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/SKILL.md:12) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/references/document-boundaries.md:82) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/references/document-boundaries.md:83) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/references/document-boundaries.md:104) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/guides/ reference 'docs/guides/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/references/document-boundaries.md:104) → route: intake
  - evidence: `docs/guides/`
  - expected: `distribution files should avoid docs/guides/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: repo-* reference 'repo-local' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md:78) → route: intake
  - evidence: `repo-local`
  - expected: `distribution files must not contain repo-* references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-epic-tracker/SKILL.md:24) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: /repo/ reference '/repo/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md:24) → route: intake
  - evidence: `/repo/`
  - expected: `distribution files must not contain /repo/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md:81) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md:84) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:21) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:60) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:60) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:66) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:66) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:68) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:69) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:69) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/SKILL.md:69) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md:99) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md:99) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md:9) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md:15) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md:39) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/spec-operation-contract-consistency.md:21) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-inspect-skills/references/spec-operation-contract-consistency.md:69) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-learning-capture/SKILL.md:20) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-learning-pipeline/SKILL.md:223) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-learning-pipeline/SKILL.md:238) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-learning-pipeline/SKILL.md:249) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-learning-pipeline/SKILL.md:350) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-quality-gates/SKILL.md:21) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md:131) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/SKILL.md:26) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/SKILL.md:131) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md:55) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:6) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:18) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-0164' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:69) → route: intake
  - evidence: `REQ-0164`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:70) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:70) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:74) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:75) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:76) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-0164' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:83) → route: intake
  - evidence: `REQ-0164`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-0164' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:84) → route: intake
  - evidence: `REQ-0164`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-0164' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:85) → route: intake
  - evidence: `REQ-0164`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:86) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:87) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-001' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:88) → route: intake
  - evidence: `REQ-001`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:92) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md:96) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md:12) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/references/test-strategy-numeric-threshold-guide.md:22) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/references/verification-log.md:3) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-analysis/references/verification-log.md:8) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-file-manager/SKILL.md:25) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-file-manager/SKILL.md:67) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-file-manager/references/numbering-and-validation.md:168) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md:30) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md:22) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:70) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:87) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:87) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:93) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:94) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:114) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/guides/ reference 'docs/guides/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:114) → route: intake
  - evidence: `docs/guides/`
  - expected: `distribution files should avoid docs/guides/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:126) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:127) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:189) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:217) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-skill-authoring/SKILL.md:21) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: repo-* reference 'repo-root-relative' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-skill-authoring/SKILL.md:179) → route: intake
  - evidence: `repo-root-relative`
  - expected: `distribution files must not contain repo-* references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-skill-authoring/references/review-protocol.md:68) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-spec-file-manager/SKILL.md:150) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-spec-file-manager/references/spec-lifecycle-application.md:44) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-005' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md:52) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN-NNN reference 'REQ-0138-009' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md:69) → route: intake
  - evidence: `REQ-0138-009`
  - expected: `distribution files must not contain REQ-NNNN-NNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-0138' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md:69) → route: intake
  - evidence: `REQ-0138`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN-NNN reference 'REQ-0104-034' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md:81) → route: intake
  - evidence: `REQ-0104-034`
  - expected: `distribution files must not contain REQ-NNNN-NNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-0104' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md:81) → route: intake
  - evidence: `REQ-0104`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-005' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md:42) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-005' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md:43) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-005' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md:48) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-005' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md:49) → route: intake
  - evidence: `REQ-005`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known heuristic violation: docs/specs/ reference 'docs/specs/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-workflow-orchestration/SKILL.md:20) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-006' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-orchestration/SKILL.md:33) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[NG]** runtime-unresolved-reference: New strict violation: REQ-NNNN reference 'REQ-006' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-orchestration/SKILL.md:33) → route: intake
  - evidence: `REQ-006`
  - expected: `distribution files must not contain REQ-NNNN references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: [baseline-known] New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (NG baseline, not yet cleaned) (src/opencode/skills/agentdev-workflow-orchestration/SKILL.md:33) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-workflow-orchestration/SKILL.md:54) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md:78) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: src/opencode/ reference 'src/opencode/' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md:92) → route: intake
  - evidence: `src/opencode/`
  - expected: `distribution files must not contain src/opencode/ references (unresolved in consumer env)`
- **[INFO]** runtime-unresolved-reference: Baseline-known strict violation: repo-* reference 'repo-agentdev-integrity' (IR-055 baseline, not yet cleaned) (src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md:94) → route: intake
  - evidence: `repo-agentdev-integrity`
  - expected: `distribution files must not contain repo-* references (unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md:48) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md:46) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`
- **[WARNING]** runtime-unresolved-reference: New heuristic violation: docs/specs/ reference 'docs/specs/' detected (IR-055 delta from baseline) (src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md:46) → route: intake
  - evidence: `docs/specs/`
  - expected: `distribution files should avoid docs/specs/ references (likely unresolved in consumer env)`

### IndexGenerationConsistency
- **[NG]** index-generation-consistency: docmap-inventory AUTOGEN block out of sync. first mismatch at line 3 (current=- SPEC: 148件（`docs/specs/**/*.md`）, expected=- SPEC: 149件（`docs/specs/**/*.md`）). Run: bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061, SC-002) (docs/DOC-MAP.md:22) → route: intake
  - evidence: `block_id=docmap-inventory, current_lines=3, expected_lines=3`
  - expected: `AUTOGEN block contents must match source file derivation (docmap-inventory)`
- **[NG]** index-generation-consistency: req-metrics-measurement-example AUTOGEN block out of sync. first mismatch at line 3 (current=| REQ-006 | 104 | +2 |  |, expected=| REQ-006 | 109 | +2 |  |). Run: bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061, SC-002) (docs/specs/quality/req-health-metrics.md:90) → route: intake
  - evidence: `block_id=req-metrics-measurement-example, current_lines=15, expected_lines=15`
  - expected: `AUTOGEN block contents must match source file derivation (req-metrics-measurement-example)`
- **[NG]** index-generation-consistency: spec-metrics-measurement-example AUTOGEN block out of sync. first mismatch at line 3 (current=| foundations/document-model.md | 633 | accepted | founda..., expected=| foundations/document-model.md | 637 | accepted | founda...). Run: bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061, SC-002) (docs/specs/quality/spec-health-metrics.md:75) → route: intake
  - evidence: `block_id=spec-metrics-measurement-example, current_lines=150, expected_lines=151`
  - expected: `AUTOGEN block contents must match source file derivation (spec-metrics-measurement-example)`
