// rules/ir-061.ts — index-generation-consistency。
// ルール詳細: docs/designs/integrity/rules/IR-061-index-generation-consistency.md
// カタログ AUTOGEN は rules レジストリ（DEC-065 決定3）と、rule-ownership・README 系
// AUTOGEN は generate_indexes.ts と共通の抽出・生成ロジックと突合する（検査と生成の
// 論理的同一性保証は現行構造を維持）。generate_indexes 側の fs 走査は索引生成器の
// 既存契約であり、ルールからの間接利用に留まる。

import * as path from "node:path";
import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import {
  findFirstMismatch,
  truncateForLog,
} from "../scripts/check_autogen_freshness.ts";
import {
  CATALOG_BLOCK_ID,
  RULE_OWNERSHIP_BLOCK_ID,
  collectIrFiles,
  findAutogenBlocks,
  generateCatalogEntries,
  generateRuleOwnershipAppendix,
  collectDecisionFiles,
  collectRetiredDecisionFiles,
  findUndeclaredRelatedReqDecisions,
  generateDecisionBaselineCaption,
  generateDecisionBaselineTable,
  generateDecisionStatusList,
  generateDecisionRetiredTable,
  generateDecisionRelatedReqTable,
  collectReqIdContext,
  extractRelatedReqNotes,
  DECISION_BASELINE_COUNT_BLOCK_ID,
  DECISION_BASELINE_TABLE_BLOCK_ID,
  DECISION_STATUS_ACCEPTED_BLOCK_ID,
  DECISION_STATUS_PROPOSED_BLOCK_ID,
  DECISION_STATUS_SUPERSEDED_BLOCK_ID,
  DECISION_STATUS_DEPRECATED_BLOCK_ID,
  DECISION_RETIRED_TABLE_BLOCK_ID,
  DECISION_RELATED_REQ_TABLE_BLOCK_ID,
  collectReqFiles,
  collectRetiredReqFiles,
  generateReqActiveCaption,
  generateReqActiveTable,
  generateReqRetiredTable,
  REQ_ACTIVE_COUNT_BLOCK_ID,
  REQ_ACTIVE_TABLE_BLOCK_ID,
  REQ_RETIRED_TABLE_BLOCK_ID,
  collectReqMetrics,
  deriveReqMetricsMeasureDate,
  generateReqMetricsTable,
  REQ_METRICS_BLOCK_ID,
  generateReadmeReqSummaryCount,
  generateDocsReadmeDecisionTable,
  README_REQ_SUMMARY_COUNT_BLOCK_ID,
  README_DECISION_SUMMARY_TABLE_BLOCK_ID,
} from "../scripts/generate_indexes.ts";
import { rules as registryRules } from "./index.ts";

interface AutogenBlockSpec {
  blockId: string;
  expected: string[];
  label: string;
}

function verifyBlocks(
  content: string,
  specs: readonly AutogenBlockSpec[],
  out: RuleViolation[],
): boolean {
  let foundViolation = false;
  const blocks = findAutogenBlocks(content);
  for (const spec of specs) {
    const block = blocks.find((b) => b.id === spec.blockId);
    if (!block) {
      out.push({
        ruleId: "IR-061",
        severity: "warning",
        filePath: "AUTOGEN marker",
        message: `${spec.label} AUTOGEN marker not found; IR-061 ${spec.label} check skipped`,
        remediationHint: "insert AUTOGEN markers for the generated block",
      });
      continue;
    }
    const mismatchIndex = findFirstMismatch(block.currentBody, spec.expected);
    if (mismatchIndex !== -1) {
      foundViolation = true;
      out.push({
        ruleId: "IR-061",
        severity: "error",
        filePath: "AUTOGEN block",
        line: block.startLine + 1 + mismatchIndex,
        message:
          `${spec.label} AUTOGEN block out of sync with its generation source. ` +
          `first mismatch at line ${mismatchIndex + 1} (current=${truncateForLog(block.currentBody[mismatchIndex])}, expected=${truncateForLog(spec.expected[mismatchIndex])}). ` +
          `Run: bun run src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061)`,
        remediationHint: "regenerate indexes via generate_indexes.ts",
      });
    }
  }
  return foundViolation;
}

export const ir061: IntegrityRule = {
  id: "IR-061",
  slug: "index-generation-consistency",
  title: "索引類自動生成整合性",
  description:
    "カタログ AUTOGEN（rules レジストリ基準）と rule-ownership・README 系 AUTOGEN（生成スクリプト基準）が生成源と一致することを検証する。",
  relatedReqs: ["REQ-010-003", "REQ-001-008", "REQ-010-008"],
  targetGlobs: [
    "docs/designs/integrity/integrity-rule-catalog.md",
    "docs/designs/integrity/rule-ownership.md",
    "docs/designs/integrity/rules/**",
    "docs/decisions/**",
    "docs/requirements/**",
    "docs/README.md",
    "docs/designs/quality/req-health-metrics.md",
    "src/common/skills/repo-agentdev-integrity/**",
  ],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const repoRoot = ctx.repoRoot;
    const rulesDir = path.join(repoRoot, "docs", "designs", "integrity", "rules");

    // 1. カタログ AUTOGEN ↔ rules レジストリ（DEC-065 決定3 単一ソース）。
    const catalogFile = ctx.readFile("docs/designs/integrity/integrity-rule-catalog.md");
    if (catalogFile !== null) {
      const expectedCatalog = generateCatalogEntries(registryRules);
      const blocks = findAutogenBlocks(catalogFile.rawContent);
      const block = blocks.find((b) => b.id === CATALOG_BLOCK_ID);
      if (!block) {
        violations.push({
          ruleId: "IR-061",
          severity: "error",
          filePath: "docs/designs/integrity/integrity-rule-catalog.md",
          message: `catalog AUTOGEN block '${CATALOG_BLOCK_ID}' not found (single-block registry-sourced format required). Run: bun run src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061)`,
          remediationHint: "regenerate the catalog AUTOGEN block from the rules registry",
        });
      } else {
        const mismatchIndex = findFirstMismatch(block.currentBody, expectedCatalog);
        if (mismatchIndex !== -1) {
          violations.push({
            ruleId: "IR-061",
            severity: "error",
            filePath: "docs/designs/integrity/integrity-rule-catalog.md",
            line: block.startLine + 1 + mismatchIndex,
            message:
              `catalog AUTOGEN block out of sync with the rules registry. ` +
              `first mismatch at line ${mismatchIndex + 1} (current=${truncateForLog(block.currentBody[mismatchIndex])}, expected=${truncateForLog(expectedCatalog[mismatchIndex])}). ` +
              `Run: bun run src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061)`,
            remediationHint: "regenerate the catalog AUTOGEN block from the rules registry",
          });
        }
      }
    }

    // 2. rule-ownership AUTOGEN ↔ IR docs 関連マッピング（現行構造を維持）。
    const ruleOwnershipFile = ctx.readFile("docs/designs/integrity/rule-ownership.md");
    if (ruleOwnershipFile !== null && ctx.pathExists("docs/designs/integrity/rules")) {
      const infos = collectIrFiles(rulesDir);
      const expectedRuleOwnership = generateRuleOwnershipAppendix(infos);
      const blocks = findAutogenBlocks(ruleOwnershipFile.rawContent);
      const block = blocks.find((b) => b.id === RULE_OWNERSHIP_BLOCK_ID);
      if (!block) {
        violations.push({
          ruleId: "IR-061",
          severity: "warning",
          filePath: "docs/designs/integrity/rule-ownership.md",
          message: "rule-ownership AUTOGEN marker not found; IR-061 rule-ownership check skipped",
          remediationHint: "insert AUTOGEN markers for the generated appendix",
        });
      } else {
        const mismatchIndex = findFirstMismatch(block.currentBody, expectedRuleOwnership);
        if (mismatchIndex !== -1) {
          violations.push({
            ruleId: "IR-061",
            severity: "error",
            filePath: "docs/designs/integrity/rule-ownership.md",
            line: block.startLine + 1 + mismatchIndex,
            message:
              `rule-ownership AUTOGEN block out of sync with IR-* files. ` +
              `first mismatch at line ${mismatchIndex + 1} (current=${truncateForLog(block.currentBody[mismatchIndex])}, expected=${truncateForLog(expectedRuleOwnership[mismatchIndex])}). ` +
              `Run: bun run src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061)`,
            remediationHint: "regenerate indexes via generate_indexes.ts",
          });
        }
      }
    }

    // 3. Decision README（8 AUTOGEN blocks、AG-008）。
    const decisionReadmeFile = ctx.readFile("docs/decisions/README.md");
    if (decisionReadmeFile !== null) {
      const decisionsDir = path.join(repoRoot, "docs", "decisions");
      const decisionRetiredDir = path.join(decisionsDir, "retired");
      const reqDir = path.join(repoRoot, "docs", "requirements");
      const reqRetiredDir = path.join(reqDir, "retired");
      const decisionInfos = collectDecisionFiles(decisionsDir);
      const decisionRetiredInfos = collectRetiredDecisionFiles(decisionRetiredDir);
      for (const d of findUndeclaredRelatedReqDecisions(decisionInfos)) {
        violations.push({
          ruleId: "IR-061",
          severity: "warning",
          filePath: `docs/decisions/${d.filename}`,
          message:
            `Decision ${d.id} は frontmatter related_reqs が未宣言です（フィールド欠落）。` +
            `関連 REQ の有無に応じて related_reqs を宣言してください（関連なしは related_reqs: [] 空宣言）。` +
            `本検出は finding であり工程停止条件ではありません（REQ-059-003、DEC-001 決定4）`,
        });
      }
      const specs: AutogenBlockSpec[] = [
        { blockId: DECISION_BASELINE_COUNT_BLOCK_ID, expected: generateDecisionBaselineCaption(decisionInfos), label: "decision-baseline-count" },
        { blockId: DECISION_BASELINE_TABLE_BLOCK_ID, expected: generateDecisionBaselineTable(decisionInfos), label: "decision-baseline-table" },
        { blockId: DECISION_STATUS_ACCEPTED_BLOCK_ID, expected: generateDecisionStatusList(decisionInfos, "accepted"), label: "decision-status-accepted" },
        { blockId: DECISION_STATUS_PROPOSED_BLOCK_ID, expected: generateDecisionStatusList(decisionInfos, "proposed"), label: "decision-status-proposed" },
        { blockId: DECISION_STATUS_SUPERSEDED_BLOCK_ID, expected: generateDecisionStatusList(decisionInfos, "superseded"), label: "decision-status-superseded" },
        { blockId: DECISION_STATUS_DEPRECATED_BLOCK_ID, expected: generateDecisionStatusList(decisionInfos, "deprecated"), label: "decision-status-deprecated" },
        { blockId: DECISION_RETIRED_TABLE_BLOCK_ID, expected: generateDecisionRetiredTable(decisionRetiredInfos), label: "decision-retired-table" },
        {
          blockId: DECISION_RELATED_REQ_TABLE_BLOCK_ID,
          expected: generateDecisionRelatedReqTable(
            decisionInfos,
            collectReqIdContext(reqDir, reqRetiredDir),
            extractRelatedReqNotes(decisionReadmeFile.rawContent),
          ),
          label: "decision-related-req-table",
        },
      ];
      verifyBlocks(decisionReadmeFile.rawContent, specs, violations);
    }

    // 4. REQ README（3 AUTOGEN blocks、AG-009）。
    const reqReadmeFile = ctx.readFile("docs/requirements/README.md");
    if (reqReadmeFile !== null) {
      const reqDir = path.join(repoRoot, "docs", "requirements");
      const reqRetiredDir = path.join(reqDir, "retired");
      const reqInfos = collectReqFiles(reqDir);
      const reqRetiredInfos = collectRetiredReqFiles(reqRetiredDir);
      const specs: AutogenBlockSpec[] = [
        { blockId: REQ_ACTIVE_COUNT_BLOCK_ID, expected: generateReqActiveCaption(reqInfos), label: "req-active-count" },
        { blockId: REQ_ACTIVE_TABLE_BLOCK_ID, expected: generateReqActiveTable(reqInfos), label: "req-active-table" },
        { blockId: REQ_RETIRED_TABLE_BLOCK_ID, expected: generateReqRetiredTable(reqRetiredInfos), label: "req-retired-table" },
      ];
      verifyBlocks(reqReadmeFile.rawContent, specs, violations);
    }

    // 5. req-health-metrics（1 AUTOGEN block、AG-006 候補5）。
    const reqHealthMetricsFile = ctx.readFile("docs/designs/quality/req-health-metrics.md");
    if (reqHealthMetricsFile !== null) {
      const reqDir = path.join(repoRoot, "docs", "requirements");
      const reqMetrics = collectReqMetrics(reqDir);
      const measureDate = deriveReqMetricsMeasureDate(repoRoot, reqDir, reqMetrics);
      if (measureDate === null) {
        violations.push({
          ruleId: "IR-061",
          severity: "error",
          filePath: "docs/designs/quality/req-health-metrics.md",
          message:
            `req-metrics measure date derivation failed (no commit history for docs/requirements/REQ-*.md or git failure). ` +
            `Run: bun run src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts (IR-061)`,
          remediationHint: "regenerate indexes via generate_indexes.ts",
        });
      } else {
        const specs: AutogenBlockSpec[] = [
          {
            blockId: REQ_METRICS_BLOCK_ID,
            expected: generateReqMetricsTable(reqMetrics, measureDate),
            label: "req-metrics-measurement-example",
          },
        ];
        verifyBlocks(reqHealthMetricsFile.rawContent, specs, violations);
      }
    }

    // 6. docs/README.md（req summary count + decision summary table、Wave 5）。
    const docsReadmeFile = ctx.readFile("docs/README.md");
    if (docsReadmeFile !== null) {
      const reqDir = path.join(repoRoot, "docs", "requirements");
      const reqRetiredDir = path.join(reqDir, "retired");
      const decisionsDir = path.join(repoRoot, "docs", "decisions");
      const specs: AutogenBlockSpec[] = [
        {
          blockId: README_REQ_SUMMARY_COUNT_BLOCK_ID,
          expected: generateReadmeReqSummaryCount({
            activeReqCount: collectReqFiles(reqDir).length,
            retiredReqCount: collectRetiredReqFiles(reqRetiredDir).length,
          }),
          label: "readme-req-summary-count",
        },
      ];
      if (findAutogenBlocks(docsReadmeFile.rawContent).some((b) => b.id === README_DECISION_SUMMARY_TABLE_BLOCK_ID)) {
        specs.push({
          blockId: README_DECISION_SUMMARY_TABLE_BLOCK_ID,
          expected: generateDocsReadmeDecisionTable(collectDecisionFiles(decisionsDir)),
          label: "readme-decision-summary-table",
        });
      }
      verifyBlocks(docsReadmeFile.rawContent, specs, violations);
    }

    return violations;
  },
};
