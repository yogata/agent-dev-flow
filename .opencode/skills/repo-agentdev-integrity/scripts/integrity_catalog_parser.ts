/**
 * Parser for `docs/specs/integrity-rule-catalog.md` (REQ-0136-040, Issue #898 Task 1.2).
 *
 * Converts each IR-NNN entry's Markdown field/value table into a typed
 * `IntegrityRule`. The catalog uses the structure:
 *
 *     ### IR-001: <title>
 *
 *     | Field | Value |
 *     |-------|-------|
 *     | rule_id | IR-001 |
 *     | ...     | ...   |
 *
 * `gate_level` may list multiple gates comma-separated (e.g.
 * `full-audit, delta-guard`). List-typed fields use bracket form
 * (e.g. `[REQ-0108-001, REQ-0101]`).
 */
import type { GateLevel } from "./cli_utils.ts";

export type CatalogSeverity = "strict" | "heuristic" | "observation";
export type CatalogCategory =
  | "document-drift"
  | "broken-reference"
  | "obsolete-structure"
  | "canonical-conflict"
  | "workflow-gap"
  | "integrity-rule-gap";

export interface IntegrityRule {
  rule_id: string;
  description: string;
  severity: CatalogSeverity;
  category: CatalogCategory;
  detection_method: string;
  affected_artifacts: string[];
  related_req: string[];
  related_spec: string[];
  gate_level: GateLevel[];
  false_positive_risk: string;
  regression_test: string;
  baseline_status: string;
  finding_route: string;
  triage_action: string;
  last_verified: string;
}

const GATE_LEVELS: readonly GateLevel[] = [
  "full-audit",
  "delta-guard",
  "impact-guard",
];

const RULE_HEADER_RE = /^###\s+(IR-\d{3})\s*:/;
const TABLE_ROW_RE = /^\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/;

export class IntegrityCatalogParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrityCatalogParseError";
  }
}

function splitTopLevelByHeaders(content: string): string[] {
  return content.split(/(?=^###\s+IR-\d{3}\s*:)/m);
}

function extractFieldValueMap(block: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of block.split("\n")) {
    const m = line.match(TABLE_ROW_RE);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    if (
      key.toLowerCase() === "field" ||
      /^-+$/.test(key) ||
      /^-+$/.test(value)
    ) {
      continue;
    }
    fields.set(key, value);
  }
  return fields;
}

function parseBracketList(raw: string): string[] {
  let inner = raw.trim();
  if (inner.startsWith("[") && inner.endsWith("]")) {
    inner = inner.slice(1, -1);
  }
  return inner
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseGateLevels(raw: string): GateLevel[] {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const result: GateLevel[] = [];
  for (const p of parts) {
    if (!GATE_LEVELS.includes(p as GateLevel)) {
      throw new IntegrityCatalogParseError(
        `Unknown gate_level "${p}" (valid: ${GATE_LEVELS.join(", ")})`,
      );
    }
    result.push(p as GateLevel);
  }
  return result;
}

function assertSeverity(value: string): CatalogSeverity {
  if (value === "strict" || value === "heuristic" || value === "observation") {
    return value;
  }
  throw new IntegrityCatalogParseError(
    `Unknown severity "${value}" (expected strict|heuristic|observation)`,
  );
}

function assertCategory(value: string): CatalogCategory {
  const known: CatalogCategory[] = [
    "document-drift",
    "broken-reference",
    "obsolete-structure",
    "canonical-conflict",
    "workflow-gap",
    "integrity-rule-gap",
  ];
  if (known.includes(value as CatalogCategory)) return value as CatalogCategory;
  throw new IntegrityCatalogParseError(
    `Unknown category "${value}" (expected one of ${known.join(", ")})`,
  );
}

function requireField(
  fields: Map<string, string>,
  ruleId: string,
  name: string,
): string {
  const v = fields.get(name);
  if (v === undefined) {
    throw new IntegrityCatalogParseError(
      `${ruleId}: missing required field "${name}"`,
    );
  }
  return v;
}

function parseRuleBlock(block: string): IntegrityRule | null {
  const headerMatch = block.match(RULE_HEADER_RE);
  if (!headerMatch) return null;
  const ruleId = headerMatch[1];
  const fields = extractFieldValueMap(block);

  const ruleIdField = requireField(fields, ruleId, "rule_id");
  if (ruleIdField !== ruleId) {
    throw new IntegrityCatalogParseError(
      `${ruleId}: header rule_id mismatch (header=${ruleId}, field=${ruleIdField})`,
    );
  }

  return {
    rule_id: ruleId,
    description: requireField(fields, ruleId, "description"),
    severity: assertSeverity(requireField(fields, ruleId, "severity")),
    category: assertCategory(requireField(fields, ruleId, "category")),
    detection_method: requireField(fields, ruleId, "detection_method"),
    affected_artifacts: parseBracketList(
      requireField(fields, ruleId, "affected_artifacts"),
    ),
    related_req: parseBracketList(
      requireField(fields, ruleId, "related_req"),
    ),
    related_spec: parseBracketList(
      requireField(fields, ruleId, "related_spec"),
    ),
    gate_level: parseGateLevels(requireField(fields, ruleId, "gate_level")),
    false_positive_risk: requireField(fields, ruleId, "false_positive_risk"),
    regression_test: requireField(fields, ruleId, "regression_test"),
    baseline_status: requireField(fields, ruleId, "baseline_status"),
    finding_route: requireField(fields, ruleId, "finding_route"),
    triage_action: requireField(fields, ruleId, "triage_action"),
    last_verified: requireField(fields, ruleId, "last_verified"),
  };
}

export function parseIntegrityRuleCatalog(content: string): IntegrityRule[] {
  if (!content || content.trim().length === 0) {
    throw new IntegrityCatalogParseError("catalog content is empty");
  }
  if (!/^#\s+Integrity Rule Catalog/m.test(content)) {
    throw new IntegrityCatalogParseError(
      "missing top-level '# Integrity Rule Catalog' header",
    );
  }
  const blocks = splitTopLevelByHeaders(content);
  const rules: IntegrityRule[] = [];
  const seen = new Set<string>();
  for (const block of blocks) {
    const rule = parseRuleBlock(block);
    if (!rule) continue;
    if (seen.has(rule.rule_id)) {
      throw new IntegrityCatalogParseError(
        `duplicate rule_id ${rule.rule_id}`,
      );
    }
    seen.add(rule.rule_id);
    rules.push(rule);
  }
  if (rules.length === 0) {
    throw new IntegrityCatalogParseError("no IR-NNN entries parsed");
  }
  return rules;
}

export function filterRulesByGate(
  rules: IntegrityRule[],
  gate: GateLevel,
): IntegrityRule[] {
  return rules.filter((r) => r.gate_level.includes(gate));
}

export function findRuleById(
  rules: IntegrityRule[],
  ruleId: string,
): IntegrityRule | undefined {
  return rules.find((r) => r.rule_id === ruleId);
}
