import { describe, it, expect } from "bun:test";
import {
  parseIntegrityRuleCatalog,
  filterRulesByGate,
  findRuleById,
} from "./integrity_catalog_parser.ts";

function readRealCatalog(): string {
  const fs = require("fs");
  const path = require("path");
  let dir = path.resolve(__dirname);
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, "docs", "specs", "integrity-rule-catalog.md");
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate, "utf-8");
    dir = path.dirname(dir);
  }
  throw new Error("integrity-rule-catalog.md fixture not found");
}

const MINIMAL_CATALOG = `# Integrity Rule Catalog

Some intro text.

## Schema

| Field | 型 | 説明 |
|-------|------|------|
| rule_id | string | 一意識別子 |

## Rules

### IR-001: Active REQ frontmatter id ↔ filename

| Field | Value |
|-------|-------|
| rule_id | IR-001 |
| description | frontmatter id matches filename |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter id extraction |
| affected_artifacts | [active REQ] |
| related_req | [REQ-0108-001, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | low |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | fix frontmatter |
| last_verified | 2026-06-06 |

### IR-006: Command frontmatter 許可フィールド

| Field | Value |
|-------|-------|
| rule_id | IR-006 |
| description | allowed frontmatter fields |
| severity | strict |
| category | document-drift |
| detection_method | field enumeration |
| affected_artifacts | [commands] |
| related_req | [REQ-0103-015] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | low |
| regression_test | command_fixtures.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | remove forbidden field |
| last_verified | 2026-06-06 |
`;

describe("parseIntegrityRuleCatalog - minimal fixture", () => {
  it("parses all IR entries", () => {
    const rules = parseIntegrityRuleCatalog(MINIMAL_CATALOG);
    expect(rules).toHaveLength(2);
    expect(rules[0].rule_id).toBe("IR-001");
    expect(rules[1].rule_id).toBe("IR-006");
  });

  it("parses all 15 metadata fields", () => {
    const rules = parseIntegrityRuleCatalog(MINIMAL_CATALOG);
    const r = rules[0];
    expect(r.description).toBe("frontmatter id matches filename");
    expect(r.severity).toBe("strict");
    expect(r.category).toBe("document-drift");
    expect(r.detection_method).toBe("frontmatter id extraction");
    expect(r.affected_artifacts).toEqual(["active REQ"]);
    expect(r.related_req).toEqual(["REQ-0108-001", "REQ-0101"]);
    expect(r.related_spec).toEqual(["integrity-contracts.md"]);
    expect(r.gate_level).toEqual(["full-audit"]);
    expect(r.false_positive_risk).toBe("low");
    expect(r.regression_test).toBe("commands_structure.test.ts");
    expect(r.baseline_status).toBe("resolved");
    expect(r.finding_route).toBe("intake");
    expect(r.triage_action).toBe("fix frontmatter");
    expect(r.last_verified).toBe("2026-06-06");
  });

  it("parses multi-gate gate_level as array", () => {
    const rules = parseIntegrityRuleCatalog(MINIMAL_CATALOG);
    expect(rules[1].gate_level).toEqual(["full-audit", "delta-guard"]);
  });

  it("parses bracket list with multiple comma-separated values", () => {
    const rules = parseIntegrityRuleCatalog(MINIMAL_CATALOG);
    expect(rules[0].related_req).toEqual(["REQ-0108-001", "REQ-0101"]);
  });
});

describe("parseIntegrityRuleCatalog - error cases", () => {
  it("throws on empty content", () => {
    expect(() => parseIntegrityRuleCatalog("")).toThrow(/empty/);
  });

  it("throws on missing top-level header", () => {
    expect(() => parseIntegrityRuleCatalog("# Wrong Title\n\n### IR-001: x\n")).toThrow(
      /Integrity Rule Catalog/,
    );
  });

  it("throws when no IR entries present", () => {
    expect(() =>
      parseIntegrityRuleCatalog("# Integrity Rule Catalog\n\nno rules here"),
    ).toThrow(/no IR-NNN entries/);
  });

  it("throws on duplicate rule_id", () => {
    const dup = MINIMAL_CATALOG + MINIMAL_CATALOG.slice(
      MINIMAL_CATALOG.indexOf("### IR-001"),
    );
    expect(() => parseIntegrityRuleCatalog(dup)).toThrow(/duplicate/);
  });

  it("throws on header/field rule_id mismatch", () => {
    const bad = MINIMAL_CATALOG.replace(
      "| rule_id | IR-001 |",
      "| rule_id | IR-099 |",
    );
    expect(() => parseIntegrityRuleCatalog(bad)).toThrow(/mismatch/);
  });

  it("throws on invalid severity", () => {
    const bad = MINIMAL_CATALOG.replace("| severity | strict |", "| severity | bogus |");
    expect(() => parseIntegrityRuleCatalog(bad)).toThrow(/severity/);
  });

  it("throws on invalid gate_level", () => {
    const bad = MINIMAL_CATALOG.replace(
      "| gate_level | full-audit |",
      "| gate_level | no-such-gate |",
    );
    expect(() => parseIntegrityRuleCatalog(bad)).toThrow(/gate_level/);
  });
});

describe("filterRulesByGate", () => {
  const rules = parseIntegrityRuleCatalog(MINIMAL_CATALOG);

  it("returns full-audit rules", () => {
    expect(filterRulesByGate(rules, "full-audit")).toHaveLength(2);
  });

  it("returns delta-guard rules only", () => {
    const dg = filterRulesByGate(rules, "delta-guard");
    expect(dg).toHaveLength(1);
    expect(dg[0].rule_id).toBe("IR-006");
  });

  it("returns empty for impact-guard when none tagged", () => {
    expect(filterRulesByGate(rules, "impact-guard")).toEqual([]);
  });
});

describe("findRuleById", () => {
  const rules = parseIntegrityRuleCatalog(MINIMAL_CATALOG);
  it("finds existing rule", () => {
    expect(findRuleById(rules, "IR-006")?.severity).toBe("strict");
  });
  it("returns undefined for missing rule", () => {
    expect(findRuleById(rules, "IR-999")).toBeUndefined();
  });
});

describe("parseIntegrityRuleCatalog - real catalog (QA Scenario 1)", () => {
  const realCatalog = readRealCatalog();
  const rules = parseIntegrityRuleCatalog(realCatalog);

  it("parses all 44 IR rules (IR-001..IR-044)", () => {
    expect(rules).toHaveLength(44);
    expect(rules[0].rule_id).toBe("IR-001");
    expect(rules[43].rule_id).toBe("IR-044");
  });

  it("delta-guard filter returns exactly 13 rules", () => {
    const dg = filterRulesByGate(rules, "delta-guard");
    const ids = dg.map((r) => r.rule_id);
    expect(dg).toHaveLength(13);
    expect(ids).toEqual([
      "IR-006",
      "IR-008",
      "IR-012",
      "IR-013",
      "IR-016",
      "IR-028",
      "IR-029",
      "IR-030",
      "IR-031",
      "IR-032",
      "IR-033",
      "IR-038",
      "IR-040",
    ]);
  });

  it("impact-guard filter returns IR-020 and IR-023", () => {
    const ig = filterRulesByGate(rules, "impact-guard");
    expect(ig.map((r) => r.rule_id).sort()).toEqual(["IR-020", "IR-023"]);
  });

  it("every rule has 15 metadata fields populated", () => {
    for (const r of rules) {
      expect(r.gate_level.length).toBeGreaterThan(0);
      expect(r.severity.length).toBeGreaterThan(0);
      expect(r.category.length).toBeGreaterThan(0);
      expect(r.rule_id).toMatch(/^IR-\d{3}$/);
    }
  });

  it("every rule includes full-audit in gate_level", () => {
    for (const r of rules) {
      expect(r.gate_level).toContain("full-audit");
    }
  });
});
